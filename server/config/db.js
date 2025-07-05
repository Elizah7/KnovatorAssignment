// server/config/db.js
const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/job_importer';

// This function will establish the MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        // It's critical for the app, so exit if connection fails
        process.exit(1);
    }
};

module.exports = connectDB; // Export the function