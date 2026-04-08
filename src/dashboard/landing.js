const LOGO_URL = '/assets/images/logo.png?v=4';

const FAVICON_LINK = `<link rel="icon" type="image/png" href="${LOGO_URL}">`;

function getLandingHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SharkQuant™ — Know the Bias in 10 Seconds</title>
<meta name="description" content="SharkQuant™ models market structure, positioning, and pressure — then translates it into clear bias, key levels, and defined risk for options traders.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://sharkquant.ai">
<meta property="og:title" content="SharkQuant™ — Know the Bias in 10 Seconds">
<meta property="og:description" content="Market structure, positioning, and pressure — translated into clear bias, key levels, and defined risk.">
<meta property="og:image" content="https://sharkquant.ai/assets/images/logo.png?v=4">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="SharkQuant™ — Know the Bias in 10 Seconds">
<meta name="twitter:description" content="Market structure, positioning, and pressure — translated into clear bias, key levels, and defined risk.">
<meta name="twitter:image" content="https://sharkquant.ai/assets/images/logo.png?v=4">
${FAVICON_LINK}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<style>
:root{
  --bg:#000000;
  --bg-surface:#0A0A0F;
  --bg-card:#0D0D14;
  --bg-elevated:#111118;
  --border:#1A1A25;
  --border-hover:#2A2A3A;
  --text:#F0F0F5;
  --text-secondary:#8888A0;
  --text-muted:#55556A;
  --accent:#3B82F6;
  --accent-bright:#60A5FA;
  --accent-dim:rgba(59,130,246,0.15);
  --gradient-start:#3B82F6;
  --gradient-mid:#6366F1;
  --gradient-end:#818CF8;
  --green:#22C55E;
  --red:#EF4444;
  --yellow:#EAB308;
  --font-heading:'DM Sans',system-ui,sans-serif;
  --font-body:'Inter',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
}
html.light{
  --bg:#FFFFFF;
  --bg-surface:#FAFAFA;
  --bg-card:#F5F5F8;
  --bg-elevated:#FFFFFF;
  --border:#E5E5EA;
  --border-hover:#D0D0DA;
  --text:#0A0A0F;
  --text-secondary:#555570;
  --text-muted:#8888A0;
  --accent:#2563EB;
  --accent-bright:#3B82F6;
  --accent-dim:rgba(37,99,235,0.08);
  --gradient-start:#2563EB;
  --gradient-mid:#4F46E5;
  --gradient-end:#6366F1;
  --green:#16A34A;
  --red:#DC2626;
  --yellow:#CA8A04;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.skip-link{position:absolute;top:-100%;left:16px;z-index:9999;padding:8px 16px;background:var(--accent);color:#fff;font-family:var(--font-body);font-size:13px;border-radius:6px;text-decoration:none;transition:top .2s}
.skip-link:focus{top:16px}
*:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
html{scroll-behavior:smooth}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}}
body{background:var(--bg);color:var(--text-secondary);font-family:var(--font-body);overflow-x:hidden;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:var(--font-heading);color:var(--text)}
a{color:var(--accent-bright);text-decoration:none;transition:color .15s}
a:hover{color:var(--text)}

/* ===== ANIMATIONS ===== */
@keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
@keyframes float1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,-15px) scale(1.03)}}
@keyframes float2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-15px,20px) scale(0.97)}}
@keyframes scanLine{0%{top:-2px;opacity:0}10%{opacity:0.7}90%{opacity:0.7}100%{top:calc(100% - 2px);opacity:0}}
@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 30px rgba(59,130,246,0.2),0 0 60px rgba(59,130,246,0.05)}50%{box-shadow:0 0 40px rgba(59,130,246,0.35),0 0 80px rgba(59,130,246,0.1)}}
@keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.6}}
.live-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green);margin-right:6px;animation:livePulse 2s ease-in-out infinite}

/* ===== SCROLL REVEAL ===== */
.rv{opacity:0;transform:translateY(28px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}
.rv.visible{opacity:1;transform:translateY(0)}
.rv .st{opacity:0;transform:translateY(20px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1)}
.rv.visible .st{opacity:1;transform:translateY(0)}

/* ===== NAV ===== */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:rgba(0,0,0,0.7);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--border)}
html.light .nav{background:rgba(255,255,255,0.8)}
.nav-left{display:flex;align-items:center;gap:10px}
.nav-left img{width:28px;height:28px;border-radius:4px}
.nav-brand{font-family:var(--font-heading);font-size:16px;font-weight:700;letter-spacing:-0.02em;color:var(--text)}
.nav-right{display:flex;align-items:center;gap:12px}
.nav-link{font-size:13px;font-weight:500;padding:7px 18px;color:var(--text-secondary);border:1px solid var(--border);border-radius:8px;transition:all .15s}
.nav-link:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}
.nav-cta{font-size:13px;font-weight:600;padding:7px 18px;border:none;border-radius:8px;background:var(--accent);color:#fff;cursor:pointer;transition:all .15s}
.nav-cta:hover{background:var(--accent-bright)}
.theme-toggle{background:none;border:1px solid var(--border);border-radius:8px;padding:6px 8px;cursor:pointer;color:var(--text-muted);display:flex;align-items:center;justify-content:center;transition:all .15s}
.theme-toggle:hover{border-color:var(--accent);color:var(--accent)}

/* ===== HERO — Centered, massive, CheddarFlow-inspired ===== */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:96px 24px 48px;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;pointer-events:none;z-index:0}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px);background-size:64px 64px;pointer-events:none;mask-image:radial-gradient(ellipse 70% 60% at 50% 50%,black 20%,transparent 80%);-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 50%,black 20%,transparent 80%)}
html.light .hero-grid{background-image:linear-gradient(rgba(37,99,235,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.05) 1px,transparent 1px)}
.hero-glow{position:absolute;width:900px;height:900px;border-radius:50%;filter:blur(120px);opacity:0.3;top:50%;left:50%;transform:translate(-50%,-55%);background:radial-gradient(circle,var(--gradient-start),var(--gradient-mid),transparent 70%)}
.hero-vignette{position:absolute;inset:0;background:radial-gradient(ellipse 80% 70% at 50% 40%,transparent 30%,var(--bg) 100%);pointer-events:none}
html.light .hero-glow{opacity:0.12}
.hero-orb1{position:absolute;width:400px;height:400px;border-radius:50%;filter:blur(80px);opacity:0.12;top:15%;right:10%;background:var(--gradient-end);animation:float1 20s ease-in-out infinite}
.hero-orb2{position:absolute;width:350px;height:350px;border-radius:50%;filter:blur(80px);opacity:0.1;bottom:10%;left:5%;background:var(--gradient-start);animation:float2 25s ease-in-out infinite}
.hero-content{position:relative;z-index:1;max-width:1000px}
.hero-logo{width:64px;height:64px;border-radius:14px;margin-bottom:24px;opacity:0;animation:fadeUp .6s cubic-bezier(.16,1,.3,1) .1s forwards}
.hero h1{font-size:clamp(52px,9vw,100px);font-weight:800;letter-spacing:-0.04em;line-height:1.0;margin-bottom:20px;opacity:0;animation:fadeUp .7s cubic-bezier(.16,1,.3,1) .25s forwards;background:linear-gradient(135deg,var(--gradient-start) 0%,var(--gradient-mid) 40%,var(--gradient-end) 70%,var(--accent-bright) 100%);background-size:300% 300%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:fadeUp .7s cubic-bezier(.16,1,.3,1) .25s forwards,gradientShift 6s ease infinite 1.2s}
.hero-sub{font-size:clamp(16px,2vw,20px);color:var(--text-secondary);line-height:1.6;max-width:560px;margin:0 auto 32px;opacity:0;animation:fadeUp .7s cubic-bezier(.16,1,.3,1) .45s forwards}
.hero-ctas{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;opacity:0;animation:fadeUp .7s cubic-bezier(.16,1,.3,1) .6s forwards}

/* Primary CTA — big, glowing */
.btn-primary{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-body);font-size:16px;font-weight:600;padding:16px 40px;border:none;color:#fff;border-radius:10px;background:var(--accent);cursor:pointer;transition:all .2s;text-decoration:none;position:relative;overflow:hidden;box-shadow:0 0 30px rgba(59,130,246,0.3),0 4px 20px rgba(59,130,246,0.2)}
.btn-primary::after{content:'';position:absolute;top:0;left:0;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);animation:shimmer 3s ease-in-out infinite}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 50px rgba(59,130,246,0.4),0 8px 32px rgba(59,130,246,0.3);color:#fff}
.btn-secondary{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-body);font-size:15px;font-weight:500;padding:16px 32px;border:1px solid var(--border);color:var(--text-secondary);border-radius:10px;background:transparent;cursor:pointer;transition:all .2s;text-decoration:none}
.btn-secondary:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}

/* Social proof */
.hero-urgency{font-family:var(--font-mono);font-size:13px;color:var(--text-muted);letter-spacing:0.03em;margin-top:24px;opacity:0;animation:fadeUp .6s cubic-bezier(.16,1,.3,1) .8s forwards}

/* ===== TRUST STRIP ===== */
.trust-strip{padding:48px 24px;text-align:center;border-bottom:1px solid var(--border)}
.trust-strip .container{max-width:900px;margin:0 auto}
.trust-strip-headline{font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-bottom:24px}
.trust-logos{display:flex;align-items:center;justify-content:center;gap:36px;flex-wrap:wrap;margin-bottom:20px}
.trust-item{display:flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:13px;color:var(--text-secondary)}
.trust-item .trust-icon{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;border:1px solid var(--border)}
.trust-tagline{font-size:14px;color:var(--text-muted);margin-top:16px;font-style:italic}

/* ===== PRODUCT FEATURE ROWS (alternating) ===== */
.product-row{display:grid;grid-template-columns:1fr 1.15fr;gap:64px;align-items:center;padding:100px 0;position:relative}
.product-row+.product-row{border-top:1px solid var(--border)}
.product-row.flip{grid-template-columns:1.15fr 1fr}
.product-row.flip .product-text{order:2}
.product-row.flip .product-visual{order:1}
.product-tag{font-family:var(--font-mono);font-size:11px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.product-tag::before{content:'';width:24px;height:1px;background:var(--accent)}
.product-text h3{font-size:clamp(30px,4vw,46px);font-weight:800;letter-spacing:-0.035em;margin-bottom:20px;line-height:1.1}
.product-text p{font-size:17px;color:var(--text-secondary);line-height:1.65;max-width:440px}
.product-outcome{display:inline-flex;align-items:center;gap:6px;margin-top:20px;font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--accent-bright);padding:6px 14px;background:var(--accent-dim);border:1px solid rgba(59,130,246,0.2);border-radius:6px}
.product-visual{position:relative;border-radius:16px;overflow:hidden;border:1px solid var(--border);background:var(--bg-card);box-shadow:0 24px 80px rgba(0,0,0,0.5),0 0 60px rgba(59,130,246,0.06)}
.product-visual::before{content:'';position:absolute;inset:-1px;border-radius:17px;padding:1px;background:linear-gradient(135deg,rgba(59,130,246,0.2),transparent 40%,transparent 60%,rgba(99,102,241,0.15));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:3}
.product-visual .scan{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);z-index:2;animation:scanLine 3s ease-in-out infinite;opacity:0.5;pointer-events:none}
.product-glow{position:absolute;width:300px;height:300px;border-radius:50%;filter:blur(100px);opacity:0.08;pointer-events:none;z-index:0}
.product-row:nth-child(odd) .product-glow{right:-80px;top:20%;background:var(--gradient-start)}
.product-row:nth-child(even) .product-glow{left:-80px;bottom:10%;background:var(--gradient-end)}
@media(max-width:768px){
  .product-row,.product-row.flip{grid-template-columns:1fr;gap:36px}
  .product-row.flip .product-text{order:1}
  .product-row.flip .product-visual{order:2}
}

/* ===== SECTION LAYOUT ===== */
.section{padding:100px 24px}
.container{max-width:1100px;margin:0 auto}
.section-label{font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:0.08em;text-align:center;margin-bottom:12px}
.section-title{text-align:center;font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-0.03em;margin-bottom:16px}
.section-sub{text-align:center;font-size:16px;color:var(--text-secondary);margin-bottom:56px;max-width:560px;margin-left:auto;margin-right:auto;line-height:1.6}

/* ===== LIVE HERO PREVIEW ===== */
.hero-mockup{margin-top:48px;opacity:0;animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .9s forwards;position:relative;z-index:1;width:100%;max-width:920px}
.live-panel{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.6),0 0 60px rgba(59,130,246,0.1),0 0 120px rgba(59,130,246,0.04);position:relative}
.live-panel .scan{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);z-index:2;animation:scanLine 3s ease-in-out infinite;opacity:0.5;pointer-events:none}
.live-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--border);background:var(--bg-elevated)}
.live-header-left{display:flex;align-items:center;gap:12px;font-family:var(--font-mono);font-size:13px}
.live-ticker{font-weight:700;color:var(--text);font-size:15px}
.live-spot{color:var(--text-secondary);font-weight:500}
.live-spot-change{font-size:11px;font-weight:600;margin-left:4px}
.live-header-right{display:flex;align-items:center;gap:8px}
.live-status{display:flex;align-items:center;gap:5px;font-family:var(--font-mono);font-size:10px;color:var(--text-muted);letter-spacing:0.04em}
.live-bias-badge{font-family:var(--font-mono);font-size:11px;font-weight:700;padding:4px 10px;border-radius:5px;letter-spacing:0.04em;transition:all .5s ease}
.live-bias-badge.bullish{background:rgba(34,197,94,0.12);color:var(--green);border:1px solid rgba(34,197,94,0.25)}
.live-bias-badge.bearish{background:rgba(239,68,68,0.12);color:var(--red);border:1px solid rgba(239,68,68,0.25)}
.live-bias-badge.neutral{background:rgba(234,179,8,0.12);color:var(--yellow);border:1px solid rgba(234,179,8,0.25)}
.live-body{display:grid;grid-template-columns:1fr 1fr;gap:0;min-height:240px}
.live-col{padding:16px 20px}
.live-col:first-child{border-right:1px solid var(--border)}
.live-col-title{font-family:var(--font-mono);font-size:9px;font-weight:600;color:var(--text-muted);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px}
.live-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)}
.live-row:last-child{border-bottom:none}
.live-label{font-family:var(--font-mono);font-size:11px;color:var(--text-muted)}
.live-val{font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--text);transition:all .4s ease}
.live-val.green{color:var(--green)}
.live-val.red{color:var(--red)}
.live-val.yellow{color:var(--yellow)}
.live-pressure{margin-top:14px}
.live-pressure-bar{width:100%;height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-top:6px}
.live-pressure-fill{height:100%;border-radius:3px;transition:width .8s ease,background .5s ease}
.live-invalidation{margin-top:14px;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:8px;font-family:var(--font-mono);font-size:10px;color:var(--text-muted);line-height:1.6}
.live-invalidation strong{color:var(--text);font-weight:600}
.live-footer{display:flex;justify-content:space-between;align-items:center;padding:10px 20px;border-top:1px solid var(--border);font-family:var(--font-mono);font-size:10px;color:var(--text-muted)}
.live-footer-ts{opacity:0.6}
@keyframes flashGreen{0%{background:rgba(34,197,94,0.15)}100%{background:transparent}}
@keyframes flashRed{0%{background:rgba(239,68,68,0.15)}100%{background:transparent}}
.flash-green{animation:flashGreen .6s ease}
.flash-red{animation:flashRed .6s ease}

/* ===== METRICS STRIP ===== */
.metrics{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.metric{padding:28px 24px;text-align:center;border-right:1px solid var(--border)}
.metric:last-child{border-right:none}
.metric-num{font-family:var(--font-mono);font-size:clamp(24px,3.5vw,36px);font-weight:700;color:var(--text)}
.metric-label{font-size:11px;color:var(--text-muted);margin-top:6px;text-transform:uppercase;letter-spacing:0.06em}

/* ===== SHOWCASE CARDS — large, dramatic ===== */
.showcase-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.showcase-card{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:0;overflow:hidden;transition:all .35s cubic-bezier(.16,1,.3,1);position:relative;cursor:default}
.showcase-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end));opacity:0;transition:opacity .35s}
.showcase-card::after{content:'';position:absolute;inset:0;border-radius:16px;opacity:0;transition:opacity .35s;pointer-events:none;background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%),rgba(59,130,246,0.04),transparent 40%)}
.showcase-card:hover{border-color:var(--border-hover);transform:translateY(-4px);box-shadow:0 20px 50px rgba(0,0,0,0.25)}
.showcase-card:hover::before{opacity:1}
.showcase-card:hover::after{opacity:1}
.showcase-body{padding:28px}
.showcase-title{font-size:17px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;gap:8px}
.showcase-caption{font-size:13px;color:var(--text-muted);margin-top:18px;line-height:1.5;padding-top:14px;border-top:1px solid var(--border)}

/* Mock internals */
.smock{font-family:var(--font-mono);font-size:11px;background:var(--bg-surface);border:1px solid var(--border);border-radius:10px;overflow:hidden}
.smock-bar{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--border);background:var(--bg-elevated)}
.smock-body{padding:12px 14px}
.smock-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border)}
.smock-row:last-child{border-bottom:none}
.smock-label{color:var(--text-muted);font-size:11px}
.smock-val{color:var(--text);font-size:11px;font-weight:600}
.smock-val.neg{color:var(--red)}
.smock-val.warn{color:var(--yellow)}
.smock-val.pos{color:var(--green)}
.badge{font-size:9px;font-weight:700;padding:3px 7px;border-radius:4px;letter-spacing:0.04em}
.badge.red{background:rgba(239,68,68,0.12);color:var(--red);border:1px solid rgba(239,68,68,0.2)}
.badge.green{background:rgba(34,197,94,0.12);color:var(--green);border:1px solid rgba(34,197,94,0.2)}
.badge.yellow{background:rgba(234,179,8,0.12);color:var(--yellow);border:1px solid rgba(234,179,8,0.2)}
.badge.blue{background:rgba(59,130,246,0.12);color:var(--accent);border:1px solid rgba(59,130,246,0.2)}

/* Mini heatmap */
.mini-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-bottom:10px}
.mini-cell{height:24px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:rgba(255,255,255,0.55)}
.mini-badges{display:flex;gap:6px;flex-wrap:wrap}

/* Flow lines */
.flow-line{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:11px;border-bottom:1px solid var(--border)}
.flow-line:last-child{border-bottom:none}
.flow-type{font-weight:700;font-size:9px;padding:2px 6px;border-radius:3px;letter-spacing:0.03em}
.flow-type.sweep{background:rgba(234,179,8,0.15);color:var(--yellow)}
.flow-type.block{background:rgba(59,130,246,0.15);color:var(--accent)}
.flow-ticker{color:var(--text);font-weight:600}
.flow-detail{color:var(--text-muted);flex:1}
.flow-dot{width:6px;height:6px;border-radius:50%;display:inline-block}
.flow-dot.bear{background:var(--red)}
.flow-dot.bull{background:var(--green)}

/* Confidence bars */
.conf-row{display:flex;align-items:center;gap:10px;padding:6px 0}
.conf-label{font-size:10px;color:var(--text-muted);min-width:90px}
.conf-bar{flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden}
.conf-fill{height:100%;border-radius:3px}
.conf-pct{font-size:10px;font-weight:600;min-width:32px;text-align:right}

/* ===== STEPS ===== */
.steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.step-card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:28px 22px;transition:all .3s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;cursor:default}
.step-card::after{content:'';position:absolute;inset:0;border-radius:14px;opacity:0;transition:opacity .3s;pointer-events:none;background:radial-gradient(350px circle at var(--mx,50%) var(--my,50%),rgba(59,130,246,0.04),transparent 40%)}
.step-card:hover{border-color:var(--border-hover);transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,0,0,0.2)}
.step-card:hover::after{opacity:1}
.step-num{font-family:var(--font-mono);font-size:11px;color:var(--accent);margin-bottom:14px;text-transform:uppercase;font-weight:600}
.step-card h3{font-size:15px;font-weight:700;margin-bottom:12px}
.step-card p{font-size:12px;color:var(--text-secondary);line-height:1.6}
.step-visual{margin-bottom:14px;font-family:var(--font-mono);font-size:10px}
.regime-bar{display:flex;gap:2px;height:8px;border-radius:4px;overflow:hidden}
.regime-seg{flex:1;border-radius:2px}
.gauge{position:relative;height:8px;background:var(--border);border-radius:4px;margin-bottom:6px}
.gauge-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--green),var(--yellow),var(--red))}
.gauge-mark{position:absolute;top:-3px;width:3px;height:14px;background:var(--text);border-radius:2px}
.gauge-lbl{font-size:10px;color:var(--yellow);font-weight:600}
.checklist{list-style:none;padding:0}
.checklist li{font-size:10px;padding:3px 0;display:flex;align-items:center;gap:6px}
.checklist .ok{color:var(--green)}
.checklist .no{color:var(--red)}
.checklist .wait{font-weight:700;color:var(--yellow);margin-left:auto}
.risk-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.risk-item{font-size:9px;color:var(--text-secondary);padding:5px 7px;background:var(--bg-surface);border-radius:5px;border:1px solid var(--border)}
.risk-item span{color:var(--text);font-weight:600;display:block;font-size:10px}

/* ===== POSITIONING ===== */
.positioning{text-align:center;padding:64px 24px;position:relative}
.positioning::before,.positioning::after{content:'';position:absolute;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,var(--accent),var(--gradient-end),var(--accent),transparent)}
.positioning::before{top:0}
.positioning::after{bottom:0}
.positioning p{font-family:var(--font-heading);font-size:clamp(24px,3.5vw,40px);font-weight:800;color:var(--text);line-height:1.5;max-width:700px;margin:0 auto;letter-spacing:-0.02em}
.positioning p span{color:var(--text-muted)}

/* ===== AUDIENCE ===== */
.audience-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.audience-card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:28px 22px;transition:all .3s cubic-bezier(.16,1,.3,1);cursor:default;position:relative;overflow:hidden}
.audience-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end));opacity:0;transition:opacity .3s}
.audience-card:hover{border-color:var(--border-hover);transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,0,0,0.2)}
.audience-card:hover::before{opacity:1}
.audience-label{font-family:var(--font-mono);font-size:11px;color:var(--accent);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;font-weight:600}
.audience-card h3{font-size:15px;font-weight:700;margin-bottom:8px}
.audience-card p{font-size:13px;line-height:1.5}

/* ===== ENGINE ===== */
.engine-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.engine-card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:28px 24px;transition:all .3s cubic-bezier(.16,1,.3,1);cursor:default}
.engine-card:hover{border-color:var(--border-hover);transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,0,0,0.2)}
.engine-card h4{font-family:var(--font-mono);font-size:12px;color:var(--accent);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;font-weight:600}
.engine-card p{font-size:13px;line-height:1.7}

/* ===== COMPLIANCE ===== */
.compliance-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1000px;margin:0 auto}
.compliance-card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:24px;cursor:default;transition:all .3s}
.compliance-card:hover{border-color:var(--border-hover);transform:translateY(-2px)}
.compliance-card h4{font-family:var(--font-mono);font-size:11px;color:var(--accent);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;font-weight:600}
.compliance-card p{font-size:13px;line-height:1.6}

/* ===== FAQ ===== */
.faq-list{max-width:860px;margin:0 auto}
.faq-item{border-bottom:1px solid var(--border)}
.faq-q{width:100%;background:none;border:none;color:var(--text);font-family:var(--font-body);font-size:15px;font-weight:500;padding:22px 0;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:color .15s}
.faq-q:hover{color:var(--accent)}
.faq-q::after{content:'+';color:var(--accent);font-size:20px;font-weight:400;transition:transform .2s}
.faq-item.open .faq-q::after{transform:rotate(45deg)}
.faq-a{max-height:0;overflow:hidden;transition:max-height .3s ease,padding .3s ease}
.faq-item.open .faq-a{max-height:500px;padding-bottom:20px}
.faq-a p{font-size:14px;line-height:1.7}

/* ===== PRICING ===== */
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1000px;margin:0 auto}
.pricing-card{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:36px;text-align:center;position:relative;transition:all .3s cubic-bezier(.16,1,.3,1);cursor:default}
.pricing-card:hover{border-color:var(--border-hover);transform:translateY(-4px);box-shadow:0 20px 50px rgba(0,0,0,0.25)}
.pricing-card.featured{border-color:var(--accent);animation:pulseGlow 3s ease-in-out infinite}
.pricing-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--gradient-start),var(--gradient-end));color:#fff;font-family:var(--font-mono);font-size:10px;font-weight:700;padding:5px 16px;border-radius:20px;letter-spacing:0.04em;white-space:nowrap;box-shadow:0 4px 20px rgba(59,130,246,0.3)}
.pricing-name{font-size:20px;font-weight:700;margin-bottom:8px}
.pricing-price{font-family:var(--font-mono);font-size:clamp(30px,4vw,40px);font-weight:700;color:var(--text);margin-bottom:6px}
.pricing-price span{font-size:14px;color:var(--text-muted);font-weight:400}
.pricing-price .strike{text-decoration:line-through;color:var(--text-muted);font-size:22px;margin-right:8px;font-weight:400}
.pricing-desc{font-size:13px;color:var(--text-muted);margin-bottom:28px;line-height:1.5}
.pricing-features{list-style:none;padding:0;margin:0 0 28px;text-align:left}
.pricing-features li{font-size:13px;padding:8px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px}
.pricing-features li:last-child{border-bottom:none}
.pricing-features li::before{content:'\\2713';color:var(--accent);font-weight:700;font-size:12px}
.pricing-btn{display:block;font-family:var(--font-body);font-size:14px;font-weight:600;padding:14px;border:none;color:#fff;border-radius:10px;background:var(--accent);cursor:pointer;text-decoration:none;transition:all .2s;text-align:center;position:relative;overflow:hidden;box-shadow:0 4px 20px rgba(59,130,246,0.2)}
.pricing-btn::after{content:'';position:absolute;top:0;left:0;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);animation:shimmer 3s ease-in-out infinite}
.pricing-btn:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(59,130,246,0.3);color:#fff}
.pricing-btn.sec{background:transparent;border:1px solid var(--border);color:var(--text);box-shadow:none}
.pricing-btn.sec::after{display:none}
.pricing-btn.sec:hover{border-color:var(--accent);color:var(--accent);box-shadow:0 4px 20px rgba(59,130,246,0.1)}
.founders-note{font-size:12px;color:var(--text-muted);margin-top:24px;max-width:480px;margin-left:auto;margin-right:auto;line-height:1.5}

/* ===== FINAL CTA ===== */
.final-cta{text-align:center;padding:100px 24px;position:relative;overflow:hidden}
.final-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(59,130,246,0.06),transparent);pointer-events:none}
.final-cta::after{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,var(--accent),var(--gradient-end),var(--accent),transparent)}
.final-cta h2{font-size:clamp(28px,4.5vw,44px);font-weight:800;letter-spacing:-0.03em;margin-bottom:16px;position:relative}
.final-cta p{font-size:17px;margin-bottom:36px;position:relative}

/* ===== FOOTER ===== */
footer{border-top:1px solid var(--border);padding:36px 24px;text-align:center}
footer img{width:24px;height:24px;margin-bottom:12px;opacity:.4;border-radius:4px}
footer .copy{color:var(--text-muted);font-size:13px;margin-bottom:4px}
footer .disc{font-size:11px;color:var(--text-muted);margin-top:12px;max-width:600px;margin-left:auto;margin-right:auto;line-height:1.6;opacity:.6}

/* ===== ANIMATED HEATMAP PREVIEW ===== */
.hero-heatmap{position:absolute;top:50%;right:-60px;transform:translateY(-50%);width:280px;height:200px;opacity:0.12;pointer-events:none;display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(6,1fr);gap:3px;z-index:0}
.hero-heatmap-cell{border-radius:3px;animation:heatPulse var(--dur) ease-in-out infinite;animation-delay:var(--delay)}
@keyframes heatPulse{0%,100%{background:var(--c1)}50%{background:var(--c2)}}
@media(max-width:1024px){.hero-heatmap{display:none}}

/* ===== ECOSYSTEM SECTION ===== */
.ecosystem{padding:100px 24px;text-align:center}
.ecosystem h2{font-family:var(--font-heading);font-size:clamp(28px,4vw,36px);font-weight:800;letter-spacing:-0.03em;margin-bottom:12px}
.ecosystem .section-sub{color:var(--text-muted);font-size:15px;margin-bottom:48px}
.eco-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;max-width:1100px;margin:0 auto}
.eco-card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:24px 20px;text-align:left;transition:all .3s cubic-bezier(.16,1,.3,1);cursor:default}
.eco-card:hover{border-color:var(--border-hover);transform:translateY(-2px)}
.eco-card-icon{margin-bottom:12px;color:var(--accent)}
.eco-card-name{font-family:var(--font-heading);font-size:15px;font-weight:700;margin-bottom:4px}
.eco-card-desc{font-size:12px;color:var(--text-muted);line-height:1.5;margin-bottom:12px}
.eco-badge{display:inline-block;font-family:var(--font-mono);font-size:9px;font-weight:700;padding:3px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px}
.eco-badge.available{background:rgba(34,197,94,0.15);color:#22c55e}
.eco-badge.coming{background:rgba(234,179,8,0.15);color:#eab308}

/* ===== RESPONSIVE ===== */
@media(max-width:1024px){
  .showcase-grid{grid-template-columns:1fr 1fr}
  .steps-grid{grid-template-columns:repeat(2,1fr)}
  .audience-grid{grid-template-columns:repeat(2,1fr)}
  .engine-grid{grid-template-columns:1fr}
  .metrics{grid-template-columns:repeat(2,1fr)}
  .metric{border-bottom:1px solid var(--border)}
}
@media(max-width:768px){
  .showcase-grid{grid-template-columns:1fr}
  .steps-grid{grid-template-columns:1fr}
  .pricing-grid{grid-template-columns:1fr;max-width:400px}
  .compliance-grid{grid-template-columns:1fr}
  .hero-glow{width:500px;height:500px}
  .live-body{grid-template-columns:1fr}
  .live-col:first-child{border-right:none;border-bottom:1px solid var(--border)}
}
@media (max-width: 768px) {
  .pricing-grid {
    display: flex;
    flex-direction: column;
  }
  .pricing-card.featured {
    order: -1;
  }
}
@media(max-width:640px){
  .nav{padding:14px 20px}
  .nav-cta{padding:6px 12px;font-size:12px}
  .hero{min-height:auto;padding:80px 20px 32px}
  .hero-ctas{flex-direction:column;align-items:center}
  .audience-grid{grid-template-columns:1fr}
  .metrics{grid-template-columns:1fr}
  .metric{border-right:none;border-bottom:1px solid var(--border)}
}
</style>
</head>
<body>

<a href="#main-content" class="skip-link">Skip to content</a>

<nav class="nav" aria-label="Main navigation">
  <div class="nav-left">
    <img src="${LOGO_URL}" alt="SharkQuant" width="28" height="28">
    <span class="nav-brand">SharkQuant&trade;</span>
  </div>
  <div class="nav-right">
    <a href="/auth/login" style="color:var(--accent-bright);font-size:13px;font-weight:500">Sign in</a>
    <a href="/dashboard" class="nav-link">Dashboard</a>
    <a href="#pricing" class="nav-cta">Pricing</a>
    <a href="https://x.com/SharkQuantAI" target="_blank" rel="noopener" class="nav-link" aria-label="Follow us on X" style="display:inline-flex;align-items:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
    <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme"><i data-lucide="sun" style="width:16px;height:16px"></i></button>
  </div>
</nav>

<main id="main-content">

<!-- ===== HERO ===== -->
<section class="hero">
  <div class="hero-bg" aria-hidden="true">
    <div class="hero-grid"></div>
    <div class="hero-glow"></div>
    <div class="hero-vignette"></div>
    <div class="hero-orb1"></div>
    <div class="hero-orb2"></div>
  </div>
  <div class="hero-content">
    <img src="${LOGO_URL}" alt="" class="hero-logo">
    <h1>Where Gamma<br>Moves Price.</h1>
    <p class="hero-sub">Live dealer positioning, gamma walls, and actionable bias &mdash; updated in real time.</p>
    <div class="hero-ctas">
      <a href="#pricing" class="btn-primary">Launch Live Dashboard &rarr;</a>
      <a href="#features" class="btn-secondary">See It In Action</a>
    </div>
    <p class="hero-urgency">Built for active SPY &amp; 0DTE traders.</p>
    <div id="live-gex" style="margin-top:24px;min-height:60px"></div>
  </div>
  <div class="hero-heatmap" aria-hidden="true">
    <div class="hero-heatmap-cell" style="--c1:rgba(139,92,246,0.3);--c2:rgba(34,197,94,0.4);--dur:7s;--delay:0s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.2);--c2:rgba(139,92,246,0.4);--dur:9s;--delay:0.5s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.3);--c2:rgba(59,130,246,0.3);--dur:8s;--delay:1s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(239,68,68,0.2);--c2:rgba(234,179,8,0.3);--dur:10s;--delay:0.3s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.3);--c2:rgba(34,197,94,0.5);--dur:7s;--delay:1.5s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(139,92,246,0.2);--c2:rgba(239,68,68,0.3);--dur:11s;--delay:0.8s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.4);--c2:rgba(139,92,246,0.3);--dur:8s;--delay:2s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.2);--c2:rgba(34,197,94,0.3);--dur:9s;--delay:0.2s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(239,68,68,0.3);--c2:rgba(59,130,246,0.3);--dur:10s;--delay:1.2s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.2);--c2:rgba(239,68,68,0.4);--dur:7s;--delay:0.7s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(139,92,246,0.4);--c2:rgba(34,197,94,0.3);--dur:9s;--delay:1.8s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.3);--c2:rgba(139,92,246,0.2);--dur:8s;--delay:0.4s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.3);--c2:rgba(59,130,246,0.4);--dur:11s;--delay:2.2s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(239,68,68,0.2);--c2:rgba(139,92,246,0.3);--dur:7s;--delay:1.1s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.4);--c2:rgba(34,197,94,0.2);--dur:9s;--delay:0.6s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(139,92,246,0.3);--c2:rgba(239,68,68,0.3);--dur:10s;--delay:1.4s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.2);--c2:rgba(59,130,246,0.5);--dur:8s;--delay:0.9s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(239,68,68,0.3);--c2:rgba(34,197,94,0.3);--dur:7s;--delay:2.5s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.3);--c2:rgba(139,92,246,0.4);--dur:11s;--delay:0.1s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(139,92,246,0.2);--c2:rgba(34,197,94,0.4);--dur:9s;--delay:1.7s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.4);--c2:rgba(239,68,68,0.2);--dur:8s;--delay:0.3s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.2);--c2:rgba(59,130,246,0.5);--dur:10s;--delay:2.1s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(239,68,68,0.4);--c2:rgba(139,92,246,0.2);--dur:7s;--delay:1.3s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(139,92,246,0.3);--c2:rgba(34,197,94,0.3);--dur:9s;--delay:0.5s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.3);--c2:rgba(59,130,246,0.3);--dur:8s;--delay:1.9s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.4);--c2:rgba(239,68,68,0.3);--dur:11s;--delay:0.7s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(239,68,68,0.2);--c2:rgba(34,197,94,0.4);--dur:7s;--delay:2.3s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(139,92,246,0.4);--c2:rgba(59,130,246,0.2);--dur:9s;--delay:1.6s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.2);--c2:rgba(139,92,246,0.5);--dur:10s;--delay:0.2s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.3);--c2:rgba(34,197,94,0.3);--dur:8s;--delay:2.6s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(239,68,68,0.3);--c2:rgba(59,130,246,0.4);--dur:7s;--delay:1s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.4);--c2:rgba(239,68,68,0.2);--dur:9s;--delay:0.4s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(139,92,246,0.2);--c2:rgba(34,197,94,0.3);--dur:11s;--delay:2s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.3);--c2:rgba(139,92,246,0.3);--dur:8s;--delay:0.8s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.3);--c2:rgba(59,130,246,0.4);--dur:7s;--delay:1.5s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(239,68,68,0.2);--c2:rgba(139,92,246,0.4);--dur:10s;--delay:0.6s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.4);--c2:rgba(34,197,94,0.2);--dur:9s;--delay:2.4s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(139,92,246,0.3);--c2:rgba(239,68,68,0.3);--dur:8s;--delay:1.2s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.2);--c2:rgba(59,130,246,0.3);--dur:7s;--delay:0.1s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(239,68,68,0.3);--c2:rgba(34,197,94,0.5);--dur:11s;--delay:1.8s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.2);--c2:rgba(139,92,246,0.3);--dur:9s;--delay:0.9s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(139,92,246,0.4);--c2:rgba(59,130,246,0.3);--dur:8s;--delay:2.7s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.3);--c2:rgba(239,68,68,0.2);--dur:10s;--delay:1.4s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.3);--c2:rgba(34,197,94,0.4);--dur:7s;--delay:0.3s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(239,68,68,0.2);--c2:rgba(59,130,246,0.3);--dur:9s;--delay:2.2s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(139,92,246,0.3);--c2:rgba(34,197,94,0.3);--dur:8s;--delay:0.5s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(34,197,94,0.4);--c2:rgba(139,92,246,0.2);--dur:11s;--delay:1.6s"></div>
    <div class="hero-heatmap-cell" style="--c1:rgba(59,130,246,0.3);--c2:rgba(239,68,68,0.4);--dur:7s;--delay:2.8s"></div>
  </div>
  <div class="hero-mockup" aria-hidden="true">
    <div style="text-align:center;margin-bottom:8px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);letter-spacing:0.04em">Simulated preview &middot; Real data on dashboard</div>
    <div class="live-panel" id="heroLivePanel">
      <div class="scan"></div>
      <div class="live-header">
        <div class="live-header-left">
          <span class="live-ticker">SPY</span>
          <span class="live-spot" id="heroSpot">$589.42</span>
          <span class="live-spot-change" id="heroSpotChange" style="color:var(--green)">+0.18</span>
        </div>
        <div class="live-header-right">
          <div class="live-status"><span class="live-dot"></span> LIVE</div>
          <span class="live-bias-badge neutral" id="heroBias">NEUTRAL</span>
        </div>
      </div>
      <div class="live-body">
        <div class="live-col">
          <div class="live-col-title">Key Levels</div>
          <div class="live-row"><span class="live-label">Call Wall</span><span class="live-val green" id="heroCW">600</span></div>
          <div class="live-row"><span class="live-label">Put Wall</span><span class="live-val red" id="heroPW">580</span></div>
          <div class="live-row"><span class="live-label">Gamma Flip</span><span class="live-val yellow" id="heroFlip">592</span></div>
          <div class="live-row"><span class="live-label">Vol Trigger</span><span class="live-val" id="heroVT">595</span></div>
          <div class="live-row"><span class="live-label">Dealer Regime</span><span class="live-val" id="heroRegime">Long Gamma</span></div>
          <div class="live-pressure">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="live-label">Flow Pressure</span>
              <span class="live-val" id="heroPressurePct" style="font-size:11px">62%</span>
            </div>
            <div class="live-pressure-bar"><div class="live-pressure-fill" id="heroPressureFill" style="width:62%;background:var(--green)"></div></div>
          </div>
        </div>
        <div class="live-col">
          <div class="live-col-title">Signal Summary</div>
          <div class="live-row"><span class="live-label">GEX Net</span><span class="live-val green" id="heroGEX">+2.4B</span></div>
          <div class="live-row"><span class="live-label">DEX Net</span><span class="live-val green" id="heroDEX">+180M</span></div>
          <div class="live-row"><span class="live-label">Put/Call Ratio</span><span class="live-val" id="heroPC">0.82</span></div>
          <div class="live-row"><span class="live-label">IV Rank</span><span class="live-val" id="heroIV">34%</span></div>
          <div class="live-invalidation">
            <strong>Invalidation:</strong> <span id="heroInval">Bias flips bearish below <span id="heroInvalLevel">585</span> if put wall breaks with volume.</span>
          </div>
        </div>
      </div>
      <div class="live-footer">
        <span>Updated <span id="heroTs">0s</span> ago</span>
        <span class="live-footer-ts">Simulated preview &middot; Real data on dashboard</span>
      </div>
    </div>
  </div>
</section>

<!-- METRICS -->
<div class="metrics rv" aria-label="Platform statistics">
  <div class="metric"><div class="metric-num" data-count="4200">0</div><div class="metric-label">Options/min analyzed</div></div>
  <div class="metric"><div class="metric-num" data-count="13">0</div><div class="metric-label">Tickers tracked</div></div>
  <div class="metric"><div class="metric-num" data-count="3">0</div><div class="metric-label">Second updates</div></div>
  <div class="metric"><div class="metric-num" data-count="24" data-text="24/7">0</div><div class="metric-label">Uptime monitoring</div></div>
</div>

<!-- ===== TRUST STRIP ===== -->
<div class="trust-strip rv">
  <div class="container">
    <div class="trust-strip-headline">Trusted by options traders who demand structure</div>
    <div class="trust-logos">
      <div class="trust-item"><span class="trust-icon" style="color:var(--green)">&#10003;</span> Licensed institutional data</div>
      <div class="trust-item"><span class="trust-icon" style="color:var(--accent)">&#9670;</span> Sub-3s real-time updates</div>
      <div class="trust-item"><span class="trust-icon" style="color:var(--yellow)">&#9733;</span> Multi-model AI consensus</div>
      <div class="trust-item"><span class="trust-icon" style="color:var(--red)">&#9632;</span> Built-in risk controls</div>
    </div>
    <p class="trust-tagline">"Build confidence in your thesis &mdash; not confusion from noise."</p>
  </div>
</div>

<!-- ===== PRODUCT FEATURES (alternating rows) ===== -->
<section id="features" class="section">
  <div class="container">
    <p class="section-label rv">Product</p>
    <h2 class="section-title rv">See what smart money sees.</h2>
    <p class="section-sub rv">Real tools. Real data. Real edge &mdash; updated every 3 seconds.</p>

    <!-- Feature 1: SharkGrid — Dealer Positioning -->
    <div class="product-row rv">
      <div class="product-glow" aria-hidden="true"></div>
      <div class="product-text st">
        <div class="product-tag">SharkGrid&trade;</div>
        <h3>See Where Dealers<br>Are Forced to Hedge.</h3>
        <p>Dealers don't choose when to hedge &mdash; they're forced to. See exactly where that pressure builds, so you're positioned before the move happens.</p>
        <div class="product-outcome">&#8594; Know the walls before price hits them</div>
      </div>
      <div class="product-visual st">
        <div class="scan"></div>
        <div class="mockup-bar"><div style="display:flex;align-items:center"><span class="live-dot"></span><span class="mockup-ticker">SPY</span><span class="mockup-price">$689.42</span></div><span class="mockup-regime">FRAGILE &#9679;</span></div>
        <div class="mockup-grid">
          <div class="mockup-strike">700</div><div class="mockup-cell" style="background:rgba(34,197,94,0.5)">12K</div><div class="mockup-cell" style="background:rgba(34,197,94,0.7)">28K</div><div class="mockup-cell" style="background:rgba(34,197,94,0.3)">8K</div><div class="mockup-cell" style="background:rgba(34,197,94,0.4)">15K</div><div class="mockup-cell" style="background:rgba(34,197,94,0.2)">5K</div>
          <div class="mockup-strike">695</div><div class="mockup-cell" style="background:rgba(34,197,94,0.6)">18K</div><div class="mockup-cell" style="background:rgba(34,197,94,0.8)">35K</div><div class="mockup-cell" style="background:rgba(34,197,94,0.4)">11K</div><div class="mockup-cell" style="background:rgba(34,197,94,0.3)">9K</div><div class="mockup-cell" style="background:rgba(34,197,94,0.15)">3K</div>
          <div class="mockup-strike" style="color:var(--yellow)">692 &#9670;</div><div class="mockup-cell" style="background:rgba(234,179,8,0.3)">-2K</div><div class="mockup-cell" style="background:rgba(234,179,8,0.5)">4K</div><div class="mockup-cell" style="background:rgba(239,68,68,0.2)">-5K</div><div class="mockup-cell" style="background:rgba(34,197,94,0.2)">2K</div><div class="mockup-cell" style="background:rgba(239,68,68,0.15)">-1K</div>
          <div class="mockup-strike" style="color:var(--red)">690</div><div class="mockup-cell" style="background:rgba(239,68,68,0.5)">-22K</div><div class="mockup-cell" style="background:rgba(239,68,68,0.7)">-38K</div><div class="mockup-cell" style="background:rgba(239,68,68,0.4)">-15K</div><div class="mockup-cell" style="background:rgba(239,68,68,0.6)">-28K</div><div class="mockup-cell" style="background:rgba(239,68,68,0.3)">-9K</div>
          <div class="mockup-strike" style="color:var(--red)">685</div><div class="mockup-cell" style="background:rgba(239,68,68,0.6)">-31K</div><div class="mockup-cell" style="background:rgba(239,68,68,0.8)">-45K</div><div class="mockup-cell" style="background:rgba(239,68,68,0.5)">-19K</div><div class="mockup-cell" style="background:rgba(239,68,68,0.7)">-33K</div><div class="mockup-cell" style="background:rgba(239,68,68,0.4)">-12K</div>
        </div>
        <div class="mockup-footer"><span>CW: 700</span><span>PW: 690</span><span style="color:var(--yellow)">FLIP: 692</span></div>
      </div>
    </div>

    <!-- Feature 2: SharkProfile — Walls & Flip (flipped) -->
    <div class="product-row flip rv">
      <div class="product-glow" aria-hidden="true"></div>
      <div class="product-text st">
        <div class="product-tag">SharkProfile&trade;</div>
        <h3>Reveal Hidden<br>Support &amp; Resistance.</h3>
        <p>Most traders draw lines on charts. You'll see where $358K of net gamma creates a mechanical floor &mdash; and where a $256K danger zone waits below.</p>
        <div class="product-outcome">&#8594; Trade with structure, not against it</div>
      </div>
      <div class="product-visual st">
        <div class="scan"></div>
        <div style="padding:24px;font-family:var(--font-mono);font-size:11px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><span style="font-size:15px;font-weight:700;color:var(--text)"><span class="live-dot"></span>SPY SharkProfile&trade;</span><span class="badge red">FRAGILE</span></div>
          <div style="margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="color:var(--green);min-width:75px;font-size:10px">Call Wall</span><span style="color:var(--text);font-weight:700;min-width:42px">$700</span><div style="flex:1;height:10px;background:var(--border);border-radius:5px;overflow:hidden"><div style="width:75%;height:100%;background:linear-gradient(90deg,var(--green),rgba(34,197,94,0.5));border-radius:5px"></div></div><span style="color:var(--text-secondary);min-width:65px;text-align:right">+35,721</span></div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="color:var(--yellow);min-width:75px;font-size:10px">Flip Level</span><span style="color:var(--text);font-weight:700;min-width:42px">$692</span><div style="flex:1;height:10px;background:var(--border);border-radius:5px;overflow:hidden"><div style="width:10%;height:100%;background:var(--yellow);border-radius:5px"></div></div><span style="color:var(--text-secondary);min-width:65px;text-align:right">~0</span></div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="color:var(--red);min-width:75px;font-size:10px">Put Wall</span><span style="color:var(--text);font-weight:700;min-width:42px">$690</span><div style="flex:1;height:10px;background:var(--border);border-radius:5px;overflow:hidden"><div style="width:90%;height:100%;background:linear-gradient(90deg,rgba(239,68,68,0.5),var(--red));border-radius:5px"></div></div><span style="color:var(--red);min-width:65px;text-align:right;font-weight:600">-358,447</span></div>
            <div style="display:flex;align-items:center;gap:10px"><span style="color:var(--red);min-width:75px;font-size:10px">Danger Zone</span><span style="color:var(--text);font-weight:700;min-width:42px">$685</span><div style="flex:1;height:10px;background:var(--border);border-radius:5px;overflow:hidden"><div style="width:65%;height:100%;background:linear-gradient(90deg,rgba(239,68,68,0.4),var(--red));border-radius:5px"></div></div><span style="color:var(--red);min-width:65px;text-align:right">-256,720</span></div>
          </div>
          <div style="border-top:1px solid var(--border);padding-top:14px;display:flex;gap:20px;font-size:10px"><span style="color:var(--text-muted)">Spot <span style="color:var(--text);font-weight:600">$689.42</span></span><span style="color:var(--text-muted)">Danger <span style="color:var(--red);font-weight:600">81/100</span></span><span style="color:var(--text-muted)">Convexity <span style="color:var(--yellow);font-weight:600">expanding</span></span></div>
        </div>
      </div>
    </div>

    <!-- Feature 3: SharkSense — Regime Intelligence -->
    <div class="product-row rv">
      <div class="product-glow" aria-hidden="true"></div>
      <div class="product-text st">
        <div class="product-tag">SharkSense&trade;</div>
        <h3>Know the Market<br>State Before You Trade.</h3>
        <p>Is the market pinning, breaking out, or about to collapse? Most traders find out after the move. You'll know in real time &mdash; with confidence scores.</p>
        <div class="product-outcome">&#8594; Never walk into a regime trap again</div>
      </div>
      <div class="product-visual st">
        <div class="scan"></div>
        <div style="padding:24px;font-family:var(--font-mono);font-size:11px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><span style="font-size:15px;font-weight:700;color:var(--text)"><span class="live-dot"></span>Regime Detector</span><span class="badge red" style="font-size:11px;padding:4px 10px">FRAGILE 72%</span></div>
          <div style="margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="min-width:80px;color:var(--text-muted);font-size:10px">Trending</span><div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden"><div style="width:12%;height:100%;background:var(--green);border-radius:4px"></div></div><span style="min-width:28px;text-align:right;color:var(--text-secondary)">12</span></div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="min-width:80px;color:var(--text-muted);font-size:10px">Mean Rev</span><div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden"><div style="width:28%;height:100%;background:var(--accent);border-radius:4px"></div></div><span style="min-width:28px;text-align:right;color:var(--text-secondary)">28</span></div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="min-width:80px;color:var(--yellow);font-size:10px;font-weight:600">Choppy</span><div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden"><div style="width:45%;height:100%;background:linear-gradient(90deg,rgba(234,179,8,0.5),var(--yellow));border-radius:4px"></div></div><span style="min-width:28px;text-align:right;color:var(--yellow);font-weight:700">45</span></div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="min-width:80px;color:var(--text-muted);font-size:10px">Squeeze</span><div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden"><div style="width:8%;height:100%;background:var(--text-muted);border-radius:4px"></div></div><span style="min-width:28px;text-align:right;color:var(--text-secondary)">8</span></div>
            <div style="display:flex;align-items:center;gap:10px"><span style="min-width:80px;color:var(--text-muted);font-size:10px">Exhaustion</span><div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden"><div style="width:7%;height:100%;background:var(--text-muted);border-radius:4px"></div></div><span style="min-width:28px;text-align:right;color:var(--text-secondary)">7</span></div>
          </div>
          <div style="border-top:1px solid var(--border);padding-top:14px;display:flex;gap:20px;font-size:10px"><span style="color:var(--text-muted)">Stability <span style="color:var(--text);font-weight:600">64%</span></span><span style="color:var(--text-muted)">Flickering <span style="color:var(--green);font-weight:600">No</span></span><span style="color:var(--text-muted)">Bias <span style="color:var(--red);font-weight:600">bearish</span></span></div>
        </div>
      </div>
    </div>

    <!-- Feature 4: SharkMind — AI Verdict (flipped) -->
    <div class="product-row flip rv">
      <div class="product-glow" aria-hidden="true"></div>
      <div class="product-text st">
        <div class="product-tag">SharkMind&trade;</div>
        <h3>One Actionable<br>Thesis. Every Day.</h3>
        <p>Three AI models analyze structure, flow, and volatility independently &mdash; then converge on one thesis with probabilities, a trade plan, and a kill switch. No ambiguity.</p>
        <div class="product-outcome">&#8594; Bias + plan + invalidation in 10 seconds</div>
      </div>
      <div class="product-visual st">
        <div class="scan"></div>
        <div style="padding:24px;font-family:var(--font-mono);font-size:11px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><span style="font-size:15px;font-weight:700;color:var(--text)"><span class="live-dot"></span>SHARK Engine</span><span class="badge blue" style="font-size:10px;padding:4px 10px">MULTI-MODEL</span></div>
          <div style="margin-bottom:16px">
            <div class="conf-row" style="padding:8px 0"><span class="conf-label" style="font-size:11px">Structural</span><div class="conf-bar" style="height:8px"><div class="conf-fill" style="width:78%;background:linear-gradient(90deg,rgba(239,68,68,0.5),var(--red));border-radius:4px"></div></div><span class="conf-pct" style="color:var(--red);font-size:12px">78%</span></div>
            <div class="conf-row" style="padding:8px 0"><span class="conf-label" style="font-size:11px">Flow</span><div class="conf-bar" style="height:8px"><div class="conf-fill" style="width:65%;background:linear-gradient(90deg,rgba(239,68,68,0.5),var(--red));border-radius:4px"></div></div><span class="conf-pct" style="color:var(--red);font-size:12px">65%</span></div>
            <div class="conf-row" style="padding:8px 0"><span class="conf-label" style="font-size:11px">Volatility</span><div class="conf-bar" style="height:8px"><div class="conf-fill" style="width:52%;background:var(--text-muted);border-radius:4px"></div></div><span class="conf-pct" style="font-size:12px">52%</span></div>
          </div>
          <div style="text-align:center;margin-bottom:16px"><span class="badge red" style="font-size:12px;padding:6px 18px;letter-spacing:0.03em">BEARISH &mdash; High Conviction</span></div>
          <div style="border-top:1px solid var(--border);padding-top:14px;font-size:11px;line-height:2"><div style="color:var(--text-secondary)"><span style="color:var(--red);font-weight:600">60%</span> SPY stays 585&ndash;590</div><div style="color:var(--text-secondary)"><span style="color:var(--yellow);font-weight:600">25%</span> breakout above 590</div><div style="color:var(--text-secondary)"><span style="color:var(--red);font-weight:600">15%</span> breakdown below 583</div></div>
          <div style="border-top:1px solid var(--border);margin-top:12px;padding-top:12px;font-size:11px;color:var(--text-muted)">Plan: <span style="color:var(--text)">Sell rips into 695</span> &bull; Invalidation: <span style="color:var(--red)">Hold above 700</span></div>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- HOW IT WORKS -->
<section id="how-it-works" class="section">
  <div class="container rv">
    <p class="section-label">How it works</p>
    <h2 class="section-title">Four steps. No guessing.</h2>
    <p class="section-sub">From raw options data to actionable trade plan</p>
    <div class="steps-grid">
      <div class="step-card glow-card st"><div class="step-num">Step 01</div><h3>Map Structure</h3><div class="step-visual"><div class="regime-bar"><div class="regime-seg" style="background:var(--green);flex:2"></div><div class="regime-seg" style="background:var(--accent);flex:1.5"></div><div class="regime-seg" style="background:var(--yellow);flex:3"></div><div class="regime-seg" style="background:var(--red);flex:0.5"></div><div class="regime-seg" style="background:var(--text-muted);flex:0.5"></div></div><div style="display:flex;justify-content:space-between;margin-top:4px;font-size:8px;color:var(--text-muted)"><span>TREND</span><span>MEAN_REV</span><span>CHOPPY</span><span>SQZ</span><span>EXH</span></div></div><p>Classifies gamma imbalance into actionable regimes</p></div>
      <div class="step-card glow-card st"><div class="step-num">Step 02</div><h3>Score Pressure</h3><div class="step-visual"><div class="gauge"><div class="gauge-fill" style="width:62%"></div><div class="gauge-mark" style="left:62%"></div></div><div class="gauge-lbl">BUILDING 62/100</div></div><p>Measures flip drift, GEX velocity, structural fragility</p></div>
      <div class="step-card glow-card st"><div class="step-num">Step 03</div><h3>Gate Trades</h3><div class="step-visual"><ul class="checklist"><li><span class="ok">&check;</span> VWAP aligned</li><li><span class="ok">&check;</span> Momentum confirmed</li><li><span class="no">&cross;</span> Volume low <span class="wait">&rarr; WAIT</span></li></ul></div><p>Rules-based execution filter. No signal = no trade.</p></div>
      <div class="step-card glow-card st"><div class="step-num">Step 04</div><h3>Enforce Risk</h3><div class="step-visual"><div class="risk-grid"><div class="risk-item"><span>-30%</span>Stop</div><div class="risk-item"><span>45min</span>Time</div><div class="risk-item"><span>$700</span>Inval</div><div class="risk-item"><span>2/hr</span>Throttle</div></div></div><p>Every output includes defined risk and invalidation</p></div>
    </div>
  </div>
</section>

<!-- POSITIONING -->
<div class="positioning rv">
  <p>Stop trading on hope.<br><span>Start trading on structure.</span></p>
</div>

<!-- BUILT FOR -->
<section class="section">
  <div class="container rv">
    <p class="section-label">Built for</p>
    <h2 class="section-title">Traders who think in structure</h2>
    <div style="text-align:center;padding:48px 24px;color:#94A3B8;font-size:16px">
      Built for day traders, swing traders, quants, and anyone who trades with data.
    </div>
  </div>
</section>

<!-- ECOSYSTEM -->
<section class="ecosystem" id="ecosystem">
  <div class="container rv">
    <p class="section-label" style="text-align:center">The platform</p>
    <h2>The SharkQuant&trade; Ecosystem</h2>
    <p class="section-sub" style="text-align:center">Every module. One terminal. Zero noise.</p>
    <div class="eco-grid">
      <div class="eco-card st"><i data-lucide="layout-dashboard" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">SharkCommand&trade;</div><div class="eco-card-desc">Unified command center with market thesis, key levels, and exposure charts.</div><span class="eco-badge available">Available</span></div>
      <div class="eco-card st"><i data-lucide="grid-3x3" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">SharkGrid&trade;</div><div class="eco-card-desc">Real-time gamma exposure heatmap with dealer positioning intelligence.</div><span class="eco-badge available">Available</span></div>
      <div class="eco-card st"><i data-lucide="activity" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">SharkFlow&trade;</div><div class="eco-card-desc">Live options flow scanner with institutional sweep detection.</div><span class="eco-badge available">Available</span></div>
      <div class="eco-card st"><i data-lucide="brain" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">SharkMind&trade;</div><div class="eco-card-desc">Multi-agent AI analysis pipeline with 10 specialized trading agents.</div><span class="eco-badge available">Available</span></div>
      <div class="eco-card st"><i data-lucide="scan" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">SharkSense&trade;</div><div class="eco-card-desc">LLM-powered gamma pattern recognition and structural analysis.</div><span class="eco-badge available">Available</span></div>
      <div class="eco-card st"><i data-lucide="bar-chart-3" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">SharkAnalytics&trade;</div><div class="eco-card-desc">Greeks, skew, term structure, OI volume, and surface analysis.</div><span class="eco-badge available">Available</span></div>
      <div class="eco-card st"><i data-lucide="eye" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">SharkVisor&trade;</div><div class="eco-card-desc">Dual SVG gamma exposure visualization with playback controls.</div><span class="eco-badge available">Available</span></div>
      <div class="eco-card st"><i data-lucide="timer" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">Shark0DTE&trade;</div><div class="eco-card-desc">Dedicated zero-DTE view with countdown, key levels, and live flow.</div><span class="eco-badge available">Available</span></div>
      <div class="eco-card st"><i data-lucide="bell-ring" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">SharkAlerts&trade;</div><div class="eco-card-desc">Real-time structural alerts with email digests and Discord notifications.</div><span class="eco-badge available">Available</span></div>
      <div class="eco-card st"><i data-lucide="book-open" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">SharkPlaybook&trade;</div><div class="eco-card-desc">Six regime-ranked strategies with entry, exit, and risk parameters.</div><span class="eco-badge available">Available</span></div>
      <div class="eco-card st"><i data-lucide="calendar-range" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">SharkSwing&trade;</div><div class="eco-card-desc">Multi-day gamma persistence heatmap for swing traders.</div><span class="eco-badge coming">Coming Soon</span></div>
      <div class="eco-card st"><i data-lucide="layers" style="width:24px;height:24px" class="eco-card-icon"></i><div class="eco-card-name">SharkTrinity&trade;</div><div class="eco-card-desc">Combined SPY + QQQ + IWM dealer exposure overlay.</div><span class="eco-badge coming">Coming Soon</span></div>
    </div>
  </div>
</section>

<!-- COMPLIANCE -->
<section class="section">
  <div class="container rv">
    <p class="section-label">Trust</p>
    <h2 class="section-title">Trust &amp; compliance</h2>
    <p class="section-sub">How we handle data, risk, and responsibility</p>
    <div class="compliance-grid">
      <div class="compliance-card st"><h4>Not Financial Advice</h4><p>SharkQuant&trade; generates structured market intelligence and scenarios. It does not provide investment advice, recommendations, or solicitations to trade.</p></div>
      <div class="compliance-card st"><h4>Data Privacy</h4><p>All market data comes from licensed institutional providers. No proprietary order flow is shared or resold. Your usage data stays private.</p></div>
      <div class="compliance-card st"><h4>Execution Controls</h4><p>Automated execution is optional, user-controlled, and has built-in kill switches, position limits, and circuit breakers.</p></div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section">
  <div class="container rv">
    <p class="section-label">FAQ</p>
    <h2 class="section-title">Questions</h2>
    <p class="section-sub">Specifics, not sales pitches</p>
    <div class="faq-list">
      <div class="faq-item"><button class="faq-q" aria-expanded="false" aria-controls="faq-1">How is this different from other gamma tools?</button><div class="faq-a" id="faq-1" role="region"><p>Most tools show you raw gamma data and leave interpretation to you. SharkQuant&trade; classifies the regime, measures structural pressure over time, and outputs a specific plan with invalidation &mdash; 10 seconds, not 10 minutes.</p></div></div>
      <div class="faq-item"><button class="faq-q" aria-expanded="false" aria-controls="faq-2">How do I access it?</button><div class="faq-a" id="faq-2" role="region"><p>SharkQuant&trade; runs via the web dashboard at app.sharkquant.ai. Subscribe, set your password, and you're in. No waitlist, no approval process.</p></div></div>
      <div class="faq-item"><button class="faq-q" aria-expanded="false" aria-controls="faq-3">What does SharkQuant&trade; actually produce?</button><div class="faq-a" id="faq-3" role="region"><p>A clear bias (Up / Down / Range / Volatile), key support and resistance levels derived from gamma positioning, a one-line trade plan, and an invalidation level. Every output includes reasoning and defined risk.</p></div></div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section id="pricing" class="section">
  <div class="container rv">
    <p class="section-label">Pricing</p>
    <h2 class="section-title">No free tier. No fluff.</h2>
    <p class="section-sub">Pick your edge.</p>
    <div class="pricing-grid">
      <div class="pricing-card st"><div class="pricing-name">Core</div><div class="pricing-price">$29.99<span>/mo</span></div><div class="pricing-desc">Real-time market structure for SPY, QQQ &amp; IWM</div><ul class="pricing-features"><li>SharkGrid&trade; &mdash; SPY, QQQ &amp; IWM</li><li>SharkFlow&trade;</li><li>SharkScan&trade; &amp; SharkMoney&trade;</li><li>SharkIntel&trade; Briefs</li><li>SharkAlerts&trade;</li></ul><a href="/api/stripe/checkout?plan=core" class="pricing-btn sec">Get Started</a></div>
      <div class="pricing-card featured st"><div class="pricing-badge">FOUNDERS &mdash; 50 SPOTS</div><div class="pricing-name">Founders</div><div class="pricing-price"><span class="strike">$49.99</span>$29.99<span>/mo</span></div><div class="founders-count" style="font-size:14px;font-weight:600;margin:8px 0"></div><div class="pricing-desc">Full Pro access &mdash; locked in for life. First 50 only.</div><ul class="pricing-features"><li>Everything in Core</li><li>All 13+ tickers (AAPL, TSLA, NVDA, META, AMD&hellip;)</li><li>SharkMind&trade; &mdash; multi-model deep analysis</li><li>SharkSense&trade; &mdash; advanced gamma detection</li><li>SHARK Engine &mdash; high-conviction trade ideas</li><li>AI-powered trade signals &amp; research</li><li>Price locked forever &mdash; no increases, ever</li></ul><a href="/api/stripe/checkout?plan=founders" class="pricing-btn founders-btn">Claim Founders Spot &rarr;</a></div>
      <div class="pricing-card st"><div class="pricing-name">Pro</div><div class="pricing-price">$49.99<span>/mo</span></div><div class="pricing-desc">Full arsenal. All tickers. AI-powered analysis.</div><ul class="pricing-features"><li>Everything in Core</li><li>All 13+ tickers unlocked</li><li>SharkMind&trade; &mdash; multi-model deep analysis</li><li>SharkSense&trade; &mdash; advanced gamma detection</li><li>SHARK Engine &mdash; high-conviction trade ideas</li><li>AI-powered trade signals &amp; research</li></ul><a href="/api/stripe/checkout?plan=pro" class="pricing-btn sec">Get Started</a></div>
    </div>
    <p class="founders-note">Founders Plan: First 50 Pro subscribers get locked in at $29.99/mo for life. Same features as Pro &mdash; you just pay less. After 50 spots fill, this plan is gone.</p>
  </div>
</section>

<!-- FINAL CTA -->
<div class="final-cta rv">
  <h2>See what you've been missing.</h2>
  <p>Your first bias, trade plan, and invalidation level &mdash; in 10 seconds.</p>
  <a href="#pricing" class="btn-primary">Get Started &rarr;</a>
</div>

</main>

<footer>
  <img src="${LOGO_URL}" alt="SharkQuant" width="24" height="24">
  <p class="copy">&copy; 2026 Rheo Agora LLC, d/b/a SharkQuant</p>
  <p style="margin:8px 0;font-size:12px;color:var(--text-muted)"><a href="/terms" style="color:var(--text-muted);text-decoration:none">Terms</a> &middot; <a href="/privacy" style="color:var(--text-muted);text-decoration:none">Privacy</a> &middot; <a href="/risk-disclosure" style="color:var(--text-muted);text-decoration:none">Risk Disclosure</a> &middot; <a href="/disclaimer" style="color:var(--text-muted);text-decoration:none">Disclaimer</a> &middot; <a href="/refund-policy" style="color:var(--text-muted);text-decoration:none">Refund Policy</a></p>
  <p style="margin:8px 0"><a href="https://x.com/SharkQuantAI" target="_blank" rel="noopener" style="color:var(--accent-bright);font-size:13px;text-decoration:none;display:inline-flex;align-items:center;gap:6px"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Follow @SharkQuantAI for free daily GEX levels</a></p>
  <p class="disc">SharkQuant&trade; provides market structure analysis and informational tools only. Nothing on this site constitutes financial advice, investment recommendations, or a solicitation to buy or sell securities. Trading involves substantial risk of loss. Past performance does not guarantee future results.</p>
</footer>

<script>
function toggleTheme(){
  document.documentElement.classList.toggle('light');
  var l=document.documentElement.classList.contains('light');
  localStorage.setItem('sq-theme',l?'light':'dark');
  if(typeof lucide!=='undefined')lucide.createIcons();
}
if(localStorage.getItem('sq-theme')==='light')document.documentElement.classList.add('light');
if(typeof lucide!=='undefined')lucide.createIcons();

// FAQ
document.querySelectorAll('.faq-q').forEach(function(b){
  function toggle(){
    var item=b.parentElement,was=item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function(i){i.classList.remove('open');i.querySelector('.faq-q').setAttribute('aria-expanded','false')});
    if(!was){item.classList.add('open');b.setAttribute('aria-expanded','true')}
  }
  b.addEventListener('click',toggle);
  b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
});

// Count-up
function countUp(el,target,suffix,finalText){
  var dur=1200,st=null;suffix=suffix||'';
  function step(ts){
    if(!st)st=ts;
    var p=Math.min((ts-st)/dur,1),e=1-Math.pow(1-p,3),c=Math.floor(e*target);
    if(p>=1&&finalText){el.textContent=finalText;return}
    el.textContent=c.toLocaleString()+suffix;
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Mouse glow
document.addEventListener('mousemove',function(e){
  document.querySelectorAll('.glow-card').forEach(function(c){
    var r=c.getBoundingClientRect();
    c.style.setProperty('--mx',(e.clientX-r.left)+'px');
    c.style.setProperty('--my',(e.clientY-r.top)+'px');
  });
});

// Scroll reveal + stagger + count-up
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  var counted=false;
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('visible');
        obs.unobserve(e.target);
        e.target.querySelectorAll('.st').forEach(function(c,i){c.style.transitionDelay=(i*100)+'ms'});
        if(!counted&&e.target.classList.contains('metrics')){
          counted=true;
          e.target.querySelectorAll('.metric-num').forEach(function(n){
            var t=parseInt(n.getAttribute('data-count'),10),s='';
            if(t===4200)s='+';
            if(n.getAttribute('data-text')){countUp(n,t,'',n.getAttribute('data-text'));return}
            if(t===3)s='s';if(t===13)s='+';
            countUp(n,t,s);
          });
        }
      }
    });
  },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.rv').forEach(function(el){obs.observe(el)});
  var m=document.querySelector('.metrics');if(m)obs.observe(m);
}else{
  document.querySelectorAll('.rv').forEach(function(el){el.classList.add('visible')});
  document.querySelectorAll('.st').forEach(function(el){el.style.opacity='1';el.style.transform='none'});
  document.querySelectorAll('.metric-num').forEach(function(n){
    var ft=n.getAttribute('data-text');if(ft){n.textContent=ft;return}
    var t=parseInt(n.getAttribute('data-count'),10),s='';
    if(t===4200)s='+';if(t===3)s='s';if(t===13)s='+';
    n.textContent=t.toLocaleString()+s;
  });
}

// Heatmap cell shimmer — all product visuals
// Conf bar subtle animation
var confFills=document.querySelectorAll('.product-visual .conf-fill');
if(confFills.length&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  setInterval(function(){confFills.forEach(function(f){var w=parseFloat(f.style.width);var delta=(Math.random()-0.5)*4;f.style.width=Math.max(10,Math.min(95,w+delta))+'%';f.style.transition='width 0.6s ease'})},2000);
}

// ===== LIVE HERO ANIMATION =====
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var frames=[
    {spot:589.42,change:'+0.18',changeColor:'var(--green)',bias:'NEUTRAL',biasClass:'neutral',cw:600,pw:580,flip:592,vt:595,regime:'Long Gamma',gex:'+2.4B',gexClass:'green',dex:'+180M',dexClass:'green',pc:'0.82',iv:'34%',pressure:62,pressureColor:'var(--green)',invalLevel:585},
    {spot:589.67,change:'+0.43',changeColor:'var(--green)',bias:'NEUTRAL',biasClass:'neutral',cw:600,pw:580,flip:592,vt:595,regime:'Long Gamma',gex:'+2.5B',gexClass:'green',dex:'+195M',dexClass:'green',pc:'0.80',iv:'33%',pressure:65,pressureColor:'var(--green)',invalLevel:585},
    {spot:590.01,change:'+0.77',changeColor:'var(--green)',bias:'BULLISH',biasClass:'bullish',cw:601,pw:580,flip:592,vt:595,regime:'Long Gamma',gex:'+2.7B',gexClass:'green',dex:'+220M',dexClass:'green',pc:'0.78',iv:'32%',pressure:71,pressureColor:'var(--green)',invalLevel:585},
    {spot:590.38,change:'+1.14',changeColor:'var(--green)',bias:'BULLISH',biasClass:'bullish',cw:601,pw:580,flip:592,vt:596,regime:'Long Gamma',gex:'+2.8B',gexClass:'green',dex:'+240M',dexClass:'green',pc:'0.76',iv:'31%',pressure:74,pressureColor:'var(--green)',invalLevel:586},
    {spot:590.55,change:'+1.31',changeColor:'var(--green)',bias:'BULLISH',biasClass:'bullish',cw:601,pw:581,flip:593,vt:596,regime:'Long Gamma',gex:'+2.9B',gexClass:'green',dex:'+255M',dexClass:'green',pc:'0.75',iv:'30%',pressure:78,pressureColor:'var(--green)',invalLevel:586},
    {spot:590.22,change:'+0.98',changeColor:'var(--green)',bias:'BULLISH',biasClass:'bullish',cw:601,pw:581,flip:593,vt:596,regime:'Long Gamma',gex:'+2.6B',gexClass:'green',dex:'+210M',dexClass:'green',pc:'0.77',iv:'31%',pressure:72,pressureColor:'var(--green)',invalLevel:586},
    {spot:589.84,change:'+0.60',changeColor:'var(--green)',bias:'NEUTRAL',biasClass:'neutral',cw:600,pw:580,flip:592,vt:595,regime:'Long Gamma',gex:'+2.2B',gexClass:'green',dex:'+160M',dexClass:'green',pc:'0.81',iv:'33%',pressure:58,pressureColor:'var(--green)',invalLevel:585},
    {spot:589.31,change:'+0.07',changeColor:'var(--green)',bias:'NEUTRAL',biasClass:'neutral',cw:600,pw:580,flip:592,vt:595,regime:'Transitioning',gex:'+1.8B',gexClass:'green',dex:'+90M',dexClass:'green',pc:'0.85',iv:'36%',pressure:48,pressureColor:'var(--yellow)',invalLevel:585},
    {spot:588.76,change:'-0.48',changeColor:'var(--red)',bias:'BEARISH',biasClass:'bearish',cw:600,pw:579,flip:591,vt:594,regime:'Short Gamma',gex:'-0.4B',gexClass:'red',dex:'-120M',dexClass:'red',pc:'0.92',iv:'39%',pressure:35,pressureColor:'var(--red)',invalLevel:584},
    {spot:588.41,change:'-0.83',changeColor:'var(--red)',bias:'BEARISH',biasClass:'bearish',cw:599,pw:579,flip:591,vt:594,regime:'Short Gamma',gex:'-0.8B',gexClass:'red',dex:'-180M',dexClass:'red',pc:'0.95',iv:'41%',pressure:28,pressureColor:'var(--red)',invalLevel:583},
    {spot:588.65,change:'-0.59',changeColor:'var(--red)',bias:'BEARISH',biasClass:'bearish',cw:599,pw:579,flip:591,vt:594,regime:'Short Gamma',gex:'-0.5B',gexClass:'red',dex:'-140M',dexClass:'red',pc:'0.91',iv:'40%',pressure:32,pressureColor:'var(--red)',invalLevel:584},
    {spot:589.10,change:'-0.14',changeColor:'var(--red)',bias:'NEUTRAL',biasClass:'neutral',cw:600,pw:580,flip:592,vt:595,regime:'Transitioning',gex:'+1.1B',gexClass:'green',dex:'+50M',dexClass:'green',pc:'0.86',iv:'37%',pressure:45,pressureColor:'var(--yellow)',invalLevel:585},
  ];
  var idx=0;
  var els={
    spot:document.getElementById('heroSpot'),
    change:document.getElementById('heroSpotChange'),
    bias:document.getElementById('heroBias'),
    cw:document.getElementById('heroCW'),
    pw:document.getElementById('heroPW'),
    flip:document.getElementById('heroFlip'),
    vt:document.getElementById('heroVT'),
    regime:document.getElementById('heroRegime'),
    gex:document.getElementById('heroGEX'),
    dex:document.getElementById('heroDEX'),
    pc:document.getElementById('heroPC'),
    iv:document.getElementById('heroIV'),
    pressurePct:document.getElementById('heroPressurePct'),
    pressureFill:document.getElementById('heroPressureFill'),
    invalLevel:document.getElementById('heroInvalLevel'),
    ts:document.getElementById('heroTs')
  };
  if(!els.spot) return;
  var tsCounter=0;
  function tick(){
    var f=frames[idx];
    var prevSpot=parseFloat(els.spot.textContent.replace('$',''));
    els.spot.textContent='$'+f.spot.toFixed(2);
    els.change.textContent=f.change;
    els.change.style.color=f.changeColor;
    if(f.spot>prevSpot){els.spot.parentElement.classList.remove('flash-red');els.spot.parentElement.classList.add('flash-green');setTimeout(function(){els.spot.parentElement.classList.remove('flash-green')},600)}
    else if(f.spot<prevSpot){els.spot.parentElement.classList.remove('flash-green');els.spot.parentElement.classList.add('flash-red');setTimeout(function(){els.spot.parentElement.classList.remove('flash-red')},600)}
    els.bias.textContent=f.bias;
    els.bias.className='live-bias-badge '+f.biasClass;
    els.cw.textContent=f.cw;
    els.pw.textContent=f.pw;
    els.flip.textContent=f.flip;
    els.vt.textContent=f.vt;
    els.regime.textContent=f.regime;
    els.gex.textContent=f.gex;els.gex.className='live-val '+f.gexClass;
    els.dex.textContent=f.dex;els.dex.className='live-val '+f.dexClass;
    els.pc.textContent=f.pc;
    els.iv.textContent=f.iv;
    els.pressurePct.textContent=f.pressure+'%';
    els.pressureFill.style.width=f.pressure+'%';
    els.pressureFill.style.background=f.pressureColor;
    els.invalLevel.textContent=f.invalLevel;
    tsCounter=0;
    els.ts.textContent='0s';
    idx=(idx+1)%frames.length;
  }
  setInterval(tick,1200);
  setInterval(function(){tsCounter++;els.ts.textContent=tsCounter+'s'},1000);
})()
</script>
<script>
(function() {
  fetch('/api/gex/latest?ticker=SPY')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      const el = document.getElementById('live-gex');
      if (!el || !data) return;
      const regimeColors = { EXPANSION: '#22C55E', COMPRESSION: '#EAB308', TRANSITIONAL: '#F97316', PINNED: '#6366F1' };
      el.innerHTML = '<div style="display:flex;gap:24px;justify-content:center;align-items:center;flex-wrap:wrap">'
        + '<div style="text-align:center"><div style="font-size:13px;color:#94A3B8;text-transform:uppercase;letter-spacing:1px">Regime</div><div style="font-size:22px;font-weight:700;color:' + (regimeColors[data.regime] || '#F8FAFC') + '">' + (data.regime || '\u2014') + '</div></div>'
        + '<div style="text-align:center"><div style="font-size:13px;color:#94A3B8;text-transform:uppercase;letter-spacing:1px">GEX Flip</div><div style="font-size:22px;font-weight:700;font-family:JetBrains Mono,monospace;color:#F8FAFC">$' + (data.gexFlipLevel ? data.gexFlipLevel.toFixed(0) : '\u2014') + '</div></div>'
        + '<div style="text-align:center"><div style="font-size:13px;color:#94A3B8;text-transform:uppercase;letter-spacing:1px">Expansion</div><div style="font-size:22px;font-weight:700;font-family:JetBrains Mono,monospace;color:#3B82F6">' + (data.expansionScore ? data.expansionScore.toFixed(1) : '\u2014') + '</div></div>'
        + '</div>';
    })
    .catch(function(){});

  fetch('/api/founders/remaining')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      var els = document.querySelectorAll('.founders-count');
      if (!data) return;
      els.forEach(function(el) {
        if (data.remaining <= 0) {
          el.textContent = 'Sold Out';
          el.style.color = '#EF4444';
        } else {
          el.textContent = data.remaining + ' of 50 spots left';
          el.style.color = data.remaining < 10 ? '#EF4444' : data.remaining < 20 ? '#EAB308' : '#22C55E';
        }
      });
      if (data.remaining <= 0) {
        var btn = document.querySelector('.founders-btn');
        if (btn) {
          btn.textContent = 'Join Waitlist';
          btn.href = '/api/waitlist';
        }
      }
    })
    .catch(function(){});
})();
</script>
</body>
</html>`;
}

function getWelcomeHTML(plan) {
  const tierName = plan === 'founders' ? 'Founders' : plan === 'pro' ? 'Pro' : 'Core';
  const tierPrice = plan === 'pro' ? '$49.99' : '$29.99';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Welcome to SharkQuant™</title>
${FAVICON_LINK}
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#F0F0F5;font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.card{background:#0D0D14;border:1px solid #1A1A25;border-radius:16px;padding:48px;max-width:480px;width:100%;text-align:center}
h1{font-family:'DM Sans',system-ui,sans-serif;font-size:24px;margin-bottom:8px}
.tier{color:#3B82F6;font-weight:600}
p{color:#8888A0;font-size:14px;line-height:1.6;margin-top:16px}
.check-icon{font-size:48px;margin-bottom:16px}
input{width:100%;padding:0.75rem 1rem;border:1px solid #1A1A25;border-radius:8px;background:#000;color:#F0F0F5;font-size:0.9rem;font-family:Inter,system-ui,sans-serif;outline:none;margin-bottom:0.5rem}
input:focus{border-color:#3B82F6}
button{width:100%;margin-top:0.5rem;padding:0.75rem;background:#3B82F6;color:#fff;border:none;border-radius:8px;font-weight:600;font-size:0.9rem;cursor:pointer}
button:hover{opacity:0.85}
button:disabled{opacity:0.5;cursor:not-allowed}
.error{color:#EF4444;font-size:0.85rem;margin-top:8px;display:none}
.error.show{display:block}
.pw-hint{color:#55556A;font-size:12px;margin-top:4px;text-align:left}
</style>
</head>
<body>
<div class="card">
  <div class="check-icon">&#10003;</div>
  <h1>You're in.</h1>
  <p>Welcome to <span class="tier">SharkQuant&trade; ${tierName}</span>.</p>
  <div style="margin:16px auto;padding:12px 20px;background:#111118;border:1px solid #1A1A25;border-radius:10px;display:inline-block">
    <div style="font-size:13px;color:#8888A0">Your plan</div>
    <div style="font-size:20px;font-weight:700;color:#F0F0F5;margin-top:4px">${tierName} <span style="font-size:14px;color:#8888A0;font-weight:400">${tierPrice}/mo</span></div>
  </div>
  <p>Set a password to access your dashboard.</p>
  <form id="register-form" style="margin-top:24px;">
    <input type="password" id="password" placeholder="Create a password" required minlength="8" autocomplete="new-password">
    <input type="password" id="confirm" placeholder="Confirm password" required minlength="8" autocomplete="new-password">
    <p class="pw-hint">At least 8 characters</p>
    <button type="submit">Create Account</button>
  </form>
  <p class="error" id="error"></p>
  <p style="margin-top:16px;font-size:13px"><a href="/auth/login" style="color:#3B82F6;text-decoration:none">Back to login</a></p>
</div>
<script>
  var sessionId = new URLSearchParams(window.location.search).get('session_id');
  document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    var pw = document.getElementById('password').value;
    var confirm = document.getElementById('confirm').value;
    var errorEl = document.getElementById('error');
    errorEl.classList.remove('show');
    if (pw !== confirm) { errorEl.textContent = 'Passwords do not match.'; errorEl.classList.add('show'); return; }
    if (pw.length < 8) { errorEl.textContent = 'Password must be at least 8 characters.'; errorEl.classList.add('show'); return; }
    var btn = this.querySelector('button');
    btn.textContent = 'Creating account...';
    btn.disabled = true;
    try {
      var resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, sessionId: sessionId })
      });
      var data = await resp.json();
      if (data.success) { window.location.href = data.redirect || '/dashboard'; return; }
      errorEl.textContent = data.error || 'Registration failed.';
      errorEl.classList.add('show');
    } catch(err) {
      errorEl.textContent = 'Network error. Try again.';
      errorEl.classList.add('show');
    }
    btn.textContent = 'Create Account';
    btn.disabled = false;
  });
</script>
</body>
</html>`;
}

function registerLandingRoutes(app) {
  app.get('/', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) return res.redirect('/dashboard');
    return res.redirect('/auth/login');
  });
  app.get('/welcome', (_req, res) => res.send(getWelcomeHTML(_req.query.plan)));
}

module.exports = { registerLandingRoutes, FAVICON_LINK };
