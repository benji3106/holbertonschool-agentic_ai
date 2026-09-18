const test = require('node:test');
const assert = require('node:assert/strict');

const {
  isRefundAction,
  processNotification,
  requestHumanConfirmation
} = require('./worker.js');

test('US-09 - a refund notification requests an explicit human confirmation', async () => {
  let confirmationPrompted = false;
  let recordedDecision = null;

  const llmClient = {
    chat: {
      completions: {
        create: async () => {
          throw new Error('LLM should not run before human confirmation');
        }
      }
    }
  };

  const result = await processNotification(
    JSON.stringify({
      id: 'notif-refund-1',
      rawBody: JSON.stringify({ action: 'refund', amount: 42, currency: 'EUR' })
    }),
    llmClient,
    {
      askConfirmation: async () => {
        confirmationPrompted = true;
        return 'o';
      },
      recordHumanDecision: async (decision) => {
        recordedDecision = decision;
      }
    }
  );

  assert.equal(result, true);
  assert.equal(confirmationPrompted, true);
  assert.deepEqual(recordedDecision, {
    notificationId: 'notif-refund-1',
    status: 'succès',
    response: 'o',
    traceId: 'notif-refund-1'
  });
});

test('US-09 - a direct n response is recorded as n and cancels the refund', async () => {
  let confirmationPrompted = false;
  let recordedDecision = null;

  const llmClient = {
    chat: {
      completions: {
        create: async () => {
          throw new Error('LLM should not run after a denial');
        }
      }
    }
  };

  const result = await processNotification(
    JSON.stringify({
      id: 'notif-refund-2',
      rawBody: JSON.stringify({ action: 'refund', amount: 50, currency: 'EUR' })
    }),
    llmClient,
    {
      askConfirmation: async () => {
        confirmationPrompted = true;
        return 'n';
      },
      recordHumanDecision: async (decision) => {
        recordedDecision = decision;
      }
    }
  );

  assert.equal(result, false);
  assert.equal(confirmationPrompted, true);
  assert.deepEqual(recordedDecision, {
    notificationId: 'notif-refund-2',
    status: 'échec',
    response: 'n',
    traceId: 'notif-refund-2'
  });
});

test('US-09 - an empty or non-recognized response is marked as invalide', async () => {
  let recordedDecision = null;

  const result = await processNotification(
    JSON.stringify({
      id: 'notif-refund-3',
      rawBody: JSON.stringify({ action: 'refund', amount: 75, currency: 'EUR' })
    }),
    { chat: { completions: { create: async () => { throw new Error('LLM should not run'); } } } },
    {
      askConfirmation: async () => '',
      recordHumanDecision: async (decision) => {
        recordedDecision = decision;
      }
    }
  );

  assert.equal(result, false);
  assert.deepEqual(recordedDecision, {
    notificationId: 'notif-refund-3',
    status: 'échec',
    response: 'invalide',
    traceId: 'notif-refund-3'
  });
});

test('US-09 - no interactive terminal is treated as a failed refund decision and does not block the worker', async () => {
  const answer = await requestHumanConfirmation({ id: 'notif-no-tty' }, { isTTY: false }, { isTTY: false });

  assert.equal(answer, 'invalide');
});

test('US-09 - a rejected confirmation still resolves as a failed refund and does not hang the queue', async () => {
  let recordedDecision = null;

  const result = await processNotification(
    JSON.stringify({
      id: 'notif-refund-reject',
      rawBody: JSON.stringify({ action: 'refund', amount: 99, currency: 'EUR' })
    }),
    { chat: { completions: { create: async () => { throw new Error('LLM should not run'); } } } },
    {
      askConfirmation: async () => {
        throw new Error('stdin closed');
      },
      recordHumanDecision: async (decision) => {
        recordedDecision = decision;
      }
    }
  );

  assert.equal(result, false);
  assert.deepEqual(recordedDecision, {
    notificationId: 'notif-refund-reject',
    status: 'échec',
    response: 'invalide',
    traceId: 'notif-refund-reject'
  });
});

test('US-08 - only a JSON action equal to refund triggers the human validation path', () => {
  assert.equal(isRefundAction(JSON.stringify({ action: 'refund' })), true);
  assert.equal(isRefundAction(JSON.stringify({ action: 'chargeback' })), false);
  assert.equal(isRefundAction('{invalid json'), false);
  assert.equal(isRefundAction(JSON.stringify({ other: 'field' })), false);
});
