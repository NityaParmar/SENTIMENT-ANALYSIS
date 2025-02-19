require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const Review = require("./models/Review");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

const MONGO_URI = "mongodb+srv://NITYA007:NITya%40_1707@cluster0.nchds.mongodb.net/sentimentDB?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Hugging Face Sentiment Analysis API Call
async function analyzeSentiment(text) {
    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/finiteautomata/bertweet-base-sentiment-analysis", 
            { inputs: text },
            { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
        );
        return response.data[0][0].label;  // Returns "POSITIVE", "NEGATIVE", or "NEUTRAL"
    } catch (error) {
        console.error("❌ Error analyzing sentiment:", error);
        return "NEUTRAL";  // Default to neutral if API fails
    }
}

// Route: Analyze Review & Store in MongoDB
app.post("/analyze", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const sentiment = await analyzeSentiment(text);
    const review = new Review({ text, sentiment });
    await review.save();

    res.json({ sentiment });
});

// Route: Get All Reviews from MongoDB
app.get("/reviews", async (req, res) => {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
