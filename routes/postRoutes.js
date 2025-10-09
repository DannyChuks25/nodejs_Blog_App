const express = require("express");
const post = require("../controllers/blogController");
const blogCards = require("../models/blogCards");
const Post = require("../models/posts");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const router = express.Router();

// const routePost = `${process.env.BASE_URL}/blog/posts`
const routePost = `/blog/posts`
const adminRoutes = `/blog/dashboard`

// ADMIN DASHBOARD
router.get("", (req, res) => {
    res.render("../views/posts/authorDashboard", { title: "Author Dashboard" });
})

// CREATE POST - EJS TEMPLATE
router.get("/create", (req, res) => {
    res.render("../views/posts/createPost",
        { title: "Create Post", routePost }
    )
})

//CREATE POST - BACKEND
router.post("/create", upload.single('coverPhoto')
    , async (req, res) => {
        try {
            console.log("File:", req.file);  // 👈 check if file is coming in

            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            const result = await cloudinary.uploader.upload(req.file.path);

            const { techStack, title, desc, AuthorName } = req.body;

            const newPost = new Post({
                coverPhoto: result.secure_url,
                techStack, title, desc, AuthorName,
                cloudinary_id: result.public_id
            })

            // res.json({
            //     message: "Post created successfully ✅",
            //     post: newPost
            // });
            await newPost.save();
            res.redirect("/blog/posts/allPosts");

        } catch (error) {
            console.error("Upload/Create Error:", error.message);
            res.status(500).json({ error: "Upload Failed!" });
        }
    });

router.put("/update/:id", (req, res) => {
    const id = req.params.id;
    const updatedPost = Post.findByIdAndUpdate(id, { $set: req.body }, { new: true });

    if (!updatedPost) return res.status(404).json({ message: "Post not found!" });
    res.json(updatedPost);
});

// DELETE PAGE
router.get("/delete/:id", (req, res) => {
    res.render("../views/posts/deletePost", { title: "DeletePost", routePost })
})
// DELETE BACKEND
router.delete("/delete/:id", (req, res) => {
    const id = req.params.id;
    const deletedPost = Post.findByIdAndDelete(id);
    // if(!deletedPost) return res.status(404).json({ message: "Post not found!"});
    if (!deletedPost) res.render("../views/posts/deletePost", { error: "Post not found!", routePost })

    // res.status(201).json({ message: `Post ${id} deleted successfully`, deletedPost });
    res.render("../views/posts/deletePost", { message: `Post ${id} deleted successfully`, title: "Delete Post", routePost })
});

// Show all Posts
router.get("/allPosts", async (req, res) => {
    let perPage = 6;
    let page = req.query.page || 1;

    const posts = await Post.aggregate([{ $sort: { createdAt: -1 } }])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
    if (!posts) return res.render("../views/posts/allPosts", { error: "No Post was found!", title: "All Posts", routePost });
    // res.json(posts);

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("../views/posts/allPosts", { posts, error: null, title: "All Posts", routePost, adminRoutes,  current: page, nextPage: hasNextPage ? nextPage : null })
});

// Show Single Post
router.get("/viewPost/:id", async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id);
    // if(!post) return res.status(404).json({ message: "Post not found!"});
    if (!post) return res.render("../views/posts/onePost", { error: "Post not found!", title: post.title, routePost });
    // res.json(post);
    res.render("../views/posts/onePost", { post, error: null, title: post.title, routePost });
});

module.exports = router;