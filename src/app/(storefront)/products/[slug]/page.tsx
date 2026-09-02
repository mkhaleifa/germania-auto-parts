import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCondition } from "@/types/product";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const products = await db.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true },
      take: 100,
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await db.product.findUnique({
      where: { slug },
      select: { title: true, description: true, images: { take: 1, select: { url: true } } },
    });

    if (!product) return {};

    return {
      title: product.title,
      description: product.description.slice(0, 160),
      openGraph: {
        title: product.title,
        description: product.description.slice(0, 160),
        images: product.images[0]?.url ? [product.images[0].url] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      partNumbers: true,
      category: { select: { id: true, name: true, slug: true } },
      vehicles: { include: { vehicle: true } },
    },
  });

  if (!product) notFound();

  // Fetch related products
  const relatedProducts = await db.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      comparePrice: true,
      condition: true,
      stock: true,
      brand: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 2,
        select: { url: true, alt: true },
      },
      category: { select: { name: true, slug: true } },
    },
  });

  // Serialize Decimal fields
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    weight: product.weight ? Number(product.weight) : null,
    specs: product.specs as Record<string, string> | null,
  };

  const serializedRelated = relatedProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
  }));

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.sku || undefined,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    image: product.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "DEM",
      price: Number(product.price),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition:
        product.condition === "NEW"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs
        items={[
          { label: "Products", href: "/products" },
          { label: product.category.name, href: `/categories/${product.category.slug}` },
          { label: product.title },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mt-6">
        <ProductDetail product={serializedProduct} />
      </div>

      {/* Related Products */}
      {serializedRelated.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Related Products</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {serializedRelated.map((p) => (
              <ProductCard
                key={p.id}
                {...p}
                condition={p.condition as ProductCondition}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}