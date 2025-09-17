/**
 * API routes
 */
const express = require('express')
const ScraperService = require('../services/scraper')
const Validator = require('../utils/validator')
const Logger = require('../utils/logger')

const router = express.Router()

/**
 * Extract metadata from URL
 * GET /meta-scraper?url=<TARGET_URL>
 */
router.get('/meta-scraper', async (req, res) => {
  try {
    const { url: targetUrl } = req.query
    
    // Validate URL
    const validation = Validator.validateUrl(targetUrl)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL',
        message: validation.error
      })
    }
    
    // Extract metadata
    const metadata = await ScraperService.extractMetadata(validation.url)
    
    res.json({
      success: true,
      data: metadata
    })
    
  } catch (error) {
    Logger.error('API error in /meta-scraper', error, { 
      query: req.query,
      ip: req.ip 
    })
    
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error',
      type: error.type || 'UNKNOWN_ERROR'
    })
  }
})

/**
 * Health check endpoint
 * GET /health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Meta Scraper API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

/**
 * API documentation endpoint
 * GET /
 */
router.get('/', (req, res) => {
  res.json({
    name: 'Meta Scraper API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Extract metadata from web pages',
    endpoints: {
      'GET /meta-scraper': {
        description: 'Extract metadata from a URL',
        parameters: {
          url: 'The URL to scrape (required)'
        },
        example: '/meta-scraper?url=https://example.com'
      },
      'GET /health': {
        description: 'Check API health status'
      }
    },
    usage: {
      example_request: 'GET /meta-scraper?url=https://github.com',
      example_response: {
        success: true,
        data: {
          title: 'GitHub: Let\'s build from here',
          description: 'GitHub is where over 100 million developers shape the future of software, together.',
          url: 'https://github.com',
          image: 'https://github.githubassets.com/images/modules/site/social-cards/github-social.png'
        }
      }
    },
    rateLimit: {
      requests: 100,
      window: '1 minute'
    }
  })
})

module.exports = router