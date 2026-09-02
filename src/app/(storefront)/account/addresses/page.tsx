import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { AddressManager } from "@/components/account/address-manager";

export const metadata = {
  title: "Addresses",
};

export default async function AddressesPage() {
  const user = await requireAuth();

  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <AddressManager initialAddresses={JSON.parse(JSON.stringify(addresses))} />
    </div>
  );
}