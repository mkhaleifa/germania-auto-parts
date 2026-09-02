import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGridSkeleton } from "@/components/ui/product-skeleton";
import { ProductListingWrapper } from "../../products/product-listing-wrapper";
import { siteConfig } from "@/config/site";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  try {
    const categories = await db.category.findMany({
      select: { slug: true },
    });
    return categories.map((cat) => ({ slug: cat.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const category = await db.category.findUnique({
      where: { slug },
      select: { name: true, description: true },
    });

    if (!category) return {};

    return {
      title: category.name,
      description:
        category.description ||
        `Browse ${category.name} Germania auto parts. Quality parts shipped from German.`,
    };
  } catch {
    return {};
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;

  const category = await db.category.findUnique({
    where: { slug },
    select: { name: true, slug: true, description: true },
  });

  if (!category) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description:
      category.description ||
      `Browse ${category.name} Germania auto parts. Quality parts shipped from German.`,
    url: `${siteConfig.url}/categories/${category.slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Products", item: `${siteConfig.url}/products` },
        { "@type": "ListItem", position: 3, name: category.name },
      ],
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Products", href: "/products" },
          { label: category.name },
        ]}
      />
      <div className="mt-6">
        <Suspense fallback={<ProductGridSkeleton count={12} />}>
          <CategoryListingWrapper
            categorySlug={category.slug}
            categoryName={category.name}
            categoryDescription={category.description}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}

async function CategoryListingWrapper({
  categorySlug,
  categoryName,
  categoryDescription,
  searchParams,
}: {
  categorySlug: string;
  categoryName: string;
  categoryDescription: string | null;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ProductListingWrapper
      searchParams={searchParams}
      categorySlug={categorySlug}
    />
  );
}