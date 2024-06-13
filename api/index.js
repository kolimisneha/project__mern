import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

// Import route handlers
import userRouter from './routes/User.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cors from 'cors';


// Load environment variables from .env file
dotenv.config();
// Verify if environment variables are loaded correctly
if (!process.env.MONGO) {
  console.error('MONGO environment variable is not defined');
  process.exit(1);
}
const __dirname=path.resolve();

// Create an Express application
const app = express();



// Middleware to parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
const mongoURI = process.env.MONGO;
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 10000, // 10 seconds to connect to the database
  socketTimeoutMS: 45000, // 45 seconds for socket inactivity
  connectTimeoutMS: 30000, // 30 seconds to connect to the database
  retryWrites: true, // Enable retry writes
})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });



// Define routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err); // Enhanced logging
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start the Express server
const PORT = process.env.PORT || 6005;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
