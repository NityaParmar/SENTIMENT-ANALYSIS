const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    text: String,
    sentiment: String,  // Positive, Negative, Neutral
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", reviewSchema);
