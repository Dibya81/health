/**
 * Request History Routes
 */

const express = require('express');
const { getRequestHistory, clearRequestHistory } = require('../middleware/requestLogger');

const router = express.Router();

/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Get request history
 *     tags: [History]
 */
router.get('/', (req, res) => {
  const history = getRequestHistory();
  const nutritionHistory = history
    .filter(r => r.path.startsWith('/api/nutrition'))
    .map(({ ip, userAgent, ...safe }) => safe);

  res.json({
    success: true,
    count: nutritionHistory.length,
    history: nutritionHistory,
    timestamp: new Date().toISOString(),
  });
});

router.delete('/', (req, res) => {
  clearRequestHistory();
  res.json({ success: true, message: 'History cleared', timestamp: new Date().toISOString() });
});

module.exports = router;
