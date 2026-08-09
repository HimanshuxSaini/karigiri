const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const baseUrl = 'https://www.prathamkarigiri.in';

// @desc    Generate sitemap index
// @route   GET /api/sitemap.xml
// @access  Public
router.get('/sitemap.xml', (req, res) => {
  const currentDate = new Date().toISOString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  const sitemaps = [
    '/sitemap/pages.xml',
    '/sitemap/categories.xml',
    '/sitemap/products/1.xml'
  ];

  sitemaps.forEach(path => {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${baseUrl}${path}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  });

  xml += `</sitemapindex>`;

  res.header('Content-Type', 'application/xml');
  res.status(200).send(xml);
});

// @desc    Generate pages sitemap
// @route   GET /api/sitemap/pages.xml
// @access  Public
router.get('/sitemap/pages.xml', (req, res) => {
  const staticUrls = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/shop', priority: 0.9, changefreq: 'daily' },
    { url: '/privacy-policy', priority: 0.3, changefreq: 'monthly' },
    { url: '/terms', priority: 0.3, changefreq: 'monthly' },
    { url: '/returns', priority: 0.4, changefreq: 'monthly' },
    { url: '/shipping', priority: 0.4, changefreq: 'monthly' },
    { url: '/contact', priority: 0.5, changefreq: 'monthly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  staticUrls.forEach((item) => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${item.url}</loc>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  res.header('Content-Type', 'application/xml');
  res.status(200).send(xml);
});

// @desc    Generate categories sitemap
// @route   GET /api/sitemap/categories.xml
// @access  Public
router.get('/sitemap/categories.xml', (req, res) => {
  const categories = ['Women', 'Men', 'Kids', 'Bouquet', 'Laddu%20Gopal', 'Yarn'];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  categories.forEach((cat) => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/shop?category=${cat}</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  res.header('Content-Type', 'application/xml');
  res.status(200).send(xml);
});

// @desc    Generate products sitemap
// @route   GET /api/sitemap/products/:page.xml
// @access  Public
router.get('/sitemap/products/:page.xml', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('products').get();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    snapshot.docs.forEach((doc) => {
      const product = doc.data();
      if (product.inStock !== false) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/product/${doc.id}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        
        if (product.updatedAt) {
           const date = product.updatedAt.toDate ? product.updatedAt.toDate().toISOString() : new Date().toISOString();
           xml += `    <lastmod>${date}</lastmod>\n`;
        }
        
        if (product.image) {
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
    console.error('Error generating products sitemap:', error);
    res.status(500).send('Error generating products sitemap');
  }
});

module.exports = router;
