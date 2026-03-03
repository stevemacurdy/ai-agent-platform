export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://www.woulfai.com';
  const agentSlugs = [
    'cfo', 'collections', 'finops', 'payables',
    'sales', 'sales-intel', 'sales-coach', 'marketing', 'seo',
    'warehouse', 'supply-chain', 'wms', 'operations',
    'hr', 'support', 'training',
    'legal', 'compliance',
    'research', 'org-lead', 'str',
  ];

  const staticPages = [
    '', 'pricing', 'contact', 'about', 'case-studies', 'solutions',
    'login', 'register', 'security', 'privacy', 'terms',
  ];

  const urls = [
    ...staticPages.map(p => ({
      loc: `${baseUrl}/${p}`,
      changefreq: p === '' ? 'weekly' : 'monthly',
      priority: p === '' ? '1.0' : p === 'pricing' ? '0.9' : '0.7',
    })),
    ...agentSlugs.map(slug => ({
      loc: `${baseUrl}/agents/${slug}`,
      changefreq: 'monthly',
      priority: '0.6',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
