# Meta Scraper API

A simple and fast API for extracting metadata from web pages.

## 🚀 Quick Start

### API Endpoint
```
GET /meta-scraper?url=<TARGET_URL>
```

### Example Request
```bash
curl "https://yourdomain.com/meta-scraper?url=https://github.com"
```

### Example Response
```json
{
  "success": true,
  "data": {
    "title": "GitHub: Let's build from here",
    "description": "GitHub is where over 100 million developers shape the future of software, together.",
    "url": "https://github.com",
    "image": "https://github.githubassets.com/images/modules/site/social-cards/github-social.png"
  }
}
```

## 📋 API Reference

### Extract Metadata
**GET** `/meta-scraper`

Extract title, description, URL, and image from any web page.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | The URL to scrape metadata from |

#### Response Format
```json
{
  "success": boolean,
  "data": {
    "title": string | null,
    "description": string | null,
    "url": string,
    "image": string | null
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Health Check
**GET** `/health`

Check if the API is running.

```json
{
  "success": true,
  "message": "Meta Scraper API is running",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

## 🔧 Usage Examples

### JavaScript (Fetch)
```javascript
const url = 'https://example.com';
const response = await fetch(`/meta-scraper?url=${encodeURIComponent(url)}`);
const data = await response.json();

if (data.success) {
  console.log('Title:', data.data.title);
  console.log('Description:', data.data.description);
  console.log('Image:', data.data.image);
} else {
  console.error('Error:', data.error);
}
```

### Python (requests)
```python
import requests

url = "https://example.com"
response = requests.get(f"/meta-scraper?url={url}")
data = response.json()

if data["success"]:
    print(f"Title: {data['data']['title']}")
    print(f"Description: {data['data']['description']}")
    print(f"Image: {data['data']['image']}")
else:
    print(f"Error: {data['error']}")
```

### PHP (cURL)
```php
<?php
$url = urlencode('https://example.com');
$response = file_get_contents("/meta-scraper?url=$url");
$data = json_decode($response, true);

if ($data['success']) {
    echo "Title: " . $data['data']['title'] . "\n";
    echo "Description: " . $data['data']['description'] . "\n";
    echo "Image: " . $data['data']['image'] . "\n";
} else {
    echo "Error: " . $data['error'] . "\n";
}
?>
```

## ⚡ Features

- **Fast**: Optimized for speed with 10-second timeout
- **Reliable**: Comprehensive error handling
- **CORS Enabled**: Works from any domain
- **Clean JSON**: Consistent response format
- **Error Details**: Helpful error messages for debugging

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Start Server
```bash
npm start
```

The API will be available at `http://localhost:8000`

## 📝 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (missing or invalid URL) |
| 404 | URL not found or unreachable |
| 408 | Request timeout |
| 500 | Internal server error |

## 🔒 Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production use.

## 📄 License

MIT License