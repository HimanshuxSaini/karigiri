const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// @desc    Generate dynamic sitemap.xml
// @route   GET /api/sitemap.xml
// @access  Public
router.get('/sitemap.xml', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('products').get();
    
    const baseUrl = 'https://www.prathamkarigiri.in';
    
    // Static URLs
    const staticUrls = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/shop', priority: 0.9, changefreq: 'daily' },
      { url: '/shop?category=Women', priority: 0.8, changefreq: 'weekly' },
      { url: '/shop?category=Men', priority: 0.8, changefreq: 'weekly' },
      { url: '/shop?category=Kids', priority: 0.8, changefreq: 'weekly' },
      { url: '/shop?category=Bouquet', priority: 0.8, changefreq: 'weekly' },
      { url: '/shop?category=Laddu%20Gopal', priority: 0.8, changefreq: 'weekly' },
      { url: '/shop?category=Yarn', priority: 0.8, changefreq: 'weekly' },
      { url: '/privacy-policy', priority: 0.3, changefreq: 'monthly' },
      { url: '/terms', priority: 0.3, changefreq: 'monthly' },
      { url: '/returns', priority: 0.4, changefreq: 'monthly' },
      { url: '/shipping', priority: 0.4, changefreq: 'monthly' },
      { url: '/contact', priority: 0.5, changefreq: 'monthly' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Add static URLs
    staticUrls.forEach((item) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${item.url}</loc>\n`;
      xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
      xml += `    <priority>${item.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add dynamic product URLs
    snapshot.docs.forEach((doc) => {
      const product = doc.data();
      // Only include active/inStock products
      if (product.inStock !== false) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/product/${doc.id}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        
        if (product.updatedAt) {
           const date = product.updatedAt.toDate ? product.updatedAt.toDate().toISOString() : new Date().toISOString();
           xml += `    <lastmod>${date}</lastmod>\n`;
        }
        
        // Image SEO for E-commerce
        if (product.image) {
          // Escape XML special characters in product name
          const safeName = (product.name || 'Product').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${product.image.replace(/&/g, '&amp;')}</image:loc>\n`;
          xml += `      <image:title>${safeName}</image:title>\n`;
          xml += `    </image:image>\n`;
        }
        
        xml += `  </url>\n`;
      }
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
