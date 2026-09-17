const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('./server.js');

const makeRequest = async (app, payload, method = 'POST') => {
  const response = await fetch('http://127.0.0.1', {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
    signal: AbortSignal.timeout(2000)
  });

  return response;
};

test('webhook returns 200 OK for a valid payment payload', async () => {
  const app = createApp();
  const server = app.listen(0);

  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId: 'PAY-12345', amount: 150.0, currency: 'EUR' }),
    signal: AbortSignal.timeout(2000)
  });

  assert.equal(response.status, 200);
  await new Promise((resolve) => server.close(resolve));
});

test('webhook returns 200 OK for invalid and empty payloads', async () => {
  const app = createApp();
  const server = app.listen(0);

  const port = server.address().port;
  const cases = [
    { label: 'empty body', init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '' } },
    { label: 'malformed json', init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"paymentId":"PAY-67890","amount":' } },
    { label: 'non-object json', init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '["PAY-67890",150.00,"EUR"]' } }
  ];

  for (const item of cases) {
    const response = await fetch(`http://127.0.0.1:${port}/webhook`, item.init);
    assert.equal(response.status, 200, `Expected 200 for ${item.label}`);
  }

  await new Promise((resolve) => server.close(resolve));
});
