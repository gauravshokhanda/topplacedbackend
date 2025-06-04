const mongoose = require("mongoose");
const Workshop = require("../models/Workshop");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createWorkshop = async (req, res) => {
  try {
    const {
      workshopName,
      dateTime,
      meetingLink,
      price,
      whatYoullLearn,
      description,
    } = req.body;

    // Validate required fields
    if (!workshopName || !dateTime || !meetingLink || !whatYoullLearn || !description) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Validate whatYoullLearn is an array
    if (!Array.isArray(whatYoullLearn) || whatYoullLearn.length === 0) {
      return res.status(400).json({
        message: "whatYoullLearn must be a non-empty array of learning points",
      });
    }

    const coverImage = req.file?.location || null; // from multer-s3

    const workshop = new Workshop({
      workshopName,
      dateTime,
      meetingLink,
      price: price || 19.49,
      whatYoullLearn,
      coverImage,
      participants: [],
      description,
    });

    const savedWorkshop = await workshop.save();
    res.status(201).json({
      message: "Workshop created successfully",
      workshop: {
        ...savedWorkshop.toObject(),
        workshopLink: savedWorkshop.workshopLink,
        description: savedWorkshop.description, // 👈 add this line
      },
    });

  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating workshop", error: error.message });
  }
};

exports.updateWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const {
      workshopName,
      dateTime,
      meetingLink,
      price,
      whatYoullLearn,
      description,
    } = req.body;

    // Validate workshopId
    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: "Invalid workshop ID format" });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    // Update fields if provided
    if (workshopName) workshop.workshopName = workshopName;
    if (dateTime) workshop.dateTime = dateTime;
    if (meetingLink) workshop.meetingLink = meetingLink;
    if (description) workshop.description = description;
    if (price) workshop.price = price;
    if (whatYoullLearn && Array.isArray(whatYoullLearn)) {
      workshop.whatYoullLearn = whatYoullLearn;
    }

    // Update cover image if a new one is uploaded
    if (req.file?.location) {
      workshop.coverImage = req.file.location;
    }

    const updatedWorkshop = await workshop.save();
    res.status(200).json({
      message: "Workshop updated successfully",
      workshop: updatedWorkshop,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating workshop", error: error.message });
  }
};

// Delete a workshop (Admin only)
exports.deleteWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;

    // Validate workshopId
    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: "Invalid workshop ID format" });
    }

    const workshop = await Workshop.findByIdAndDelete(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    res.status(200).json({ message: "Workshop deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting workshop", error: error.message });
  }
};

exports.registerParticipant = async (req, res) => {
  try {
    const { workshopId, workshopLink, fullName, email, whatsapp, payment } =
      req.body;

    // Validate input
    if (!fullName || !email || !whatsapp || !payment) {
      return res.status(400).json({
        message: "Full name, email, whatsapp, and payment are required",
      });
    }

    // Validate payment amount
    const allowedPlans = [19, 49, 99];
    if (!allowedPlans.includes(Number(payment))) {
      return res
        .status(400)
        .json({ message: "Invalid payment amount selected" });
    }

    // Find workshop
    let workshop;
    if (workshopId && mongoose.Types.ObjectId.isValid(workshopId)) {
      workshop = await Workshop.findById(workshopId);
    } else if (workshopLink) {
      workshop = await Workshop.findOne({ workshopLink });
    } else {
      return res
        .status(400)
        .json({ message: "Workshop ID or link is required" });
    }

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    // Check if email is already registered
    const isRegistered = workshop.participants.some((p) => p.email === email);
    if (isRegistered) {
      return res
        .status(400)
        .json({ message: "This email is already registered for the workshop" });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(payment * 100), // in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // Optional: Send pre-confirmation email
    await sendEmail({
      to: email,
      subject: "TopPlaced Workshop - Payment Initiated",
      html: `
        <h2>Hi ${fullName},</h2>
        <p>Your registration for the <strong>${workshop.workshopName}</strong> has been initiated.</p>
        <p>Plan Selected: ₹${payment}</p>
        <p>As soon as your payment is confirmed, you'll receive another email with access details.</p>
        <br/>
        <p>Regards,<br/>TopPlaced Team</p>
      `,
    });

    // Return order details to frontend
    res.status(200).json({
      success: true,
      order: razorpayOrder,
      participantInfo: {
        fullName,
        email,
        whatsapp,
        payment,
        workshopId: workshop._id,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering participant", error: error.message });
  }
};

exports.confirmRegistration = async (req, res) => {
  try {
    const {
      fullName,
      email,
      whatsapp,
      workshopId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Step 1: Verify Signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Step 2: Save Participant
    const workshop = await Workshop.findById(workshopId);
    if (!workshop)
      return res.status(404).json({ message: "Workshop not found" });

    // Check duplicate
    const alreadyRegistered = workshop.participants.some(
      (p) => p.email === email
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const participant = {
      fullName,
      email,
      whatsapp,
      payment: workshop.price,
    };

    workshop.participants.push(participant);
    await workshop.save();

    // Step 3: Send confirmation email
    await sendEmail({
      to: email,
      subject: "TopPlaced Workshop - Registration Confirmed",
      html: `
        <h2>Hello ${fullName},</h2>
        <p>Your payment was successfully received and your registration for the <strong>${workshop.workshopName
        }</strong> is confirmed.</p>
        <p><strong>Date & Time:</strong> ${new Date(
          workshop.dateTime
        ).toLocaleString()}</p>
        <p><strong>Meeting Link:</strong> <a href="${workshop.meetingLink}">${workshop.meetingLink
        }</a></p>
        <br/>
        <p>Looking forward to seeing you!</p>
        <p>Regards,<br/>TopPlaced Team</p>
      `,
    });

    res
      .status(200)
      .json({ message: "Registration successful and payment verified" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to confirm registration",
      error: error.message,
    });
  }
};

// Get a specific participant's details (Read)
exports.getParticipant = async (req, res) => {
  try {
    const { workshopId, participantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: "Invalid workshop ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: "Invalid participant ID format" });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    const participant = workshop.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    res.status(200).json(participant);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching participant", error: error.message });
  }
};

// Delete a participant from a workshop (Delete)
exports.deleteParticipant = async (req, res) => {
  console.log(
    `DELETE /api/workshops/${req.params.workshopId}/participants/${req.params.participantId} called`
  );
  try {
    const { workshopId, participantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: "Invalid workshop ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: "Invalid participant ID format" });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    const participant = workshop.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Remove the participant from the array
    workshop.participants.pull(participantId);
    const updatedWorkshop = await workshop.save();

    res.status(200).json({
      message: "Participant deleted successfully",
      workshop: updatedWorkshop,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting participant", error: error.message });
  }
};

// Update a participant's details
exports.updateParticipant = async (req, res) => {
  try {
    const { workshopId, participantId } = req.params;
    const { fullName, email, whatsapp, payment } = req.body;

    // Validate workshopId and participantId
    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: "Invalid workshop ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: "Invalid participant ID format" });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    const participant = workshop.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Update fields if provided
    if (fullName) participant.fullName = fullName;
    if (email) participant.email = email;
    if (whatsapp) participant.whatsapp = whatsapp;
    if (payment) participant.payment = payment;

    const updatedWorkshop = await workshop.save();
    res.status(200).json({
      message: "Participant updated successfully",
      workshop: updatedWorkshop,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating participant", error: error.message });
  }
};

// Get all workshops
exports.getAllWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find();
    res.status(200).json(workshops);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching workshops", error: error.message });
  }
};

// Get a specific workshop by ID
exports.getWorkshopById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid workshop ID format" });
    }

    const workshop = await Workshop.findById(id);
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }
    res.status(200).json(workshop);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching workshop", error: error.message });
  }
};
