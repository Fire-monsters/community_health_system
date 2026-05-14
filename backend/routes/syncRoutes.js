const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const syncController = require('../controllers/syncController');

router.use(authenticate);
router.post('/upload', syncController.upload);
router.post('/download', syncController.download);
router.post('/resolve', syncController.resolve);
router.get('/status', syncController.getStatus);

module.exports = router;
