const mongoose = require('mongoose');
const Workshop = require('../models/Workshop');


exports.createWorkshop = async (req, res) => {
  try {
    const { workshopName, dateTime, meetingLink, price, whatYoullLearn } = req.body;

    // Validate required fields
    if (!workshopName || !dateTime || !meetingLink || !whatYoullLearn) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate whatYoullLearn is an array
    if (!Array.isArray(whatYoullLearn) || whatYoullLearn.length === 0) {
      return res.status(400).json({ 
        message: 'whatYoullLearn must be a non-empty array of learning points' 
      });
    }

    const workshop = new Workshop({
      workshopName,
      dateTime,
      meetingLink,
      price: price || 19.49,
      whatYoullLearn,
      participants: []
    });

    const savedWorkshop = await workshop.save();
    res.status(201).json({ 
      message: 'Workshop created successfully', 
      workshop: {
        ...savedWorkshop.toObject(),
        workshopLink: savedWorkshop.workshopLink
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating workshop', error: error.message });
  }
};

exports.updateWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { workshopName, dateTime, meetingLink, price, whatYoullLearn } = req.body;

    // Validate workshopId
    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: 'Invalid workshop ID format' });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Update fields if provided
    if (workshopName) workshop.workshopName = workshopName;
    if (dateTime) workshop.dateTime = dateTime;
    if (meetingLink) workshop.meetingLink = meetingLink;
    if (price) workshop.price = price;
    if (whatYoullLearn && Array.isArray(whatYoullLearn)) {
      workshop.whatYoullLearn = whatYoullLearn;
    }

    const updatedWorkshop = await workshop.save();
    res.status(200).json({ 
      message: 'Workshop updated successfully', 
      workshop: updatedWorkshop 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating workshop', error: error.message });
  }
};

// Delete a workshop (Admin only)
exports.deleteWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;

    // Validate workshopId
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

// Register a participant in a workshop
exports.registerParticipant = async (req, res) => {
  try {
    const { workshopId, fullName, email, whatsapp, payment } = req.body;

    // Validate workshopId
    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: 'Invalid workshop ID format' });
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const participant = {
      fullName,
      email,
      whatsapp,
      payment: payment || workshop.price
    };

    workshop.participants.push(participant);
    const updatedWorkshop = await workshop.save();
    res.status(200).json({ message: 'Participant registered successfully', workshop: updatedWorkshop });
  } catch (error) {
    res.status(500).json({ message: 'Error registering participant', error: error.message });
  }
};

// Get a specific participant's details (Read)
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
  
  // Delete a participant from a workshop (Delete)
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
  
      // Remove the participant from the array
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

    // Validate workshopId and participantId
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

    // Update fields if provided
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

    // Validate id
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