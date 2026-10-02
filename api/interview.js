/**
 * La page d'une interview publiée depuis l'admin Haloways.
 *
 *   /interviews/<slug>              la page en ligne
 *   /interviews/relecture/<jeton>   l'aperçu privé que l'invité relit et valide
 *
 * Les données viennent de Supabase (fn_interview_page, lecture publique mais
 * limitée aux pages publiées, ou à celle du jeton). Le rendu est fait côté
 * serveur, pour que LinkedIn et Google lisent le titre, la description et
 * l'image de partage sans exécuter de JavaScript.
 */
const { POSTHOG, PIXEL_CHATGPT } = require('./_gabarit.js')
// La mise en page (refonte du 02/10/2026) vit dans son propre fichier.
const rendre = require('./_interview_page.js')

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mbdvmvgxfqztcxeamzgo.supabase.co'
// Clé publique (anon), déjà embarquée dans l'app web. Elle ne donne accès qu'aux RPC autorisées.
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZHZtdmd4ZnF6dGN4ZWFtemdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzg3OTYsImV4cCI6MjA4ODcxNDc5Nn0.5HNME7DJWug9EqTCbw2lwBNd2VRa2CrclPoFAluzYRk'
// www : haloways.com sans www redirige vers www. L'adresse canonique, le plan
// du site et les partages doivent donner l'adresse qui répond vraiment.
const SITE = 'https://www.haloways.com'
// Le logo LinkedIn officiel (le même que dans l'app, components/ui/BrandIcon).
const LOGO_LINKEDIN = "<svg class=\"li\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"2\" fill=\"#fff\"/><path fill=\"#0A66C2\" d=\"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z\"/></svg>"

// Typographie française : l'espace avant ? ! : ; ne doit jamais laisser le signe seul en début de ligne.
const insecables = (t) => t.replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0')
const esc = (s) => insecables(String(s == null ? '' : s))
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

const initiales = (nom) => String(nom || '').split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0].toUpperCase()).join('')

async function rpc(fn, args) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new Error(`${fn} ${r.status}`)
  return r.json()
}

const page = (d, { token } = {}) => rendre(d, { esc, initiales, LOGO_LINKEDIN, SITE, POSTHOG, PIXEL_CHATGPT, SUPABASE_URL, SUPABASE_ANON }, { token })

module.exports = async (req, res) => {
  // req.query n'existe pas dans toutes les versions du runtime : on lit l'URL.
  const q = new URL(req.url || '/', 'https://haloways.com').searchParams
  const slug = String((req.query && req.query.slug) || q.get('slug') || '').toLowerCase()
  const token = String((req.query && req.query.token) || q.get('token') || '')
  try {
    if (!slug && !token) { res.statusCode = 404; res.setHeader('Content-Type', 'text/plain; charset=utf-8'); return res.end('Introuvable') }
    const d = await rpc('fn_interview_page', token ? { p_token: token } : { p_slug: slug })
    if (!d || !d.page) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.end('<!DOCTYPE html><meta charset="utf-8"><title>Interview introuvable · Haloways</title><p style="font-family:sans-serif;padding:40px">Cette interview n\'existe pas ou n\'est plus en ligne. <a href="/">Retour à l\'accueil</a></p>')
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    // Une page publiée se met en cache une minute à la périphérie : une
    // correction dans l'admin est en ligne presque tout de suite.
    res.setHeader('Cache-Control', token ? 'private, no-store' : 'public, s-maxage=60, stale-while-revalidate=600')
    if (token) res.setHeader('X-Robots-Tag', 'noindex, nofollow')
    return res.end(page(d, { token: token || null }))
  } catch (e) {
    console.error('[interview]', e)
    res.statusCode = 500
    return res.end('Erreur')
  }
}

// Pour les tests locaux du gabarit.
module.exports.rendre = page
