let logIndex = 0;

const logger = {
  info: (...args) => log('INFO', ...args),
  warn: (...args) => log('WARN', ...args),
  error: (...args) => log('ERROR', ...args),
  debug: (...args) => {
    if (localStorage.getItem('debug') !== 'false') {
      log('DEBUG', ...args);
    }
  },
};

function log(level, ...args) {
  const timestamp = getTime();
  const index = String(logIndex++).padStart(3, '0');
  const module = getCallerFileName();

  const parts = [`[${index}]`];
  if (timestamp) parts.push(`[${timestamp}]`);
  parts.push(`[${level}]`, `[${module}]`);

  console.log(`%c${parts.join(' ')}`, style(level), ...args);
}

function getTime() {
  const enabled = localStorage.getItem('logTime') === 'true'; // default: false
  if (!enabled) return null;
  return new Date().toISOString().split('T')[1].slice(0, 8); // hh:mm:ss
}

function getCallerFileName() {
  const err = new Error();
  const stack = err.stack?.split('\n') || [];
  const callerLine = stack[3] || '';
  const match = callerLine.match(/\/([^\/]+\.js):\d+:\d+/);
  return match ? match[1] : 'unknown';
}

function style(level) {
  switch (level) {
    case 'INFO': return 'color: cyan';
    case 'WARN': return 'color: orange';
    case 'ERROR': return 'color: red';
    case 'DEBUG': return 'color: gray';
    default: return '';
  }
}
export default logger;
