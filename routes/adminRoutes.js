const express = require("express");
const Post = require("../models/posts");
const cloudinary = require("../utils/cloudinary");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../utils/multer");
const setUser = require("../middleware/setUser");
const router = express.Router();

// const adminRoutes = `${process.env.BASE_URL}/blog/dashboard`
const adminRoutes = `/blog/dashboard`

router.get("/post/:id", async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id);
    // if(!post) return res.status(404).json({ message: "Post not found!"});
    if (!post) return res.render("../views/posts/onePost", { error: "Post not found!", title: post.title, adminRoutes });
    // res.json(post);
    res.render("../views/posts/onePost", { post, error: null, title: post.title, adminRoutes });
});

router.get("/create", (req, res) => {
    res.render("../views/posts/create",
        { title: "Create Post", adminRoutes }
    )
})

//CREATE POST - BACKEND
router.post("/create", setUser, authMiddleware, upload.single('coverPhoto')
    , async (req, res) => {
        console.log("req.user:", req.user);
        try {
            console.log("File:", req.file);  // 👈 check if file is coming in

            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            const result = await cloudinary.uploader.upload(req.file.path);
            const { techStack, title, desc, AuthorName } = req.body;
            console.log(`Before: ${AuthorName}`);

            const newPost = new Post({
                coverPhoto: result.secure_url,  
                techStack, title, desc, AuthorName,
                authorName: req.session.userId,
                // authorId: req.user._id,
                cloudinary_id: result.public_id
            })
            console.log(`After: ${AuthorName}`);

            // res.json({
            //     message: "Post created successfully ✅",
            //     post: newPost
            // });
            await newPost.save();
            res.redirect("/blog/dashboard");

        } catch (error) {
            console.error("Upload/Create Error:", error.message);
            res.status(500).json({ error: "Upload Failed!" });
        }
    });

router.get("/update-post/:id", setUser, authMiddleware, async (req, res) => {
    console.log(req.user._id.toString());
    const data = await Post.findById(req.params.id);
    console.log(data.authorName.toString());
    console.log(req.session.userId);
    if (!data) return res.status(404).send("Post not found");

    if (req.session.userId !==  data.authorName.toString()) {
        return res.status(403).json({ message: "Not authorized to modify others posts" });
    }
    res.render("../views/posts/updatePost", { data, title: "Update Post", adminRoutes });
})

router.put("/update-post/:id", setUser, authMiddleware, async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(req.params.id);
    if (req.session.userId !== post.authorName.toString()) {
        return res.status(403).json({ message: "Not authorized to modify others posts" });
    }
    // await Post.findByIdAndUpdate(id, {
    //     techStack: req.body.techStack,
    //     title: req.body.title,
    //     desc: req.body.desc,
    //     authorName: req.body.authorName,
    //     updatedAt: Date.now()
    // });
    await Post.findByIdAndUpdate(id, req.body, {new: true});
    res.redirect("/blog/dashboard");
})


router.delete("/delete-post/:id", setUser, authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send("Post not found");

        if (req.session.userId !==  post.authorName.toString()) {
            return res.status(403).json({ message: "Not authorized to delete others' posts" });
        }

        await Post.deleteOne({ _id: req.params.id });
        res.redirect("/blog/dashboard");
    } catch (error) {
        console.log(error.message);
    }
})

module.exports = router;