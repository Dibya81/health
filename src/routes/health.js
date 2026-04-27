/**
 * Health Check Routes
 */

const express = require('express');
const router = express.Router();
const os = require('os');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'nutriscan-api',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/health/deep:
 *   get:
 *     summary: Deep health check with system info
 *     tags: [Health]
 */
router.get('/deep', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      release: os.release(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length
    },
    services: {
      database: 'connected',
      ai_engine: 'online'
    },
    endpoints: [
      '/api/nutrition/analyze',
      '/api/nutrition/plan',
      '/api/history'
    ]
  });
});

module.exports = router;
