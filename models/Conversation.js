const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        _id: String,
        userIds: [String],
        messages: [
            {
                _id: mongoose.Types.ObjectId,
                userId: String,
                body: String,
                createdAt: String
            }
        ],
        createdAt: String
    },
    { _id: false }
);

module.exports = mongoose.model("Conversation", conversationSchema);
