import './globals.css';

export const metadata = {
  metadataBase: new URL('http://localhost:3002'),
  title: 'PivotIQ — See Which Parts of Your Job Are Next',
  description: 'A premium task-level career scan that shows where AI pressure is building, what still compounds, and where to pivot next.',
  openGraph: {
    title: 'PivotIQ — See Which Parts of Your Job Are Next',
    description: 'Start with a free scan. See risk by task, not by title, then decide if the full pivot roadmap earns your trust.',
    type: 'website',
    siteName: 'PivotIQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PivotIQ — See Which Parts of Your Job Are Next',
    description: 'See what is exposed, what still matters, and what to do next.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
