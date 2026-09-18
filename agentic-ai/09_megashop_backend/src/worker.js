const dotenv = require('dotenv');
const Redis = require('ioredis');
const OpenAI = require('openai');
const { createInterface } = require('node:readline/promises');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { LangfuseSpanProcessor } = require('@langfuse/otel');
const { observeOpenAI } = require('@langfuse/openai');

dotenv.config();

const QUEUE_NAME = process.env.QUEUE_NAME || 'payment_notifications';
const DECISIONS = new Set(['conforme', 'non_conforme', 'a_verifier']);
let langfuseSdk;
let langfuseProcessor;

function initializeLangfuseTracing() {
  if (langfuseSdk) {
    return { sdk: langfuseSdk, processor: langfuseProcessor };
  }

  langfuseProcessor = new LangfuseSpanProcessor({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL,
    exportMode: 'immediate',
    flushAt: 1
  });

  langfuseSdk = new NodeSDK({
    spanProcessors: [langfuseProcessor]
  });

  langfuseSdk.start();

  process.on('SIGTERM', async () => {
    if (langfuseProcessor) {
      await langfuseProcessor.forceFlush();
    }
    if (langfuseSdk) {
      await langfuseSdk.shutdown();
    }
    process.exit(0);
  });

  return { sdk: langfuseSdk, processor: langfuseProcessor };
}

// US-05 - Analyse asynchrone de la transaction
function createLlmClient(traceConfig = {}) {
  const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: process.env.GEMINI_BASE_URL
  });

  return observeOpenAI(client, {
    generationName: 'payment-notification-analysis',
    ...traceConfig
  });
}

// US-06 - Résultat exploitable de l'analyse IA
function parseNotification(message) {
  const notification = JSON.parse(message);

  if (!notification || typeof notification.id !== 'string' || typeof notification.rawBody !== 'string') {
    throw new Error('Invalid notification message');
  }

  return notification;
}

// US-06 - Résultat exploitable de l'analyse IA
async function analyseNotification(notification, llmClient) {
  if (notification.rawBody.length === 0) {
    return 'a_verifier';
  }

  try {
    JSON.parse(notification.rawBody);
  } catch (error) {
    return 'a_verifier';
  }

  const completion = await llmClient.chat.completions.create({
    model: process.env.LLM_MODEL || 'gemini-2.0-flash',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'Analyse la notification de paiement et réponds uniquement par conforme, non_conforme ou a_verifier.'
      },
      {
        role: 'user',
        content: notification.rawBody
      }
    ]
  });

  const decision = completion.choices[0]?.message?.content?.trim();
  if (!DECISIONS.has(decision)) {
    throw new Error('LLM returned an invalid decision');
  }

  return decision;
}

// US-08 - Détection d'une action de remboursement
function isRefundAction(rawBody) {
  if (typeof rawBody !== 'string' || rawBody.trim() === '') {
    return false;
  }

  try {
    const payload = JSON.parse(rawBody);
    return !!payload && payload.action === 'refund';
  } catch (error) {
    return false;
  }
}

function hasInteractiveTerminal(input = process.stdin, output = process.stdout) {
  const inputIsTty = input && typeof input.isTTY === 'boolean' ? input.isTTY : false;
  const outputIsTty = output && typeof output.isTTY === 'boolean' ? output.isTTY : false;

  return inputIsTty && outputIsTty;
}

// US-09 - Validation humaine avant remboursement
async function requestHumanConfirmation(notification, input = process.stdin, output = process.stdout) {
  if (!hasInteractiveTerminal(input, output)) {
    return 'invalide';
  }

  const rl = createInterface({ input, output });

  try {
    const answer = await rl.question(`Notification ${notification.id} : remboursement détecté. Autoriser le remboursement ? [o/n] `);
    return String(answer).trim().toLowerCase();
  } catch (error) {
    return 'invalide';
  } finally {
    rl.close();
  }
}

// US-10 - Enregistrement de la décision dans Langfuse
async function recordHumanDecisionInLangfuse({ notificationId, traceId, status, response }) {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl = process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com';

  if (!publicKey || !secretKey) {
    console.error(JSON.stringify({
      notificationId,
      status: 'echec',
      error: 'Missing Langfuse credentials for human refund decision'
    }));
    return false;
  }

  const scoreUrl = new URL('/api/public/scores', baseUrl).toString();
  const responseValue = status === 'succès' ? 1 : 0;
  const requestBody = {
    name: 'human_refund_confirmation',
    value: responseValue,
    dataType: 'BOOLEAN',
    traceId,
    metadata: {
      notificationId,
      response,
      status,
      source: 'worker-human-confirmation'
    },
    comment: `Réponse opérateur: ${response}. Statut: ${status}.`
  };

  const authHeader = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');
  const controller = new AbortController();
  const timeoutMs = Number(process.env.LANGFUSE_TIMEOUT_MS || 5000);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const responseFromLangfuse = await fetch(scoreUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    if (!responseFromLangfuse.ok) {
      const errorBody = await responseFromLangfuse.text();
      console.error(JSON.stringify({
        notificationId,
        status: 'echec',
        error: 'Langfuse score registration failed',
        details: errorBody
      }));
      return false;
    }

    return true;
  } catch (error) {
    console.error(JSON.stringify({
      notificationId,
      status: 'echec',
      error: error.message || 'Langfuse score registration timed out'
    }));
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeHumanConfirmationResponse(rawResponse) {
  if (typeof rawResponse !== 'string') {
    return 'invalide';
  }

  const normalized = rawResponse.trim().toLowerCase();

  if (normalized === 'o' || normalized === 'n') {
    return normalized;
  }

  return 'invalide';
}

// US-09 - Validation humaine avant remboursement
async function confirmRefundAction(notification, askConfirmation = requestHumanConfirmation, recordHumanDecision = recordHumanDecisionInLangfuse) {
  const traceId = notification.id || 'unknown-trace';
  let normalizedResponse = 'invalide';

  try {
    const rawResponse = await askConfirmation(notification);
    normalizedResponse = normalizeHumanConfirmationResponse(rawResponse);
  } catch (error) {
    console.error(JSON.stringify({
      notificationId: notification.id,
      status: 'echec',
      error: error.message || 'Human confirmation input unavailable'
    }));
    normalizedResponse = 'invalide';
  }

  const isAuthorized = normalizedResponse === 'o';
  const status = isAuthorized ? 'succès' : 'échec';

  try {
    await recordHumanDecision({
      notificationId: notification.id,
      traceId,
      status,
      response: normalizedResponse
    });
  } catch (error) {
    console.error(JSON.stringify({
      notificationId: notification.id,
      status: 'echec',
      error: error.message || 'Human decision logging failed'
    }));
  }

  return {
    authorized: isAuthorized,
    response: normalizedResponse
  };
}

// US-05 - Analyse asynchrone de la transaction
async function processNotification(message, llmClient, dependencies = {}) {
  const { askConfirmation = requestHumanConfirmation, recordHumanDecision = recordHumanDecisionInLangfuse } = dependencies;
  let notification;

  try {
    notification = parseNotification(message);

    if (isRefundAction(notification.rawBody)) {
      const confirmationResult = await confirmRefundAction(notification, askConfirmation, recordHumanDecision);

      if (!confirmationResult.authorized) {
        console.log(JSON.stringify({
          notificationId: notification.id,
          decision: 'remboursement_annule',
          status: 'echec',
          response: confirmationResult.response
        }));
        return false;
      }

      console.log(JSON.stringify({
        notificationId: notification.id,
        decision: 'remboursement_autorise',
        status: 'succès',
        response: confirmationResult.response
      }));
      return true;
    }

    const decision = await analyseNotification(notification, llmClient);
    console.log(JSON.stringify({ notificationId: notification.id, decision }));

    if (langfuseProcessor) {
      await langfuseProcessor.forceFlush();
    }

    return decision;
  } catch (error) {
    const notificationId = notification?.id || 'unknown';
    console.error(JSON.stringify({ notificationId, status: 'echec', error: error.message }));
    return false;
  }
}

// US-05 - Analyse asynchrone de la transaction
async function startWorker() {
  const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  let lastError = null;

  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await redis.ping();
      break;
    } catch (error) {
      lastError = error;
      if (attempt === 30) {
        throw new Error(`Redis not available after 30 attempts: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  initializeLangfuseTracing();
  const llmClient = createLlmClient();

  console.log(`Worker listening on queue ${QUEUE_NAME}`);
  while (true) {
    const result = await redis.brpop(QUEUE_NAME, 0);
    await processNotification(result[1], llmClient);
  }
}

if (require.main === module) {
  startWorker().catch((error) => {
    console.error(JSON.stringify({ status: 'echec', error: error.message }));
    process.exitCode = 1;
  });
}

module.exports = {
  analyseNotification,
  confirmRefundAction,
  isRefundAction,
  parseNotification,
  processNotification,
  recordHumanDecisionInLangfuse,
  requestHumanConfirmation,
  startWorker
};