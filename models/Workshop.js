const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Participant sub-schema
const participantSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  whatsapp: {
    type: String,
    required: true,
  },
  payment: {
    type: Number,
    required: true,
    default: 19.49,
  },
  razorpay_payment_id: {
    type: String, // Store Razorpay payment ID
    required: false,
  },
  paymentStatus: {
    type: Boolean, // Track payment completion
    default: false,
  },
});

// Workshop schema
const workshopSchema = new Schema({
  workshopName: {
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  meetingLink: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 19.49,
  },
  totalRegistered: {
    type: Number,
    default: 0,
  },
  participants: [participantSchema],
});

// Pre-save hook to update totalRegistered
workshopSchema.pre('save', function (next) {
  this.totalRegistered = this.participants.length;
  next();
});

module.exports = mongoose.model('Workshop', workshopSchema);