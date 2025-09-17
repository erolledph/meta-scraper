const express = require('express')
const metascraper = require('metascraper')([
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])
const got = require('got')

const app = express()

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// Handle preflight requests
app.options('*', (req, res) => {
  res.sendStatus(200)
})

// API endpoint for metadata scraping
app.get('/meta-scraper', async (req, res) => {
  try {
    const { url: targetUrl } = req.query
    
    if (!targetUrl) {
      return res.status(400).json({ 
        success: false,
        error: 'URL parameter is required',
        message: 'Please provide a URL parameter. Example: /meta-scraper?url=https://example.com'
      })
    }

    // Validate URL format
    try {
      new URL(targetUrl)
    } catch (urlError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
        message: 'Please provide a valid URL with protocol (http:// or https://)'
      })
    }
    
    const { body: html, url } = await got(targetUrl, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MetaScraper/1.0)'
      }
    })
    
    const metadata = await metascraper({ html, url })

    // Return clean JSON response
    res.json({
      success: true,
      data: {
        title: metadata.title || null,
        description: metadata.description || null,
        url: metadata.url || targetUrl,
        image: metadata.image || null
      }
    })
    
  } catch (error) {
    console.error('Error scraping metadata:', error)
    
    // Handle different types of errors
    let errorMessage = 'Failed to scrape metadata'
    let statusCode = 500
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Unable to connect to the provided URL'
      statusCode = 404
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Request timeout - the website took too long to respond'
      statusCode = 408
    } else if (error.response && error.response.statusCode) {
      errorMessage = `Website returned ${error.response.statusCode} status code`
      statusCode = error.response.statusCode >= 400 && error.response.statusCode < 500 ? 400 : 500
    }
    
    res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Meta Scraper API is running',
    timestamp: new Date().toISOString()
  })
})

// API documentation endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Meta Scraper API',
    version: '1.0.0',
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
    }
  })
})

// Handle 404 for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: 'Available endpoints: GET /, GET /meta-scraper, GET /health'
  })
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`🚀 Meta Scraper API running on port ${PORT}`)
  console.log(`📖 API Documentation: http://localhost:${PORT}`)
  console.log(`🔍 Example usage: http://localhost:${PORT}/meta-scraper?url=https://github.com`)
})