/**
 * La page d'une interview publiée depuis l'admin Haloways.
 *
 *   /interviews/<slug>              la page en ligne
 *   /interviews/relecture/<jeton>   l'aperçu privé que l'invité relit et valide
 *
 * Les données viennent de Supabase (fn_interview_page, lecture publique mais
 * limitée aux pages publiées, ou à celle du jeton). Le rendu est fait ici, côté
 * serveur, pour que LinkedIn et Google lisent le titre, la description et
 * l'image de partage sans exécuter de JavaScript.
 */
const { CSS, POSTHOG } = require('./_gabarit.js')

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mbdvmvgxfqztcxeamzgo.supabase.co'
// Clé publique (anon), déjà embarquée dans l'app web. Elle ne donne accès qu'aux RPC autorisées.
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZHZtdmd4ZnF6dGN4ZWFtemdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzg3OTYsImV4cCI6MjA4ODcxNDc5Nn0.5HNME7DJWug9EqTCbw2lwBNd2VRa2CrclPoFAluzYRk'
const SITE = 'https://haloways.com'
// L'intervieweur : chaque question porte son visage et son nom.
const HOTE = {
  nom: 'Charles Vidonne',
  photo: process.env.HOTE_PHOTO_URL || 'https://mbdvmvgxfqztcxeamzgo.supabase.co/storage/v1/object/public/avatars/fc718bc2-ebd8-4f6e-8382-4eaddc6f1c8e/fc718bc2-ebd8-4f6e-8382-4eaddc6f1c8e_1775723115174.jpg',
}
// Le logo LinkedIn officiel (le même que dans l'app, components/ui/BrandIcon).
const LOGO_LINKEDIN = "<svg class=\"li\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"2\" fill=\"#fff\"/><path fill=\"#0A66C2\" d=\"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z\"/></svg>"

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

const initiales = (nom) => String(nom || '').split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0].toUpperCase()).join('')

function paragraphes(t) {
  return String(t || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')
}

async function rpc(fn, args) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new Error(`${fn} ${r.status}`)
  return r.json()
}

function page(d, { token }) {
  const p = d.page || {}
  const apercu = !!token
  const slug = d.slug || ''
  const url = `${SITE}/interviews/${slug}`
  const nom = p.nom || ''
  const prenom = nom.split(' ')[0] || nom
  const role = p.surtitre && p.surtitre.startsWith(nom) ? p.surtitre.slice(nom.length).replace(/^[\s,]+/, '') : (p.surtitre || '')
  const titreDoc = `${p.titre} · ${nom}, interview Haloways`
  const desc = p.description_seo || p.accroche || ''
  const image = p.share_image_url || `${SITE}/logo-square.png`
  const echanges = Array.isArray(p.echanges) ? p.echanges.filter((e) => e && (e.question || e.reponse)) : []
  const mots = echanges.reduce((n, e) => n + String(e.reponse || '').split(/\s+/).length, 0) + String(p.chapo || '').split(/\s+/).length
  const lecture = Math.max(2, Math.round(mots / 230))
  const pubIso = (d.published_at || new Date().toISOString()).slice(0, 10)
  const f = p.fiche || {}
  const portrait = p.portrait_url
  const photo = (cls) => portrait
    ? `<span class="mono ${cls}" aria-hidden="true"><img src="${esc(portrait)}" alt=""></span>`
    : `<span class="mono ${cls}" aria-hidden="true">${esc(initiales(nom))}</span>`
  const exergues = Array.isArray(p.exergues) ? p.exergues : []

  const blocs = echanges.map((e, i) => {
    const n = i + 1
    const pulls = exergues.filter((x) => Number(x.apres_echange) === n && x.texte)
      .map((x) => `<blockquote class="pull"><p>« ${esc(x.texte)} »</p><cite>${esc(nom)}</cite></blockquote>`).join('')
    return `<section class="ex" id="q${n}">
<div class="row q msg"><span class="av m hote" aria-hidden="true"><img src="${esc(HOTE.photo)}" alt=""></span><div class="bw"><p class="who"><img class="mini" src="${esc(HOTE.photo)}" alt="">${esc(HOTE.nom)}</p><div class="bq"><h2>${esc(e.question)}</h2></div></div></div>
<div class="row a msg"><div class="bw"><p class="who">${esc(nom)}${portrait ? `<img class="mini" src="${esc(portrait)}" alt="">` : ''}</p><div class="ba"><span class="tape" aria-hidden="true"><i></i><i></i><i></i></span><div class="txt">${paragraphes(e.reponse)}</div></div></div>${photo('av m')}</div>
</section>${pulls}`
  }).join('')

  const recherche = (p.recherche || []).filter(Boolean)
  const lignesFiche = [
    ['Entreprise', f.entreprise], ['Métier', f.metier], ['Basé à', f.lieu], ['À son compte depuis', f.depuis], ['Clients', f.clients],
  ].filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')
  const siteNu = f.site ? String(f.site).replace(/^https?:\/\//, '').replace(/\/$/, '') : ''
  const siteUrl = f.site ? (/^https?:/.test(f.site) ? f.site : `https://${f.site}`) : ''

  const ld = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: p.titre, alternativeHeadline: p.surtitre, description: desc, inLanguage: 'fr-FR',
    datePublished: pubIso, dateModified: pubIso, mainEntityOfPage: url, url,
    image: [image, portrait].filter(Boolean), wordCount: mots, articleSection: 'Interviews',
    author: { '@type': 'Person', name: 'Charles Vidonne' },
    publisher: { '@type': 'Organization', name: 'Haloways', url: `${SITE}/`, logo: { '@type': 'ImageObject', url: `${SITE}/logo-square.png` } },
    about: { '@type': 'Person', name: nom, jobTitle: role || undefined, ...(f.entreprise ? { worksFor: { '@type': 'Organization', name: f.entreprise, ...(siteUrl ? { url: siteUrl } : {}) } } : {}), sameAs: [siteUrl, f.linkedin].filter(Boolean) },
  }

  const relecture = apercu ? `
<section class="relire" id="relire"><div class="box">
<h2>Votre interview vous convient ?</h2>
<p>Validez-la telle quelle, ou dites-nous ce qu'il faut corriger. Vous pouvez retirer un nom, il appartient à la personne citée. Les faits que vous avez racontés restent, ils appartiennent au récit.</p>
${d.status === 'approved' || d.status === 'published' ? '<p class="ok">Merci, votre interview est validée.</p>' : ''}
<textarea id="corr" placeholder="Vos corrections, précisément (ex. : c'était en 2022, pas en 2021)"></textarea>
<div class="acts"><button class="btn" id="ok" type="button">Je valide mon interview</button><button class="btn ghost" id="ko" type="button">Envoyer mes corrections</button></div>
<p id="etat" style="margin-top:16px"></p></div></section>
<script>
(function(){
  var etat=document.getElementById('etat');
  function envoyer(decision){
    var m=document.getElementById('corr').value;
    if(decision==='changes'&&!m.trim()){etat.className='ko';etat.textContent="Écrivez ce qu'il faut corriger.";return}
    etat.className='';etat.textContent='Envoi…';
    fetch(${JSON.stringify(SUPABASE_URL + '/functions/v1/interview-publish')},{method:'POST',headers:{'Content-Type':'application/json',apikey:${JSON.stringify(SUPABASE_ANON)}},
      body:JSON.stringify({action:'review',token:${JSON.stringify(token)},decision:decision,message:m})})
    .then(function(r){return r.json()}).then(function(d){
      if(d&&d.ok){etat.className='ok';etat.textContent=decision==='approve'?'Merci, votre interview est validée. Nous vous prévenons dès sa publication.':'Merci, vos corrections sont transmises à Charles.'}
      else{etat.className='ko';etat.textContent=(d&&d.error)||"L'envoi a échoué, réessayez."}
    }).catch(function(){etat.className='ko';etat.textContent="L'envoi a échoué, réessayez."});
  }
  document.getElementById('ok').onclick=function(){envoyer('approve')};
  document.getElementById('ko').onclick=function(){envoyer('changes')};
})();
</script>` : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titreDoc)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${apercu ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'}">
${apercu ? '' : `<link rel="canonical" href="${url}">`}
<link rel="icon" type="image/png" href="/favicon.png" sizes="32x32">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Haloways">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${esc(p.titre)}">
<meta property="og:description" content="${esc(`${p.surtitre}. ${desc}`)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(`${nom} : « ${p.citation_partage || p.titre} »`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.titre)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
<meta property="article:published_time" content="${pubIso}"><meta property="article:section" content="Interviews"><meta property="article:author" content="Charles Vidonne">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&display=swap" rel="stylesheet">
<style>${CSS}</style>
${apercu ? '' : POSTHOG}
</head>
<body>
<header class="top"><a class="logo" href="/" aria-label="Haloways, accueil">HALOWAYS</a>
<nav aria-label="Navigation principale"><a class="nl on" href="/interviews">Interviews</a><a class="nl" href="/#tarif">Tarif</a><a class="nl" href="https://one.haloways.com/login">Se connecter</a>
<a class="btn sm" href="https://one.haloways.com/signup">Commencer 14 jours gratuits</a></nav></header>
${apercu ? `<div class="apercu">Aperçu privé, visible par vous seul${d.status === 'published' ? '' : ' : cette page n’est pas encore publiée'}. <a href="#relire" style="color:var(--gold)">Valider ou corriger ↓</a></div>` : ''}
<main>
<article>
<header class="hx">
<nav class="hx-crumbs" aria-label="Fil d'Ariane"><a href="/">Accueil</a><span>/</span><a href="/interviews">Interviews</a><span>/</span><span aria-current="page">${esc(nom)}</span></nav>
<div class="vc">
<div class="vc-id">
<div class="vc-ph">${portrait ? `<img src="${esc(portrait)}" alt="Portrait de ${esc(nom)}">` : `<span class="hx-ini">${esc(initiales(nom))}</span>`}</div>
<b>${esc(nom)}${f.linkedin ? `<a class="hx-li" href="${esc(f.linkedin)}" target="_blank" rel="noopener" aria-label="Profil LinkedIn de ${esc(nom)}">${LOGO_LINKEDIN}</a>` : ''}</b>
<span>${esc(role)}</span>
</div>
<div class="vc-txt">
<p class="hx-k"><span>Interview Haloways</span><span>${esc(p.date_label || '')}</span><span>${lecture} min de lecture</span></p>
<h1 class="hx-t">${esc(p.titre)}</h1>
${p.chapo ? `<p class="vc-chapo">${esc(p.chapo)}</p>` : ''}
</div>
</div>
</header>
<div class="body"><div><div class="itv-head"><span class="itv-k">L'interview</span><h2 class="itv-title"><em>${echanges.length}</em> questions à ${esc(prenom)}</h2><p class="itv-sub">Un échange avec Charles Vidonne</p></div>${blocs}
<p class="credits">Propos recueillis par Charles Vidonne. Production : Nicolas De Monte.</p>
${recherche.length ? `<section class="seek" aria-labelledby="seek-t">
<h2 id="seek-t">Ce que ${esc(prenom)} <em>recherche</em></h2><ul>${recherche.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
<div class="acts">${siteUrl ? `<a class="btn" href="${esc(siteUrl)}" target="_blank" rel="noopener">Découvrir ${esc(f.entreprise || siteNu)} ↗</a>` : ''}${f.linkedin ? `<a class="btn ghost lnk" href="${esc(f.linkedin)}" target="_blank" rel="noopener">${LOGO_LINKEDIN}LinkedIn</a>` : ''}</div>
<p class="hw">Chaque semaine, Haloways croise les besoins de ses membres pour leur présenter les bonnes personnes. <a href="/#how">Voir comment ça marche →</a></p></section>` : ''}
</div>
<aside class="side" aria-label="Fiche de ${esc(nom)}"><div class="card">${photo('')}
<p class="nm">${esc(nom)}</p><p class="rl">${esc(role)}</p><dl>${lignesFiche}${p.membre_haloways ? '<div><dt>Réseau</dt><dd class="g">Membre Haloways</dd></div>' : ''}</dl>
${siteUrl ? `<a class="lk first" href="${esc(siteUrl)}" target="_blank" rel="noopener"><span>${esc(siteNu)}</span><span aria-hidden="true">↗</span></a>` : ''}
${f.linkedin ? `<a class="lk${siteUrl ? '' : ' first'}" href="${esc(f.linkedin)}" target="_blank" rel="noopener"><span class="lk-li">${LOGO_LINKEDIN}LinkedIn</span><span aria-hidden="true">↗</span></a>` : ''}
</div></aside></div></article>
${relecture}
</main>
<section class="cta-band" aria-labelledby="cta-t"><span class="label">Le club Haloways</span>
<h2 id="cta-t">Rencontrez des entrepreneurs comme ${esc(prenom)}, chaque semaine.</h2>
<p>Des rencontres choisies pour faire avancer votre activité, en visio. Dès 33 €/mois, sans engagement.</p>
<a class="btn" href="https://one.haloways.com/signup">Commencer 14 jours gratuits</a></section><footer class="foot"><span class="flogo">HALOWAYS</span>
<nav aria-label="Liens du site"><a href="/">Accueil</a><a href="/interviews">Interviews</a><a href="mailto:nicolas@haloways.com">Contact</a><a href="/terms">Conditions d'utilisation</a><a href="/privacy">Confidentialité</a><a href="/mentions-legales">Mentions légales</a></nav>
<small>© 2026 Haloways</small></footer>
<script>
/* Les messages s'envoient au fil du scroll : la question arrive, on voit
   « en train d'écrire », puis la réponse. Sans JavaScript ou avec la
   réduction des animations, tout reste affiché d'emblée. */
(function(){
  var d=document.documentElement;
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  d.classList.add('anim');
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      var ex=e.target; io.unobserve(ex);
      var q=ex.querySelector('.row.q'), a=ex.querySelector('.row.a');
      if(q) q.classList.add('vu');
      if(a){ setTimeout(function(){ a.classList.add('vu','ecrit') }, 420);
             setTimeout(function(){ a.classList.remove('ecrit') }, 1250); }
    });
  },{rootMargin:'0px 0px -12% 0px',threshold:0.12});
  document.querySelectorAll('.ex').forEach(function(ex){ io.observe(ex) });
})();
</script>
</body></html>`
}

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
      return res.end('<!DOCTYPE html><meta charset="utf-8"><title>Interview introuvable · Haloways</title><p style="font-family:sans-serif;padding:40px">Cette interview n\'existe pas ou n\'est plus en ligne. <a href="/interviews">Voir les interviews</a></p>')
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
