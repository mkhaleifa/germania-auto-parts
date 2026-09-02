import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { AccountSettings } from "@/components/account/account-settings";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireAuth();

  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      passwordHash: true,
      accounts: { select: { provider: true } },
    },
  });

  return (
    <AccountSettings
      initialProfile={{
        name: profile?.name || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
      }}
      hasPassword={!!profile?.passwordHash}
      providers={profile?.accounts.map((a) => a.provider) || []}
    />
  );
}