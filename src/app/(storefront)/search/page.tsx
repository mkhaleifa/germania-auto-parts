import { redirect } from "next/navigation";

export const metadata = {
  title: "Search parts",
  description: "Search the Germania Auto Parts catalogue.",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  redirect(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
}
