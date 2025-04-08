const Razorpay = require('razorpay');
const crypto = require('crypto');
const Workshop = require('../models/Workshop');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { amount, workshopId } = req.body;

    if (!amount || !workshopId) {
      return res.status(400).json({ message: 'Amount and workshopId are required' });
    }

    // Optionally validate workshop existence
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const options = {
      amount: amount * 100, // Convert to paise (e.g., 19.49 * 100 = 1949)
      currency: 'INR',
      receipt: `receipt_workshop_${workshopId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      workshopId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Verify payment and optionally register participant
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, workshopId, fullName, email, whatsapp } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !workshopId) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Payment verified, now register participant
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const participant = {
      fullName,
      email,
      whatsapp,
      payment: workshop.price,
      razorpay_payment_id, // Store payment ID
    };

    workshop.participants.push(participant);
    const updatedWorkshop = await workshop.save();

    res.json({
      success: true,
      message: 'Payment verified and participant registered successfully',
      workshop: updatedWorkshop,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};