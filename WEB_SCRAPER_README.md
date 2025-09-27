# Web Scraper for Blog Content

A comprehensive web scraping system that can search the web, extract content, summarize text, process images, and automatically generate blog posts.

## Features

### 🔍 **Web Search Engine**
- Search Google and Bing for relevant content
- Filter and rank results by relevance
- Support for custom search parameters
- Automatic fallback between search engines

### 📄 **Content Extraction**
- Smart content detection from web pages
- Extract main article content while filtering out navigation, ads, and boilerplate
- Support for various HTML structures and layouts
- Clean text extraction with proper formatting

### 📝 **Content Summarization**
- Intelligent text summarization using sentence scoring
- Configurable summary length
- Key sentence extraction based on position and content quality
- Maintains readability and context

### 🖼️ **Image Processing**
- Extract relevant images from scraped content
- Filter out decorative images, icons, and logos
- Download and store images locally
- Generate optimized file names and paths
- Support for multiple image formats (JPG, PNG, GIF, WebP)

### 🤖 **Automated Blog Generation**
- Generate complete blog posts from topics
- Auto-create titles, content, and excerpts
- SEO optimization with meta tags and keywords
- Integration with existing blog creation workflow

## API Endpoints

### Search Web Content
```http
POST /admin/blogs/scraper/search
Content-Type: application/json

{
    "topic": "artificial intelligence trends",
    "max_results": 10
}
```

### Scrape Specific URL
```http
POST /admin/blogs/scraper/scrape
Content-Type: application/json

{
    "url": "https://example.com/article",
    "include_images": true,
    "summarize": true,
    "summary_length": 500
}
```

### Download Images
```http
POST /admin/blogs/scraper/download-images
Content-Type: application/json

{
    "images": [
        {
            "url": "https://example.com/image.jpg",
            "alt": "Image description"
        }
    ]
}
```

### Generate Blog Content
```http
POST /admin/blogs/scraper/content-for-blog
Content-Type: application/json

{
    "topic": "machine learning basics",
    "auto_search": true,
    "include_images": true
}
```

## Usage in Blog Creation

### Manual Integration
1. Navigate to **Create Blog Post**
2. Click on the **Web Scraper** tab
3. Enter your topic or keywords
4. Choose search options (include images, auto-summarize)
5. Click **Quick Generate** for automatic content creation, or:
   - Click **Search** to find relevant articles
   - Select articles to scrape
   - Review and customize scraped content
   - Generate blog post from selected content

### Programmatic Usage

```php
use App\Services\WebScraperService;

$scraper = new WebScraperService();

// Search for content
$results = $scraper->searchWeb('Laravel tips', 5);

// Scrape specific URL
$content = $scraper->scrapeContent('https://laravel.com/docs');

// Summarize content
$summary = $scraper->summarizeContent($content['content'], 300);

// Download images
$image = $scraper->downloadAndProcessImage('https://example.com/image.jpg');
```

## Configuration

### Rate Limiting
The scraper includes built-in rate limiting to respect target websites:
- 30-second timeout per request
- Proper User-Agent headers
- Respectful delay between requests

### Content Filtering
- Minimum content length: 500 characters
- Image size filtering: excludes images smaller than 100x100px
- Content cleaning: removes scripts, styles, navigation elements
- Format support: HTML, plain text extraction

### Security Features
- URL validation and sanitization
- Content-type verification for images
- XSS prevention in extracted content
- Safe file naming and storage

## File Structure

```
app/
├── Services/
│   └── WebScraperService.php          # Main scraper service
├── Http/Controllers/Admin/
│   └── WebScraperController.php       # API endpoints
resources/js/
├── components/
│   └── web-scraper.tsx               # React component
└── pages/admin/blog/
    ├── create.tsx                    # Integrated create form
    └── edit.tsx                      # Integrated edit form
```

## Component Features

### Search Interface
- Real-time search with loading states
- Results preview with source information
- Bulk selection for scraping multiple articles
- External link access for manual review

### Content Management
- Live preview of scraped content
- Image gallery with download options
- Summary generation controls
- Manual content editing capabilities

### Integration
- Seamless form population
- Auto-generation of SEO metadata
- Featured image selection
- Draft/publish workflow integration

## Best Practices

### For Content Quality
1. **Review scraped content** before publishing
2. **Add original commentary** to provide unique value
3. **Verify facts and citations** from scraped sources
4. **Optimize for SEO** with custom meta descriptions

### For Performance
1. **Limit concurrent scraping** to avoid overwhelming target sites
2. **Use caching** for frequently accessed content
3. **Batch image downloads** for efficiency
4. **Monitor storage usage** for downloaded images

### For Ethics
1. **Respect robots.txt** files
2. **Provide proper attribution** to original sources
3. **Add substantial original content** to avoid duplication
4. **Check copyright restrictions** before using images

## Error Handling

The scraper includes comprehensive error handling:
- Network timeout protection
- Invalid URL detection
- Content extraction failures
- Image download errors
- Rate limiting responses

All errors are logged and provide user-friendly feedback in the interface.

## Future Enhancements

- **AI-powered summarization** using GPT/Claude APIs
- **Multi-language support** for international content
- **Social media integration** for content discovery
- **Advanced filtering** by publication date, author, etc.
- **Duplicate content detection** to avoid republishing
- **SEO score analysis** of generated content