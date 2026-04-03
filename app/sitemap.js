import { ROLE_PAGE_SLUGS } from '../lib/role-pages';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pivotiq.app';

export default function sitemap() {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/audit`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/ai-career-risk`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/career-pivot-planner`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/white-collar-jobs-at-risk-from-ai`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/methodology`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.72,
    },
    ...ROLE_PAGE_SLUGS.map((slug) => ({
      url: `${siteUrl}/roles/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.76,
    })),
    {
      url: `${siteUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];
}
