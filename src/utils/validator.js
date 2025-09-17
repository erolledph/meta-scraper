/**
 * Input validation utilities
 */
const Logger = require('./logger')

class Validator {
  /**
   * Validate and sanitize URL
   * @param {string} url - URL to validate
   * @returns {Object} - { isValid: boolean, url: string, error?: string }
   */
  static validateUrl(url) {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        error: 'URL parameter is required and must be a string'
      }
    }
    
    // Remove whitespace
    const cleanUrl = url.trim()
    
    if (!cleanUrl) {
      return {
        isValid: false,
        error: 'URL cannot be empty'
      }
    }
    
    // Add protocol if missing
    let validUrl = cleanUrl
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      validUrl = `https://${cleanUrl}`
    }
    
    try {
      const urlObj = new URL(validUrl)
      
      // Security: Block private/local networks
      const hostname = urlObj.hostname.toLowerCase()
      const blockedHosts = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1'
      ]
      
      if (blockedHosts.includes(hostname) || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.')) {
        return {
          isValid: false,
          error: 'Access to private/local networks is not allowed'
        }
      }
      
      // Only allow HTTP/HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          error: 'Only HTTP and HTTPS protocols are supported'
        }
      }
      
      return {
        isValid: true,
        url: validUrl
      }
    } catch (error) {
      Logger.warn('URL validation failed', { url: cleanUrl, error: error.message })
      return {
        isValid: false,
        error: 'Invalid URL format. Please provide a valid URL with protocol (http:// or https://)'
      }
    }
  }
}

module.exports = Validator