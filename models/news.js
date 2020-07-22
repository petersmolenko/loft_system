const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: String,
    text: String,
    user: String
}, { timestamps: {createdAt: "created_at"}});

const model = mongoose.model("News", schema);

module.exports = model
