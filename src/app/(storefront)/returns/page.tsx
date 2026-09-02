import type { Metadata } from "next";
import { CheckCircle, XCircle, MessageCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Refund Policy",
  description:
    "Germania Auto Parts 30-day return policy for new parts and 14-day policy for used parts. Learn how to return items and get a refund.",
};

export default function ReturnsPage() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace("+", "") || "818098611876";

  return (
    <main className="py-10 md:py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Home</Link>
          {" › "}
          <span>Returns Policy</span>
        </div>
        <h1 className="text-3xl font-bold mb-1">Returns &amp; Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: Aug 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-10">

          {/* Return Window */}
          <section>
            <h2 className="text-xl font-bold mb-4">Return Window</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border p-5">
                <p className="text-2xl font-bold text-red-600">30 days</p>
                <p className="font-medium mt-1">New Parts</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Unopened, in original packaging
                </p>
              </div>
              <div className="rounded-xl border p-5">
                <p className="text-2xl font-bold text-amber-600">14 days</p>
                <p className="font-medium mt-1">Used / Graded Parts</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Part doesn&apos;t match description or is defective
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Return window begins from the date of delivery as confirmed by the shipping carrier.
            </p>
          </section>

          {/* Eligible / Not Eligible */}
          <section>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-bold">Eligible for Return</h2>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    New parts in unopened original packaging
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Used parts that don&apos;t match the description
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Damaged items (report within 48 hours of delivery)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Wrong item shipped (our error)
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-bold">Not Eligible</h2>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    Installed or used parts
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    Electrical parts that have been connected or tested
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    Custom or special-order items
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    Items returned after the return window
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    Items damaged due to improper installation
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Return Process */}
          <section>
            <h2 className="text-xl font-bold mb-4">How to Return</h2>
            <ol className="space-y-4">
              {[
                { step: 1, title: "Request a Return", desc: "Log in to your account → Orders → select the order → click \"Request Return\". Guest orders: contact us via WhatsApp or email with your order number." },
                { step: 2, title: "Select Items & Reason", desc: "Choose the items you wish to return and provide the reason (wrong item, not as described, damaged, changed mind, etc.)." },
                { step: 3, title: "Receive Return Label", desc: "We'll send you a return shipping label or instructions within 24 business hours. For international returns, you'll arrange and pay for return shipping." },
                { step: 4, title: "Ship the Item", desc: "Pack the item securely and ship it back using the provided label. Keep your tracking number — we're not responsible for items lost in transit without tracking." },
                { step: 5, title: "Refund Processed", desc: "Once we receive and inspect the item, your refund will be processed within 5–7 business days back to your original payment method." },
              ].map(({ step, title, desc }) => (
                <li key={step} className="flex gap-4">
                  <span className="flex-shrink-0 h-7 w-7 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center">
                    {step}
                  </span>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Refunds */}
          <section>
            <h2 className="text-xl font-bold mb-4">Refunds</h2>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3 font-medium">Refund Method</td>
                    <td className="p-3 text-muted-foreground">Original payment method (card, Apple Pay, bank transfer)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Processing Time</td>
                    <td className="p-3 text-muted-foreground">5–7 business days after receipt</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Shipping Costs</td>
                    <td className="p-3 text-muted-foreground">Non-refundable unless item was damaged or wrong item shipped</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">International Returns</td>
                    <td className="p-3 text-muted-foreground">Return shipping costs are the buyer&apos;s responsibility</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Partial Refunds</td>
                    <td className="p-3 text-muted-foreground">May apply if item is not in original condition</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Questions */}
          <section className="rounded-xl bg-muted/50 p-6 text-center">
            <p className="font-medium mb-4">Questions about a return?</p>
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
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}