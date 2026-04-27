/**
 * Request Logger
 */

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
if (!process.env.VERCEL && !fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const logger = {
  info: (msg, meta = {}) => log('INFO', msg, meta),
  warn: (msg, meta = {}) => log('WARN', msg, meta),
  error: (msg, meta = {}) => log('ERROR', msg, meta),
};

function log(level, msg, meta) {
  const entry = JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    message: msg,
    ...meta,
  });
  if (!process.env.VERCEL) {
    const logFile = path.join(LOG_DIR, 'app.log');
    fs.appendFileSync(logFile, entry + '\n');
  } else {
    if (level === 'INFO') console.log(entry);
    if (level === 'WARN') console.warn(entry);
  }
  if (level === 'ERROR') console.error(entry);
}

const requestHistory = [];
const MAX_HISTORY = 100;

const requestLogger = (req, res, next) => {
  req.id = uuidv4();
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', req.id);

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const record = {
      id: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    requestHistory.unshift(record);
    if (requestHistory.length > MAX_HISTORY) requestHistory.pop();

    logger.info(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`, { requestId: req.id });
  });

  next();
};

const getRequestHistory = () => [...requestHistory];

const clearRequestHistory = () => { requestHistory.length = 0; };

module.exports = { requestLogger, logger, getRequestHistory, clearRequestHistory };
