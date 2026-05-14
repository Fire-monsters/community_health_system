const express = require('express');
const router = express.Router();
const { loginHandler } = require('../controllers/authController');

router.post('/login', loginHandler);

module.exports = router;