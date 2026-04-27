# 🥗 NutriScan AI

NutriScan AI is a Smart Diet & Nutrition Analyzer built with Node.js and Express. It provides comprehensive nutritional analysis, generates personalized meal plans based on health conditions, and features a beautiful dark-mode interface.

## ✨ Features

- **Nutritional Analysis**: Detailed breakdown of calories and macros for various foods.
- **Personalized Meal Plans**: Generates daily diet plans based on your activity level, diet preferences, and health conditions (e.g., Keto, High-Protein, Diabetes).
- **Interactive UI**: A modern, sleek dashboard to interact with the API directly from your browser.
- **API Documentation**: Auto-generated Swagger documentation for all endpoints.
- **Robust Security**: Protected with rate limiting (`express-rate-limit`), security headers (`helmet`), and input validation (`Joi`).
- **Data Export & History**: Track request history and export nutrition data as JSON.

---

## 📂 Folder Structure

```text
nutriscan-ai/
├── public/               # Frontend assets
│   └── index.html        # Main dashboard interface
├── src/                  # Backend application code
│   ├── middleware/       # Express middlewares
│   │   ├── auth.js           # API key & JWT authentication
│   │   ├── errorHandler.js   # Global error handling
│   │   └── requestLogger.js  # Request logging tracking
│   ├── routes/           # API endpoints
│   │   ├── export.js         # Data export routes
│   │   ├── health.js         # System health checks
│   │   ├── history.js        # Request history routes
│   │   └── nutrition.js      # Core nutrition & analysis routes
│   ├── services/         # Business logic & core engines
│   │   └── nutritionService.js # Nutrition database & calculation algorithms
│   ├── utils/            # Helper utilities
│   │   └── swagger.js        # Swagger UI configuration
│   ├── validators/       # Request validation schemas
│   │   └── schemas.js        # Joi schemas
│   └── server.js         # Main Express application entry point
├── tests/                # Test suites
│   └── api.test.js       # API endpoint tests (Supertest)
├── logs/                 # Auto-generated access logs
├── package.json          # Project metadata and dependencies
└── render.yaml           # Deployment configuration for Render
```

---

## 🚀 Startup Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Installation
Navigate to the project directory and install the dependencies:
```bash
cd ~/Desktop/nutriscan-ai
npm install
```

### 2. Running the Application
To start the application, run:
```bash
npm start
```
*Note: For active development with auto-reload, you can use `npm run dev` (requires `nodemon` to be installed).*

### 3. Accessing the App
Once the server is running, open your web browser and navigate to:
- **Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Documentation**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🧪 Testing

The project includes API tests written with `Jest` and `Supertest`. To run the test suite:
```bash
npm test
```

## 🛠️ Built With

- **Backend Framework**: [Express.js](https://expressjs.com/)
- **Validation**: [Joi](https://joi.dev/)
- **Documentation**: [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)
- **Security**: [Helmet](https://helmetjs.github.io/), [Cors](https://github.com/expressjs/cors), [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- **Testing**: [Jest](https://jestjs.io/), [Supertest](https://github.com/ladjs/supertest)
