/**
 * Security middleware
 */
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const config = require('../config')
const Logger = require('../utils/logger')

/**
 * Rate limiting middleware
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Too many requests',
    message: `Rate limit exceeded. Maximum ${config.rateLimit.max} requests per minute allowed.`
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    Logger.warn('Rate limit exceeded', { 
      ip: req.ip, 
      userAgent: req.get('User-Agent'),
      url: req.originalUrl
    })
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: `Rate limit exceeded. Maximum ${config.rateLimit.max} requests per minute allowed.`
    })
  }
})

/**
 * Security headers middleware
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
})

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - startTime
    Logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
  })
  
  next()
}

module.exports = {
  rateLimiter,
  securityHeaders,
  requestLogger
}