const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    userId: String,
    body: String,
    createdAt: String
});

module.exports = mongoose.model("Message", messageSchema);
