const { login } = require('../services/authService');

async function loginHandler(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const result = await login(username, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { loginHandler };