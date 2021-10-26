const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    userIds: [String],
    messages: [
        {
            userId: String,
            body: String,
            createdAt: String
        }
    ],
    createdAt: String
});

module.exports = mongoose.model("Conversation", conversationSchema);
