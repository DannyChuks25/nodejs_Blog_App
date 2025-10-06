const Posts = require("../models/posts")

const deletePost = (id) => {
    const deleted = Posts.find((post => post._id == id));
    if(deleted){
        
    }
}

module.exports = { deletePost };