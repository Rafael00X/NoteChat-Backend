const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    texts: [
        {
            userId: String,
            body: String,
            createdAt: String
        }
    ]
});

module.exports = mongoose.model("Conversation", conversationSchema);
