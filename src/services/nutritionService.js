/**
 * NutriScan AI Intelligence Module
 */

const { AIServiceError } = require('../middleware/errorHandler');
const { logger } = require('../middleware/requestLogger');

const NUTRITION_DB = {
  apple: { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4, sugar: 10, vitamins: ['C', 'B6'], minerals: ['Potassium'] },
  banana: { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, sugar: 12, vitamins: ['B6', 'C'], minerals: ['Potassium', 'Magnesium'] },
  rice: { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, sugar: 0, vitamins: ['B1', 'B3'], minerals: ['Manganese', 'Phosphorus'] },
  chicken: { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, sugar: 0, vitamins: ['B3', 'B6', 'B12'], minerals: ['Phosphorus', 'Selenium'] },
  egg: { calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0, sugar: 1.1, vitamins: ['A', 'D', 'B12'], minerals: ['Selenium', 'Choline'] },
  milk: { calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0, sugar: 5, vitamins: ['D', 'B12', 'A'], minerals: ['Calcium', 'Phosphorus'] },
  bread: { calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7, sugar: 5, vitamins: ['B1', 'B2', 'B3'], minerals: ['Iron', 'Sodium'] },
  pasta: { calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8, sugar: 0.6, vitamins: ['B1', 'B9'], minerals: ['Iron', 'Manganese'] },
  salmon: { calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0, sugar: 0, vitamins: ['D', 'B12', 'B3'], minerals: ['Selenium', 'Potassium'] },
  broccoli: { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6, sugar: 1.7, vitamins: ['C', 'K', 'A'], minerals: ['Potassium', 'Iron'] },
  spinach: { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2, sugar: 0.4, vitamins: ['K', 'A', 'C', 'B9'], minerals: ['Iron', 'Calcium'] },
  oats: { calories: 389, protein: 17, carbs: 66, fats: 7, fiber: 11, sugar: 1, vitamins: ['B1', 'B5'], minerals: ['Manganese', 'Phosphorus'] },
  pizza: { calories: 266, protein: 11, carbs: 33, fats: 10, fiber: 2.3, sugar: 3.6, vitamins: ['B12', 'A'], minerals: ['Calcium', 'Sodium'] },
  burger: { calories: 295, protein: 17, carbs: 24, fats: 14, fiber: 1.3, sugar: 5, vitamins: ['B12', 'B3'], minerals: ['Iron', 'Zinc'] },
  salad: { calories: 20, protein: 1.5, carbs: 3.5, fats: 0.3, fiber: 2, sugar: 1.5, vitamins: ['K', 'A', 'C'], minerals: ['Potassium', 'Folate'] },
  dosa: { calories: 133, protein: 2.7, carbs: 25, fats: 2.5, fiber: 0.5, sugar: 0.3, vitamins: ['B1', 'B3'], minerals: ['Iron', 'Phosphorus'] },
  idli: { calories: 58, protein: 2.2, carbs: 10.9, fats: 0.4, fiber: 0.3, sugar: 0, vitamins: ['B1', 'B3'], minerals: ['Iron', 'Calcium'] },
  dal: { calories: 116, protein: 9, carbs: 20, fats: 0.4, fiber: 8, sugar: 0, vitamins: ['B9', 'B1'], minerals: ['Iron', 'Potassium'] },
  roti: { calories: 264, protein: 9.7, carbs: 53, fats: 3.6, fiber: 4.6, sugar: 0, vitamins: ['B3', 'B1'], minerals: ['Iron', 'Manganese'] },
  paneer: { calories: 265, protein: 18, carbs: 1.2, fats: 21, fiber: 0, sugar: 1.2, vitamins: ['A', 'D', 'B12'], minerals: ['Calcium', 'Phosphorus'] },
};

function calculateTDEE({ weight = 70, height = 170, age = 30, gender = 'male', activityLevel = 'moderately-active' }) {
  const ACTIVITY_MULTIPLIERS = {
    'sedentary': 1.2,
    'lightly-active': 1.375,
    'moderately-active': 1.55,
    'very-active': 1.725,
    'extremely-active': 1.9,
  };

  let bmr;
  if (gender === 'female') bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  else bmr = 10 * weight + 6.25 * height - 5 * age + 5;

  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55));
}

function getMacroSplit(dietPreference, tdee) {
  const splits = {
    'balanced':       { protein: 0.25, carbs: 0.50, fats: 0.25 },
    'high-protein':   { protein: 0.35, carbs: 0.40, fats: 0.25 },
    'muscle-gain':    { protein: 0.35, carbs: 0.45, fats: 0.20 },
    'low-carb':       { protein: 0.30, carbs: 0.25, fats: 0.45 },
    'keto':           { protein: 0.25, carbs: 0.05, fats: 0.70 },
    'weight-loss':    { protein: 0.35, carbs: 0.35, fats: 0.30 },
    'vegetarian':     { protein: 0.20, carbs: 0.55, fats: 0.25 },
    'vegan':          { protein: 0.18, carbs: 0.58, fats: 0.24 },
    'mediterranean':  { protein: 0.22, carbs: 0.48, fats: 0.30 },
    'diabetic':       { protein: 0.28, carbs: 0.35, fats: 0.37 },
  };

  const split = splits[dietPreference] || splits['balanced'];
  return {
    calories: tdee,
    protein: Math.round((tdee * split.protein) / 4),
    carbs:   Math.round((tdee * split.carbs) / 4),
    fats:    Math.round((tdee * split.fats) / 9),
  };
}

function applyHealthConditionAdjustments(macros, condition) {
  const adjustments = {
    diabetes: {
      note: 'Reduced carbs, increased fiber, low glycemic focus',
      carbs: Math.round(macros.carbs * 0.7),
      restrictions: ['white rice', 'sugar', 'fruit juice', 'white bread'],
      recommendations: ['whole grains', 'leafy greens', 'legumes', 'nuts'],
    },
    hypertension: {
      note: 'Low sodium diet, rich in potassium and magnesium',
      restrictions: ['processed food', 'canned food', 'pickles', 'fast food'],
      recommendations: ['bananas', 'leafy greens', 'beets', 'oats', 'berries'],
    },
    obesity: {
      note: 'Caloric deficit of 500 kcal/day, high satiety foods',
      calories: macros.calories - 500,
      restrictions: ['sugary drinks', 'fast food', 'processed snacks'],
      recommendations: ['vegetables', 'lean protein', 'whole grains', 'water'],
    },
    celiac: {
      note: 'Strict gluten-free diet required',
      restrictions: ['wheat', 'barley', 'rye', 'regular bread', 'pasta'],
      recommendations: ['rice', 'quinoa', 'potatoes', 'corn', 'gluten-free oats'],
    },
    'lactose-intolerant': {
      note: 'Avoid dairy; supplement calcium from other sources',
      restrictions: ['milk', 'cheese', 'ice cream', 'cream'],
      recommendations: ['almond milk', 'soy milk', 'leafy greens', 'fortified foods'],
    },
    pcos: {
      note: 'Low GI foods, anti-inflammatory diet',
      restrictions: ['refined carbs', 'sugar', 'processed food'],
      recommendations: ['whole grains', 'leafy greens', 'berries', 'omega-3 rich foods'],
    },
    thyroid: {
      note: 'Iodine and selenium rich foods; avoid goitrogens if hypothyroid',
      restrictions: ['raw cruciferous vegetables (large amounts)', 'soy (excessive)'],
      recommendations: ['seafood', 'eggs', 'dairy', 'iodized salt'],
    },
    'heart-disease': {
      note: 'Low saturated fat, low cholesterol, heart-healthy diet',
      fats: Math.round(macros.fats * 0.7),
      restrictions: ['red meat', 'full-fat dairy', 'fried food', 'trans fats'],
      recommendations: ['fatty fish', 'olive oil', 'nuts', 'whole grains', 'fruits'],
    },
    none: {
      note: 'No health restrictions applied',
      restrictions: [],
      recommendations: ['variety of whole foods', 'stay hydrated', 'limit processed food'],
    },
  };

  const adj = adjustments[condition] || adjustments['none'];
  return {
    ...macros,
    ...adj,
    calories: adj.calories || macros.calories,
    carbs: adj.carbs || macros.carbs,
    fats: adj.fats || macros.fats,
  };
}

function lookupFoodNutrition(foodName, quantity = '100g') {
  const normalized = foodName.toLowerCase().trim();
  let match = NUTRITION_DB[normalized];

  if (!match) {
    const key = Object.keys(NUTRITION_DB).find(k =>
      normalized.includes(k) || k.includes(normalized)
    );
    match = key ? NUTRITION_DB[key] : null;
  }

  if (!match) return null;

  let multiplier = 1;
  const gMatch = quantity.match(/(\d+(?:\.\d+)?)\s*g/i);
  const servingMatch = quantity.match(/(\d+(?:\.\d+)?)\s*serving/i);

  if (gMatch) multiplier = parseFloat(gMatch[1]) / 100;
  else if (servingMatch) multiplier = parseFloat(servingMatch[1]);

  return {
    food: normalized,
    quantity,
    per100g: { ...match },
    adjusted: {
      calories: Math.round(match.calories * multiplier),
      protein: Math.round(match.protein * multiplier * 10) / 10,
      carbs: Math.round(match.carbs * multiplier * 10) / 10,
      fats: Math.round(match.fats * multiplier * 10) / 10,
      fiber: Math.round(match.fiber * multiplier * 10) / 10,
      sugar: Math.round(match.sugar * multiplier * 10) / 10,
    },
    vitamins: match.vitamins,
    minerals: match.minerals,
    source: 'database',
  };
}

function generateMealPlan({ dietPreference, healthCondition, macros, days = 1 }) {
  const plans = {
    'high-protein': {
      breakfast: ['Scrambled eggs (3) + oats + milk', 'Greek yogurt + banana + protein shake'],
      lunch: ['Grilled chicken breast + brown rice + broccoli', 'Tuna salad + whole grain bread + spinach'],
      dinner: ['Baked salmon + sweet potato + asparagus', 'Lean beef stir-fry + brown rice + mixed vegetables'],
      snacks: ['Protein bar', 'Cottage cheese + almonds', 'Hard-boiled egg + apple'],
    },
    'balanced': {
      breakfast: ['Oats + milk + banana', 'Whole wheat toast + eggs + orange juice'],
      lunch: ['Grilled chicken + rice + salad', 'Lentil soup + bread + yogurt'],
      dinner: ['Baked fish + vegetables + quinoa', 'Paneer curry + roti + dal'],
      snacks: ['Mixed nuts + fruit', 'Yogurt + granola'],
    },
    'diabetic': {
      breakfast: ['Oats (steel cut) + nuts + berries', 'Eggs + whole grain toast + avocado'],
      lunch: ['Grilled chicken + salad + olive oil', 'Dal + small portion brown rice + vegetables'],
      dinner: ['Fish + roasted vegetables (non-starchy)', 'Tofu stir-fry + cauliflower rice'],
      snacks: ['Nuts (small handful)', 'Cucumber + hummus', 'Berries'],
    },
    'vegan': {
      breakfast: ['Tofu scramble + whole grain toast', 'Smoothie bowl (oats + fruit + plant milk)'],
      lunch: ['Chickpea curry + brown rice', 'Lentil soup + whole grain bread + salad'],
      dinner: ['Tempeh stir-fry + quinoa + vegetables', 'Black bean tacos + corn tortillas + guacamole'],
      snacks: ['Fruit + almond butter', 'Trail mix', 'Hummus + veggie sticks'],
    },
    'keto': {
      breakfast: ['Eggs + bacon + avocado', 'Keto smoothie (MCT oil + berries + cream)'],
      lunch: ['Chicken salad with olive oil + cheese', 'Tuna + cucumber + full-fat yogurt'],
      dinner: ['Ribeye steak + roasted asparagus + butter', 'Salmon + zucchini noodles + cream sauce'],
      snacks: ['Cheese cubes', 'Macadamia nuts', 'Celery + cream cheese'],
    },
    'weight-loss': {
      breakfast: ['Egg white omelette + vegetables', 'Greek yogurt (fat-free) + berries'],
      lunch: ['Large salad + grilled chicken + lemon dressing', 'Vegetable soup + whole grain crackers'],
      dinner: ['Steamed fish + roasted vegetables', 'Tofu + stir-fried vegetables (minimal oil)'],
      snacks: ['Apple + celery', 'Low-fat yogurt', 'Cucumber + lemon'],
    },
  };

  const plan = plans[dietPreference] || plans['balanced'];

  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    breakfast: plan.breakfast[i % plan.breakfast.length],
    lunch: plan.lunch[i % plan.lunch.length],
    dinner: plan.dinner[i % plan.dinner.length],
    snacks: plan.snacks.slice(0, 2),
    estimatedMacros: {
      calories: macros.calories,
      protein: `${macros.protein}g`,
      carbs: `${macros.carbs}g`,
      fats: `${macros.fats}g`,
    },
  }));
}

function calculateHealthScore(nutrition) {
  let score = 70;
  if (nutrition.protein > 20) score += 10;
  if (nutrition.sugar < 5) score += 10;
  if (nutrition.fiber > 3) score += 10;
  if (nutrition.fats > 20) score -= 10;
  if (nutrition.calories > 600) score -= 10;
  if (nutrition.vitamins?.length > 2) score += 5;
  if (nutrition.minerals?.length > 1) score += 5;
  return Math.min(100, Math.max(0, score));
}

async function analyzeFoodItem({ foodName, quantity, dietPreference, healthCondition, activityLevel, age, weight, height, macroGoals }) {
  logger.info('analyzeFoodItem', { foodName, quantity, dietPreference });
  const nutritionData = lookupFoodNutrition(foodName, quantity);

  if (!nutritionData) {
    return {
      success: true,
      warning: `"${foodName}" not found in database. Showing estimated values.`,
      food: {
        name: foodName,
        quantity: quantity || '1 serving',
        nutrition: { calories: 150, protein: 5, carbs: 20, fats: 5, fiber: 2, sugar: 3 },
        vitamins: ['Various'],
        minerals: ['Various'],
        source: 'estimated',
        healthScore: 60,
        healthScoreLabel: 'Moderate',
      },
      recommendations: ['Try searching for a more specific food name', 'Use the image upload for better accuracy'],
    };
  }

  let personalizedTargets = null;
  if (weight && height && age) {
    const tdee = calculateTDEE({ weight, height, age, activityLevel });
    const rawMacros = getMacroSplit(dietPreference, tdee);
    personalizedTargets = applyHealthConditionAdjustments(rawMacros, healthCondition);
    if (macroGoals) Object.assign(personalizedTargets, macroGoals);
  }

  const healthScore = calculateHealthScore(nutritionData.adjusted);
  const healthScoreLabel = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Moderate' : 'Poor';

  return {
    success: true,
    food: {
      name: nutritionData.food,
      quantity: nutritionData.quantity,
      nutrition: nutritionData.adjusted,
      per100g: nutritionData.per100g,
      vitamins: nutritionData.vitamins,
      minerals: nutritionData.minerals,
      source: nutritionData.source,
      healthScore,
      healthScoreLabel,
    },
    personalization: personalizedTargets ? {
      dailyTargets: personalizedTargets,
      coveragePercent: {
        calories: Math.round((nutritionData.adjusted.calories / personalizedTargets.calories) * 100),
        protein: Math.round((nutritionData.adjusted.protein / personalizedTargets.protein) * 100),
        carbs: Math.round((nutritionData.adjusted.carbs / personalizedTargets.carbs) * 100),
        fats: Math.round((nutritionData.adjusted.fats / personalizedTargets.fats) * 100),
      },
    } : null,
    recommendations: getRecommendations({ dietPreference, healthCondition, nutrition: nutritionData.adjusted }),
  };
}

function getRecommendations({ dietPreference, healthCondition, nutrition }) {
  const recs = [];
  if (nutrition.protein < 10 && ['high-protein', 'muscle-gain'].includes(dietPreference)) recs.push('Low protein. Pair with eggs, chicken, or legumes.');
  if (nutrition.sugar > 10) recs.push('High sugar. Limit portion size.');
  if (nutrition.fiber < 1) recs.push('Low fiber. Add leafy greens.');
  if (healthCondition === 'diabetes' && nutrition.carbs > 30) recs.push('High carbs for diabetic diet.');
  if (nutrition.calories > 500) recs.push('High calorie item.');
  if (recs.length === 0) recs.push('Good nutritional profile!');
  return recs;
}

async function generatePersonalizedPlan({ dietPreference, healthCondition, activityLevel, age, weight, height, macroGoals, days }) {
  logger.info('generatePersonalizedPlan', { dietPreference, healthCondition, days });
  const w = weight || 70, h = height || 170, a = age || 30;
  const tdee = calculateTDEE({ weight: w, height: h, age: a, activityLevel });
  let macros = getMacroSplit(dietPreference, tdee);
  macros = applyHealthConditionAdjustments(macros, healthCondition);
  if (macroGoals) Object.assign(macros, macroGoals);

  return {
    success: true,
    profile: { weight: w, height: h, age: a, activityLevel, dietPreference, healthCondition },
    tdee,
    dailyMacros: macros,
    mealPlan: generateMealPlan({ dietPreference, healthCondition, macros, days }),
    hydration: `Drink at least ${Math.round(w * 0.033)} liters of water daily`,
    generalTips: ['Eat at consistent times', 'Chew slowly', 'Prep in advance', 'Track weekly'],
  };
}

module.exports = {
  analyzeFoodItem,
  generatePersonalizedPlan,
  lookupFoodNutrition,
  calculateTDEE,
  getMacroSplit,
  NUTRITION_DB,
};
