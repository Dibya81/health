const request = require('supertest');
const app = require('../src/server');

describe('🏥 Health Endpoints', () => {
  test('GET /api/health → 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('🥗 Nutrition Analysis', () => {
  test('POST /api/nutrition/analyze', async () => {
    const res = await request(app)
      .post('/api/nutrition/analyze')
      .send({ foodName: 'chicken' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
