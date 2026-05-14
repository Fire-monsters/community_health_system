const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const encounterController = require('../controllers/encounterController');

router.use(authenticate);
router.post('/', encounterController.createEncounter);
router.get('/patient/:patientId', encounterController.getEncountersByPatient);
router.get('/:id', encounterController.getEncounterById);
router.put('/:id', encounterController.updateEncounter);

module.exports = router;
