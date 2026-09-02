import type { Metadata } from "next";
import { MessageCircle, Mail, Clock, MapPin, ChevronDown } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Germania Auto Parts. Chat on WhatsApp, email us, or use the contact form. We respond within 24 hours.",
};

const faqs = [
  {
    q: "How do I find the right part for my vehicle?",
    a: "Use our Vehicle Selector to filter parts by make, model, and year. You can also search by part name, OEM number, or SKU. If you can't find what you need, contact us and we'll source it for you.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes! We ship to Pakistan, the Middle East, Southeast Asia, and worldwide. Shipping rates vary by destination and package weight. See our Shipping Info page for details.",
  },
  {
    q: "What is your return policy?",
    a: "New parts can be returned within 30 days. Used/graded parts within 14 days. Items must be in original condition, uninstalled. See our Returns Policy page for full details.",
  },
  {
    q: "How long does shipping take?",
    a: "German domestic: 1-3 business days. International: 5-14 business days depending on destination. Express options are available.",
  },
  {
    q: "Are used parts tested?",
    a: "Yes. All used parts are inspected and graded by our team in German before listing. Grades range from A (excellent) to D (good working condition with visible wear). Condition notes are included in each listing.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Once your order ships, you'll receive a tracking number by email. You can also view your order status in your account under Order History.",
  },
];

export default function ContactPage() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace("+", "") || "123456789";

  return (
    <main className="py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="mt-2 text-muted-foreground">
            Have a question about a part? We&apos;re here to help.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border p-6 md:p-8">
              <h2 className="text-lg font-semibold mb-6">Send a Message</h2>
              <ContactForm />
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-xl border p-5 hover:bg-muted/50 transition-colors group"
            >
              <div className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-muted-foreground">
                  {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+81 80-9861-1876"}
                </p>
                <p className="text-sm text-red-600 font-medium mt-1 group-hover:underline">
                  Chat on WhatsApp →
                </p>
              </div>
            </a>

            <div className="flex items-start gap-4 rounded-xl border p-5">
              <div className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <Mail className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <a
                  href="mailto:mohamedkhaleifa362@gmail.com"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  mohamedkhaleifa362@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border p-5">
              <div className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Business Hours</p>
                <p className="text-sm text-muted-foreground">
                  Mon–Sat: 9AM–6PM JST
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  German Standard Time (CET, UTC+1)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border p-5">
              <div className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold">Location</p>
                <p className="text-sm text-muted-foreground">Berlin, German</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border"
              >
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
        </div>
      </div>
    </main>
  );
}