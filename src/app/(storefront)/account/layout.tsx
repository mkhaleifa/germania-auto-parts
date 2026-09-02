import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { AccountMobileNav } from "@/components/account/account-mobile-nav";

export const metadata: Metadata = {
  title: {
    template: "%s | My Account | Germania Auto Parts",
    default: "My Account",
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: "My Account", href: "/account" }]} />
      <div className="mt-6">
        {/* Mobile tabs */}
        <AccountMobileNav />

        <div className="mt-4 flex gap-8 lg:mt-0">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <AccountSidebar />
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}