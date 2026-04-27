<div align="center">

# 🥗 NutriScan AI

**Smart Diet & Nutrition Analyzer**

A full-stack Node.js + Express application that delivers detailed nutritional analysis, personalized meal planning, and health-condition-aware dietary recommendations — served through a modern SaaS-grade dark dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-≥18.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-Jest%20%2B%20Supertest-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Docs](https://img.shields.io/badge/API%20Docs-Swagger%20UI-85EA2D?logo=swagger&logoColor=black)](http://localhost:3000/api/docs)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Live Demo & Endpoints](#-live-demo--endpoints)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Food Database](#-food-database)
- [Diet Profiles & Health Conditions](#-diet-profiles--health-conditions)
- [Algorithms & Scoring](#-algorithms--scoring)
- [Security](#-security)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running Tests](#-running-tests)
- [Deployment](#-deployment)
- [Frontend UI Guide](#-frontend-ui-guide)
- [Known Limitations](#-known-limitations)
- [Contributing](#-contributing)

---

## 🧠 Overview

NutriScan AI is a nutrition intelligence platform built around a curated food database of 20 common foods (including Indian staples like **dal, dosa, idli, roti, paneer**). It computes macro/micronutrient breakdowns scaled to any quantity, calculates personalized TDEE (Total Daily Energy Expenditure), applies health-condition-specific dietary adjustments, and generates multi-day meal plans — all in real time.

The application is fully self-contained: the backend serves the frontend as static files, so a single deployment URL covers both the API and the UI.

---

## 🌐 Live Demo & Endpoints

Once running locally on `http://localhost:3000`:

| URL | Description |
|-----|-------------|
| `/` | Main dashboard (SaaS UI) |
| `/api/docs` | Swagger interactive API docs |
| `/api/health` | Basic health check |
| `/api/health/deep` | System info + service status |
| `/api/nutrition/analyze` | Food analysis endpoint |
| `/api/nutrition/plan` | Meal plan generator |
| `/api/nutrition/foods` | Full food database listing |
| `/api/nutrition/options` | All valid enum values |
| `/api/history` | Request history |
| `/api/export/json` | Export data as downloadable JSON |

---

## ✨ Features

### Core Features

- **Food Nutrition Analysis** — Macro + micronutrient breakdown (calories, protein, carbs, fats, fiber, sugar, vitamins, minerals) scaled to any gram quantity or serving count
- **Health Score** — Algorithmic 0–100 health score with labels: Excellent / Good / Moderate / Poor
- **Personalized TDEE** — Mifflin-St Jeor BMR formula with 5 activity level multipliers
- **Macro Targeting** — 10 diet-preference splits (keto, high-protein, vegan, etc.) with custom macro goal overrides
- **Health Condition Adjustments** — 8 medical conditions modify caloric targets, carb caps, food restrictions, and recommendations
- **Daily Coverage %** — Shows what percentage of daily targets a single food item covers
- **Multi-Day Meal Plans** — 1–7 day meal plans with breakfast, lunch, dinner, snacks, and macro breakdowns per day
- **Hydration Recommendation** — Weight-based daily water intake guidance
- **Image Upload** — Upload a food image (client-side validated: type + size); server assigns a food from the database (mock recognition)
- **Unknown Food Fallback** — Foods not in the database return estimated values instead of errors

### Platform Features

- **Swagger UI** — Full interactive API documentation at `/api/docs`
- **Request History** — In-memory circular log of last 100 API requests, filterable to nutrition endpoints
- **JSON Export** — Download any analysis or meal plan as a formatted `.json` file
- **Rate Limiting** — Global (100 req/15min) + analysis-specific (10 req/min) limiters
- **Structured Error Responses** — Consistent `{ success, error: { code, message, details } }` format
- **Health Checks** — Shallow (`/api/health`) and deep (`/api/health/deep`) with system metrics
- **Request ID Tracing** — Every request gets a UUID (`X-Request-ID` header + `requestId` in response body)
- **Access Logging** — Morgan HTTP logs written to `logs/access.log` + structured JSON app logs to `logs/app.log`

### Frontend Features

- SaaS-style dark dashboard with sidebar navigation
- 5 pages: Dashboard, Analyze Food, Meal Plan, Food Database, Request History
- Animated SVG health score ring
- Macro coverage progress bars (animated)
- Vitamin/mineral badges
- Toast notification system
- Drag-and-drop image upload with preview
- Client-side real-time field validation
- Skeleton/spinner loading states
- Empty states for all list views
- One-click JSON export and clipboard copy
- API status indicator with live polling (every 30s)
- Session stats on dashboard (foods analyzed, DB size, API version)
- Name-based personalized greeting (stored in `localStorage`)

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js ≥18 | JavaScript runtime |
| Framework | Express 4.18 | HTTP server & routing |
| Validation | Joi 17 | Request schema validation |
| File Upload | Multer 1.4 | `multipart/form-data` handling |
| Security | Helmet 7 | HTTP security headers |
| CORS | cors 2.8 | Cross-origin resource sharing |
| Rate Limiting | express-rate-limit 7 | API abuse prevention |
| Auth | jsonwebtoken 9 | JWT verification |
| HTTP Logging | Morgan 1.10 | Access log format |
| API Docs | swagger-jsdoc + swagger-ui-express | Interactive documentation |
| IDs | uuid 9 | Request ID generation |
| Testing | Jest 29 + Supertest 6 | Unit + integration tests |
| Dev | Nodemon 3 | Auto-reload in development |
| Frontend | Vanilla HTML/CSS/JS | No build step required |

---

## 📂 Project Structure

```
nutriscan-ai/
│
├── public/                         # Static frontend (served by Express)
│   ├── index.html                  # SaaS dashboard shell (login, sidebar, 5 pages)
│   └── app.js                      # Frontend logic (state, API calls, rendering)
│
├── src/                            # Backend application
│   │
│   ├── server.js                   # App entry point — middleware stack, route mounting
│   │
│   ├── routes/                     # Express route handlers
│   │   ├── nutrition.js            # POST /analyze, POST /plan, GET /foods, GET /options
│   │   ├── health.js               # GET /health, GET /health/deep
│   │   ├── history.js              # GET /history, DELETE /history
│   │   └── export.js               # POST /export/json
│   │
│   ├── services/
│   │   └── nutritionService.js     # Core logic: NUTRITION_DB, TDEE, macros, meal plans,
│   │                               # health score, recommendations, quantity scaling
│   │
│   ├── middleware/
│   │   ├── auth.js                 # API key auth + JWT auth + token generator
│   │   ├── errorHandler.js         # AppError class hierarchy + global error handler
│   │   └── requestLogger.js        # UUID injection, in-memory history, structured logger
│   │
│   ├── validators/
│   │   └── schemas.js              # Joi schemas: analyzeTextSchema, analyzePlanSchema,
│   │                               # macroGoalsSchema, validateImageFile middleware
│   │
│   └── utils/
│       └── swagger.js              # OpenAPI spec configuration
│
├── tests/
│   └── api.test.js                 # Jest + Supertest integration tests
│
├── logs/                           # Auto-created at runtime
│   ├── access.log                  # Morgan HTTP access log
│   └── app.log                     # Structured JSON application log
│
├── .env.example                    # Environment variable template
├── package.json                    # Dependencies + npm scripts
├── render.yaml                     # Render.com deployment config
└── README.md                       # This file
```

---

## 📡 API Reference

All endpoints return JSON. Successful responses include `success: true`. Errors follow:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [{ "field": "age", "message": "Must be between 1 and 120" }]
  },
  "requestId": "uuid-here",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### `GET /api/health`

Basic health check. Used by the frontend status indicator.

**Response `200`:**
```json
{
  "status": "healthy",
  "service": "nutriscan-api",
  "version": "1.0.0",
  "uptime": 342.1,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### `GET /api/health/deep`

System-level health check including memory, CPU, and service status.

**Response `200`:**
```json
{
  "status": "healthy",
  "system": {
    "platform": "linux",
    "totalMemory": 8589934592,
    "freeMemory": 4294967296,
    "cpus": 4
  },
  "services": { "database": "connected", "ai_engine": "online" }
}
```

---

### `POST /api/nutrition/analyze`

Analyzes a food item and returns macro/micronutrient data, health score, and personalized insights.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `foodName` | string | ✅ (or image) | Food name (e.g. `chicken`, `dal`, `banana`) |
| `image` | file | ✅ (or name) | Food photo — JPG/PNG/WebP/GIF, max 5MB |
| `quantity` | string | ❌ | e.g. `150g`, `1 serving`, `2 pieces`. Default: `1 serving` |
| `dietPreference` | enum | ❌ | One of 10 diet profiles. Default: `balanced` |
| `healthCondition` | enum | ❌ | One of 8 conditions. Default: `none` |
| `activityLevel` | enum | ❌ | One of 5 levels. Default: `moderately-active` |
| `age` | integer 1–120 | ❌ | Enables TDEE calculation |
| `weight` | number 1–500 | ❌ | Body weight in kg |
| `height` | number 50–300 | ❌ | Height in cm |
| `macroGoals` | JSON string | ❌ | Override macro targets: `{"calories":2000,"protein":150}` |

> **Note:** When sending `macroGoals` in a multipart form, serialize it as a JSON string. The backend parses it automatically.

**Response `200`:**
```json
{
  "success": true,
  "food": {
    "name": "chicken",
    "quantity": "150g",
    "nutrition": {
      "calories": 248, "protein": 46.5, "carbs": 0,
      "fats": 5.4, "fiber": 0, "sugar": 0
    },
    "per100g": { "calories": 165, "protein": 31, "carbs": 0, "fats": 3.6 },
    "vitamins": ["B3", "B6", "B12"],
    "minerals": ["Phosphorus", "Selenium"],
    "source": "database",
    "healthScore": 90,
    "healthScoreLabel": "Excellent"
  },
  "personalization": {
    "dailyTargets": { "calories": 2558, "protein": 224, "carbs": 256, "fats": 71 },
    "coveragePercent": { "calories": 10, "protein": 21, "carbs": 0, "fats": 8 }
  },
  "recommendations": ["Good nutritional profile!"],
  "meta": {
    "requestId": "...", "analysisType": "text", "timestamp": "..."
  }
}
```

---

### `POST /api/nutrition/plan`

Generates a personalized multi-day meal plan.

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dietPreference` | enum | ✅ | Diet profile |
| `healthCondition` | enum | ❌ | Medical condition |
| `activityLevel` | enum | ❌ | Activity level |
| `age` | integer | ❌ | Age in years |
| `weight` | number | ❌ | Weight in kg |
| `height` | number | ❌ | Height in cm |
| `macroGoals` | object | ❌ | Manual macro overrides |
| `days` | integer 1–7 | ❌ | Number of days. Default: `1` |

**Response `200`:**
```json
{
  "success": true,
  "profile": { "weight": 70, "height": 170, "age": 28, "dietPreference": "keto" },
  "tdee": 2324,
  "dailyMacros": {
    "calories": 2324, "protein": 145, "carbs": 29, "fats": 181,
    "note": "No health restrictions applied"
  },
  "mealPlan": [
    {
      "day": 1,
      "breakfast": "Eggs + bacon + avocado",
      "lunch": "Chicken salad with olive oil + cheese",
      "dinner": "Ribeye steak + roasted asparagus + butter",
      "snacks": ["Cheese cubes", "Macadamia nuts"],
      "estimatedMacros": { "calories": 2324, "protein": "145g", "carbs": "29g", "fats": "181g" }
    }
  ],
  "hydration": "Drink at least 2.3 liters of water daily",
  "generalTips": ["Eat at consistent times", "Chew slowly", "Prep in advance", "Track weekly"]
}
```

---

### `GET /api/nutrition/foods`

Returns all foods in the database with basic macros.

**Response `200`:**
```json
{
  "success": true,
  "count": 20,
  "foods": [
    { "name": "apple", "calories": 52, "protein": 0.3 },
    { "name": "chicken", "calories": 165, "protein": 31 }
  ],
  "dietPreferences": ["balanced", "high-protein", ...],
  "healthConditions": ["none", "diabetes", ...]
}
```

---

### `GET /api/nutrition/options`

Returns all valid enum values for dropdowns.

---

### `GET /api/history`

Returns the last 100 API requests (filtered to nutrition endpoints).

---

### `DELETE /api/history`

Clears the in-memory request history.

---

### `POST /api/export/json`

Returns a downloadable JSON file with provided data.

**Body:**
```json
{ "data": { "any": "result object" }, "filename": "my-export" }
```

---

## 🗄 Food Database

20 foods are currently supported. Per-100g nutritional values are stored; the API scales them automatically to your requested quantity.

| Food | Cal | Protein | Carbs | Fats | Region |
|------|-----|---------|-------|------|--------|
| Apple | 52 | 0.3g | 14g | 0.2g | Global |
| Banana | 89 | 1.1g | 23g | 0.3g | Global |
| Rice | 130 | 2.7g | 28g | 0.3g | Global |
| Chicken | 165 | 31g | 0g | 3.6g | Global |
| Egg | 155 | 13g | 1.1g | 11g | Global |
| Milk | 61 | 3.2g | 4.8g | 3.3g | Global |
| Bread | 265 | 9g | 49g | 3.2g | Global |
| Pasta | 131 | 5g | 25g | 1.1g | Global |
| Salmon | 208 | 20g | 0g | 13g | Global |
| Broccoli | 34 | 2.8g | 7g | 0.4g | Global |
| Spinach | 23 | 2.9g | 3.6g | 0.4g | Global |
| Oats | 389 | 17g | 66g | 7g | Global |
| Pizza | 266 | 11g | 33g | 10g | Global |
| Burger | 295 | 17g | 24g | 14g | Global |
| Salad | 20 | 1.5g | 3.5g | 0.3g | Global |
| **Dosa** | 133 | 2.7g | 25g | 2.5g | 🇮🇳 India |
| **Idli** | 58 | 2.2g | 10.9g | 0.4g | 🇮🇳 India |
| **Dal** | 116 | 9g | 20g | 0.4g | 🇮🇳 India |
| **Roti** | 264 | 9.7g | 53g | 3.6g | 🇮🇳 India |
| **Paneer** | 265 | 18g | 1.2g | 21g | 🇮🇳 India |

**Quantity parsing** supports:
- `150g` → scales by 1.5×
- `1 serving` / `2 servings` → scales by count
- Unrecognized strings → defaults to 100g baseline

---

## 🥑 Diet Profiles & Health Conditions

### Diet Profiles (10)

| Profile | Protein % | Carbs % | Fats % | Best For |
|---------|-----------|---------|--------|---------|
| `balanced` | 25% | 50% | 25% | General health |
| `high-protein` | 35% | 40% | 25% | Athletes, active individuals |
| `muscle-gain` | 35% | 45% | 20% | Bodybuilding, strength training |
| `low-carb` | 30% | 25% | 45% | Metabolic health, weight loss |
| `keto` | 25% | 5% | 70% | Ketosis, epilepsy management |
| `weight-loss` | 35% | 35% | 30% | Caloric deficit diets |
| `vegetarian` | 20% | 55% | 25% | Plant-based with dairy/eggs |
| `vegan` | 18% | 58% | 24% | Fully plant-based |
| `mediterranean` | 22% | 48% | 30% | Heart health, longevity |
| `diabetic` | 28% | 35% | 37% | Blood sugar management |

### Health Conditions (8 + none)

| Condition | Key Adjustment |
|-----------|---------------|
| `diabetes` | Carbs reduced to 70%, low-GI food focus |
| `hypertension` | Low sodium, potassium/magnesium rich recommendations |
| `obesity` | 500 kcal/day deficit applied to TDEE |
| `celiac` | Gluten-free food restrictions |
| `lactose-intolerant` | Dairy restrictions, alternative calcium sources |
| `pcos` | Anti-inflammatory, low-GI diet |
| `thyroid` | Iodine/selenium guidance, goitrogen awareness |
| `heart-disease` | Fats reduced to 70%, low saturated fat focus |

---

## 🧮 Algorithms & Scoring

### TDEE Calculation

Uses the **Mifflin-St Jeor equation**:

```
Male BMR   = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
Female BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161

TDEE = BMR × activity_multiplier
```

| Activity Level | Multiplier |
|---------------|------------|
| Sedentary | 1.20 |
| Lightly Active | 1.375 |
| Moderately Active | 1.55 |
| Very Active | 1.725 |
| Extremely Active | 1.90 |

### Health Score Algorithm

Base score: **70**

| Condition | Score Change |
|-----------|-------------|
| Protein > 20g | +10 |
| Sugar < 5g | +10 |
| Fiber > 3g | +10 |
| Fats > 20g | −10 |
| Calories > 600 | −10 |
| Vitamins count > 2 | +5 |
| Minerals count > 1 | +5 |

Score is clamped to `[0, 100]`. Labels: ≥80 Excellent · ≥60 Good · ≥40 Moderate · <40 Poor.

---

## 🔐 Security

| Layer | Implementation |
|-------|---------------|
| HTTP Headers | `helmet` — sets CSP, HSTS, X-Frame-Options, etc. |
| CORS | Configurable via `ALLOWED_ORIGINS` env var |
| Rate Limiting | Global: 100 req/15min · Analysis: 10 req/1min |
| Input Validation | Joi schemas with strict type coercion and unknown field stripping |
| File Upload Validation | MIME type whitelist + 5MB size cap (client + server) |
| Authentication | API key (`x-api-key` header) OR JWT Bearer token |
| Error Sanitization | Stack traces only exposed in non-production environments |
| Request Tracing | UUID per request in header + response body |

**Authentication flow:**

```
Request arrives
    ↓
Has x-api-key header?
    ├─ YES → validate against VALID_API_KEYS set
    └─ NO  → check Authorization: Bearer <token>
                 ├─ Valid JWT → proceed
                 └─ No token → proceed as unauthenticated (public endpoints allowed)
```

> `/api/health` is always public and bypasses all auth checks.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 18.0.0` — [Download](https://nodejs.org/)
- **npm** `>= 9.0.0` (bundled with Node)

### Installation

```bash
# 1. Clone or extract the project
cd nutriscan-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section)
```

### Development

```bash
npm run dev
# Server starts at http://localhost:3000
# Auto-reloads on file changes (nodemon)
```

### Production

```bash
npm start
# Server starts at http://localhost:3000 (or PORT env var)
```

### Verify it's working

```bash
# Health check
curl http://localhost:3000/api/health

# Quick food analysis
curl -X POST http://localhost:3000/api/nutrition/analyze \
  -H "Content-Type: application/json" \
  -d '{"foodName":"chicken","quantity":"150g","dietPreference":"high-protein"}'

# Meal plan (3-day vegan)
curl -X POST http://localhost:3000/api/nutrition/plan \
  -H "Content-Type: application/json" \
  -d '{"dietPreference":"vegan","days":3,"age":25,"weight":65,"height":165}'
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Server
PORT=3000
NODE_ENV=development          # "production" disables stack traces in errors

# Security
JWT_SECRET=replace_with_min_32_char_random_string
API_KEYS=key1,key2,key3       # Comma-separated list of valid API keys

# CORS
ALLOWED_ORIGINS=http://localhost:3000    # Comma-separated. Use "*" for dev only.
```

| Variable | Required in Prod | Default (Dev) | Description |
|----------|-----------------|--------------|-------------|
| `PORT` | ❌ | `3000` | HTTP port |
| `NODE_ENV` | ✅ | `development` | Affects error verbosity and startup guards |
| `JWT_SECRET` | ✅ | Hardcoded fallback | Must be changed — app refuses to start in prod without it |
| `API_KEYS` | ✅ | Demo keys | Must be changed — app refuses to start in prod without it |
| `ALLOWED_ORIGINS` | ✅ | `*` | Restrict to your frontend domain in production |

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Watch mode (re-runs on file save)
npm run test:watch
```

Tests use **Jest** + **Supertest** and cover:

- `GET /api/health` → 200 + `status: healthy`
- `POST /api/nutrition/analyze` with `foodName: chicken` → 200 + `success: true`

To extend tests, add cases to `tests/api.test.js`:

```js
test('POST /api/nutrition/plan - keto 3 days', async () => {
  const res = await request(app)
    .post('/api/nutrition/plan')
    .send({ dietPreference: 'keto', days: 3, weight: 75, height: 175, age: 28 });
  expect(res.status).toBe(200);
  expect(res.body.mealPlan).toHaveLength(3);
});
```

---

## ☁️ Deployment

### Deploy to Render (Recommended)

The project includes a `render.yaml` for one-click deployment:

1. Push your project to a GitHub repository
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — click **Deploy**
5. Set secret environment variables in the Render dashboard:
   - `JWT_SECRET` → generate a strong random value
   - `API_KEYS` → your production API keys
   - `ALLOWED_ORIGINS` → your Render service URL

```yaml
# render.yaml (already included)
services:
  - type: web
    name: nutriscan-api
    env: node
    buildCommand: npm install
    startCommand: node src/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: API_KEYS
        generateValue: true
```

### Deploy to Railway / Fly.io

```bash
# Railway
railway init && railway up

# Fly.io
fly launch && fly deploy
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

```bash
docker build -t nutriscan-ai .
docker run -p 3000:3000 --env-file .env nutriscan-ai
```

### Pre-Deployment Checklist

- [ ] `NODE_ENV=production` is set
- [ ] `JWT_SECRET` is a strong random string (≥32 chars), not the default
- [ ] `API_KEYS` contains real production keys, not demo keys
- [ ] `ALLOWED_ORIGINS` is set to your frontend domain (not `*`)
- [ ] `GET /api/health` returns `status: healthy` after deploy
- [ ] `GET /api/docs` loads Swagger UI correctly
- [ ] Test a food analysis via the deployed URL
- [ ] Verify rate limiting works (send >10 requests/minute to `/api/nutrition/analyze`)

---

## 🖥 Frontend UI Guide

The UI has 5 pages navigated via the left sidebar:

### Dashboard
- Session stats: foods analyzed, DB size, API version
- API status badge (live-polling every 30 seconds)
- Quick-start buttons to Analyze or Plan
- Diet profile badge grid

### Analyze Food
Left panel: input form
- Food name text field (or drag-drop image upload)
- Quantity field (e.g. `150g`, `1 serving`)
- Profile: diet preference, health condition, activity level
- Optional personal metrics: age, weight, height
- Expandable custom macro goals section

Right panel: results
- Animated SVG health score ring
- 4 macro cards (Calories, Protein, Carbs, Fats)
- Additional nutrients: fiber, sugar
- Vitamin and mineral badges
- Daily target coverage progress bars (if personal metrics provided)
- Personalized recommendations
- Export JSON / Copy to clipboard buttons

### Meal Plan
- Plan settings (diet, condition, activity, days, personal metrics)
- Results: daily macro targets, day-by-day meal cards (breakfast/lunch/dinner/snacks), hydration tip, general tips
- Export plan as JSON

### Food Database
- Searchable table of all 20 foods
- Quick Analyze button per food (pre-fills the analyze form)

### Request History
- Shows last 100 API requests (method, path, status code, duration, timestamp)
- Refresh and Clear buttons

---

## ⚠️ Known Limitations

| Limitation | Impact | Notes |
|-----------|--------|-------|
| Mock image recognition | Images are assigned a food by `fileSize % dbSize` (random) | A real vision API (Google Vision, Clarifai) would replace `mockImageRecognition()` in `nutrition.js` |
| In-memory history | Resets on server restart | Replace `requestHistory` array with Redis or a database for persistence |
| No real user accounts | Names stored in `localStorage` only | Add a database + proper auth for multi-user support |
| Food DB size (20 items) | Unknown foods return estimated values | Extend `NUTRITION_DB` in `nutritionService.js` or integrate a nutrition API (USDA FoodData, Edamam) |
| Gender assumption in TDEE | Defaults to male formula | Add `gender` field to schemas for accurate female BMR |
| No HTTPS enforcement | App relies on deployment platform for TLS | Render, Railway, Fly.io all provide TLS automatically |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit: `git commit -m 'feat: add your feature'`
6. Push and open a Pull Request

### Adding a New Food

In `src/services/nutritionService.js`, add an entry to `NUTRITION_DB`:

```js
const NUTRITION_DB = {
  // ... existing foods ...
  avocado: {
    calories: 160, protein: 2, carbs: 9, fats: 15,
    fiber: 7, sugar: 0.7,
    vitamins: ['K', 'E', 'C', 'B6'],
    minerals: ['Potassium', 'Magnesium']
  },
};
```

No other changes needed — the food immediately appears in `/api/nutrition/foods`, is searchable in the UI, and can be analyzed.

### Adding a New Diet Profile

In `src/services/nutritionService.js`:

```js
// 1. Add macro split in getMacroSplit()
'carnivore': { protein: 0.45, carbs: 0.02, fats: 0.53 },

// 2. Add meal plan in generateMealPlan()
'carnivore': {
  breakfast: ['Ribeye + eggs', ...],
  lunch: ['Ground beef + cheese', ...],
  dinner: ['Lamb chops + bone broth', ...],
  snacks: ['Beef jerky', ...],
},
```

In `src/validators/schemas.js`:
```js
const DIET_PREFERENCES = [...existingList, 'carnivore'];
```

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for full text.

---

<div align="center">

Built with ❤️ using Node.js + Express · NutriScan AI v1.0.0

</div>
