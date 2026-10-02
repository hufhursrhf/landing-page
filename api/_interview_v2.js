/**
 * La page d'interview, version 2 (02/10/2026). Servie avec ?v=2 tant qu'elle
 * n'est pas validée : la page en ligne ne change pas.
 *
 * Ce qui change par rapport à la version 1, et pourquoi :
 *   • les réponses ne sont plus dans des cartes sombres. Une bulle de
 *     messagerie tient une phrase ; avec trois paragraphes c'est un mur. La
 *     question reste une bulle (c'est Charles qui écrit), la réponse devient
 *     du texte de lecture, repéré par le visage de l'invité ;
 *   • plus rien n'est caché en attendant une animation : en défilant vite on
 *     tombait sur des écrans vides. Seule la bulle de la question s'anime ;
 *   • le parcours daté (publication.reperes), rédigé à chaque interview mais
 *     jamais affiché, ouvre la page ;
 *   • la fiche (entreprise, lieu, depuis quand) monte dans l'en-tête sous
 *     forme d'étiquettes, au lieu d'une carte qui répétait l'en-tête ;
 *   • sur grand écran, un sommaire des questions suit la lecture ;
 *   • la fin tient en un seul bloc : ce que l'invité recherche, puis Haloways
 *     en une phrase, une vidéo qui s'ouvre au clic et un bouton. Avant : la
 *     recherche, la fiche, une bande vidéo, une bande d'appel.
 *   • le titre « 10 questions à Maxime » laisse la place à l'accroche de
 *     l'interview, qui dit de quoi on parle.
 */

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--ink:#101a30;--ink2:#15233f;--gold:#C9A84C;--ivory:#F5F0E8;--hi:rgba(245,240,232,.9);--mid:rgba(245,240,232,.66);--lo:rgba(245,240,232,.44);--line:rgba(245,240,232,.1);--serif:'Cormorant Garamond',Georgia,serif}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{background:var(--ink);color:var(--hi);font-family:'DM Sans',system-ui,sans-serif;font-weight:300;font-size:17px;line-height:1.75;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit}
img{display:block;max-width:100%}
.top{position:sticky;top:0;z-index:30;height:60px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 clamp(18px,4vw,40px);background:rgba(16,26,48,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.logo{font-family:var(--serif);font-size:1.02rem;letter-spacing:.28em;color:var(--gold);text-decoration:none}
.top nav{display:flex;align-items:center;gap:24px}
.nl{font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;color:var(--mid);text-decoration:none}
.nl:hover{color:var(--ivory)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--gold);color:var(--ink);font-size:.64rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;padding:.9rem 1.5rem;border-radius:999px;border:0;cursor:pointer;transition:filter .2s}
.btn:hover{filter:brightness(1.07)}
.btn.sm{padding:.6rem 1.05rem;font-size:.58rem}
.btn.clair{background:transparent;color:var(--ivory);border:1px solid rgba(245,240,232,.22)}
.btn.clair:hover{border-color:rgba(201,168,76,.6);color:var(--gold);filter:none}
.btn .li{flex:none}
.prog{position:fixed;top:0;left:0;right:0;height:2px;z-index:40;background:var(--gold);transform-origin:0 50%;transform:scaleX(0)}

/* ── En-tête ── */
.hero{max-width:1080px;margin:0 auto;padding:clamp(36px,7vw,84px) clamp(20px,4vw,40px) 0;display:grid;grid-template-columns:minmax(0,1fr) 264px;gap:56px;align-items:start}
.k{font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:var(--lo);display:flex;flex-wrap:wrap;gap:6px 14px}
.k b{font-weight:500;color:var(--gold)}
.hero h1{font-family:var(--serif);font-weight:400;font-size:clamp(2.05rem,5.6vw,3.55rem);line-height:1.1;color:var(--ivory);margin:18px 0 22px;text-wrap:balance}
.hero h1 i{font-style:normal;color:var(--gold)}
.qui{display:flex;align-items:center;gap:14px}
.qui .ph{width:54px;height:54px;border-radius:50%;overflow:hidden;flex:none;background:var(--ink2);border:1px solid rgba(201,168,76,.4);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-style:italic;color:var(--gold)}
.qui .ph img{width:100%;height:100%;object-fit:cover}
.qui b{display:flex;align-items:center;gap:8px;font-weight:500;color:var(--ivory);font-size:1rem;line-height:1.3}
.qui span{display:block;font-size:.86rem;color:var(--mid);line-height:1.4}
.qui span::first-letter{text-transform:uppercase}
.chapo{margin-top:22px;max-width:640px;font-size:1.06rem;color:var(--mid)}
.faits{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}
.faits li{list-style:none;font-size:.78rem;line-height:1.3;padding:.42rem .8rem;border:1px solid var(--line);border-radius:999px;color:var(--mid)}
.faits li.g{border-color:rgba(201,168,76,.4);color:var(--gold)}
.portrait{position:relative;margin-top:10px;width:232px;justify-self:end}
.portrait::before{content:'';position:absolute;inset:-12px;border:1px solid rgba(201,168,76,.3);border-radius:50%}
.portrait img,.portrait .ini{position:relative;width:100%;aspect-ratio:1;object-fit:cover;border-radius:50%;background:var(--ink2)}
.portrait .ini{display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-style:italic;font-size:4rem;color:var(--gold)}

/* ── Parcours ── */
.parcours{max-width:1080px;margin:0 auto;padding:clamp(40px,6vw,64px) clamp(20px,4vw,40px) 0}
.parcours h2,.kk{font-size:.62rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--gold)}
.parcours ol{list-style:none;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:0;margin-top:20px;border-top:1px solid var(--line)}
.parcours li{position:relative;padding:18px 20px 0 0}
.parcours li::before{content:'';position:absolute;top:-4px;left:0;width:7px;height:7px;border-radius:50%;background:var(--gold)}
.parcours b{display:block;font-family:var(--serif);font-weight:400;font-size:1.35rem;line-height:1.2;color:var(--ivory)}
.parcours span{display:block;margin-top:6px;font-size:.86rem;line-height:1.5;color:var(--mid)}

/* ── Conversation ── */
.conv{max-width:1080px;margin:0 auto;padding:clamp(48px,7vw,88px) clamp(20px,4vw,40px) 0;display:grid;grid-template-columns:232px minmax(0,680px);gap:64px;justify-content:space-between}
.rail{position:sticky;top:92px;align-self:start;max-height:calc(100vh - 120px);overflow:auto}
.rail ol{list-style:none;margin-top:16px;border-left:1px solid var(--line)}
.rail a{display:block;padding:7px 0 7px 14px;margin-left:-1px;border-left:1px solid transparent;font-size:.8rem;line-height:1.4;color:var(--lo);text-decoration:none;transition:color .2s,border-color .2s}
.rail a:hover{color:var(--hi)}
.rail a[aria-current]{color:var(--ivory);border-left-color:var(--gold)}
.conv-t{font-family:var(--serif);font-style:italic;font-weight:400;font-size:clamp(1.45rem,3.2vw,1.9rem);line-height:1.3;color:var(--ivory);margin-top:12px;text-wrap:balance}
.ex{margin-top:clamp(40px,6vw,60px);scroll-margin-top:84px}
.q{display:flex;align-items:flex-start;gap:10px}
.q .av{width:30px;height:30px;border-radius:50%;object-fit:cover;flex:none;margin-top:5px;border:1px solid var(--line)}
.q h2{font-family:var(--serif);font-style:italic;font-weight:400;font-size:clamp(1.18rem,2.6vw,1.34rem);line-height:1.35;color:var(--ivory);background:rgba(201,168,76,.09);border:1px solid rgba(201,168,76,.3);border-radius:5px 20px 20px 20px;padding:12px 18px;max-width:560px}
.a{margin-top:18px;padding-left:40px}
.a .de{display:flex;align-items:center;gap:8px;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--lo);margin-bottom:8px}
.a .de img,.a .de i{width:22px;height:22px;border-radius:50%;object-fit:cover;flex:none}
.a .de i{display:inline-flex;align-items:center;justify-content:center;background:var(--ink2);font-family:var(--serif);font-size:.7rem;color:var(--gold);letter-spacing:0}
.a p{margin-bottom:1em}
.a p:last-child{margin-bottom:0}
.a p:first-of-type{color:var(--ivory);font-weight:400}
.pull{margin:clamp(44px,7vw,68px) 0 0;padding:28px 0;border-top:1px solid rgba(201,168,76,.3);border-bottom:1px solid rgba(201,168,76,.3);text-align:center}
.pull p{font-family:var(--serif);font-style:italic;font-size:clamp(1.5rem,3.6vw,2rem);line-height:1.28;color:var(--ivory);text-wrap:balance}
.pull cite{display:block;margin-top:12px;font-style:normal;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
.credits{margin-top:44px;font-size:.82rem;font-style:italic;color:var(--lo)}

/* ── La fin : ce qu'il recherche, puis Haloways ── */
.fin{max-width:1080px;margin:clamp(56px,8vw,96px) auto 0;padding:0 clamp(20px,4vw,40px) clamp(64px,8vw,104px)}
.fin-in{border-top:1px solid var(--line);padding-top:clamp(40px,6vw,64px);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,400px);gap:clamp(32px,5vw,72px);align-items:start}
.fin h2{font-family:var(--serif);font-weight:400;font-size:clamp(1.7rem,3.8vw,2.3rem);line-height:1.18;color:var(--ivory)}
.fin h2 em{font-style:italic;color:var(--gold)}
.cherche{list-style:none;margin-top:20px;counter-reset:c}
.cherche li{counter-increment:c;display:grid;grid-template-columns:28px 1fr;gap:6px;padding:12px 0;border-top:1px solid var(--line);font-size:.98rem;line-height:1.55}
.cherche li::before{content:counter(c);font-family:var(--serif);font-style:italic;font-size:1.15rem;color:var(--gold)}
.acts{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.pont{background:var(--ink2);border:1px solid var(--line);border-radius:24px;padding:22px}
.film{position:relative;display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:16px;overflow:hidden;background:#0b1326 center/cover no-repeat;cursor:pointer}
.film::after{content:'';position:absolute;inset:0;background:rgba(11,19,38,.18)}
.film .rond{position:absolute;z-index:1;left:50%;top:50%;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;transition:transform .2s}
.film:hover .rond{transform:scale(1.06)}
.film .rond svg{width:22px;height:22px;fill:var(--ink);margin-left:3px}
.film .lib{position:absolute;z-index:1;left:12px;top:12px;padding:5px 10px;border-radius:999px;background:rgba(11,19,38,.72);font-size:.6rem;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--ivory)}
.pont p{margin-top:18px;font-size:.98rem;line-height:1.6;color:var(--hi)}
.pont p b{font-weight:500;color:var(--ivory)}
.pont small{display:block;margin-top:8px;font-size:.8rem;line-height:1.5;color:var(--lo)}
.pont .btn{margin-top:18px;width:100%}
.voile{position:fixed;inset:0;z-index:60;background:rgba(8,13,26,.92);display:none;align-items:center;justify-content:center;padding:20px}
.voile.ouvert{display:flex}
.voile video{width:min(100%,1040px);max-height:86vh;aspect-ratio:16/9;border-radius:16px;background:#000}
.voile button{position:absolute;top:16px;right:16px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(245,240,232,.3);background:rgba(16,26,48,.6);color:var(--ivory);font-size:1.3rem;line-height:1;cursor:pointer}
.foot{border-top:1px solid var(--line);padding:30px clamp(20px,4vw,40px);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;font-size:.78rem;color:var(--lo)}
.foot .flogo{font-family:var(--serif);letter-spacing:.28em;color:var(--gold)}
.foot nav{display:flex;flex-wrap:wrap;gap:8px 20px}
.foot a{text-decoration:none;color:var(--mid)}
.foot a:hover{color:var(--gold)}
:focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:6px}

/* La bulle de la question arrive ; la réponse, elle, est toujours là. */
.js .q h2{opacity:0;transform:translateY(8px) scale(.985);transform-origin:0 0;transition:opacity .45s ease,transform .45s ease}
.js .ex.vu .q h2{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.js .q h2{opacity:1;transform:none;transition:none}html{scroll-behavior:auto}}

@media(max-width:980px){
  .hero{grid-template-columns:1fr;gap:0}
  .portrait{display:none}
  .conv{grid-template-columns:minmax(0,680px);justify-content:center}
  .rail{display:none}
  .fin-in{grid-template-columns:1fr}
}
@media(min-width:981px){.qui .ph{display:none}}
@media(max-width:760px){
  body{font-size:16.5px}
  .top nav .nl{display:none}
  .parcours ol{grid-auto-flow:row;grid-auto-columns:auto;border-top:0;border-left:1px solid var(--line);margin-left:3px}
  .parcours li{padding:0 0 18px 20px}
  .parcours li:last-child{padding-bottom:0}
  .parcours li::before{top:9px;left:-4px}
  .a{padding-left:0}
  .q h2{max-width:none}
  .acts .btn{flex:1 1 auto}
}
`

const court = (t, n) => {
  const s = String(t || '').replace(/\s+/g, ' ').trim()
  return s.length > n ? `${s.slice(0, n - 1).replace(/[\s,;:]+\S*$/, '')}…` : s
}

module.exports = function rendreV2(d, h) {
  const { esc, paragraphes, initiales, HOTE, LOGO_LINKEDIN, SITE, POSTHOG, PIXEL_CHATGPT } = h
  const p = d.page || {}
  const slug = d.slug || ''
  const url = `${SITE}/interviews/${slug}`
  const nom = p.nom || ''
  const prenom = nom.split(' ')[0] || nom
  const role = p.surtitre && p.surtitre.startsWith(nom) ? p.surtitre.slice(nom.length).replace(/^[\s,]+/, '') : (p.surtitre || '')
  const desc = p.description_seo || p.accroche || ''
  const image = p.share_image_url || `${SITE}/logo-square.png`
  const echanges = Array.isArray(p.echanges) ? p.echanges.filter((e) => e && (e.question || e.reponse)) : []
  const mots = echanges.reduce((n, e) => n + String(e.reponse || '').split(/\s+/).length, 0) + String(p.chapo || '').split(/\s+/).length
  const lecture = Math.max(2, Math.round(mots / 230))
  const pubIso = (d.published_at || new Date().toISOString()).slice(0, 10)
  const f = p.fiche || {}
  const portrait = p.portrait_url
  const exergues = Array.isArray(p.exergues) ? p.exergues : []
  const reperes = (Array.isArray(p.reperes) ? p.reperes : []).filter((r) => r && r.date && r.texte).slice(0, 6)
  const recherche = (p.recherche || []).filter(Boolean)
  const siteNu = f.site ? String(f.site).replace(/^https?:\/\//, '').replace(/\/$/, '') : ''
  const siteUrl = f.site ? (/^https?:/.test(f.site) ? f.site : `https://${f.site}`) : ''

  const faits = [
    f.entreprise ? esc(f.entreprise) : '',
    f.lieu ? esc(f.lieu) : '',
    f.depuis ? `À son compte depuis ${esc(f.depuis)}` : '',
  ].filter(Boolean).map((t) => `<li>${t}</li>`).join('') + (p.membre_haloways ? '<li class="g">Membre Haloways</li>' : '')

  const mini = portrait ? `<img src="${esc(portrait)}" alt="" loading="lazy">` : `<i>${esc(initiales(nom))}</i>`
  const blocs = echanges.map((e, i) => {
    const n = i + 1
    const pulls = exergues.filter((x) => Number(x.apres_echange) === n && x.texte)
      .map((x) => `<blockquote class="pull"><p>« ${esc(x.texte)} »</p><cite>${esc(nom)}</cite></blockquote>`).join('')
    return `<section class="ex" id="q${n}">
<div class="q"><img class="av" src="${esc(HOTE.photo)}" alt="${esc(HOTE.nom)}" loading="lazy"><h2>${esc(e.question)}</h2></div>
<div class="a"><p class="de">${mini}${esc(prenom)}</p>${paragraphes(e.reponse)}</div>
</section>${pulls}`
  }).join('')

  const ld = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: p.titre, alternativeHeadline: p.surtitre, description: desc, inLanguage: 'fr-FR',
    datePublished: pubIso, dateModified: pubIso, mainEntityOfPage: url, url,
    image: [image, portrait].filter(Boolean), wordCount: mots, articleSection: 'Interviews',
    author: { '@type': 'Person', name: HOTE.nom },
    publisher: { '@type': 'Organization', name: 'Haloways', url: `${SITE}/`, logo: { '@type': 'ImageObject', url: `${SITE}/logo-square.png` } },
    about: { '@type': 'Person', name: nom, jobTitle: role || undefined, ...(f.entreprise ? { worksFor: { '@type': 'Organization', name: f.entreprise, ...(siteUrl ? { url: siteUrl } : {}) } } : {}), sameAs: [siteUrl, f.linkedin].filter(Boolean) },
  }

  const pont = p.membre_haloways
    ? `<b>${esc(prenom)} est membre d'Haloways.</b> Chaque semaine, le club lui présente un entrepreneur choisi pour son activité, en visio. Vous pouvez en être aussi.`
    : `<b>Cette interview est produite par Haloways.</b> Chaque semaine, le club présente à chacun de ses membres un entrepreneur choisi pour son activité, en visio.`

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(`${p.titre} · ${nom}, interview Haloways`)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="${url}">
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
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&display=swap" rel="stylesheet">
<style>${CSS}</style>
<script>document.documentElement.className='js'</script>
${PIXEL_CHATGPT}
${POSTHOG}
</head>
<body>
<div class="prog" id="prog" aria-hidden="true"></div>
<header class="top"><a class="logo" href="/" aria-label="Haloways, accueil">HALOWAYS</a>
<nav aria-label="Navigation principale"><a class="nl" href="/#tarif">Tarif</a><a class="nl" href="https://one.haloways.com/login">Se connecter</a>
<a class="btn sm" href="https://one.haloways.com/signup" data-cta="interview_haut">Commencer 14 jours gratuits</a></nav></header>
<main>
<article>
<header class="hero">
<div>
<p class="k"><b>Interview</b><span>${esc(p.date_label || '')}</span><span>${lecture} min de lecture</span></p>
<h1><i>«&nbsp;</i>${esc(p.titre)}<i>&nbsp;»</i></h1>
<div class="qui"><span class="ph">${portrait ? `<img src="${esc(portrait)}" alt="Portrait de ${esc(nom)}">` : esc(initiales(nom))}</span>
<div><b>${esc(nom)}${f.linkedin ? `<a href="${esc(f.linkedin)}" target="_blank" rel="noopener" aria-label="Profil LinkedIn de ${esc(nom)}">${LOGO_LINKEDIN}</a>` : ''}</b><span>${esc(role)}</span></div></div>
${p.chapo ? `<p class="chapo">${esc(p.chapo)}</p>` : ''}
${faits ? `<ul class="faits" aria-label="En bref">${faits}</ul>` : ''}
</div>
<div class="portrait" aria-hidden="true">${portrait ? `<img src="${esc(portrait)}" alt="">` : `<span class="ini">${esc(initiales(nom))}</span>`}</div>
</header>
${reperes.length >= 3 ? `<section class="parcours" aria-labelledby="parcours-t">
<h2 id="parcours-t">Son parcours en ${reperes.length} dates</h2>
<ol>${reperes.map((r) => `<li><b>${esc(r.date)}</b><span>${esc(r.texte)}</span></li>`).join('')}</ol>
</section>` : ''}
<div class="conv">
<nav class="rail" aria-label="Les questions"><p class="kk">Les questions</p>
<ol>${echanges.map((e, i) => `<li><a href="#q${i + 1}">${esc(court(e.question, 58))}</a></li>`).join('')}</ol></nav>
<div>
<p class="kk">La conversation, menée par ${esc(HOTE.nom)}</p>
<p class="conv-t">${esc(p.accroche || `${prenom} raconte son parcours, ses rencontres et ce qu'il cherche aujourd'hui.`)}</p>
${blocs}
<p class="credits">Propos recueillis par ${esc(HOTE.nom)}. Production : Nicolas De Monte.</p>
</div>
</div>
</article>
</main>
<section class="fin" aria-labelledby="fin-t"><div class="fin-in">
<div>
${recherche.length ? `<h2 id="fin-t">Ce que ${esc(prenom)} <em>recherche</em></h2>
<ol class="cherche">${recherche.map((r) => `<li>${esc(r)}</li>`).join('')}</ol>` : `<h2 id="fin-t">Pour joindre <em>${esc(prenom)}</em></h2>`}
<div class="acts">${f.linkedin ? `<a class="btn clair" href="${esc(f.linkedin)}" target="_blank" rel="noopener" data-cta="interview_linkedin">${LOGO_LINKEDIN}Écrire à ${esc(prenom)}</a>` : ''}${siteUrl ? `<a class="btn clair" href="${esc(siteUrl)}" target="_blank" rel="noopener">${esc(f.entreprise || siteNu)} ↗</a>` : ''}</div>
</div>
<aside class="pont" aria-label="Haloways">
<button class="film" id="film" type="button" style="background-image:url(/video/haloways-affiche.jpg)" aria-label="Voir la présentation d'Haloways, 1 minute 30"><span class="rond"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg></span><span class="lib">Haloways en 1 min 30</span></button>
<p>${pont}</p>
<small>14 jours gratuits, puis dès 33 € par mois, sans engagement.</small>
<a class="btn" href="https://one.haloways.com/signup" data-cta="interview_fin">Commencer 14 jours gratuits</a>
</aside>
</div></section>
<div class="voile" id="voile" role="dialog" aria-modal="true" aria-label="Présentation d'Haloways"><button type="button" aria-label="Fermer la vidéo">×</button>
<video playsinline controls preload="none"><source data-src="/video/haloways-v4-720.mp4" type="video/mp4" media="(max-width: 820px)"><source data-src="/video/haloways-v4-1080.mp4" type="video/mp4"></video></div>
<footer class="foot"><span class="flogo">HALOWAYS</span>
<nav aria-label="Liens du site"><a href="/">Accueil</a><a href="mailto:nicolas@haloways.com">Contact</a><a href="/terms">Conditions d'utilisation</a><a href="/privacy">Confidentialité</a><a href="/mentions-legales">Mentions légales</a></nav>
<small>© 2026 Haloways</small></footer>
<script>
(function(){
  var slug=${JSON.stringify(slug)};
  function ev(n,p){try{window.posthog&&posthog.capture(n,Object.assign({page:'interview',version:2,slug:slug},p||{}))}catch(e){}}
  /* Au défilement : la barre de lecture avance, la bulle de la question en vue
     arrive, le sommaire suit la question en cours. Tout part de l'événement
     de défilement (et non d'un observateur) : une bulle ne peut pas rester
     invisible parce qu'un rappel ne s'est pas déclenché. */
  var prog=document.getElementById('prog'), art=document.querySelector('article');
  var exs=[].slice.call(document.querySelectorAll('.ex')), liens=[].slice.call(document.querySelectorAll('.rail a')), prevu=false;
  function suivre(){
    prevu=false;
    var r=art.getBoundingClientRect(), h=r.height-innerHeight, vh=innerHeight, courant=-1;
    prog.style.transform='scaleX('+(h>0?Math.max(0,Math.min(1,-r.top/h)):0)+')';
    for(var i=0;i<exs.length;i++){
      var t=exs[i].getBoundingClientRect().top;
      if(t<vh*0.94) exs[i].classList.add('vu');
      if(t<vh*0.42) courant=i;
    }
    for(var k=0;k<liens.length;k++){ if(k===courant) liens[k].setAttribute('aria-current','true'); else liens[k].removeAttribute('aria-current') }
  }
  function demander(){ if(!prevu){ prevu=true; (window.requestAnimationFrame||setTimeout)(suivre) } }
  addEventListener('scroll',demander,{passive:true}); addEventListener('resize',demander); suivre();
  /* Filet de sécurité : après 4 secondes sans défilement, tout est affiché. */
  setTimeout(function(){ if(scrollY<10) return; exs.forEach(function(x){ if(x.getBoundingClientRect().top<innerHeight) x.classList.add('vu') }) },4000);
  /* La vidéo ne se charge qu'au clic, et s'ouvre par-dessus la page. */
  var voile=document.getElementById('voile'), v=voile.querySelector('video'), charge=false, jalons={};
  function ouvrir(){ if(!charge){charge=true;[].forEach.call(v.querySelectorAll('source'),function(s){s.src=s.getAttribute('data-src')});v.load()}
    voile.classList.add('ouvert');var p=v.play();if(p&&p.catch)p.catch(function(){});ev('landing_video_play',{mode:'son'}) }
  function fermer(){voile.classList.remove('ouvert');v.pause()}
  document.getElementById('film').addEventListener('click',ouvrir);
  voile.querySelector('button').addEventListener('click',fermer);
  voile.addEventListener('click',function(e){if(e.target===voile)fermer()});
  addEventListener('keydown',function(e){if(e.key==='Escape')fermer()});
  v.addEventListener('timeupdate',function(){if(!v.duration)return;var q=Math.floor(v.currentTime/v.duration*4)*25;if(q>0&&q<100&&!jalons[q]){jalons[q]=1;ev('landing_video_progress',{pct:q})}});
  v.addEventListener('ended',function(){ev('landing_video_progress',{pct:100})});
})();
</script>
</body></html>`
}
