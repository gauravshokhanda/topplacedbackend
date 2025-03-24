const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Success', 'Failed'], default: 'Success' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
