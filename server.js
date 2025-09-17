/**
 * Meta Scraper API Server
 * Production-ready Express.js application for extracting web page metadata
 */
const express = require('express')
const cors = require('cors')
const config = require('./src/config')
const Logger = require('./src/utils/logger')
const { rateLimiter, securityHeaders, requestLogger } = require('./src/middleware/security')
const apiRoutes = require('./src/routes/api')

const app = express()

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1)

// Security middleware
app.use(securityHeaders)
app.use(rateLimiter)

// CORS configuration
app.use(cors(config.cors))

// Request logging
app.use(requestLogger)

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }))

// API routes
app.use('/', apiRoutes)

// Handle 404 for unknown routes
app.use('*', (req, res) => {
  Logger.warn('404 - Route not found', { 
    url: req.originalUrl, 
    method: req.method,
    ip: req.ip 
  })
  
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: 'Available endpoints: GET /, GET /meta-scraper, GET /health'
  })
})

// Global error handler
app.use((error, req, res, next) => {
  Logger.error('Unhandled error', error, { 
    url: req.originalUrl, 
    method: req.method,
    ip: req.ip 
  })
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? error.message : 'Something went wrong'
  })
})

// Graceful shutdown handling
process.on('SIGTERM', () => {
  Logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  Logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Start server
const server = app.listen(config.port, () => {
  Logger.info('Server started', {
    port: config.port,
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0'
  })
  
  if (config.nodeEnv === 'development') {
    console.log(`🚀 Meta Scraper API running on port ${config.port}`)
    console.log(`📖 API Documentation: http://localhost:${config.port}`)
    console.log(`🔍 Example usage: http://localhost:${config.port}/meta-scraper?url=https://github.com`)
  }
})

// Handle server errors
server.on('error', (error) => {
  Logger.error('Server error', error)
  process.exit(1)
})

module.exports = app