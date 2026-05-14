const encounterModel = require('../models/encounterModel');
const patientModel = require('../models/patientModel');

async function ensurePatientInFacility(patientId, facilityId) {
  const patient = await patientModel.findById(patientId);
  if (!patient) {
    const err = new Error('Patient not found');
    err.status = 404;
    throw err;
  }
  if (patient.facility_id !== facilityId) {
    const err = new Error('Access denied');
    err.status = 403;
    throw err;
  }
  return patient;
}

async function createEncounter(req, res, next) {
  try {
    const { id: recorded_by, facility_id } = req.user;
    await ensurePatientInFacility(req.body.patient_id, facility_id);

    const encounter = await encounterModel.create({
      ...req.body,
      recorded_by,
      facility_id,
    });

    res.status(201).json(encounter);
  } catch (err) {
    next(err);
  }
}

async function getEncounterById(req, res, next) {
  try {
    const encounter = await encounterModel.findById(req.params.id);
    if (!encounter) {
      return res.status(404).json({ error: 'Encounter not found' });
    }
    if (encounter.facility_id !== req.user.facility_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(encounter);
  } catch (err) {
    next(err);
  }
}

async function getEncountersByPatient(req, res, next) {
  try {
    await ensurePatientInFacility(req.params.patientId, req.user.facility_id);
    const encounters = await encounterModel.findByPatient(req.params.patientId);
    res.json(encounters);
  } catch (err) {
    next(err);
  }
}

async function updateEncounter(req, res, next) {
  try {
    const encounter = await encounterModel.findById(req.params.id);
    if (!encounter) {
      return res.status(404).json({ error: 'Encounter not found' });
    }
    if (encounter.facility_id !== req.user.facility_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await encounterModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEncounter,
  getEncounterById,
  getEncountersByPatient,
  updateEncounter,
};
