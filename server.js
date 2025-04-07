require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require('./routes/interviewRoutes.js');
const availableSlotRoutes = require('./routes/availableSlotRoutes');
const workshopRoutes = require('./routes/workshopRoutes');

const app = express();

// ✅ Enable CORS (Allow requests from frontend)
app.use(cors({
  origin: ["http://localhost:3000","https://topplacedstagging.netlify.app"],
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

// Connect to the database
connectDB();

// Middleware
app.use(express.json()); // For parsing JSON bodies
app.get('/', (req, res) => {
  res.send('Backend is working fine');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/api/resume", resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/available-slots', availableSlotRoutes);
app.use('/api/workshops', workshopRoutes); // Add this line


// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message, stack: process.env.NODE_ENV === 'production' ? null : err.stack });
});

// Server configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
