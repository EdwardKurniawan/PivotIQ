import { notFound } from 'next/navigation';
import { PillarPage } from '../../../components/pillar-page';
import { getServerLocale } from '../../../lib/i18n-server';
import { getRelatedRolePages, getRolePage, hasRolePage, ROLE_PAGE_SLUGS } from '../../../lib/role-pages';

export function generateStaticParams() {
  return ROLE_PAGE_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const locale = getServerLocale();
  const slug = params.slug;

  if (!hasRolePage(slug)) {
    return {};
  }

  const page = getRolePage(locale, slug);

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical: `/roles/${slug}`,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `/roles/${slug}`,
      type: 'article',
    },
    twitter: {
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export default function RolePage({ params }) {
  const locale = getServerLocale();
  const slug = params.slug;

  if (!hasRolePage(slug)) {
    notFound();
  }

  const page = getRolePage(locale, slug);
  const relatedPages = getRelatedRolePages(locale, slug);

  return <PillarPage locale={locale} page={page} relatedPages={relatedPages} path={`/roles/${slug}`} />;
}

