const dotenv = require('dotenv');
const Redis = require('ioredis');
const OpenAI = require('openai');
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

// US-05 - Analyse asynchrone de la transaction
async function processNotification(message, llmClient) {
  let notification;

  try {
    notification = parseNotification(message);
    const decision = await analyseNotification(notification, llmClient);
    console.log(JSON.stringify({ notificationId: notification.id, decision }));

    if (langfuseProcessor) {
      await langfuseProcessor.forceFlush();
    }
  } catch (error) {
    const notificationId = notification?.id || 'unknown';
    console.error(JSON.stringify({ notificationId, status: 'echec', error: error.message }));
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
  parseNotification,
  processNotification,
  startWorker
};