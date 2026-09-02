import { siteConfig } from "@/config/site";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Germania Auto Parts</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Terms &amp; Conditions</h1>
      <div className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground">
        <section><h2 className="text-lg font-semibold text-foreground">Orders and availability</h2><p>All orders are subject to availability and confirmation. Compatibility information is provided as guidance; please verify the OEM part number, vehicle VIN and fitment before ordering.</p></section>
        <section><h2 className="text-lg font-semibold text-foreground">Condition and images</h2><p>Used parts are inspected and condition graded before listing. Product photos form part of the description; normal signs of use are noted where material to the purchase decision.</p></section>
        <section><h2 className="text-lg font-semibold text-foreground">Pricing and delivery</h2><p>Prices are shown in EUR. Delivery options, delivery costs and applicable taxes are presented during checkout. International buyers are responsible for import duties and local charges.</p></section>
        <section><h2 className="text-lg font-semibold text-foreground">Contact</h2><p>Questions about an order or a part can be sent to {siteConfig.links.email} before purchase.</p></section>
      </div>
    </main>
  );
}
