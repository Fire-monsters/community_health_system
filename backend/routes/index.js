const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const patientRoutes = require('./patientRoutes');
const encounterRoutes = require('./encounterRoutes');
const syncRoutes = require('./syncRoutes');

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/encounters', encounterRoutes);
router.use('/sync', syncRoutes);

module.exports = router;
