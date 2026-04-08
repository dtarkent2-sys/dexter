const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const config = require('../config');
const log = require('../logger')('Auth');

// Serialize just the user object into the session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Build callback URL: explicit env var > dashboardUrl fallback
function getCallbackURL() {
  if (config.discordRedirectUri) return config.discordRedirectUri;
  const base = config.dashboardUrl || `http://localhost:${config.port}`;
  return `${base}/auth/discord/callback`;
}

/**
 * Configure session, passport, and auth routes on the Express app.
 * Call this AFTER express.json() but BEFORE dashboard routes.
 */
function configureAuth(app) {
  const express = require('express');
  const oauthClientId = config.discordOAuthClientId || config.clientId;
  if (!config.discordClientSecret || !oauthClientId) {
    log.warn('Discord OAuth not configured (missing DISCORD_CLIENT_SECRET or DISCORD_OAUTH_CLIENT_ID). Dashboard auth disabled.');
    return;
  }

  // Session
  app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: 'auto',       // secure when behind HTTPS proxy
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',      // CSRF protection
    },
  }));

  // Trust Railway's proxy so secure cookies work
  app.set('trust proxy', 1);

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new DiscordStrategy({
    clientID: oauthClientId,
    clientSecret: config.discordClientSecret,
    callbackURL: getCallbackURL(),
    scope: ['identify'],
  }, (accessToken, refreshToken, profile, done) => {
    // Check allowlist of approved Discord user IDs
    const allowlist = (process.env.DASHBOARD_ALLOWED_USERS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (allowlist.length > 0) {
      if (!allowlist.includes(profile.id)) {
        log.warn(`User ${profile.username} (${profile.id}) denied — not on allowlist`);
        return done(null, false, { message: 'not_approved' });
      }
      log.info(`User ${profile.username} (${profile.id}) authorized (allowlisted)`);
    } else {
      log.info(`User ${profile.username} (${profile.id}) authorized (no allowlist set — open access)`);
    }
    // Store minimal user info in session
    return done(null, {
      id: profile.id,
      username: profile.username,
      discriminator: profile.discriminator,
      avatar: profile.avatar,
      authType: 'discord',
    });
  }));

  // ── Auth Routes ──────────────────────────────────────────────────────

  // Start Discord OAuth flow
  app.get('/auth/discord', passport.authenticate('discord'));

  // OAuth callback
  app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/auth/denied' }),
    (req, res) => {
      const returnTo = req.session.returnTo || '/dashboard';
      delete req.session.returnTo;
      res.redirect(returnTo);
    }
  );

  // Access denied page
  app.get('/auth/denied', (_req, res) => {
    res.status(403).send(getDeniedHTML());
  });

  // Logout
  app.get('/auth/logout', (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.redirect('/');
      });
    });
  });

  // ── Email + Password Auth ──────────────────────────────────────────────
  const magicToken = require('../services/magic-token');
  const approvedUsers = require('../services/approved-users');

  const _magicLinkSent = new Map();
  function canSendMagicLink(email) {
    const last = _magicLinkSent.get(email);
    if (last && Date.now() - last < 2 * 60 * 1000) return false;
    _magicLinkSent.set(email, Date.now());
    return true;
  }

  const _loginAttempts = new Map();
  function checkLoginRate(email) {
    const now = Date.now();
    const window = 15 * 60 * 1000;
    const max = 5;
    let record = _loginAttempts.get(email);
    if (!record || now - record.start > window) {
      record = { start: now, count: 0 };
      _loginAttempts.set(email, record);
    }
    record.count++;
    return record.count <= max;
  }

  setInterval(() => {
    const now = Date.now();
    if (_magicLinkSent.size > 10000) _magicLinkSent.clear();
    else for (const [k, v] of _magicLinkSent) { if (now - v > 2 * 60 * 1000) _magicLinkSent.delete(k); }
    if (_loginAttempts.size > 10000) _loginAttempts.clear();
    else for (const [k, v] of _loginAttempts) { if (now - v.start > 15 * 60 * 1000) _loginAttempts.delete(k); }
  }, 60_000);

  // Login page — email + password form
  app.get('/auth/login', (req, res) => {
    if (req.query.plan && ['core', 'founders', 'pro'].includes(req.query.plan)) {
      req.session.checkoutPlan = req.query.plan;
    }
    res.send(getLoginHTML());
  });

  // Email + password login
  app.post('/api/auth/login', express.json(), (req, res) => {
    const { email, password, remember } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const e = email.toLowerCase();
    if (!checkLoginRate(e)) return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
    if (!approvedUsers.isApproved(e)) return res.status(401).json({ error: 'Invalid email or password.' });
    if (!approvedUsers.hasPassword(e)) {
      // Auto-send a password setup link (rate-limited to prevent email loops)
      if (canSendMagicLink(e)) {
        const { sendMagicLink } = require('../services/magic-email');
        sendMagicLink(e).catch(err => log.error('Magic link send failed', err));
      }
      return res.status(401).json({ error: 'No password set yet. Check your email for a link to set your password.' });
    }
    if (!approvedUsers.verifyPassword(e, password)) return res.status(401).json({ error: 'Invalid email or password.' });

    approvedUsers.recordLogin(e);
    const user = { id: `email:${e}`, username: e, authType: 'email' };
    // Extend session to 30 days if "Remember me" is checked
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login error' });
      const plan = req.session.checkoutPlan;
      delete req.session.checkoutPlan;
      const returnTo = req.session.returnTo || '/dashboard';
      delete req.session.returnTo;
      res.json({ success: true, redirect: returnTo });
    });
  });

  // Set password (after Stripe payment — welcome page)
  // SECURITY: sessionId is REQUIRED to prove email ownership via Stripe checkout
  app.post('/api/auth/register', express.json(), async (req, res) => {
    const { password, sessionId } = req.body || {};
    if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (!sessionId) return res.status(400).json({ error: 'Session ID required.' });

    // Verify email via Stripe session ID (only trusted source)
    let e = '';
    try {
      const stripeService = require('../services/stripe');
      const session = await stripeService.retrieveSession(sessionId);
      e = (session.customer_email || session.client_reference_id || (session.customer_details && session.customer_details.email) || '').toLowerCase();
    } catch (err) {
      return res.status(400).json({ error: 'Invalid session.' });
    }
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return res.status(400).json({ error: 'Could not determine email from session.' });
    if (!approvedUsers.isApproved(e)) return res.status(403).json({ error: 'No active subscription found for this email.' });
    if (approvedUsers.hasPassword(e)) return res.status(409).json({ error: 'Password already set. Use login or forgot password.' });

    approvedUsers.setPassword(e, password);
    approvedUsers.recordLogin(e);

    const user = { id: `email:${e}`, username: e, authType: 'email' };
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login error' });
      res.json({ success: true, redirect: '/dashboard' });
    });
  });

  // Verify magic link token and create session (forgot password flow)
  app.get('/auth/magic', (req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect('/auth/login');

    const email = magicToken.verify(token);
    if (!email) return res.status(400).send(getLoginHTML('This link has expired or is invalid. Request a new one.'));
    if (!approvedUsers.isApproved(email)) return res.status(403).send(getDeniedHTML());

    approvedUsers.recordLogin(email);
    const user = { id: `email:${email}`, username: email, authType: 'email' };
    req.login(user, (err) => {
      if (err) return res.status(500).send('Login error');

      // Always redirect to set-password — user came from a magic link
      // (either "forgot password" or first-time access)
      return res.redirect('/auth/set-password');
    });
  });

  // Set password page (shown after magic link login when no password exists)
  app.get('/auth/set-password', (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.redirect('/auth/login');
    const email = req.user?.username || '';
    res.send(getSetPasswordHTML(email));
  });

  // Handle password set from the set-password page
  app.post('/api/auth/set-password', express.json(), (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated.' });
    const { password } = req.body || {};
    if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    const email = req.user?.username;
    if (!email) return res.status(400).json({ error: 'No email in session.' });
    approvedUsers.setPassword(email, password);
    res.json({ success: true, redirect: '/dashboard' });
  });

  // Request a password reset magic link
  app.post('/api/auth/request-link', express.json(), async (req, res) => {
    const { email } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required.' });
    }
    if (!approvedUsers.isApproved(email.toLowerCase())) {
      return res.json({ message: 'If this email has access, a reset link has been sent.' });
    }
    if (!canSendMagicLink(email.toLowerCase())) {
      return res.status(429).json({ error: 'Please wait 2 minutes before requesting another reset link.' });
    }
    const { sendPasswordResetLink } = require('../services/magic-email');
    await sendPasswordResetLink(email.toLowerCase());
    res.json({ message: 'If this email has access, a reset link has been sent.' });
  });

  log.info('Discord OAuth configured');
}

/**
 * Middleware: require authenticated session for dashboard routes.
 * Redirects to Discord OAuth if not logged in.
 */
function requireAuth(req, res, next) {
  // Skip if auth is not configured (no client secret)
  if (!config.discordClientSecret || !(config.discordOAuthClientId || config.clientId)) return next();

  if (req.isAuthenticated && req.isAuthenticated()) return next();

  // Save the requested URL so we can redirect back after login
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
}

function getDeniedHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Denied | SharkQuant™</title>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0A0F1C;
      --bg-surface: rgba(15,23,42,0.85);
      --border: rgba(251,191,36,0.1);
      --text: #F8FAFC;
      --text-secondary: #94A3B8;
      --accent: #fbbf24;
      --red: #f87171;
      --font-heading: 'Barlow Condensed', 'DM Sans', system-ui, sans-serif;
      --font-body: 'Inter', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: var(--bg); color: var(--text-secondary);
      font-family: var(--font-body);
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
      background-image: radial-gradient(ellipse at 50% 50%, rgba(248,113,113,0.03) 0%, transparent 60%);
    }
    .card {
      text-align: center; max-width: 480px; padding: 3rem;
      border: 1px solid rgba(248,113,113,0.15); border-radius: 4px;
      background: rgba(15,23,42,0.85); backdrop-filter: blur(12px);
    }
    h1 { color: var(--red); font-size: 1.5rem; margin-bottom: 1rem; font-family: var(--font-heading); letter-spacing: 2px; text-transform: uppercase; }
    p { line-height: 1.6; margin-bottom: 1.5rem; }
    a {
      display: inline-block; padding: 0.75rem 1.5rem;
      background: rgba(251,191,36,0.12); color: var(--accent); text-decoration: none;
      border: 1px solid rgba(251,191,36,0.25); border-radius: 3px; font-weight: 700; font-size: 0.9rem;
      font-family: var(--font-heading); letter-spacing: 1px; text-transform: uppercase; transition: all 0.15s;
    }
    a:hover { background: rgba(251,191,36,0.2); }
    .retry { margin-left: 1rem; background: rgba(248,113,113,0.08); color: var(--text-secondary); border-color: rgba(248,113,113,0.2); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Access Denied</h1>
    <p>Dashboard access is by approval only. Contact the SharkQuant&trade; admin to request access.</p>
    <a href="/">Home</a>
    <a href="/auth/discord" class="retry">Try Again</a>
  </div>
</body>
</html>`;
}

function getLoginHTML(error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In | SharkQuant™</title>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root { --bg:#0A0F1C;--bg-surface:rgba(15,23,42,0.85);--border:rgba(251,191,36,0.1);--text:#F8FAFC;--text-secondary:#94A3B8;--accent:#fbbf24;--red:#f87171;--green:#4ade80;--font-heading:'Barlow Condensed','DM Sans',system-ui,sans-serif;--font-body:'Inter',system-ui,sans-serif;--font-mono:'JetBrains Mono',monospace; }
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:var(--bg);color:var(--text-secondary);font-family:var(--font-body);display:flex;align-items:center;justify-content:center;min-height:100vh;background-image:radial-gradient(ellipse at 30% 20%,rgba(251,191,36,0.03) 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(34,211,238,0.02) 0%,transparent 60%); }
    .card { text-align:center;max-width:420px;width:100%;padding:2.5rem;border:1px solid rgba(251,191,36,0.12);border-radius:4px;background:rgba(15,23,42,0.85);backdrop-filter:blur(12px); }
    h1 { color:var(--accent);font-family:var(--font-heading);font-size:1.6rem;margin-bottom:0.5rem;letter-spacing:3px;text-transform:uppercase; }
    .subtitle { margin-bottom:1.5rem;font-size:0.85rem;font-family:var(--font-mono);letter-spacing:0.5px; }
    .error { color:var(--red);font-size:0.85rem;margin-bottom:1rem;display:none;font-family:var(--font-mono); }
    .error.show { display:block; }
    input { width:100%;padding:0.7rem 1rem;border:1px solid rgba(251,191,36,0.12);border-radius:3px;background:rgba(0,0,0,0.3);color:var(--text);font-size:0.9rem;font-family:var(--font-body);outline:none;margin-bottom:0.5rem; }
    input:focus { border-color:rgba(251,191,36,0.3);box-shadow:0 0 8px rgba(251,191,36,0.1); }
    button { width:100%;margin-top:0.5rem;padding:0.75rem;background:rgba(251,191,36,0.12);color:var(--accent);border:1px solid rgba(251,191,36,0.25);border-radius:3px;font-weight:700;font-size:0.9rem;cursor:pointer;font-family:var(--font-heading);letter-spacing:1px;text-transform:uppercase;transition:all 0.15s; }
    button:hover { background:rgba(251,191,36,0.2); }
    button:disabled { opacity:0.4;cursor:not-allowed; }
    .divider { display:flex;align-items:center;gap:12px;margin:1.5rem 0;font-size:0.75rem;color:var(--text-secondary);font-family:var(--font-mono);letter-spacing:1px;text-transform:uppercase; }
    .divider::before,.divider::after { content:'';flex:1;height:1px;background:rgba(251,191,36,0.1); }
    .discord-btn { background:rgba(88,101,242,0.15);color:#818cf8;border-color:rgba(88,101,242,0.25); }
    .discord-btn:hover { background:rgba(88,101,242,0.25); }
    .forgot { font-size:0.8rem;margin-top:0.75rem;font-family:var(--font-mono); }
    .forgot a { color:var(--accent);text-decoration:none; }
    .sent { color:var(--green);font-size:0.85rem;margin-top:1rem;display:none;font-family:var(--font-mono); }
    a { color:var(--accent);text-decoration:none; }
    .remember { display:flex;align-items:center;gap:8px;margin:0.5rem 0;font-size:0.85rem;color:var(--text-secondary);cursor:pointer;user-select:none; }
    .remember input { width:auto;margin:0;cursor:pointer;accent-color:var(--accent); }
  </style>
</head>
<body>
  <div class="card">
    <h1>SharkQuant&trade;</h1>
    <p class="subtitle">Sign in to your terminal</p>
    <p class="error" id="error">${error ? error : ''}</p>
    <form id="login-form">
      <input type="email" id="email" placeholder="Email" required autocomplete="email">
      <input type="password" id="password" placeholder="Password" required autocomplete="current-password">
      <label class="remember"><input type="checkbox" id="remember" checked> Remember me</label>
      <button type="submit">Sign In</button>
    </form>
    <p class="forgot"><a href="#" id="forgot-link">Forgot password?</a></p>
    <div id="sent-msg" class="sent">Check your inbox for a login link.</div>
    <div class="divider">or</div>
    <a href="/auth/discord"><button class="discord-btn" type="button">Continue with Discord</button></a>
  </div>
  <script>
    var errorEl = document.getElementById('error');
    if (errorEl.textContent) errorEl.classList.add('show');

    document.getElementById('login-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      errorEl.classList.remove('show');
      var btn = this.querySelector('button');
      btn.textContent = 'Signing in...';
      btn.disabled = true;
      try {
        var resp = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: document.getElementById('email').value, password: document.getElementById('password').value, remember: document.getElementById('remember').checked })
        });
        var data = await resp.json();
        if (data.success) {
          window.location.href = data.redirect || '/dashboard';
          return;
        }
        errorEl.textContent = data.error || 'Login failed.';
        errorEl.classList.add('show');
      } catch(err) {
        errorEl.textContent = 'Network error. Try again.';
        errorEl.classList.add('show');
      }
      btn.textContent = 'Sign In';
      btn.disabled = false;
    });

    document.getElementById('forgot-link').addEventListener('click', async function(e) {
      e.preventDefault();
      var email = document.getElementById('email').value;
      if (!email) { errorEl.textContent = 'Enter your email first.'; errorEl.classList.add('show'); return; }
      try {
        var resp = await fetch('/api/auth/request-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        var data = await resp.json();
        if (resp.status === 429) { errorEl.textContent = data.error || 'Too many requests.'; errorEl.classList.add('show'); return; }
      } catch(err) {}
      document.getElementById('sent-msg').style.display = 'block';
    });
  </script>
</body>
</html>`;
}

function getSetPasswordHTML(email) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Set Password | SharkQuant™</title>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root { --bg:#0A0F1C;--bg-surface:rgba(15,23,42,0.85);--border:rgba(251,191,36,0.1);--text:#F8FAFC;--text-secondary:#94A3B8;--accent:#fbbf24;--red:#f87171;--green:#4ade80;--font-heading:'Barlow Condensed','DM Sans',system-ui,sans-serif;--font-body:'Inter',system-ui,sans-serif;--font-mono:'JetBrains Mono',monospace; }
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:var(--bg);color:var(--text-secondary);font-family:var(--font-body);display:flex;align-items:center;justify-content:center;min-height:100vh;background-image:radial-gradient(ellipse at 30% 20%,rgba(251,191,36,0.03) 0%,transparent 60%); }
    .card { text-align:center;max-width:420px;width:100%;padding:2.5rem;border:1px solid rgba(251,191,36,0.12);border-radius:4px;background:rgba(15,23,42,0.85);backdrop-filter:blur(12px); }
    h1 { color:var(--accent);font-family:var(--font-heading);font-size:1.6rem;margin-bottom:0.5rem;letter-spacing:3px;text-transform:uppercase; }
    .subtitle { margin-bottom:1.5rem;font-size:0.85rem;font-family:var(--font-mono);letter-spacing:0.5px; }
    .error { color:var(--red);font-size:0.85rem;margin-bottom:1rem;display:none;font-family:var(--font-mono); }
    .error.show { display:block; }
    input { width:100%;padding:0.7rem 1rem;border:1px solid rgba(251,191,36,0.12);border-radius:3px;background:rgba(0,0,0,0.3);color:var(--text);font-size:0.9rem;font-family:var(--font-body);outline:none;margin-bottom:0.5rem; }
    input:focus { border-color:rgba(251,191,36,0.3);box-shadow:0 0 8px rgba(251,191,36,0.1); }
    button { width:100%;margin-top:0.5rem;padding:0.75rem;background:rgba(251,191,36,0.12);color:var(--accent);border:1px solid rgba(251,191,36,0.25);border-radius:3px;font-weight:700;font-size:0.9rem;cursor:pointer;font-family:var(--font-heading);letter-spacing:1px;text-transform:uppercase;transition:all 0.15s; }
    button:hover { background:rgba(251,191,36,0.2); }
    button:disabled { opacity:0.4;cursor:not-allowed; }
    .pw-strength{height:3px;border-radius:2px;background:rgba(251,191,36,0.06);margin-top:2px;margin-bottom:2px;overflow:hidden}
    .pw-strength-fill{height:100%;border-radius:2px;transition:width .3s,background .3s;width:0}
    .pw-strength-label{font-size:11px;text-align:left;margin-bottom:8px;color:var(--text-secondary);font-family:var(--font-mono)}
  </style>
</head>
<body>
  <div class="card">
    <h1>Set Your Password</h1>
    <p class="subtitle">Welcome to SharkQuant&trade;! Set a password for <strong style="color:var(--text)">${email}</strong> so you can log in anytime.</p>
    <p class="error" id="error"></p>
    <form id="set-pw-form">
      <input type="password" id="password" placeholder="New password (8+ characters)" required minlength="8" autocomplete="new-password">
      <div class="pw-strength"><div class="pw-strength-fill" id="pw-strength-fill"></div></div>
      <div class="pw-strength-label" id="pw-strength-label"></div>
      <input type="password" id="confirm" placeholder="Confirm password" required minlength="8" autocomplete="new-password">
      <button type="submit">Set Password</button>
    </form>
  </div>
  <script>
    document.getElementById('password').addEventListener('input', function() {
      var pw = this.value, fill = document.getElementById('pw-strength-fill'), label = document.getElementById('pw-strength-label');
      var hasMixed = /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
      if (pw.length >= 12 && hasMixed) { fill.style.width = '100%'; fill.style.background = 'var(--green)'; label.textContent = 'Strong'; label.style.color = 'var(--green)'; }
      else if (pw.length >= 8) { fill.style.width = '60%'; fill.style.background = '#EAB308'; label.textContent = 'Fair'; label.style.color = '#EAB308'; }
      else if (pw.length > 0) { fill.style.width = '30%'; fill.style.background = 'var(--red)'; label.textContent = 'Weak'; label.style.color = 'var(--red)'; }
      else { fill.style.width = '0'; label.textContent = ''; }
    });
    document.getElementById('set-pw-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      var errorEl = document.getElementById('error');
      errorEl.classList.remove('show');
      var pw = document.getElementById('password').value;
      var confirm = document.getElementById('confirm').value;
      if (pw !== confirm) { errorEl.textContent = 'Passwords do not match.'; errorEl.classList.add('show'); return; }
      if (pw.length < 8) { errorEl.textContent = 'Password must be at least 8 characters.'; errorEl.classList.add('show'); return; }
      var btn = this.querySelector('button');
      btn.textContent = 'Setting password...';
      btn.disabled = true;
      try {
        var resp = await fetch('/api/auth/set-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw })
        });
        var data = await resp.json();
        if (data.success) { window.location.href = data.redirect || '/dashboard'; return; }
        errorEl.textContent = data.error || 'Failed to set password.';
        errorEl.classList.add('show');
      } catch(err) {
        errorEl.textContent = 'Network error. Try again.';
        errorEl.classList.add('show');
      }
      btn.textContent = 'Set Password';
      btn.disabled = false;
    });
  </script>
</body>
</html>`;
}

module.exports = { configureAuth, requireAuth };
