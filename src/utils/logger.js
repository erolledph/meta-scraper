/**
 * Centralized logging utility
 */
const config = require('../config')

class Logger {
  static info(message, meta = {}) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }))
  }
  
  static error(message, error = null, meta = {}) {
    const errorData = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }
    
    if (error) {
      errorData.error = {
        message: error.message,
        stack: config.nodeEnv === 'development' ? error.stack : undefined,
        code: error.code
      }
    }
    
    console.error(JSON.stringify(errorData))
  }
  
  static warn(message, meta = {}) {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }))
  }
}

module.exports = Logger