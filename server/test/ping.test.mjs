import request from 'supertest';
import { app } from '../server.js';

describe('GET /ping', function() {
  it('should return pong <G8>', function(done) {
    request(app)
      .get('/ping')
      .expect(200)
      .expect('pong <G8>')
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
