'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['headers-option'];

describe('headers option', () => {
  let server;
  let req;

  describe('as a string', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          headers: { 'X-Foo': '1' },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('GET request with headers', async () => {
      const res = await req.get('/main.js');
      expect(res.headers['x-foo']).toEqual('1');
      expect(res.status).toEqual(200);
    });
  });

  describe('as an array', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          headers: { 'X-Bar': ['key1=value1', 'key2=value2'] },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('GET request with headers as an array', async () => {
      // https://github.com/webpack/webpack-dev-server/pull/1650#discussion_r254217027
      const expected = 'key1=value1, key2=value2';
      const res = await req.get('/main.js');
      expect(res.headers['x-bar']).toEqual(expected);
      expect(res.status).toEqual(200);
    });
  });

  describe('as a function', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          headers: () => {
            return { 'X-Bar': ['key1=value1', 'key2=value2'] };
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('GET request with headers as a function', async () => {
      // https://github.com/webpack/webpack-dev-server/pull/1650#discussion_r254217027
      const expected = 'key1=value1, key2=value2';
      const res = await req.get('/main.js');
      expect(res.headers['x-bar']).toEqual(expected);
      expect(res.status).toEqual(200);
    });
  });

  describe('dev middleware headers take precedence for dev middleware output files', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          headers: { 'X-Foo': '1' },
          devMiddleware: {
            headers: { 'X-Foo': '2' },
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('GET request with headers', async () => {
      const res = await req.get('/main.js');
      expect(res.headers['x-foo']).toEqual('2');
      expect(res.status).toEqual(200);
    });
  });
});
