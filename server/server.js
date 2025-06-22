const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const connectDB = require("./connections/mongoDB");

dotenv.config();
const cityRoutes = require("./routes/cityRoutes");



// Load environment variables
// Check required environment variable
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env");
  process.exit(1);
}

const rawOrigin = process.env.Client_Base_URL;
const allowedOrigin = rawOrigin ? rawOrigin.replace(/\/$/, "") : "http://localhost:5173";

// Create Express app
const app = express();

// IMPORTANT: cookieParser must come BEFORE other middleware
app.use(cookieParser());

// CORS configuration - VERY IMPORTANT for cookies
app.use(
  cors({
    origin: allowedOrigin, // Your frontend URL
    credentials: true, // This is crucial for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); // Parse JSON bodies

// Basic health check route
app.get("/", (req, res) => {
  res.status(200).send("Server is running!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/user",  userRoutes)

// Connect to MongoDB and start server
const PORT = process.env.PORT || 9000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
