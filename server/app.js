const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const importRoutes = require('./routes/importRoutes');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());


app.use('/api/imports', importRoutes);


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start server due to MongoDB connection error:', err.message);
    process.exit(1); // Exit if DB connection fails
});