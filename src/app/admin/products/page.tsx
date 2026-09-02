import { Suspense } from "react";
import { ProductList } from "@/components/admin/product-list";

export const metadata = {
  title: "Products",
};

export default function AdminProductsPage() {
  return (
    <Suspense>
      <ProductList />
    </Suspense>
  );
}