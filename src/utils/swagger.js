const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NutriScan AI API',
      version: '1.0.0',
      description: 'Smart Diet & Nutrition Analyzer — Personalized food analysis, meal planning, and health scoring.',
      contact: { name: 'NutriScan Team' },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local Development' },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' },
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ ApiKeyAuth: [] }],
    tags: [
      { name: 'Nutrition', description: 'Food analysis and meal planning' },
      { name: 'Health', description: 'API health monitoring' },
      { name: 'History', description: 'Request history' },
      { name: 'Export', description: 'Data export' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
