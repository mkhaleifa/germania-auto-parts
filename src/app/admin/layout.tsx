import type { Metadata } from "next";
// import { SessionProvider } from "next-auth/react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | AHF Admin",
    default: "Germania Admin Dashboard",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <SessionProvider>
      <div className="flex min-h-screen flex-col">
        <AdminHeader />
        <div className="flex flex-1">
          <aside className="hidden w-60 shrink-0 border-r bg-muted/30 lg:block">
            <AdminSidebar />
          </aside>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    // </SessionProvider>
  );
}