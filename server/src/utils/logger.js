const logger = {
  info: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(new Date().toISOString(), 'INFO:', message, meta);
    }
  },
  error: (message, error) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(new Date().toISOString(), 'ERROR:', message, error);
    }
  },
  warn: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(new Date().toISOString(), 'WARN:', message, meta);
    }
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'test' && process.env.DEBUG) {
      console.log(new Date().toISOString(), 'DEBUG:', message, meta);
    }
  }
};

module.exports = logger;