require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./config/database');

const PORT = process.env.PORT || 3000;

const start = async () => {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`CHR backend running on port ${PORT}`);
  });
};

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});