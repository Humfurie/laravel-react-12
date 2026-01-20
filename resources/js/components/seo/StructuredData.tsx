import { Head } from '@inertiajs/react';

type WithContext<T> = T & {
    '@context': 'https://schema.org';
};

type PersonSchema = WithContext<{
    '@type': 'Person';
    name: string;
    jobTitle: string;
    url: string;
    image?: string;
    sameAs?: string[];
    description?: string;
}>;

type WebSiteSchema = WithContext<{
    '@type': 'WebSite';
    name: string;
    url: string;
    description?: string;
    potentialAction?: {
        '@type': 'SearchAction';
        target: string;
        'query-input': string;
    };
}>;

type BlogPostingSchema = WithContext<{
    '@type': 'BlogPosting';
    headline: string;
    description?: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    author?: {
        '@type': 'Person';
        name: string;
        url?: string;
    };
    publisher?: {
        '@type': 'Organization';
        name: string;
        logo?: {
            '@type': 'ImageObject';
            url: string;
        };
    };
    mainEntityOfPage?: {
        '@type': 'WebPage';
        '@id': string;
    };
    keywords?: string;
    articleBody?: string;
}>;

type SchemaData = PersonSchema | WebSiteSchema | BlogPostingSchema;

interface StructuredDataProps {
    data: SchemaData | SchemaData[];
}

/**
 * Renders JSON-LD structured data for SEO.
 * Uses dangerouslySetInnerHTML which is safe here because:
 * 1. Content is JSON-serialized from typed schema objects (not user input)
 * 2. Script type="application/ld+json" is not executed as JavaScript
 * 3. This is the standard approach recommended by Google for structured data
 */
export default function StructuredData({ data }: StructuredDataProps) {
    const schemas = Array.isArray(data) ? data : [data];

    return (
        <Head>
            {schemas.map((schema, index) => (
                <script
                    key={`schema-${schema['@type']}-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </Head>
    );
}

// Pre-configured schemas for common use cases
export const schemas = {
    person: (): PersonSchema => ({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Humphrey Singculan',
        jobTitle: 'Software Engineer',
        url: 'https://humfurie.org',
        image: 'https://humfurie.org/images/profile.jpg',
        description: 'Software Engineer specializing in Laravel, React, and full-stack development.',
        sameAs: [
            'https://github.com/Humfurie',
            'https://www.linkedin.com/in/humphrey-singculan-09a459153',
            'https://www.facebook.com/humphrey123',
            'https://www.instagram.com/humfuree/',
            'https://x.com/Humphfries',
        ],
    }),

    website: (): WebSiteSchema => ({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Humphrey Singculan',
        url: 'https://humfurie.org',
        description: 'Portfolio and blog of Humphrey Singculan, Software Engineer',
        potentialAction: {
            '@type': 'SearchAction',
            target: 'https://humfurie.org/blog?search={search_term_string}',
            'query-input': 'required name=search_term_string',
        },
    }),

    blogPosting: (props: {
        headline: string;
        description?: string;
        image?: string;
        datePublished?: string;
        dateModified?: string;
        url: string;
        keywords?: string;
        articleBody?: string;
    }): BlogPostingSchema => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: props.headline,
        description: props.description,
        image: props.image,
        datePublished: props.datePublished,
        dateModified: props.dateModified,
        author: {
            '@type': 'Person',
            name: 'Humphrey Singculan',
            url: 'https://humfurie.org',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Humphrey Singculan',
            logo: {
                '@type': 'ImageObject',
                url: 'https://humfurie.org/images/logo.png',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': props.url,
        },
        keywords: props.keywords,
        articleBody: props.articleBody,
    }),
};
