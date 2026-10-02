/**
 * Le plan du site, servi sur /sitemap.xml.
 *
 * Il était écrit à la main et ne listait que la première interview : une page
 * publiée depuis l'admin n'y entrait jamais. Il se construit maintenant à la
 * demande : les pages fixes, puis chaque interview en ligne (fn_interviews_publiees).
 *
 * Les adresses sont en www : haloways.com sans www redirige, et un plan du
 * site ne doit lister que des adresses qui répondent directement.
 */
const SITE = 'https://www.haloways.com'
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mbdvmvgxfqztcxeamzgo.supabase.co'
// Clé publique (anon), la même que dans api/interview.js.
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZHZtdmd4ZnF6dGN4ZWFtemdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzg3OTYsImV4cCI6MjA4ODcxNDc5Nn0.5HNME7DJWug9EqTCbw2lwBNd2VRa2CrclPoFAluzYRk'

const FIXES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/ai', changefreq: 'monthly', priority: '0.4' },
  { loc: '/terms', changefreq: 'monthly', priority: '0.3' },
  { loc: '/privacy', changefreq: 'monthly', priority: '0.3' },
]

module.exports = async (req, res) => {
  let interviews = []
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/fn_interviews_publiees`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (r.ok) interviews = await r.json()
  } catch (e) {
    // Sans la liste, le plan reste valide avec les pages fixes.
    console.error('[sitemap]', e)
  }
  const jour = (d) => (d ? String(d).slice(0, 10) : '')
  const lignes = [
    ...FIXES.map((p) => `  <url>\n    <loc>${SITE}${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`),
    ...(Array.isArray(interviews) ? interviews : []).filter((i) => i && /^[a-z0-9-]+$/.test(i.slug || '')).map((i) =>
      `  <url>\n    <loc>${SITE}/interviews/${i.slug}</loc>${jour(i.updated_at || i.published_at) ? `\n    <lastmod>${jour(i.updated_at || i.published_at)}</lastmod>` : ''}\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`),
  ]
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemaps/0.9">\n${lignes.join('\n')}\n</urlset>\n`.replace('schemas/sitemaps/0.9', 'schemas/sitemap/0.9'))
}
