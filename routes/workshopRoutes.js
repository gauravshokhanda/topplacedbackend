const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');

// Create a new workshop (POST /api/workshops)
router.post('/', workshopController.createWorkshop);

// Update a workshop (PUT /api/workshops/:workshopId)
router.put('/:workshopId', workshopController.updateWorkshop);

// Delete a workshop (DELETE /api/workshops/:workshopId)
router.delete('/:workshopId', workshopController.deleteWorkshop);

// Register a participant in a workshop (POST /api/workshops/register)
router.post('/register', workshopController.registerParticipant);

router.post('/confirm-registration', workshopController.confirmRegistration);


// Update a participant's details (PUT /api/workshops/:workshopId/participants/:participantId)
router.put('/:workshopId/participants/:participantId', workshopController.updateParticipant);

// Get a specific participant's details (GET /api/workshops/:workshopId/participants/:participantId)
router.get('/:workshopId/participants/:participantId', workshopController.getParticipant);

// Delete a participant from a workshop (DELETE /api/workshops/:workshopId/participants/:participantId)
router.delete('/:workshopId/participants/:participantId', workshopController.deleteParticipant);

// Get all workshops (GET /api/workshops)
router.get('/', workshopController.getAllWorkshops);

// Get a specific workshop by ID (GET /api/workshops/:id)
router.get('/:id', workshopController.getWorkshopById);

module.exports = router;