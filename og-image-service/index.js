import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Load fonts
let fontBold;
let fontRegular;

try {
    fontBold = fs.readFileSync(path.join(__dirname, 'fonts', 'Inter-Bold.ttf'));
    fontRegular = fs.readFileSync(path.join(__dirname, 'fonts', 'Inter-Regular.ttf'));
} catch {
    console.warn('Custom fonts not found, will use fallback');
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Generate OG image
app.get('/generate', async (req, res) => {
    try {
        const {
            title = 'Untitled',
            subtitle = '',
            type = 'Article',
            accentColor = '#FC6141',
        } = req.query;

        // Build the virtual DOM structure
        const element = {
            type: 'div',
            props: {
                style: {
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '60px',
                    fontFamily: 'Inter',
                },
                children: [
                    // Top section with type badge
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            },
                            children: [
                                // Accent bar
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            width: '4px',
                                            height: '24px',
                                            backgroundColor: accentColor,
                                            borderRadius: '2px',
                                        },
                                    },
                                },
                                // Type text
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            color: accentColor,
                                            fontSize: '20px',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                        },
                                        children: type,
                                    },
                                },
                            ],
                        },
                    },
                    // Title
                    {
                        type: 'div',
                        props: {
                            style: {
                                fontSize: title.length > 50 ? '48px' : '56px',
                                fontWeight: 700,
                                color: '#ffffff',
                                marginTop: '32px',
                                lineHeight: 1.2,
                                maxWidth: '900px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            },
                            children: title.length > 80 ? title.substring(0, 77) + '...' : title,
                        },
                    },
                    // Subtitle
                    subtitle ? {
                        type: 'div',
                        props: {
                            style: {
                                fontSize: '24px',
                                color: '#9ca3af',
                                marginTop: '20px',
                                lineHeight: 1.4,
                                maxWidth: '800px',
                            },
                            children: subtitle.length > 120 ? subtitle.substring(0, 117) + '...' : subtitle,
                        },
                    } : null,
                    // Spacer
                    {
                        type: 'div',
                        props: {
                            style: {
                                flexGrow: 1,
                            },
                        },
                    },
                    // Footer
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            },
                            children: [
                                // Site branding
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                        },
                                        children: [
                                            // Logo placeholder (circle)
                                            {
                                                type: 'div',
                                                props: {
                                                    style: {
                                                        width: '40px',
                                                        height: '40px',
                                                        backgroundColor: accentColor,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#ffffff',
                                                        fontSize: '20px',
                                                        fontWeight: 700,
                                                    },
                                                    children: 'H',
                                                },
                                            },
                                            // Site name
                                            {
                                                type: 'div',
                                                props: {
                                                    style: {
                                                        color: '#ffffff',
                                                        fontSize: '20px',
                                                        fontWeight: 600,
                                                    },
                                                    children: 'humfurie.org',
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ].filter(Boolean),
            },
        };

        const fonts = [];
        if (fontBold) {
            fonts.push({ name: 'Inter', data: fontBold, weight: 700, style: 'normal' });
        }
        if (fontRegular) {
            fonts.push({ name: 'Inter', data: fontRegular, weight: 400, style: 'normal' });
        }

        const svg = await satori(element, {
            width: 1200,
            height: 630,
            fonts: fonts.length > 0 ? fonts : undefined,
        });

        const resvg = new Resvg(svg, {
            fitTo: {
                mode: 'width',
                value: 1200,
            },
        });

        const png = resvg.render().asPng();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
        res.send(Buffer.from(png));
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Failed to generate image', details: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`OG Image service running on port ${PORT}`);
});
