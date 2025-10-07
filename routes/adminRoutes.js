const express = require("express");
const Post = require("../models/posts");
const cloudinary = require("../utils/cloudinary");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../utils/multer");
const router = express.Router();

const adminRoutes = `${process.env.BASE_URL}/blog/dashboard`

router.get("/post/:id", async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id);
    // if(!post) return res.status(404).json({ message: "Post not found!"});
    if(!post) return res.render("../views/posts/onePost", { error: "Post not found!",  title: post.title, adminRoutes});
    // res.json(post);
    res.render("../views/posts/onePost",  { post, error:null,  title: post.title , adminRoutes });
});

router.get("/create", (req, res) => {
    res.render("../views/posts/createPost", 
        { title: "Create Post", adminRoutes}
    )
})

//CREATE POST - BACKEND
router.post("/create", upload.single('coverPhoto')
    ,async (req, res) => {
        try {
            console.log("File:", req.file);  // 👈 check if file is coming in
            
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            const result = await cloudinary.uploader.upload(req.file.path);
            const { techStack, title, desc, authorName } = req.body;

            const newPost =  new Post({
                coverPhoto:result.secure_url, 
                techStack, title, desc, authorName,
                cloudinary_id: result.public_id
            })

            // res.json({
            //     message: "Post created successfully ✅",
            //     post: newPost
            // });
            await newPost.save();
            res.redirect("/api/blog/dashboard");

        } catch (error) {
            console.error("Upload/Create Error:", error.message);
            res.status(500).json({ error: "Upload Failed!" });
        }    
});

router.get("/update-post/:id", async (req, res) => {
    const data = await Post.findById(req.params.id);
    if (!data) return res.status(404).send("Post not found");
    res.render("../views/posts/updatePost", {data, title: "Update Post", adminRoutes});
})

router.put("/update-post/:id",authMiddleware, async (req, res) => {
    const id = req.params.id;
    await Post.findByIdAndUpdate(id, {
        techStack: req.body.techStack,
        title: req.body.title,
        desc: req.body.desc,
        authorName: req.body.authorName,
        updatedAt: Date.now()
    });
    res.redirect("/api/blog/dashboard");
})


router.delete("/delete-post/:id",authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({_id:req.params.id});
        res.redirect("/api/blog/dashboard");
    } catch (error) {
       console.log(error.message) ;
    }
})

module.exports = router;