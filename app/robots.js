const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pivotiq.app';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/report/', '/dashboard'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
