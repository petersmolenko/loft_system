const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    senderId: String,
    recipientId: String,
    text: String,
    created_time: Number
});

const model = mongoose.model("Message", schema);

module.exports = model