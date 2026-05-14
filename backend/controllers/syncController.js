const { applyChanges, getDelta } = require('../services/syncService');
const { resolveConflict } = require('../services/conflictResolver');

async function upload(req, res, next) {
  try {
    const { facility_id } = req.user;
    const { last_sync_token, changes } = req.body;
    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'Invalid changes array' });
    }
    const result = await applyChanges(facility_id, last_sync_token, changes);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const { facility_id } = req.user;
    const { last_sync_token } = req.body;
    const delta = await getDelta(facility_id, last_sync_token);
    res.json(delta);
  } catch (err) {
    next(err);
  }
}

async function resolve(req, res, next) {
  try {
    const { conflict_id, resolution, custom_payload } = req.body;
    const userId = req.user.id;
    const result = await resolveConflict(conflict_id, resolution, custom_payload, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getStatus(req, res, next) {
  // Optional: count pending sync_queue entries for the facility
  res.json({ message: 'Sync status endpoint - to be implemented' });
}

module.exports = { upload, download, resolve, getStatus };