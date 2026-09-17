const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const MAX_REQUEST_BODY_SIZE = 1024 * 1024;

const createApp = () => {
  const app = express();

  app.disable('x-powered-by');

  app.use((req, res, next) => {
    let rawBody = '';
    let receivedBytes = 0;

    req.setEncoding('utf8');

    const rejectBodyTooLarge = () => {
      const timestamp = new Date().toISOString();
      console.error(JSON.stringify({
        timestamp,
        method: req.method,
        rawBody,
        statusCode: 413,
        error: 'Request body too large'
      }));

      if (!res.headersSent) {
        res.status(413).json({
          status: 'error',
          message: 'Request body too large'
        });
      }

      req.destroy();
    };

    req.on('data', (chunk) => {
      receivedBytes += Buffer.byteLength(chunk);

      if (receivedBytes > MAX_REQUEST_BODY_SIZE) {
        rejectBodyTooLarge();
        return;
      }

      rawBody += chunk;
    });

    req.on('end', () => {
      if (res.writableEnded || res.headersSent) {
        return;
      }

      req.rawBody = rawBody;
      next();
    });

    req.on('error', (error) => {
      const timestamp = new Date().toISOString();
      console.error(JSON.stringify({
        timestamp,
        method: req.method,
        rawBody,
        statusCode: 200,
        error: error.message
      }));
      if (!res.headersSent) {
        res.status(200).send();
      }
    });
  });

  // US-01 - Réception de notification de paiement
  // US-02 - Trace de réception
  // US-03 - Accusé de réception
  app.all('/webhook', (req, res) => {
    const timestamp = new Date().toISOString();
    const rawBody = typeof req.rawBody === 'string' ? req.rawBody : '';
    let parsedBody = null;

    if (rawBody.length > 0) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch (error) {
        parsedBody = null;
      }
    }

    console.log(JSON.stringify({
      timestamp,
      method: req.method,
      rawBody,
      parsedBody,
      statusCode: 200,
      note: 'Notification de paiement reçue et acceptée sans blocage'
    }));

    res.status(200).json({
      status: 'ok',
      message: 'Notification received successfully'
    });
  });

  return app;
};

const startServer = () => {
  const app = createApp();
  const port = Number(process.env.PORT || 3000);

  app.listen(port, () => {
    console.log(`Webhook listening on port ${port}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = {
  createApp,
  startServer
};
