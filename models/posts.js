const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
    coverPhoto: { type: String },
    techStack: {type: String, required: true},
    title: {type: String, required: true},
    desc: {type: String, required: true},
    authorName: {type: String, required: true},
    AuthorName: {type: String, required: true},
    // authorId: { type: String, required: true },
    cloudinary_id: { type: String }
}, {timestamps:true})

const Post = mongoose.model("post", postSchema);

module.exports = Post;