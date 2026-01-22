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

type BreadcrumbListSchema = WithContext<{
    '@type': 'BreadcrumbList';
    itemListElement: {
        '@type': 'ListItem';
        position: number;
        name: string;
        item: string;
    }[];
}>;

type SoftwareApplicationSchema = WithContext<{
    '@type': 'SoftwareApplication';
    name: string;
    description: string;
    url?: string;
    image?: string;
    applicationCategory: string;
    operatingSystem: string;
    dateCreated?: string;
    author: {
        '@type': 'Person';
        name: string;
        url: string;
    };
}>;

type CollectionPageSchema = WithContext<{
    '@type': 'CollectionPage';
    name: string;
    description: string;
    url: string;
}>;

type SchemaData =
    | PersonSchema
    | WebSiteSchema
    | BlogPostingSchema
    | BreadcrumbListSchema
    | SoftwareApplicationSchema
    | CollectionPageSchema;

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

    breadcrumbList: (items: { name: string; url: string }[]): BreadcrumbListSchema => ({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }),

    softwareProject: (props: {
        name: string;
        description: string;
        url?: string;
        image?: string;
        dateCreated?: string;
    }): SoftwareApplicationSchema => ({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: props.name,
        description: props.description,
        url: props.url,
        image: props.image,
        applicationCategory: 'WebApplication',
        operatingSystem: 'Web',
        dateCreated: props.dateCreated,
        author: {
            '@type': 'Person',
            name: 'Humphrey Singculan',
            url: 'https://humfurie.org',
        },
    }),

    collectionPage: (props: { name: string; description: string; url: string }): CollectionPageSchema => ({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: props.name,
        description: props.description,
        url: props.url,
    }),
};
