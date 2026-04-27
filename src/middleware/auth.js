/**
 * Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const { AuthError } = require('./errorHandler');

const VALID_API_KEYS = new Set(
  (process.env.API_KEYS || 'demo-key-nutriscan-2024,test-key-abc123').split(',')
);

const JWT_SECRET = process.env.JWT_SECRET || 'nutriscan-jwt-secret-change-in-prod';

const apiKeyAuth = (req, res, next) => {
  if (req.path.startsWith('/api/health')) return next();

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return jwtAuth(req, res, next);

  if (!VALID_API_KEYS.has(apiKey)) throw new AuthError('Invalid API key');

  req.authMethod = 'api_key';
  next();
};

const jwtAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.authMethod = 'none';
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.authMethod = 'jwt';
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AuthError('JWT token expired');
    if (err.name === 'JsonWebTokenError') throw new AuthError('Invalid JWT token');
    throw new AuthError('Authentication failed');
  }
};

const generateToken = (payload = { role: 'user' }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = { apiKeyAuth, jwtAuth, generateToken };
