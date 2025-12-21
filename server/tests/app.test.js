const request = require('supertest');
const app = require('../src/app');

describe('App Setup', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('status', 'healthy');
      expect(res.body.data).toHaveProperty('timestamp');
      expect(res.body.data).toHaveProperty('uptime');
      expect(res.body.data).toHaveProperty('memory');
      expect(res.body.data).toHaveProperty('services');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const res = await request(app)
        .get('/unknown-route')
        .expect(404);
    });
  });
});