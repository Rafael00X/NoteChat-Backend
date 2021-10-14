const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: String,
    username: String,
    body: String,
    createdAt: String,
    editedAt: String,
    commentCount: Number,
    comments: [
        {
            userId: String,
            username: String,
            body: String,
            createdAt: String
        }
    ],
    likeCount: Number,
    likes: [
        {
            userId: String,
            username: String,
            createdAt: String
        }
    ]
});

module.exports = mongoose.model("Post", postSchema);
