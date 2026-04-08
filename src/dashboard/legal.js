const LOGO_URL = '/assets/images/logo.png?v=4';

function shell(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — SharkQuant™</title>
<link rel="icon" type="image/png" href="${LOGO_URL}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#000;--bg-surface:#0A0A0F;--border:#1A1A25;--text:#F0F0F5;--text-secondary:#8888A0;--text-muted:#55556A;--accent:#3B82F6;--accent-bright:#60A5FA;--font-heading:'DM Sans',system-ui,sans-serif;--font-body:'Inter',system-ui,sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);line-height:1.7;-webkit-font-smoothing:antialiased}
.legal-wrap{max-width:720px;margin:0 auto;padding:48px 24px 80px}
.legal-back{display:inline-flex;align-items:center;gap:6px;color:var(--accent-bright);font-size:14px;text-decoration:none;margin-bottom:32px}
.legal-back:hover{text-decoration:underline}
h1{font-family:var(--font-heading);font-size:28px;font-weight:700;margin-bottom:8px}
.legal-updated{color:var(--text-muted);font-size:13px;margin-bottom:32px}
h2{font-family:var(--font-heading);font-size:18px;font-weight:600;margin:32px 0 12px;color:var(--text)}
h3{font-family:var(--font-heading);font-size:15px;font-weight:600;margin:20px 0 8px;color:var(--text-secondary)}
p,li{color:var(--text-secondary);font-size:14px;margin-bottom:12px}
ul,ol{padding-left:24px;margin-bottom:16px}
li{margin-bottom:6px}
a{color:var(--accent-bright)}
.legal-footer{border-top:1px solid var(--border);margin-top:48px;padding-top:24px;text-align:center;color:var(--text-muted);font-size:12px}
</style>
</head>
<body>
<div class="legal-wrap">
<a href="/" class="legal-back">&larr; Back to SharkQuant&trade;</a>
${content}
<div class="legal-footer">&copy; 2026 Rheo Agora LLC, d/b/a SharkQuant. All rights reserved.</div>
</div>
</body>
</html>`;
}

function getTermsHTML() {
  return shell('Terms of Service', `
<h1>Terms of Service</h1>
<p class="legal-updated">Last updated: March 4, 2026</p>

<h2>1. Agreement to Terms</h2>
<p>By accessing or using the SharkQuant platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). The Service is operated by Rheo Agora LLC, d/b/a SharkQuant ("Company," "we," "us," or "our"). If you do not agree to these Terms, do not use the Service.</p>

<h2>2. Description of Service</h2>
<p>SharkQuant provides market structure analysis, gamma exposure (GEX) data, options flow analytics, and AI-powered trading research tools via a web-based dashboard. The Service is offered on a subscription basis.</p>

<h2>3. Eligibility</h2>
<p>You must be at least 18 years old and legally able to enter into contracts in your jurisdiction. By using the Service, you represent and warrant that you meet these requirements.</p>

<h2>4. Account Registration</h2>
<p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to notify us immediately of any unauthorized use. We reserve the right to suspend or terminate accounts that violate these Terms.</p>

<h2>5. Subscriptions and Billing</h2>
<ul>
<li>The Service is offered under paid subscription plans billed on a monthly recurring basis.</li>
<li>By subscribing, you authorize us to charge your payment method on a recurring monthly cycle.</li>
<li>Prices are subject to change with 30 days' notice.</li>
<li>You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period.</li>
</ul>

<h2>6. Acceptable Use</h2>
<p>You agree not to:</p>
<ul>
<li>Reverse-engineer, scrape, or redistribute any data or content from the Service.</li>
<li>Share your account credentials or allow others to access your account.</li>
<li>Use the Service for any unlawful purpose or in violation of any applicable regulation.</li>
<li>Attempt to interfere with or disrupt the Service's infrastructure.</li>
<li>Resell, sublicense, or commercially exploit the Service without our written consent.</li>
</ul>

<h2>7. Intellectual Property</h2>
<p>All content, data models, analytics, branding, and software comprising the Service are the property of Rheo Agora LLC or its licensors. You are granted a limited, non-exclusive, non-transferable license to use the Service for personal, non-commercial purposes during your active subscription.</p>

<h2>8. Not Financial Advice</h2>
<p>The Service provides informational and analytical tools only. Nothing provided through the Service constitutes financial advice, investment recommendations, or a solicitation to buy or sell securities. See our <a href="/risk-disclosure">Risk Disclosure</a> for details.</p>

<h2>9. Limitation of Liability</h2>
<p>To the maximum extent permitted by law, Rheo Agora LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or trading losses, arising out of or related to your use of the Service.</p>
<p>Our total aggregate liability shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.</p>

<h2>10. Disclaimer of Warranties</h2>
<p>The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>

<h2>11. Indemnification</h2>
<p>You agree to indemnify and hold harmless Rheo Agora LLC, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.</p>

<h2>12. Termination</h2>
<p>We may suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. Upon termination, your right to use the Service ceases immediately.</p>

<h2>13. Governing Law</h2>
<p>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of law principles.</p>

<h2>14. Changes to Terms</h2>
<p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email or a notice on the Service. Continued use after changes constitutes acceptance of the updated Terms.</p>

<h2>15. Contact</h2>
<p>For questions about these Terms, contact us at <a href="mailto:support@sharkquant.ai">support@sharkquant.ai</a>.</p>
`);
}

function getPrivacyHTML() {
  return shell('Privacy Policy', `
<h1>Privacy Policy</h1>
<p class="legal-updated">Last updated: March 4, 2026</p>

<h2>1. Introduction</h2>
<p>Rheo Agora LLC, d/b/a SharkQuant ("Company," "we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the SharkQuant platform ("Service").</p>

<h2>2. Information We Collect</h2>
<h3>Information You Provide</h3>
<ul>
<li><strong>Account information:</strong> Email address and password when you register.</li>
<li><strong>Payment information:</strong> Billing details processed by our third-party payment processor. We do not store full credit card numbers.</li>
<li><strong>Communications:</strong> Messages you send to us via email or support channels.</li>
</ul>
<h3>Information Collected Automatically</h3>
<ul>
<li><strong>Usage data:</strong> Pages viewed, features used, timestamps, and interaction patterns.</li>
<li><strong>Device data:</strong> Browser type, operating system, IP address, and device identifiers.</li>
<li><strong>Cookies:</strong> Session cookies for authentication and preferences. We do not use third-party advertising cookies.</li>
</ul>

<h2>3. How We Use Your Information</h2>
<ul>
<li>To provide, maintain, and improve the Service.</li>
<li>To process subscriptions and payments.</li>
<li>To send account-related communications (billing, security, service updates).</li>
<li>To respond to support inquiries.</li>
<li>To detect and prevent fraud or abuse.</li>
<li>To comply with legal obligations.</li>
</ul>

<h2>4. Third-Party Service Providers</h2>
<p>We use third-party services for payment processing, email delivery, authentication, and infrastructure hosting. These providers access your data only to perform services on our behalf and are contractually obligated to protect it.</p>

<h2>5. Data Retention</h2>
<p>We retain your personal information for as long as your account is active or as needed to provide the Service. Upon account deletion, we will remove your personal data within 30 days, except where retention is required by law.</p>

<h2>6. Data Security</h2>
<p>We implement reasonable administrative, technical, and physical safeguards to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>

<h2>7. Your Rights</h2>
<p>Depending on your jurisdiction, you may have the right to:</p>
<ul>
<li>Access the personal data we hold about you.</li>
<li>Request correction or deletion of your data.</li>
<li>Opt out of marketing communications.</li>
<li>Request a copy of your data in a portable format.</li>
</ul>
<p>To exercise these rights, contact us at <a href="mailto:support@sharkquant.ai">support@sharkquant.ai</a>.</p>

<h2>8. Children's Privacy</h2>
<p>The Service is not intended for individuals under 18. We do not knowingly collect data from minors.</p>

<h2>9. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or through the Service.</p>

<h2>10. Contact</h2>
<p>For privacy-related inquiries, contact us at <a href="mailto:support@sharkquant.ai">support@sharkquant.ai</a>.</p>
`);
}

function getRiskDisclosureHTML() {
  return shell('Risk Disclosure', `
<h1>Risk Disclosure</h1>
<p class="legal-updated">Last updated: March 4, 2026</p>

<h2>Important Notice</h2>
<p>This risk disclosure is provided by Rheo Agora LLC, d/b/a SharkQuant. Please read it carefully before using the Service.</p>

<h2>Not a Registered Investment Adviser</h2>
<p>Rheo Agora LLC is not a registered investment adviser, broker-dealer, or financial planner. The Service does not provide personalized investment advice, and no fiduciary relationship is created between us and any user.</p>

<h2>Not Financial Advice</h2>
<p>All content, data, analytics, AI-generated output, and commentary provided through the Service are for informational and educational purposes only. Nothing on SharkQuant constitutes a recommendation or solicitation to buy, sell, or hold any security, derivative, or financial instrument.</p>

<h2>Trading Risks</h2>
<ul>
<li>Trading securities, options, and derivatives involves substantial risk of loss and is not suitable for all investors.</li>
<li>You may lose more than your initial investment.</li>
<li>Options trading carries unique risks including the potential for rapid and total loss of premium.</li>
<li>Leveraged and short positions amplify both gains and losses.</li>
</ul>

<h2>No Guarantees</h2>
<ul>
<li>Past performance does not guarantee future results.</li>
<li>No trading strategy, model, or analytical tool can guarantee profits or prevent losses.</li>
<li>Market conditions can change rapidly and unpredictably.</li>
<li>Data feeds, computations, and AI outputs may contain errors or delays.</li>
</ul>

<h2>Your Responsibility</h2>
<p>You are solely responsible for your own trading and investment decisions. You should consult with a qualified financial adviser before making any investment decisions. You should only trade with capital you can afford to lose.</p>

<h2>Contact</h2>
<p>Questions about this disclosure may be directed to <a href="mailto:support@sharkquant.ai">support@sharkquant.ai</a>.</p>
`);
}

function getDisclaimerHTML() {
  return shell('Disclaimer', `
<h1>Disclaimer</h1>
<p class="legal-updated">Last updated: March 4, 2026</p>

<h2>General Disclaimer</h2>
<p>The information provided by Rheo Agora LLC, d/b/a SharkQuant ("Company") through the SharkQuant platform ("Service") is for general informational and educational purposes only. All information on the Service is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Service.</p>

<h2>Educational Purpose</h2>
<p>The Service is designed to help users understand market structure, gamma exposure, options flow, and related analytical concepts. It is intended as a research and educational tool, not as a trading signal service or financial advisory platform.</p>

<h2>Past Performance</h2>
<p>Any references to past performance, historical data, backtested results, or example trades are provided for illustrative purposes only. Past performance is not indicative of future results. Hypothetical or simulated performance results have inherent limitations and do not represent actual trading.</p>

<h2>AI-Generated Content</h2>
<p>Portions of the Service utilize artificial intelligence and machine learning models to generate analysis, commentary, and insights. AI-generated content may contain errors, inaccuracies, or biases. Users should independently verify any information before making decisions based on it.</p>

<h2>Data Accuracy</h2>
<p>While we strive to provide accurate and timely data, we do not guarantee that all data, analytics, or computations are error-free or current. Market data may be delayed. Users should not rely solely on the Service for time-sensitive trading decisions.</p>

<h2>Third-Party Content</h2>
<p>The Service may reference or link to third-party content. We do not endorse and are not responsible for the accuracy or reliability of any third-party information.</p>

<h2>Limitation</h2>
<p>Under no circumstances shall Rheo Agora LLC be liable for any loss or damage arising from reliance on information provided through the Service.</p>

<h2>Contact</h2>
<p>For questions about this disclaimer, contact us at <a href="mailto:support@sharkquant.ai">support@sharkquant.ai</a>.</p>
`);
}

function getRefundPolicyHTML() {
  return shell('Refund Policy', `
<h1>Refund Policy</h1>
<p class="legal-updated">Last updated: March 4, 2026</p>

<h2>Subscription-Based Service</h2>
<p>SharkQuant, operated by Rheo Agora LLC, is a subscription-based service billed on a monthly recurring basis. By subscribing, you agree to the following terms regarding cancellations and refunds.</p>

<h2>Cancellation</h2>
<ul>
<li>You may cancel your subscription at any time through the dashboard or by contacting us at <a href="mailto:support@sharkquant.ai">support@sharkquant.ai</a>.</li>
<li>Cancellation takes effect at the end of your current billing period.</li>
<li>You will retain access to the Service until the end of the period you have already paid for.</li>
<li>No partial or prorated refunds are issued for unused time within a billing period.</li>
</ul>

<h2>Refund Eligibility</h2>
<ul>
<li>We generally do not offer refunds for subscription charges.</li>
<li>In exceptional circumstances (e.g., duplicate charges, billing errors, or extended service outages), refund requests may be considered on a case-by-case basis.</li>
<li>Refund requests must be submitted within 7 days of the charge in question.</li>
</ul>

<h2>How to Request a Refund</h2>
<p>To request a refund, email <a href="mailto:support@sharkquant.ai">support@sharkquant.ai</a> with your account email and a description of the issue. We will respond within 3 business days.</p>

<h2>Processing</h2>
<p>Approved refunds will be credited back to the original payment method within 5–10 business days, depending on your financial institution.</p>

<h2>Changes to This Policy</h2>
<p>We reserve the right to update this Refund Policy at any time. Changes will be posted on this page with an updated effective date.</p>

<h2>Contact</h2>
<p>For billing inquiries, contact us at <a href="mailto:support@sharkquant.ai">support@sharkquant.ai</a>.</p>
`);
}

function registerLegalRoutes(app) {
  app.get('/terms', (req, res) => res.send(getTermsHTML()));
  app.get('/privacy', (req, res) => res.send(getPrivacyHTML()));
  app.get('/risk-disclosure', (req, res) => res.send(getRiskDisclosureHTML()));
  app.get('/disclaimer', (req, res) => res.send(getDisclaimerHTML()));
  app.get('/refund-policy', (req, res) => res.send(getRefundPolicyHTML()));
}

module.exports = { registerLegalRoutes };
