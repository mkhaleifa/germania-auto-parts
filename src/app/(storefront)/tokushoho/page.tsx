import { siteConfig } from "@/config/site";

export const metadata = { title: "Legal Notice" };

export default function LegalNoticePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Germania Auto Parts</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Legal Notice</h1>
      <dl className="mt-8 divide-y rounded-xl border text-sm">
        <div className="grid gap-1 p-5 sm:grid-cols-[12rem_1fr]"><dt className="font-semibold">Business</dt><dd>Germania Auto Parts</dd></div>
        <div className="grid gap-1 p-5 sm:grid-cols-[12rem_1fr]"><dt className="font-semibold">Contact</dt><dd>{siteConfig.links.email}</dd></div>
        <div className="grid gap-1 p-5 sm:grid-cols-[12rem_1fr]"><dt className="font-semibold">Currency</dt><dd>All prices are displayed in EUR.</dd></div>
        <div className="grid gap-1 p-5 sm:grid-cols-[12rem_1fr]"><dt className="font-semibold">Delivery</dt><dd>German and international delivery costs are calculated during checkout.</dd></div>
      </dl>
    </main>
  );
}
