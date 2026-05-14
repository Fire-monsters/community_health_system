const patientModel = require('../models/patientModel');

function handlePatientError(err, next) {
  if (err.code === '23505') {
    err.status = 409;
    err.message = 'A patient with that number already exists';
  }

  if (err.code === '22P02' || err.code === '23514') {
    err.status = 400;
    err.message = 'Invalid patient data';
  }

  next(err);
}

async function createPatient(req, res, next) {
  try {
    const { facility_id } = req.user; // from JWT
    const patientData = { ...req.body, facility_id };

    if (typeof patientData.full_name !== 'string' || !patientData.full_name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    // You'll need a patient_number generator – for now, placeholder
    patientData.patient_number = patientData.patient_number || `TMP-${Date.now()}`;
    const patient = await patientModel.create(patientData);
    res.status(201).json(patient);
  } catch (err) {
    handlePatientError(err, next);
  }
}

async function getPatients(req, res, next) {
  try {
    const { facility_id } = req.user;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const patients = await patientModel.findByFacility(facility_id, limit, offset);
    res.json(patients);
  } catch (err) {
    handlePatientError(err, next);
  }
}

async function getPatientById(req, res, next) {
  try {
    const patient = await patientModel.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    // optional: verify patient belongs to user's facility
    if (patient.facility_id !== req.user.facility_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(patient);
  } catch (err) {
    handlePatientError(err, next);
  }
}

async function updatePatient(req, res, next) {
  try {
    const patient = await patientModel.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (patient.facility_id !== req.user.facility_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.body.full_name !== undefined && (typeof req.body.full_name !== 'string' || !req.body.full_name.trim())) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const updated = await patientModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    handlePatientError(err, next);
  }
}

async function deletePatient(req, res, next) {
  try {
    const patient = await patientModel.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (patient.facility_id !== req.user.facility_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    await patientModel.softDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    handlePatientError(err, next);
  }
}

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };
