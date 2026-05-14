const appointmentModel = require('../models/appointmentModel');
const patientModel = require('../models/patientModel');

function handleAppointmentError(err, next) {
  if (err.code === '22P02' || err.code === '23514') {
    err.status = 400;
    err.message = 'Invalid appointment data';
  }

  if (err.code === '23503') {
    err.status = 400;
    err.message = 'Patient not found for appointment';
  }

  next(err);
}

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

async function create(req, res, next) {
  try {
    const { facility_id } = req.user;
    const appointmentData = { ...req.body, facility_id };

    if (!appointmentData.patient_id) {
      return res.status(400).json({ error: 'Patient is required' });
    }

    if (!appointmentData.scheduled_for) {
      return res.status(400).json({ error: 'Appointment date and time is required' });
    }

    await ensurePatientInFacility(appointmentData.patient_id, facility_id);
    const appointment = await appointmentModel.create(appointmentData);
    res.status(201).json(appointment);
  } catch (err) {
    handleAppointmentError(err, next);
  }
}

async function list(req, res, next) {
  try {
    const { facility_id } = req.user;
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;
    const appointments = await appointmentModel.findByFacility(facility_id, limit, offset);
    res.json(appointments);
  } catch (err) {
    handleAppointmentError(err, next);
  }
}

async function get(req, res, next) {
  try {
    const appointment = await appointmentModel.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.facility_id !== req.user.facility_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(appointment);
  } catch (err) {
    handleAppointmentError(err, next);
  }
}

async function update(req, res, next) {
  try {
    const appointment = await appointmentModel.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.facility_id !== req.user.facility_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.body.patient_id) {
      await ensurePatientInFacility(req.body.patient_id, req.user.facility_id);
    }

    const updated = await appointmentModel.update(req.params.id, {
      ...req.body,
      facility_id: req.user.facility_id
    });
    res.json(updated);
  } catch (err) {
    handleAppointmentError(err, next);
  }
}

async function deleteAppointment(req, res, next) {
  try {
    const appointment = await appointmentModel.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.facility_id !== req.user.facility_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await appointmentModel.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleAppointmentError(err, next);
  }
}

module.exports = { create, list, get, update, delete: deleteAppointment };
