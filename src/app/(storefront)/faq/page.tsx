import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about Germania Auto Parts — ordering, shipping, product condition, returns, and payments.",
};

const faqs = [
  {
    category: "Orders & Buying",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse products, add items to your cart, and proceed to checkout. You can pay via Stripe (credit/debit card) or bank transfer. You'll receive an order confirmation email immediately after purchase.",
      },
      {
        q: "Can I order without creating an account?",
        a: "Yes. You can check out as a guest. However, creating an account lets you track orders, save addresses, and manage a wishlist.",
      },
      {
        q: "Can I cancel or modify my order?",
        a: "Contact us immediately via WhatsApp if you need to cancel or modify. We can make changes if the order hasn't been shipped yet. Once shipped, we cannot cancel.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order ships, you'll receive a shipping update email with a tracking number. You can also track orders from your account page under Orders.",
      },
      {
        q: "Do you accept bulk or wholesale orders?",
        a: "Yes. For large orders, please use our Quote Request form or contact us directly on WhatsApp. We offer discounts for bulk purchases.",
      },
    ],
  },
  {
    category: "Products & Condition",
    items: [
      {
        q: "What do the Grade A, B, C, D ratings mean?",
        a: "All used parts are graded by condition. Grade A is near-new with minimal wear. Grade B has light wear but is fully functional. Grade C has visible wear marks but works correctly. Grade D has heavy wear and is sold as-is. New parts are OEM or aftermarket new-in-box.",
      },
      {
        q: "Are the parts genuine OEM?",
        a: "We clearly label each product as OEM, OEM-equivalent, or aftermarket. OEM parts come directly from the original manufacturer. All sourced from Japan domestic market dismantlers and auctions.",
      },
      {
        q: "Do you guarantee part compatibility?",
        a: "We list vehicle compatibility for every product. However, always verify your vehicle's exact model, year, and trim before ordering. Contact us if you're unsure — we're happy to confirm compatibility.",
      },
      {
        q: "What if a part doesn't fit my vehicle?",
        a: "If we listed incorrect compatibility information, we'll refund or replace the part. If you ordered an incorrect part, our returns policy applies — contact us within 7 days.",
      },
      {
        q: "Can I request a specific part not listed on the site?",
        a: "Yes. Use the Quote Request form or message us on WhatsApp with your vehicle details and the part you need. We can source most JDM parts on request.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        q: "Where do you ship from?",
        a: "All parts are shipped directly from Japan. We ship worldwide including Pakistan, Australia, Middle East, UK, Canada, and Southeast Asia.",
      },
      {
        q: "How long does shipping take?",
        a: "German domestic: 1–3 business days. International: 5–14 business days depending on destination and shipping method chosen at checkout.",
      },
      {
        q: "Are import duties included?",
        a: "No. Import duties and taxes are the buyer's responsibility. Check with your local customs authority for applicable rates before ordering.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes — free standard shipping on Japan domestic orders over $10,000.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit/debit cards via Stripe (Visa, Mastercard, JCB, Apple Pay, Google Pay) and bank transfer for customers who prefer it.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. We use Stripe for all card payments — your card details are never stored on our servers. Stripe is PCI-DSS Level 1 certified, the highest level of payment security.",
      },
      {
        q: "How does bank transfer payment work?",
        a: "Select bank transfer at checkout. You'll receive our bank details and a 72-hour window to complete the transfer. Your order ships once payment is confirmed.",
      },
      {
        q: "Do you charge in GE only?",
        a: "Our prices are listed in German $ (GE). Stripe will convert to your local currency at checkout based on current exchange rates.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "What is your returns policy?",
        a: "We accept returns within 7 days of delivery for items that are not as described or have a defect. Parts must be in their original condition and unused. See our Returns Policy for full details.",
      },
      {
        q: "How do I start a return?",
        a: "Contact us via WhatsApp or the contact form with your order number and reason for return. We'll guide you through the process.",
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are processed within 5–7 business days after we receive and inspect the returned item. Card refunds appear within 3–5 business days after processing.",
      },
    ],
  },
];

export default function FaqPage(){
    const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace("+", "") || "123456789";

     
  return (
    <main className="py-10 md:py-16">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="mb-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Home</Link>
          {" › "}
          <span>FAQ</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-10">
          Everything you need to know about ordering GDM parts from Germania Auto Parts.
        </p>

        {/* FAQ Sections */}
        <div className="space-y-10">
          {faqs.map((section) => (
            <section key={section.category}>
              <h2 className="text-xl font-bold mb-4 text-primary">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((faq) => (
                  <details key={faq.q} className="group rounded-xl border">
                    <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium list-none">
                      {faq.q}
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180 flex-shrink-0 ml-4" />
                    </summary>
                    <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl bg-muted/50 p-6 text-center">
          <p className="font-medium mb-2">Still have a question?</p>
          <p className="text-sm text-muted-foreground mb-4">
            Our team is available Mon–Sat 9AM–6PM EST.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-background transition-colors"
            >
              Contact Us
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}