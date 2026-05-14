const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

router.use(authenticate);
router.post('/', appointmentController.create);
router.get('/', appointmentController.list);
router.get('/:id', appointmentController.get);
router.put('/:id', appointmentController.update);
router.delete('/:id', appointmentController.delete);

module.exports = router;