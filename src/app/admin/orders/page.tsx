import { Suspense } from "react";
import { AdminOrderList } from "@/components/admin/admin-order-list";

export const metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <AdminOrderList />
    </Suspense>
  );
}