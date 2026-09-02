import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { WishlistGrid } from "@/components/account/wishlist-grid";

export const metadata = {
  title: "Wishlist",
};

export default async function WishlistPage() {
  const user = await requireAuth();

  const items = await db.wishlist.findMany({
    where: { userId: user.id },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          comparePrice: true,
          stock: true,
          condition: true,
          images: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <WishlistGrid
        initialItems={JSON.parse(JSON.stringify(items))}
      />
    </div>
  );
}