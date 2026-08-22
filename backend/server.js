// Load environment variables FIRST
// This must be at the very top so that process.env.MONGODB_URI, process.env.PORT, etc.
// are available when other modules try to use them.
require('dotenv').config()

const app = require('./src/app')
const connectDb = require('./src/config/database')

// Read PORT from environment variables
// This makes it easy to change the port without modifying code.
const PORT = process.env.PORT || 3000

// Start the server
// We use an async function because connectDb() is asynchronous.
// We MUST wait for the database connection to succeed before starting
// the server. Otherwise, requests might come in before the database
// is ready, causing errors.
async function startServer() {
    try {
        // Step 1: Connect to MongoDB first
        await connectDb()

        // Step 2: Start listening for requests only AFTER DB is connected
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (error) {
        console.error('Failed to start server:', error.message)
        process.exit(1)
    }
}

startServer()