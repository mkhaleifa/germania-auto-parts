import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  MessageCircle,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constant";
import { NewsletterForm } from "./newsletter-form";

const shopLinks = [
  { href: "/products", label: "All Products" },
  { href: "/products?sort=newest", label: "New Arrivals" },
  { href: "/products?condition=NEW", label: "New Parts" },
  { href: "/vehicles", label: "Shop by Vehicle" },
];

const supportLinks = [
  { href: "/contact", label: "Contact Us" },
  { href: "/shipping", label: "Shipping Info" },
  { href: "/returns", label: "Returns Policy" },
  { href: "/faq", label: "FAQ" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/tokushoho", label: "Specified Commercial Law" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace("+", "") ||
    "123456789";

  return (
    <footer className="border-t border-border bg-card text-foreground">
      {/* Premium divider */}
      <div className="premium-divider" />

      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="group flex items-center gap-3"
            >
              <div className="premium-glow rounded-xl p-1">
                <Image
                  src="/fast.png"
                  alt="Germania Auto Parts"
                  width={44}
                  height={44}
                  className="rounded-lg"
                />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight">
                  Germania
                </p>

                <p className="premium-text text-xs font-semibold tracking-[0.2em]">
                  AUTO PARTS
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Premium OEM and aftermarket automotive parts,
              carefully selected and shipped from Germany to
              enthusiasts around the world.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />

              <span className="text-xs font-medium text-muted-foreground">
                German Engineering. Global Delivery.
              </span>
            </div>
          </div>

          {/* Shop */}
          <FooterColumn
            title="Shop"
            links={shopLinks}
          />

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              Categories
            </h3>

            <div className="mt-5 h-px w-10 bg-primary/40" />

            <ul className="mt-5 space-y-3">
              {CATEGORIES.slice(0, 5).map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <ChevronRight className="mr-1 h-3.5 w-3.5 opacity-0 transition-all group-hover:mr-2 group-hover:opacity-100" />

                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <FooterColumn
            title="Support"
            links={supportLinks}
          />

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              Connect
            </h3>

            <div className="mt-5 h-px w-10 bg-primary/40" />

            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <div className="rounded-md border border-border p-2 transition-colors group-hover:border-primary/40">
                    <MessageCircle className="h-4 w-4" />
                  </div>

                  <span>WhatsApp</span>
                </a>
              </li>

              <li>
                <a
                  href="mailto:mohamedkhaleifa362@gmail.com"
                  className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <div className="rounded-md border border-border p-2 transition-colors group-hover:border-primary/40">
                    <Mail className="h-4 w-4" />
                  </div>

                  <span className="break-all">
                    mohamedkhaleifa362@gmail.com
                  </span>
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">
                Newsletter
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Get updates on new arrivals and exclusive offers.
              </p>

              <div className="mt-4">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="premium-divider my-12" />

        {/* Bottom */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          
          <p className="text-xs text-muted-foreground">
            © {currentYear} Germania Auto Parts.
            All rights reserved.
          </p>

          {/* Legal */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Payments */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>

            <span className="text-xs">
              Visa · Mastercard · Apple Pay · Google Pay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wide text-foreground">
        {title}
      </h3>

      {/* Gold accent */}
      <div className="mt-5 h-px w-10 bg-primary/40" />

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ChevronRight className="mr-1 h-3.5 w-3.5 opacity-0 transition-all group-hover:mr-2 group-hover:opacity-100" />

              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}