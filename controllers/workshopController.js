const mongoose = require('mongoose');
const Workshop = require('../models/Workshop');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a new workshop (Admin only)
exports.createWorkshop = async (req, res) => {
  try {
    const { workshopName, dateTime, meetingLink, price } = req.body;

    const workshop = new Workshop({
      workshopName,
      dateTime,
      meetingLink,
      price: price || 19.49,
      participants: [],
    });

    const savedWorkshop = await workshop.save();
    res.status(201).json({ message: 'Workshop created successfully', workshop: savedWorkshop });
  } catch (error) {
    res.status(500).json({ message: 'Error creating workshop', error: error.message });
  }
};

// Update a workshop (Admin only)
exports.updateWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { workshopName, dateTime, meetingLink, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: 'Invalid workshop ID format' });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (workshopName) workshop.workshopName = workshopName;
    if (dateTime) workshop.dateTime = dateTime;
    if (meetingLink) workshop.meetingLink = meetingLink;
    if (price) workshop.price = price;

    const updatedWorkshop = await workshop.save();
    res.status(200).json({ message: 'Workshop updated successfully', workshop: updatedWorkshop });
  } catch (error) {
    res.status(500).json({ message: 'Error updating workshop', error: error.message });
  }
};

// Delete a workshop (Admin only)
exports.deleteWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: 'Invalid workshop ID format' });
    }

    const workshop = await Workshop.findByIdAndDelete(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    res.status(200).json({ message: 'Workshop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting workshop', error: error.message });
  }
};

// Register a participant and initiate payment
exports.registerParticipant = async (req, res) => {
  try {
    const { workshopId, fullName, email, whatsapp } = req.body;

    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: 'Invalid workshop ID format' });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Create Razorpay order
    const options = {
      amount: workshop.price * 100, // Convert to paise (e.g., 19.49 * 100 = 1949)
      currency: 'INR',
      receipt: `receipt_workshop_${workshopId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Return order details to frontend for payment processing
    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      workshopId,
      participantDetails: { fullName, email, whatsapp },
      message: 'Order created, proceed with payment',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error initiating payment', error: error.message });
  }
};

// Verify payment and complete registration
exports.verifyRegistration = async (req, res) => {
  try {
    const { workshopId, fullName, email, whatsapp, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: 'Invalid workshop ID format' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return Rohanres.status(400).json({ message: 'Invalid payment signature' });
    }

    // Payment verified, register participant
    const participant = {
      fullName,
      email,
      whatsapp,
      payment: workshop.price,
      razorpay_payment_id,
      paymentStatus: true,
    };

    workshop.participants.push(participant);
    const updatedWorkshop = await workshop.save();

    res.status(200).json({
      message: 'Payment verified and participant registered successfully',
      workshop: updatedWorkshop,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

// Get a specific participant's details
exports.getParticipant = async (req, res) => {
  try {
    const { workshopId, participantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: 'Invalid workshop ID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: 'Invalid participant ID format' });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const participant = workshop.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.status(200).json(participant);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching participant', error: error.message });
  }
};

// Delete a participant from a workshop
exports.deleteParticipant = async (req, res) => {
  console.log(`DELETE /api/workshops/${req.params.workshopId}/participants/${req.params.participantId} called`);
  try {
    const { workshopId, participantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: 'Invalid workshop ID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: 'Invalid participant ID format' });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const participant = workshop.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    workshop.participants.pull(participantId);
    const updatedWorkshop = await workshop.save();

    res.status(200).json({ message: 'Participant deleted successfully', workshop: updatedWorkshop });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting participant', error: error.message });
  }
};

// Update a participant's details
exports.updateParticipant = async (req, res) => {
  try {
    const { workshopId, participantId } = req.params;
    const { fullName, email, whatsapp, payment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: 'Invalid workshop ID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: 'Invalid participant ID format' });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const participant = workshop.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    if (fullName) participant.fullName = fullName;
    if (email) participant.email = email;
    if (whatsapp) participant.whatsapp = whatsapp;
    if (payment) participant.payment = payment;

    const updatedWorkshop = await workshop.save();
    res.status(200).json({ message: 'Participant updated successfully', workshop: updatedWorkshop });
  } catch (error) {
    res.status(500).json({ message: 'Error updating participant', error: error.message });
  }
};

// Get all workshops
exports.getAllWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find();
    res.status(200).json(workshops);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workshops', error: error.message });
  }
};

// Get a specific workshop by ID
exports.getWorkshopById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid workshop ID format' });
    }

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    res.status(200).json(workshop);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workshop', error: error.message });
  }
};