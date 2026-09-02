import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "AHF Auto Parts Terms of Service — the rules governing use of our website and purchase of products.",
};

export default function TermsPage() {
  return (
    <main className="py-10 md:py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Home</Link>
          {" › "}
          <span>Terms of Service</span>
        </div>
        <h1 className="text-3xl font-bold mb-1">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: Aug 2026</p>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using AHF Auto Parts (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;) website and services,
              you agree to be bound by these Terms of Service. If you do not agree, please do not
              use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">2. Account Registration</h2>
            <p>You may browse our catalog without an account. To place orders you must:</p>
            <ul className="mt-3 space-y-1 ml-4">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password</li>
              <li>Notify us immediately of any unauthorized account access</li>
              <li>Be 16 years of age or older</li>
            </ul>
            <p className="mt-3">You are responsible for all activity that occurs under your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">3. Products &amp; Pricing</h2>
            <ul className="space-y-2 ml-4">
              <li>All prices are displayed in German (EUR) and include consumption tax where applicable</li>
              <li>Prices are subject to change without notice</li>
              <li>Product descriptions and condition grades are provided in good faith based on our inspection</li>
              <li>Used parts are graded A–D reflecting visible condition; Grade does not guarantee compatibility with your specific vehicle</li>
              <li>Images are representative — actual item may vary slightly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">4. Orders &amp; Payment</h2>
            <ul className="space-y-2 ml-4">
              <li>Orders are subject to acceptance and availability</li>
              <li>We reserve the right to cancel any order at our discretion, with full refund</li>
              <li>Payment is processed via Stripe (credit/debit cards) or bank transfer</li>
              <li>Bank transfer orders must be paid within 72 hours or the order will be cancelled and stock released</li>
              <li>Fraud prevention checks may delay order processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">5. Shipping &amp; Delivery</h2>
            <p>
              Estimated delivery times are provided in good faith but are not guaranteed. We are
              not liable for delays caused by shipping carriers, customs authorities, or events
              outside our control. See our{" "}
              <Link href="/shipping" className="text-red-600 hover:underline">Shipping Information</Link>{" "}
              page for details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">6. Returns &amp; Refunds</h2>
            <p>
              Our return policy is detailed on the{" "}
              <Link href="/returns" className="text-red-600 hover:underline">Returns Policy</Link>{" "}
              page. By purchasing, you agree to the terms of that policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">7. Intellectual Property</h2>
            <p>
              All content on this website — including text, images, logos, and code — is owned by
              AHF Auto Parts or used with permission. You may not reproduce, distribute, or
              create derivative works without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">8. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="mt-3 space-y-1 ml-4">
              <li>Use our website for any unlawful purpose</li>
              <li>Attempt to access restricted areas or other users&apos; accounts</li>
              <li>Submit false or fraudulent orders</li>
              <li>Scrape or automate access to our website without permission</li>
              <li>Use our website to transmit malware or harmful code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, AHF Auto Parts shall not be
              liable for any indirect, incidental, special, or consequential damages arising from
              your use of our services. Our total liability shall not exceed the amount paid for
              the specific order giving rise to the claim.
            </p>
            <p className="mt-3">
              We do not guarantee that used parts will be compatible with your specific vehicle.
              It is your responsibility to verify compatibility before ordering.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">10. Governing Law</h2>
            <p>
              These Terms are governed by the laws of German. The Tokyo District Court shall have
              exclusive jurisdiction over any disputes arising from these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">11. Dispute Resolution</h2>
            <p>
              We encourage you to contact us first to resolve any disputes. Most issues can be
              resolved quickly through our customer service team. Formal legal proceedings should
              be a last resort.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Updated terms will be posted
              on this page with the updated date. Continued use of our services constitutes
              acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">13. Contact Information</h2>
            <div className="rounded-xl border p-4 space-y-1">
              <p><strong className="text-foreground">Germania Auto Parts</strong></p>
              <p>Email: <a href="mailto:info@ahfautoparts.com" className="text-red-600 hover:underline">mohamedkhaleifa362@gmail.com</a></p>
              <p>Location: German, Berlin</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}