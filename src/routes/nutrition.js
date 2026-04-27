/**
 * Nutrition API Routes
 */

const express = require('express');
const multer = require('multer');
const { validate, validateImageFile, analyzeTextSchema, analyzePlanSchema, DIET_PREFERENCES, HEALTH_CONDITIONS } = require('../validators/schemas');
const { analyzeFoodItem, generatePersonalizedPlan, NUTRITION_DB } = require('../services/nutritionService');
const { ValidationError } = require('../middleware/errorHandler');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

/**
 * @swagger
 * /api/nutrition/analyze:
 *   post:
 *     summary: Analyze a food item's nutrition
 *     tags: [Nutrition]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foodName:
 *                 type: string
 *                 example: chicken
 *               quantity:
 *                 type: string
 *                 example: 150g
 *               dietPreference:
 *                 type: string
 *                 enum: [balanced, high-protein, keto, vegan, weight-loss]
 *               healthCondition:
 *                 type: string
 *                 enum: [none, diabetes, hypertension]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Analysis result
 *       400:
 *         description: Validation error
 */
router.post('/analyze',
  upload.single('image'),
  validateImageFile,
  (req, res, next) => {
    if (req.body.macroGoals && typeof req.body.macroGoals === 'string') {
      try { req.body.macroGoals = JSON.parse(req.body.macroGoals); }
      catch { req.body.macroGoals = undefined; }
    }
    next();
  },
  validate(analyzeTextSchema),
  async (req, res, next) => {
    try {
      const hasImage = !!req.file;
      const { foodName, quantity, dietPreference, healthCondition, activityLevel, age, weight, height, macroGoals } = req.body;

      if (hasImage && !foodName) {
        req.body.foodName = mockImageRecognition(req.file);
      }

      if (!req.body.foodName && !req.file) {
        return next(new ValidationError('Either foodName or an image is required'));
      }

      const result = await analyzeFoodItem({
        foodName: req.body.foodName,
        quantity,
        dietPreference,
        healthCondition,
        activityLevel,
        age,
        weight,
        height,
        macroGoals,
      });

      res.status(200).json({
        ...result,
        meta: {
          requestId: req.id,
          analysisType: hasImage ? 'image+text' : 'text',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/nutrition/plan:
 *   post:
 *     summary: Generate a personalized meal plan
 *     tags: [Nutrition]
 */
router.post('/plan',
  validate(analyzePlanSchema),
  async (req, res, next) => {
    try {
      const result = await generatePersonalizedPlan(req.body);
      res.status(200).json({
        ...result,
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/nutrition/foods:
 *   get:
 *     summary: List all supported foods
 *     tags: [Nutrition]
 */
router.get('/foods', (req, res) => {
  const foods = Object.keys(NUTRITION_DB).map(name => ({
    name,
    calories: NUTRITION_DB[name].calories,
    protein: NUTRITION_DB[name].protein,
  }));

  res.json({
    success: true,
    count: foods.length,
    foods,
    dietPreferences: DIET_PREFERENCES,
    healthConditions: HEALTH_CONDITIONS,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /api/nutrition/options:
 *   get:
 *     summary: Get all valid enum options
 *     tags: [Nutrition]
 */
router.get('/options', (req, res) => {
  res.json({
    success: true,
    dietPreferences: DIET_PREFERENCES,
    healthConditions: HEALTH_CONDITIONS,
    activityLevels: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'],
    timestamp: new Date().toISOString(),
  });
});

function mockImageRecognition(file) {
  const foods = Object.keys(NUTRITION_DB);
  const index = file.size % foods.length;
  return foods[index];
}

module.exports = router;
