require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
// const paymentRoutes = require('./routes/paymentRoutes');
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes.js");
const availableSlotRoutes = require("./routes/availableSlotRoutes");
const workshopRoutes = require("./routes/workshopRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const jobRoleRoutes = require("./routes/jobRoleRoutes");
const jobRoleTemplateRoutes = require("./routes/jobRoleTemplateRoutes");
const jobCardRoutes = require("./routes/jobCardRoute.js");
const studentManagementRoutes = require("./routes/studentManagementRoutes.js");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://topplacedstagging.netlify.app",
  "https://testtopplaced.netlify.app",
  "https://www.topplaced.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect to the database
connectDB();

// Middleware
app.use(express.json()); // For parsing JSON bodies

app.get("/", (req, res) => {
  res.send("Backend is working fine on hostmycode ");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/available-slots", availableSlotRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/payment", paymentRoutes);

app.use("/api/job-roles", jobRoleRoutes);
app.use("/api/job-role-templates", jobRoleTemplateRoutes);
app.use("/api/job-cards", jobCardRoutes);
app.use("/api/students", studentManagementRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
