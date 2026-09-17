const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const { createApp } = require('./server.js');

test('US-01 - webhook accepts a valid payment notification', async () => {
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
  assert.equal((await response.json()).status, 'ok');

  await new Promise((resolve) => server.close(resolve));
});

test('US-02 - webhook logs UTC timestamp, method, raw body and status for each request', async () => {
  const app = createApp();
  const server = app.listen(0);
  const originalLog = console.log;
  const logs = [];

  console.log = (...args) => logs.push(args.join(' '));

  try {
    const port = server.address().port;
    const body = JSON.stringify({ paymentId: 'PAY-67890', amount: 125.5, currency: 'EUR' });
    const response = await fetch(`http://127.0.0.1:${port}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(2000)
    });

    assert.equal(response.status, 200);
    assert.ok(logs.length >= 1, 'Expected at least one console trace');

    const entry = logs[logs.length - 1];
    const trace = JSON.parse(entry);
    assert.match(trace.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.equal(trace.method, 'POST');
    assert.equal(trace.rawBody, body);
    assert.equal(trace.statusCode, 200);
  } finally {
    console.log = originalLog;
    await new Promise((resolve) => server.close(resolve));
  }
});

test('US-03 - webhook returns 200 OK immediately for empty, malformed and non-object payloads', async () => {
  const app = createApp();
  const server = app.listen(0);

  const port = server.address().port;
  const cases = [
    { label: 'empty body', init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '' } },
    { label: 'malformed json', init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"paymentId":"PAY-67890","amount":' } },
    { label: 'non-object json', init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '["PAY-67890",150.00,"EUR"]' } }
  ];

  for (const item of cases) {
    const startedAt = Date.now();
    const response = await fetch(`http://127.0.0.1:${port}/webhook`, item.init);
    const elapsedMs = Date.now() - startedAt;

    assert.equal(response.status, 200, `Expected 200 for ${item.label}`);
    assert.ok(elapsedMs <= 1000, `Expected request to answer within 1 second for ${item.label}`);
  }

  await new Promise((resolve) => server.close(resolve));
});

test('SEC-01 - webhook rejects oversized request bodies before processing them', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = server.address().port;
    const oversizedBody = JSON.stringify({ payload: 'A'.repeat(2 * 1024 * 1024) });

    const response = await fetch(`http://127.0.0.1:${port}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: oversizedBody,
      signal: AbortSignal.timeout(2000)
    });

    assert.equal(response.status, 413, 'Expected 413 for oversized request body');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('SEC-02 - Dockerfile uses npm ci instead of npm install', () => {
  const dockerfileContent = readFileSync(path.join(__dirname, '..', 'Dockerfile'), 'utf8');

  assert.match(dockerfileContent, /npm\s+ci\b/);
  assert.doesNotMatch(dockerfileContent, /npm\s+install\b/i);
});

test('SEC-03 - Dockerfile avoids chown -R on application sources', () => {
  const dockerfileContent = readFileSync(path.join(__dirname, '..', 'Dockerfile'), 'utf8');

  assert.doesNotMatch(dockerfileContent, /chown\s+-R\b/i);
  assert.match(dockerfileContent, /USER\s+node\b/i);
});

test('SEC-04 - Dockerfile runs the container as a non-root user', () => {
  const dockerfileContent = readFileSync(path.join(__dirname, '..', 'Dockerfile'), 'utf8');

  assert.match(dockerfileContent, /USER\s+(?!root)\S+/);
  assert.doesNotMatch(dockerfileContent, /USER\s+root\b/i);
});
