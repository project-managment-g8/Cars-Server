import request from 'supertest';
import { app } from '../server.js'; // Ensure correct path

describe('GET /ping', () => {
  it('should return pong <G8>', (done) => {
    request(app)
      .get('/ping')
      .expect(200)
      .expect('pong <G8>')
      .end(done);
  });
});
