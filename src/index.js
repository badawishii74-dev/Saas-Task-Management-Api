const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');

// Use routes
app.use('/api/auth', authRoutes);



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the server after successful DB connection
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });