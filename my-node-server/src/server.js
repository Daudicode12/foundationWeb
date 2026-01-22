// importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

// Import database connection
const db = require("./db");

// Import routes
const adminRouter = require("./routes/admin");
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const contactRouter = require("./routes/contactRouter");
const prayerRouter = require("./routes/prayerRouter");
const eventsRouter = require("./routes/eventsRouter");
const sermonsRouter = require("./routes/sermonsRouter");
const announcementsRouter = require("./routes/announcementsRouter");
const offeringsRouter = require("./routes/offeringsRouter");
const resourcesRouter = require("./routes/resourcesRouter");

// Import auth controller for admin login
const authController = require("./controllers/authController");

const app = express();
const port = 8000;

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes"
  }
});

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, "../client/build")));

// Also serve images from public/eduford_img for backward compatibility
app.use('/eduford_img', express.static(path.join(__dirname, "../public/eduford_img")));

// Mount routes
app.use("/api", authRouter);                    // /api/signup, /api/login, /api/verify-token, /api/refresh-token
app.use("/api/profile", profileRouter);         // /api/profile
app.use("/api/contact", contactRouter);         // /api/contact
app.use("/api/prayer-requests", prayerRouter);  // /api/prayer-requests
app.use("/api/events", eventsRouter);           // /api/events
app.use("/api/sermons", sermonsRouter);         // /api/sermons
app.use("/api/announcements", announcementsRouter); // /api/announcements
app.use("/api/my-offerings", offeringsRouter);  // /api/my-offerings (member's own offerings)
app.use("/api/resources", resourcesRouter);     // /api/resources (public resources for members)

// Admin routes
app.use("/api/admin", apiLimiter, adminRouter);

// Admin login route (special - not part of protected admin routes)
app.post("/api/admin/login", authController.adminLogin);

// Catch-all route - serve React app for all non-API routes
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server Running on Port Http://localhost:${port}`);
});
