/**
 * Input Validation Schemas
 */

const Joi = require('joi');
const { ValidationError } = require('../middleware/errorHandler');

const DIET_PREFERENCES = ['balanced', 'high-protein', 'low-carb', 'keto', 'vegetarian', 'vegan', 'mediterranean', 'diabetic', 'weight-loss', 'muscle-gain'];
const HEALTH_CONDITIONS = ['none', 'diabetes', 'hypertension', 'obesity', 'celiac', 'lactose-intolerant', 'pcos', 'thyroid', 'heart-disease'];
const ACTIVITY_LEVELS = ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'];

const macroGoalsSchema = Joi.object({
  calories: Joi.number().integer().min(500).max(10000).optional(),
  protein: Joi.number().integer().min(0).max(500).optional(),
  carbs: Joi.number().integer().min(0).max(1000).optional(),
  fats: Joi.number().integer().min(0).max(500).optional(),
});

const analyzeTextSchema = Joi.object({
  foodName: Joi.string().trim().min(1).max(200).optional(),
  quantity: Joi.string().trim().max(50).optional().default('1 serving'),
  dietPreference: Joi.string().valid(...DIET_PREFERENCES).optional().default('balanced'),
  healthCondition: Joi.string().valid(...HEALTH_CONDITIONS).optional().default('none'),
  activityLevel: Joi.string().valid(...ACTIVITY_LEVELS).optional().default('moderately-active'),
  age: Joi.number().integer().min(1).max(120).optional(),
  weight: Joi.number().min(1).max(500).optional(),
  height: Joi.number().min(50).max(300).optional(),
  macroGoals: macroGoalsSchema.optional(),
});

const analyzePlanSchema = Joi.object({
  dietPreference: Joi.string().valid(...DIET_PREFERENCES).required(),
  healthCondition: Joi.string().valid(...HEALTH_CONDITIONS).optional().default('none'),
  activityLevel: Joi.string().valid(...ACTIVITY_LEVELS).optional().default('moderately-active'),
  age: Joi.number().integer().min(1).max(120).optional(),
  weight: Joi.number().min(1).max(500).optional(),
  height: Joi.number().min(50).max(300).optional(),
  macroGoals: macroGoalsSchema.optional(),
  days: Joi.number().integer().min(1).max(7).optional().default(1),
});

const validate = (schema, source = 'body') => (req, res, next) => {
  const data = source === 'body' ? req.body : req.query;
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const details = error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return next(new ValidationError('Invalid input data', details));
  }

  if (source === 'body') req.body = value;
  else req.query = value;

  next();
};

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const validateImageFile = (req, res, next) => {
  if (!req.file) return next();

  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    return next(new ValidationError('Invalid file type', [{
      field: 'image',
      message: `Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }]);
  }

  if (req.file.size > MAX_FILE_SIZE) {
    return next(new ValidationError('File too large', [{
      field: 'image',
      message: 'Maximum file size is 5MB',
    }]);
  }

  next();
};

module.exports = {
  validate,
  validateImageFile,
  analyzeTextSchema,
  analyzePlanSchema,
  DIET_PREFERENCES,
  HEALTH_CONDITIONS,
  ACTIVITY_LEVELS,
};
