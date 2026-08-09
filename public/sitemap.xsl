<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Advanced SEO Sitemap | Pratham Karigiri</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style type="text/css">
          :root {
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --bg: #f3f4f6;
            --surface: #ffffff;
            --text-main: #111827;
            --text-muted: #6b7280;
            --border: #e5e7eb;
          }
          * { box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            color: var(--text-main); 
            margin: 0; 
            background: var(--bg); 
            padding: 2rem;
            line-height: 1.5;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          .header {
            background: var(--surface);
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin-bottom: 2rem;
            border-left: 5px solid var(--primary);
          }
          h1 { margin: 0 0 0.5rem 0; font-size: 1.8rem; color: var(--text-main); }
          p { margin: 0; color: var(--text-muted); }
          .stats {
            display: flex;
            gap: 1.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border);
          }
          .stat-badge {
            background: #e0e7ff;
            color: var(--primary);
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 0.875rem;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            background: var(--surface); 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
            border-radius: 12px; 
            overflow: hidden; 
          }
          th { 
            background-color: #f9fafb; 
            text-align: left; 
            padding: 1rem 1.5rem; 
            font-size: 0.875rem; 
            font-weight: 600; 
            color: var(--text-muted); 
            border-bottom: 2px solid var(--border); 
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          td { 
            padding: 1rem 1.5rem; 
            font-size: 0.95rem; 
            border-bottom: 1px solid var(--border); 
            vertical-align: top;
          }
          tr:last-child td { border-bottom: none; }
          tr:hover { background-color: #f9fafb; }
          a { color: var(--primary); text-decoration: none; font-weight: 500; word-break: break-all; }
          a:hover { text-decoration: underline; color: var(--primary-hover); }
          .image-info { margin-top: 0.5rem; padding: 0.75rem; background: #f8fafc; border-left: 3px solid #38bdf8; border-radius: 0 6px 6px 0; font-size: 0.875rem; }
          .image-info strong { color: #0f172a; }
          .tag {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            font-size: 0.75rem;
            color: #475569;
            margin-right: 0.5rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Advanced XML Sitemap</h1>
            <p>This is a highly optimized XML Sitemap designed for superior SEO and readable display. Google and other search engines use this to discover your URLs.</p>
            <div class="stats">
              <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
                <span class="stat-badge"><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> Sitemaps</span>
              </xsl:if>
              <xsl:if test="count(sitemap:urlset/sitemap:url) &gt; 0">
                <span class="stat-badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs</span>
                <span class="stat-badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url/image:image)"/> Images</span>
              </xsl:if>
            </div>
          </div>

          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
            <table>
              <thead>
                <tr>
                  <th>Sitemap Index URL</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <tr>
                    <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="sitemap:lastmod">
                          <span class="tag"><xsl:value-of select="concat(substring(sitemap:lastmod,0,11), ' ', substring(sitemap:lastmod,12,5))"/></span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span style="color: #94a3b8; font-style: italic;">Not specified</span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>

          <xsl:if test="count(sitemap:urlset/sitemap:url) &gt; 0">
            <table>
              <thead>
                <tr>
                  <th>URL Location</th>
                  <th>Images &amp; SEO Data</th>
                  <th>Priority</th>
                  <th>Change Freq</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td>
                      <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                      <xsl:if test="sitemap:lastmod">
                        <div style="margin-top: 6px;">
                          <span style="font-size: 0.75rem; color: #94a3b8;">Last modified: <xsl:value-of select="concat(substring(sitemap:lastmod,0,11), ' ', substring(sitemap:lastmod,12,5))"/></span>
                        </div>
                      </xsl:if>
                    </td>
                    <td>
                      <xsl:if test="count(image:image) = 0">
                        <span style="color: #94a3b8; font-style: italic;">No Images</span>
                      </xsl:if>
                      <xsl:for-each select="image:image">
                        <div class="image-info">
                          <strong><xsl:value-of select="image:title"/></strong><br/>
                          <xsl:value-of select="image:caption"/><br/>
                          <a href="{image:loc}" target="_blank" style="font-size: 0.75rem; color: #38bdf8;">View Image File →</a>
                        </div>
                      </xsl:for-each>
                    </td>
                    <td><span class="tag"><xsl:value-of select="sitemap:priority"/></span></td>
                    <td><span style="text-transform: capitalize; color: #475569; font-size: 0.875rem;"><xsl:value-of select="sitemap:changefreq"/></span></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
