const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    username: String,
    createdAt: String,
    conversations: [String],
    comments: [String],
    likes: [String],
    posts: [String]
});

module.exports = mongoose.model("User", userSchema);
