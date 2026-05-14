const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const patientRoutes = require('./patientRoutes');   // we'll add later
const encounterRoutes = require('./encounterRoutes');

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/encounters', encounterRoutes);

module.exports = router;