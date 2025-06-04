const mongoose = require("mongoose");
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
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
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
  coverImage: {
    type: String, // S3 URL or path
    required: false,
  },
  description: {
    type: String, // ✅ newly added
    required: false,
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
  workshopLink: {
    type: String,
    unique: true,
  },
  whatYoullLearn: {
    type: [String], // Array of strings to store multiple learning points
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 19.49,
  },
  coverImage: {
    type: String, // 🔥 This was missing
    required: false,
  },
  totalRegistered: {
    type: Number,
    default: 0,
  },
  participants: [participantSchema],
});

// Pre-save hook to update totalRegistered and generate workshop link
workshopSchema.pre("save", function (next) {
  this.totalRegistered = this.participants.length;

  // Generate unique workshop link if not already set
  if (!this.workshopLink) {
    const uniqueId = this._id.toString();
    this.workshopLink = `/workshops/${this.workshopName
      .toLowerCase()
      .replace(/\s+/g, "-")}-${uniqueId.slice(-6)}`;
  }

  next();
});

module.exports = mongoose.model("Workshop", workshopSchema);
