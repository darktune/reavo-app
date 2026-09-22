import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://www.reavoglobal.com').replace(/\/$/, '');

    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    let products = [];
    if (url && key) {
      const supabase = createClient(url, key);
      const { data } = await supabase.from('products').select('id, updated_at');
      products = data || [];
    }

    const staticRoutes = [
      '',
      '/shop',
      '/story',
      '/about',
      '/compare',
      '/partnerships',
      '/ambassadors',
      '/faq'
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static routes
    staticRoutes.forEach(route => {
      xml += '  <url>\n';
      xml += `    <loc>${siteUrl}${route}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Add dynamic product routes
    products.forEach(product => {
      xml += '  <url>\n';
      xml += `    <loc>${siteUrl}/product/${product.id}</loc>\n`;
      if (product.updated_at) {
        xml += `    <lastmod>${new Date(product.updated_at).toISOString()}</lastmod>\n`;
      }
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.9</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('[API sitemap] Generation error:', error);
    return res.status(500).end();
  }
}
