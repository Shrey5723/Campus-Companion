const mongoose = require('mongoose')

// Connect to MongoDB
// We use try/catch so that if the connection fails, the app stops immediately
// instead of running without a database (which would cause confusing errors later)
async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB successfully')
    } catch (error) {
        console.error('MongoDB connection failed:', error.message)
        // Exit the process because the app cannot work without a database
        process.exit(1)
    }
}

module.exports = connectDb