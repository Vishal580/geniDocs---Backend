const mongoose = require('mongoose');

const mongooseURI = process.env.MONGO_URI

const connectDB = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongooseURI);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        // Log and handle connection errors
        console.error('Failed to connect to MongoDB:', error);
    }
};

module.exports = connectDB;