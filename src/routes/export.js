/**
 * Export Routes
 */

const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/export/json:
 *   post:
 *     summary: Export data to JSON
 *     tags: [Export]
 */
router.post('/json', (req, res) => {
  const { data, filename } = req.body;

  if (!data) {
    return res.status(400).json({ success: false, error: 'No data provided' });
  }

  const exportData = {
    ...data,
    exportedAt: new Date().toISOString(),
    exportedBy: 'NutriScan AI v1.0'
  };

  const safeName = (filename || 'nutriscan-export').replace(/[^a-zA-Z0-9\-_]/g, '').substring(0, 50);

  const serialized = JSON.stringify(data);
  if (serialized.length > 500_000) {
    return res.status(413).json({ success: false, error: 'Export data too large (max 500KB)' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}.json"`);
  res.send(JSON.stringify(exportData, null, 2));
});

module.exports = router;
