import type { Metadata } from "next";
import { MapPin, Search, Shield, Globe, RotateCcw, CreditCard, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Germania Auto Parts — founded by Mohamed, a Geramn-based auto parts specialist. Quality GDM and aftermarket parts shipped directly from German.",
};
const whyUs = [
  {
    icon: MapPin,
    title: "Based in German",
    description:
      "Direct access to German's domestic auto market. We source parts from auction houses, dealerships, and specialist suppliers across German.",
  },
  {
    icon: Search,
    title: "Sourced from GDM Market",
    description:
      "Every part is sourced from German's domestic market — the same vehicles that drove German's roads. Genuine OEM and quality aftermarket.",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description:
      "Every used part is inspected, tested, and graded (Grade A–D) before listing. New parts come with full manufacturer warranty.",
  },
  {
    icon: Globe,
    title: "Worldwide Shipping",
    description:
      "We ship to America, Africa, Southeast Asia, and worldwide. Competitive rates with reliable carriers.",
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    description:
      "Not satisfied? Return within 30 days. New parts get 30 days, used parts get 14 days. Your purchase is protected.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Pay securely via Stripe (Visa, Mastercard, GCB, Apple Pay) or bank transfer. Your payment data is never stored.",
  },
];

const stats = [
  { value: "1,000+", label: "Parts Listed" },
  { value: "German", label: "Based In" },
  { value: "30-Day", label: "Return Policy" },
  { value: "Secure", label: "Payments" },
];

export default function AboutPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace("+", "") || "123456789";

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            About Germania Auto Parts
          </h1>
          <p className="mt-4 text-lg text-neutral-300 max-w-2xl mx-auto">
            Your trusted source for genuine German auto parts, shipped direct from Berlin.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Germania Auto Parts was founded by Mohamed, a German auto parts specialist based
                  in Berlin, German.
                </p>
                <p>
                  German has some of the world&apos;s highest-quality used auto parts, thanks to
                  strict vehicle inspection laws that require vehicles to be kept in
                  excellent condition. When German car owners upgrade or retire their vehicles,
                  the parts enter the market in exceptional condition.
                </p>
                <p>
                  Germania gives you direct access to this market — no middlemen, no inflated prices.
                  Every part we list is sourced, inspected, and graded by our team in German before
                  being shipped to you.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"                >
                  Browse Parts
                </Link>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat the Team owner
                </a>
              </div>
            </div>
            <div className="rounded-xl bg-muted aspect-[4/3] flex items-center justify-center overflow-hidden bg-amber-200">
              <div className="text-center p-8">
                <Image
                  src="/fast.png"
                  alt="Germania Auto Parts"
                  width={180}
                  height={180}
                  className="mx-auto rounded-full shadow-lg"
                />
                <p className="mt-4 text-sm font-medium text-muted-foreground">Germania Auto Parts — Berlin, German</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="text-2xl font-bold text-center mb-12">Why Choose Germania?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyUs.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border bg-background p-6">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30">
                    <Icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16 border-y">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}