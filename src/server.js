/**
 * NutriScan AI - Smart Diet & Nutrition Analyzer
 * Entry point
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

const nutritionRoutes = require('./routes/nutrition');
const historyRoutes = require('./routes/history');
const exportRoutes = require('./routes/export');
const healthRoutes = require('./routes/health');
const swaggerSpec = require('./utils/swagger');

const app = express();
const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET not set in production. Using fallback secret.');
    process.env.JWT_SECRET = 'fallback_secret_key_change_me_in_production';
  }
  if (!process.env.API_KEYS) {
    console.warn('WARNING: API_KEYS not set in production. Using fallback key.');
    process.env.API_KEYS = 'demo-key';
  }
}

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'"],
      "script-src-attr": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      "img-src": ["'self'", "data:", "https:"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (!origin || allowed.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposedHeaders: ['X-Request-ID'],
}));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests. Try again in 15 minutes.' },
});

const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: 'Analysis limit reached. Max 10 requests/minute.' },
});

app.use(globalLimiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const { apiKeyAuth } = require('./middleware/auth');
app.use(apiKeyAuth);

// Logging
if (!process.env.VERCEL) {
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const logStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: logStream }));
}
app.use(morgan('dev'));
app.use(requestLogger);

// Swagger Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'NutriScan API Docs',
}));

// Static Frontend
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/nutrition', analysisLimiter, nutritionRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/export', exportRoutes);

// Catch-all → serve frontend
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  res.status(404).json({ success: false, error: 'Not found' });
});

// Error Handling
app.use(errorHandler);

// Start
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ NutriScan API running on port ${PORT}`);
    console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
