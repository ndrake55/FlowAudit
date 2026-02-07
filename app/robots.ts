import { MetadataRoute } from 'next';

const BASE_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://flowaudit.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/api/'], // Private areas
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
