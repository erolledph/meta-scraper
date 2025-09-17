/**
 * Metadata scraping service
 */
const metascraper = require('metascraper')([
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])
const got = require('got')
const config = require('../config')
const Logger = require('../utils/logger')

class ScraperService {
  /**
   * Extract metadata from URL
   * @param {string} targetUrl - URL to scrape
   * @returns {Promise<Object>} - Metadata object
   */
  static async extractMetadata(targetUrl) {
    const startTime = Date.now()
    
    try {
      Logger.info('Starting metadata extraction', { url: targetUrl })
      
      const { body: html, url } = await got(targetUrl, {
        timeout: config.request.timeout,
        followRedirect: true,
        maxRedirects: config.request.maxRedirects,
        headers: {
          'User-Agent': config.request.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        retry: {
          limit: 2,
          methods: ['GET']
        }
      })
      
      const metadata = await metascraper({ html, url })
      const duration = Date.now() - startTime
      
      Logger.info('Metadata extraction completed', { 
        url: targetUrl, 
        duration,
        hasTitle: !!metadata.title,
        hasDescription: !!metadata.description,
        hasImage: !!metadata.image
      })
      
      return {
        title: metadata.title || null,
        description: metadata.description || null,
        url: metadata.url || targetUrl,
        image: metadata.image || null
      }
      
    } catch (error) {
      const duration = Date.now() - startTime
      Logger.error('Metadata extraction failed', error, { 
        url: targetUrl, 
        duration,
        errorCode: error.code,
        statusCode: error.response?.statusCode
      })
      
      throw this.handleScrapingError(error)
    }
  }
  
  /**
   * Handle and categorize scraping errors
   * @param {Error} error - Original error
   * @returns {Error} - Categorized error
   */
  static handleScrapingError(error) {
    const customError = new Error()
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      customError.message = 'Unable to connect to the provided URL'
      customError.statusCode = 404
      customError.type = 'CONNECTION_ERROR'
    } else if (error.code === 'ETIMEDOUT') {
      customError.message = 'Request timeout - the website took too long to respond'
      customError.statusCode = 408
      customError.type = 'TIMEOUT_ERROR'
    } else if (error.response?.statusCode === 403) {
      customError.message = 'Access forbidden - the website blocked our request'
      customError.statusCode = 403
      customError.type = 'ACCESS_DENIED'
    } else if (error.response?.statusCode === 404) {
      customError.message = 'Page not found'
      customError.statusCode = 404
      customError.type = 'NOT_FOUND'
    } else if (error.response?.statusCode >= 400 && error.response?.statusCode < 500) {
      customError.message = `Website returned ${error.response.statusCode} status code`
      customError.statusCode = 400
      customError.type = 'CLIENT_ERROR'
    } else if (error.response?.statusCode >= 500) {
      customError.message = 'The target website is experiencing server issues'
      customError.statusCode = 502
      customError.type = 'SERVER_ERROR'
    } else {
      customError.message = 'Failed to scrape metadata'
      customError.statusCode = 500
      customError.type = 'UNKNOWN_ERROR'
    }
    
    customError.originalError = error
    return customError
  }
}

module.exports = ScraperService