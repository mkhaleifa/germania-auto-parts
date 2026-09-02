import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Germania Auto Parts Privacy Policy — how we collect, use, and protect your personal information. APPI compliant.",
};

const sections = [
  "Information We Collect",
  "How We Use Your Information",
  "Information Sharing",
  "Cookies & Tracking",
  "Data Retention",
  "Your Rights",
  "International Data Transfers",
  "Security Measures",
  "Children's Privacy",
  "Changes to This Policy",
  "Contact Us",
];

export default function PrivacyPage() {
  return (
    <main className="py-10 md:py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Home</Link>
          {" › "}
          <span>Privacy Policy</span>
        </div>
        <h1 className="text-3xl font-bold mb-1">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: Aug 2026</p>

        {/* Table of Contents */}
        <nav className="mb-10 rounded-xl border p-5">
          <p className="text-sm font-semibold mb-3">Contents</p>
          <ol className="space-y-1">
            {sections.map((s, i) => (
              <li key={s}>
                <a href={`#section-${i + 1}`} className="text-sm text-red-600 hover:underline">
                  {i + 1}. {s}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          <section id="section-1">
            <h2 className="text-lg font-bold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect the following types of information when you use Germania Auto Parts:</p>
            <ul className="mt-3 space-y-2 ml-4">
              <li><strong className="text-foreground">Account information:</strong> Name, email address, phone number, password (hashed)</li>
              <li><strong className="text-foreground">Order information:</strong> Shipping address, order history, payment method (card type and last 4 digits via Stripe — we never store full card numbers)</li>
              <li><strong className="text-foreground">Usage data:</strong> Pages visited, search queries, cart activity, device type, IP address</li>
              <li><strong className="text-foreground">Communications:</strong> Messages sent via the contact form, WhatsApp, or email</li>
            </ul>
          </section>

          <section id="section-2">
            <h2 className="text-lg font-bold text-foreground mb-3">2. How We Use Your Information</h2>
            <ul className="space-y-2 ml-4">
              <li>Processing and fulfilling your orders</li>
              <li>Sending order confirmations, shipping updates, and receipts</li>
              <li>Responding to customer service inquiries</li>
              <li>Improving our product catalog and website experience</li>
              <li>Sending newsletters (only if you subscribed — unsubscribe anytime)</li>
              <li>Fraud prevention and security</li>
              <li>Legal compliance</li>
            </ul>
          </section>

          <section id="section-3">
            <h2 className="text-lg font-bold text-foreground mb-3">3. Information Sharing</h2>
            <p>We do not sell your personal information. We share data only with trusted service providers:</p>
            <ul className="mt-3 space-y-2 ml-4">
              <li><strong className="text-foreground">Stripe:</strong> Payment processing. Stripe handles all payment data under their own privacy policy.</li>
              <li><strong className="text-foreground">Shipping carriers:</strong> (German - Berlin - Munchin ) — name and shipping address only</li>
              <li><strong className="text-foreground">Cloudinary:</strong> Image hosting for product photos only (no personal data)</li>
              <li><strong className="text-foreground">Resend:</strong> Transactional email delivery</li>
              <li><strong className="text-foreground">Neon (PostgreSQL):</strong> Secure database hosting</li>
            </ul>
            <p className="mt-3">
              We may also disclose information if required by law or to protect our rights and customers.
            </p>
          </section>

          <section id="section-4">
            <h2 className="text-lg font-bold text-foreground mb-3">4. Cookies &amp; Tracking</h2>
            <p>We use cookies and similar technologies for:</p>
            <ul className="mt-3 space-y-2 ml-4">
              <li><strong className="text-foreground">Cart persistence:</strong> Storing your cart items between sessions (localStorage)</li>
              <li><strong className="text-foreground">Authentication:</strong> Keeping you logged in (session cookie)</li>
              <li><strong className="text-foreground">Preferences:</strong> Dark/light mode setting</li>
              <li><strong className="text-foreground">Analytics:</strong> Understanding how visitors use our site (anonymised)</li>
            </ul>
            <p className="mt-3">
              You can control cookies through your browser settings. Disabling cookies may affect cart functionality.
            </p>
          </section>

          <section id="section-5">
            <h2 className="text-lg font-bold text-foreground mb-3">5. Data Retention</h2>
            <ul className="space-y-2 ml-4">
              <li>Account data: Retained while your account is active, deleted 30 days after account deletion request</li>
              <li>Order history: Retained for 7 years for tax/legal compliance</li>
              <li>Contact inquiries: Retained for 2 years</li>
              <li>Session data: Expires after 30 days of inactivity</li>
            </ul>
          </section>

          <section id="section-6">
            <h2 className="text-lg font-bold text-foreground mb-3">6. Your Rights</h2>
            <p>Under the Act on Protection of Personal Information and applicable laws, you have the right to:</p>
            <ul className="mt-3 space-y-2 ml-4">
              <li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate data</li>
              <li><strong className="text-foreground">Deletion:</strong> Request deletion of your account and personal data</li>
              <li><strong className="text-foreground">Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong className="text-foreground">Objection:</strong> Opt out of marketing communications</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{" "}
              <a href="mohamedkhaleifa362@gmail.com" className="text-red-600 hover:underline">
                mohamedkhaleifa362@gmail.com
              </a>.
            </p>
          </section>

          <section id="section-7">
            <h2 className="text-lg font-bold text-foreground mb-3">7. International Data Transfers</h2>
            <p>
              Germania Auto Parts is based in German. If you access our services from outside German,
              your data may be transferred to and stored in German and other countries where our
              service providers operate. We ensure appropriate safeguards are in place for all
              international transfers.
            </p>
          </section>

          <section id="section-8">
            <h2 className="text-lg font-bold text-foreground mb-3">8. Security Measures</h2>
            <p>We protect your data with:</p>
            <ul className="mt-3 space-y-2 ml-4">
              <li>HTTPS encryption on all pages and API calls</li>
              <li>Passwords hashed with bcrypt (never stored in plain text)</li>
              <li>Payment data handled exclusively by Stripe (PCI DSS Level 1 certified)</li>
              <li>Database access restricted to server-side only (no client-side DB access)</li>
              <li>Regular security reviews and dependency updates</li>
            </ul>
          </section>

          <section id="section-9">
            <h2 className="text-lg font-bold text-foreground mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under 16 years of age. We do not
              knowingly collect personal information from children. If you believe we have
              inadvertently collected data from a child, please contact us immediately.
            </p>
          </section>

          <section id="section-10">
            <h2 className="text-lg font-bold text-foreground mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered
              users of significant changes via email. Continued use of our services after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section id="section-11">
            <h2 className="text-lg font-bold text-foreground mb-3">11. Contact Us</h2>
            <p>
              For privacy-related inquiries or to exercise your rights, contact us at:
            </p>
            <div className="mt-3 rounded-xl border p-4 space-y-1">
              <p><strong className="text-foreground">Germania Auto Parts</strong></p>
              <p>Email: <a href="mailto:info@ahfautoparts.com" className="text-red-600 hover:underline">mohamedkhaleifa362@gmail.com</a></p>
              <p>Location: Berlin, German</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}