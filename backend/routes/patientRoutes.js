const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const patientController = require('../controllers/patientController');

router.use(authenticate); // all patient routes require authentication
router.post('/', patientController.createPatient);
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.put('/:id', patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

module.exports = router;