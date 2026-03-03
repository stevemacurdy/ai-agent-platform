// ─── SEO Metadata for WoulfAI ───────────────────────────────────
// Add JSON-LD structured data and OG tags

export function generateSeoMetadata() {
  return {
    title: 'WoulfAI — AI Employees for Warehouse & Logistics Operations',
    description: 'Hire AI Employees that automate your warehouse operations, financial management, sales, HR, and more. Built by Woulf Group — 1,200+ projects, 4M+ sq ft.',
    keywords: 'AI warehouse automation, warehouse management system, 3PL technology, logistics AI, supply chain automation, warehouse operations software',
    openGraph: {
      title: 'WoulfAI — AI Employees for Your Business',
      description: 'Automate warehouse operations, finance, sales, and more with 21 AI Employees.',
      url: 'https://www.woulfai.com',
      siteName: 'WoulfAI',
      type: 'website',
      images: [{ url: 'https://www.woulfai.com/og-image.png', width: 1200, height: 630, alt: 'WoulfAI Platform' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'WoulfAI — AI Employees for Warehouse Operations',
      description: 'Automate your business with 21 AI Employees. Built by Woulf Group.',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: 'https://www.woulfai.com' },
  };
}

export const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'WoulfAI',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '497',
    highPrice: '4997',
    priceCurrency: 'USD',
    offerCount: 3,
  },
  creator: {
    '@type': 'Organization',
    name: 'Woulf Group',
    url: 'https://www.woulfgroup.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Grantsville',
      addressRegion: 'UT',
      addressCountry: 'US',
    },
  },
  description: 'AI-powered platform providing 21 specialized AI Employees for warehouse operations, finance, sales, HR, and more.',
};
