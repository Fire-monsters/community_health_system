const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount all API routes under /api
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Global error handler
app.use(errorHandler);

module.exports = app;