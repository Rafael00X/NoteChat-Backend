const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    username: String,
    createdAt: String,
    chats: [String],
    comments: [String],
    likes: [String],
    posts: [String]
});

module.exports = mongoose.model("User", userSchema);
