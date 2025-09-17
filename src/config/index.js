/**
 * Application configuration
 */
module.exports = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Request settings
  request: {
    timeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000,
    userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (compatible; MetaScraper/1.0)',
    maxRedirects: parseInt(process.env.MAX_REDIRECTS) || 5
  },
  
  // Rate limiting (requests per minute per IP)
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100 // 100 requests per minute
  },
  
  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
  }
}