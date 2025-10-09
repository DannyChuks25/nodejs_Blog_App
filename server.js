require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const expressLayout = require("express-ejs-layouts");
const setUser = require("./middleware/setUser");

const app = express();
const connectDB = async () => {
     try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database Connected ${conn.connection.host}`)
    }
    catch(error){
        console.log("MongoDB connection failed:", error);
        process.exit(1);
    }
}
connectDB();

// mongoose.connect("mongodb://localhost:27017/blog_Platform")
// .then(()=>console.log("MongoDb connected succesfully!"))
// .catch((err)=>console.log("MongoDb connection failed", err));

app.use(express.static("public"));
app.use(express.json());


app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
        // mongoUrl: "mongodb://localhost:27017"
    })
}));
app.use(setUser);
app.use(expressLayout)
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.use("/blog", require("./routes/mainRoute"));
app.use("/blog/posts", require("./routes/postRoutes"));
app.use("/blog/dashboard", require("./routes/adminRoutes"));

app.get("/", (req, res) => {
    res.redirect("/blog");
})

app.locals.route = "/blog";
app.locals.routePost = "/blog/posts";
app.locals.adminRoutes = "/blog/dashboard";

app.listen(3000, ()=> console.log(`Server running on localhost:3000`));