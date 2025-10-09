const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/users");
const blogCards = require("../models/blogCards");
const Post = require("../models/posts");
const authMiddleware = require("../middleware/authMiddleware");

// const route = `${process.env.BASE_URL}/blog`;
const route = `/blog`;
// const routePost = `${process.env.BASE_URL}/blog/posts`;
const routePost = `/blog/posts`;
// const adminRoutes = `${process.env.BASE_URL}/blog/dashboard`;
const adminRoutes = `/blog/dashboard`;

router.get("", async (req, res) => {
    let perPage = 6;
    let page = req.query.page || 1;

    const blogs = await Post.aggregate([{ $sort: { createdAt: -1 } }])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    res.render("index", { title: "Blog Platform", blogs, route, routePost, current: page, nextPage: hasNextPage ? nextPage : null, adminRoutes });
})

router.get("/about", (req, res) => {
    res.render("../views/pages/about", { title: "About Us", route, routePost })
});

router.get("/contact", (req, res) => {
    res.render("../views/pages/contact", { title: "About Us", route, routePost })
});

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
        // return res.status(400).json({ message: "User already exists" });
        return res.status(400).render("../views/layouts/message", {
            title: "Registration Error",
            heading: "Error",
            message: "User already exists",
            redirectUrl: "/blog/register",
            loginUrl: "/blog/login",
            route
        });

    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
    })
    req.session.userId = newUser._id;

    await newUser.save();
    const token = generateToken({ _id: newUser._id, name: newUser.name });
    // res.status(201).json({ message: "User Account successfully created" })
    return res.status(201).render("../views/layouts/message", {
        title: "Registration Success",
        heading: "Success",
        message: "User Account successfully created",
        redirectUrl: "/blog/register",
        loginUrl: "/blog/login",
    })
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(400).json({ error: "Invalid Credentials" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: "Invalid Credentials" });
    }
    const token = generateToken({ _id: user._id, name: user.name });
    res.cookie('token', token, { httpOnly: true });
    req.session.userId = user._id;
    res.redirect("/blog/dashboard");
    // res.json({ message: "User logged in successfully", token });
})

// Function to generate token
const generateToken = (data) => {
    return jwt.sign(data, process.env.SECRET_KEY, { expiresIn: "2h" })
}


router.get("/dashboard", authMiddleware, async (req, res) => {
    //const users = await User.find({}, {name: 1, email: 1});  
    // To exclude the password, we could also say 
    // const users = await User.findById(req.user._id).select("-password")
    //res.json(users);  Lists all users
    // const user = await User.find();
    let perPage = 6;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    const user = await User.findById(req.session.userId);
    console.log(user);
    res.render("../views/pages/dashboard", { data, user, title: "User Dashboard", adminRoutes, current: page, nextPage: hasNextPage ? nextPage : null })
})

router.get("/register", (req, res) => {
    res.render("auth/register", { title: "Regiser User", route });
})

router.get("/login", (req, res) => {
    res.render("auth/login", { title: "User Login", route });
})

router.post("/search", async (req, res) => {
    try {

        let searchTerm = req.body.searcTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        })

        res.render("../views/pages/search", { title: "Search", data, route });
    } catch (error) {
        console.log(error);
    }
})

router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if(err){
            return res.status(500).json({message: "Logout Failed!"})
        }
        res.clearCookie("connect-sid", { 
            path: "/" 
        })
        // res.json({message: "Logout successfull"})
        res.redirect("/blog");
    }) 
})

module.exports = router;