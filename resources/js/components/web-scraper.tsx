import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, Globe, Download, FileText, ExternalLink } from 'lucide-react';

interface SearchResult {
    title: string;
    url: string;
    source: string;
}

interface ScrapedContent {
    title: string;
    content: string;
    summary?: string;
    url: string;
    images?: Array<{
        url: string;
        alt: string;
        width?: string;
        height?: string;
    }>;
}

interface ProcessedImage {
    original_url: string;
    local_path: string;
    public_url: string;
    filename: string;
    size: number;
    alt: string;
}

interface WebScraperProps {
    onContentGenerated: (data: {
        title: string;
        content: string;
        excerpt: string;
        featured_image?: string;
    }) => void;
}

interface BlogData {
    title: string;
    content: string;
    excerpt: string;
    featured_image?: string; // Optional property
}

export default function WebScraper({ onContentGenerated }: WebScraperProps) {
    const [activeTab, setActiveTab] = useState('search');
    const [loading, setLoading] = useState(false);

    // Search state
    const [searchTopic, setSearchTopic] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    // Scraping state
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
    const [scrapedContent, setScrapedContent] = useState<ScrapedContent[]>([]);

    // Processing state
    const [includeImages, setIncludeImages] = useState(true);
    const [autoSummarize, setAutoSummarize] = useState(true);
    const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);

    const handleSearch = async () => {
        if (!searchTopic.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/admin/blogs/scraper/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    topic: searchTopic,
                    max_results: 10
                })
            });

            const data = await response.json();

            if (data.success) {
                setSearchResults(data.results);
                setActiveTab('results');
            } else {
                alert('Search failed: ' + data.error);
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUrlToggle = (url: string) => {
        setSelectedUrls(prev =>
            prev.includes(url)
                ? prev.filter(u => u !== url)
                : [...prev, url]
        );
    };

    const handleScrapeSelected = async () => {
        if (selectedUrls.length === 0) return;

        setLoading(true);
        setScrapedContent([]);

        try {
            const scrapedData: ScrapedContent[] = [];

            for (const url of selectedUrls) {
                const response = await fetch('/admin/blogs/scraper/scrape', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        url,
                        include_images: includeImages,
                        summarize: autoSummarize,
                        summary_length: 300
                    })
                });

                const data = await response.json();

                if (data.success) {
                    scrapedData.push(data);
                }
            }

            setScrapedContent(scrapedData);
            setActiveTab('content');
        } catch (error) {
            console.error('Scraping error:', error);
            alert('Scraping failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickGenerate = async () => {
        if (!searchTopic.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/admin/blogs/scraper/content-for-blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    topic: searchTopic,
                    auto_search: true,
                    include_images: includeImages
                })
            });

            const data = await response.json();

            if (data.success) {
                // Generate blog content from scraped data
                const blogData: BlogData = {
                    title: data.suggested_title || searchTopic,
                    content: formatContentForBlog(data.summary, data.sources),
                    excerpt: data.summary.substring(0, 200) + '...',
                };

                // If images are available, set the first one as featured image
                if (data.images && data.images.length > 0) {
                    const firstImage = data.images[0];
                    blogData.featured_image = firstImage.url;
                }

                onContentGenerated(blogData);
            } else {
                alert('Content generation failed: ' + data.error);
            }
        } catch (error) {
            console.error('Generation error:', error);
            alert('Content generation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadImages = async (images: Array<{ url: string; alt: string }>) => {
        setLoading(true);
        try {
            const response = await fetch('/admin/blogs/scraper/download-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ images })
            });

            const data = await response.json();

            if (data.success) {
                setProcessedImages(data.processed_images);
            } else {
                alert('Image download failed');
            }
        } catch (error) {
            console.error('Image download error:', error);
            alert('Image download failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatContentForBlog = (
        summary: string,
        sources: {
            url: string;
            title: string;
            summary: string;
        }[],
    ): string => {
        let content = `<p>${summary}</p>`;

        if (sources && sources.length > 0) {
            content += `<h2>Sources and References</h2><ul>`;
            sources.forEach((source) => {
                content += `<li><a href="${source.url}" target="_blank">${source.title}</a> - ${source.summary}</li>`;
            });
            content += `</ul>`;
        }

        return content;
    };

    const handleScrapeForRichText = async (url: string) => {
        setLoading(true);
        try {
            const response = await fetch('/admin/blogs/scraper/formatted-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (data.success) {
                // Generate blog content with formatted HTML
                const blogData: BlogData = {
                    title: data.title,
                    content: data.html_content || data.plain_content,
                    excerpt: data.excerpt,
                };

                // If images are available, set the first one as featured image
                if (data.images && data.images.length > 0) {
                    const firstImage = data.images[0];
                    blogData.featured_image = firstImage.url;
                }

                onContentGenerated(blogData);
            } else {
                alert('Content extraction failed: ' + data.error);
            }
        } catch (error) {
            console.error('Content extraction error:', error);
            alert('Content extraction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const generateBlogFromContent = () => {
        if (scrapedContent.length === 0) return;

        // Combine all scraped content
        const combinedTitle = scrapedContent[0]?.title || searchTopic;
        const combinedSummaries = scrapedContent
            .map(content => content.summary || content.content.substring(0, 300))
            .join('\n\n');

        const fullContent = scrapedContent
            .map(content => `<h3>${content.title}</h3><p>${content.summary || content.content.substring(0, 500)}...</p>`)
            .join('\n');

        const blogData: BlogData = {
            title: combinedTitle,
            content: fullContent,
            excerpt: combinedSummaries.substring(0, 300) + '...',
        };

        // Now you can assign directly
        if (processedImages.length > 0) {
            blogData.featured_image = processedImages[0].public_url;
        }

        onContentGenerated(blogData);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Web Content Scraper
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="search">Search</TabsTrigger>
                        <TabsTrigger value="results">Results</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="generate">Generate</TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="search-topic">Topic or Keywords</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="search-topic"
                                        value={searchTopic}
                                        onChange={(e) => setSearchTopic(e.target.value)}
                                        placeholder="Enter topic to search for..."
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button onClick={handleSearch} disabled={loading}>
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        Search
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="include-images"
                                        checked={includeImages}
                                        onCheckedChange={(checked) => setIncludeImages(checked === true)}
                                    />
                                    <Label htmlFor="include-images">Include Images</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="auto-summarize"
                                        checked={autoSummarize}
                                        onCheckedChange={(checked) => setAutoSummarize(checked === true)}
                                    />
                                    <Label htmlFor="auto-summarize">Auto Summarize</Label>
                                </div>
                            </div>

                            <Button
                                onClick={handleQuickGenerate}
                                disabled={loading || !searchTopic.trim()}
                                className="w-full"
                                variant="outline"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                                Quick Generate Blog Content
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="results" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Search Results ({searchResults.length})</h3>
                            <Button
                                onClick={handleScrapeSelected}
                                disabled={selectedUrls.length === 0 || loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                                Scrape Selected ({selectedUrls.length})
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {searchResults.map((result, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                                    <Checkbox
                                        checked={selectedUrls.includes(result.url)}
                                        onCheckedChange={() => handleUrlToggle(result.url)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium truncate">{result.title}</h4>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <p className="text-sm text-gray-600 truncate">{result.url}</p>
                                            <Badge variant="secondary" className="text-xs">
                                                {result.source}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleScrapeForRichText(result.url)}
                                            disabled={loading}
                                            title="Fill rich text editor with content"
                                        >
                                            <FileText className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => window.open(result.url, '_blank')}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Scraped Content ({scrapedContent.length})</h3>
                            <Button onClick={generateBlogFromContent} disabled={scrapedContent.length === 0}>
                                <FileText className="w-4 h-4 mr-2" />
                                Generate Blog Post
                            </Button>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {scrapedContent.map((content, index) => (
                                <Card key={index}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">{content.title}</CardTitle>
                                        <p className="text-sm text-gray-600">{content.url}</p>
                                    </CardHeader>
                                    <CardContent>
                                        {content.summary && (
                                            <div className="mb-3">
                                                <Label className="text-sm font-medium">Summary:</Label>
                                                <p className="text-sm mt-1">{content.summary}</p>
                                            </div>
                                        )}

                                        {content.images && content.images.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-medium">Images ({content.images.length}):</Label>
                                                <div className="flex gap-2 mt-2 overflow-x-auto">
                                                    {content.images.slice(0, 3).map((image, imgIndex) => (
                                                        <img
                                                            key={imgIndex}
                                                            src={image.url}
                                                            alt={image.alt}
                                                            className="w-20 h-20 object-cover rounded border"
                                                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDownloadImages(content.images!)}
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download Images
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleScrapeForRichText(content.url)}
                                                        disabled={loading}
                                                    >
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        Fill Rich Text
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="generate" className="space-y-4">
                        <div className="text-center space-y-4">
                            <h3 className="text-lg font-semibold">Generate Blog Content</h3>
                            <p className="text-gray-600">
                                Use the scraped content to automatically generate a blog post with title, content, and images.
                            </p>

                            {processedImages.length > 0 && (
                                <div>
                                    <Label className="text-sm font-medium">Processed Images ({processedImages.length}):</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {processedImages.map((image, index) => (
                                            <div key={index} className="text-center">
                                                <img
                                                    src={image.public_url}
                                                    alt={image.alt}
                                                    className="w-full h-20 object-cover rounded border"
                                                />
                                                <p className="text-xs text-gray-600 mt-1">{image.filename}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={generateBlogFromContent}
                                disabled={scrapedContent.length === 0}
                                className="w-full"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Generate Blog Post from Scraped Content
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
