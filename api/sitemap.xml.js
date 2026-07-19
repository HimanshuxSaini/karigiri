export default async function handler(req, res) {
  // Use VITE_API_URL which points to the Render backend (e.g. https://karigiri-api.onrender.com/api)
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:5001/api';
  
  try {
    // Append /sitemap.xml to the backend API URL
    const targetUrl = apiUrl.endsWith('/') ? `${apiUrl}sitemap.xml` : `${apiUrl}/sitemap.xml`;
    
    // Fetch the generated XML from the Render backend
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      throw new Error(`Backend returned status: ${response.status}`);
    }
    
    const xml = await response.text();
    
    // Send it back as XML and cache it on Vercel's edge network for 1 hour
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap Proxy Error:', error);
    res.status(500).send('Error fetching sitemap');
  }
}
