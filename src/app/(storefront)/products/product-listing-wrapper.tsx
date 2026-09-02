import { db } from "@/lib/db";
import { ProductListing } from "@/components/product/product-listing";
import { PRODUCTS_PER_PAGE } from "@/lib/constant";
import type { Prisma } from "@/generated/prisma/client";

export const revalidate = 60;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  categorySlug?: string;
}

function getString(val: string | string[] | undefined): string | undefined {
  return typeof val === "string" ? val : undefined;
}

function getNumber(val: string | string[] | undefined): number | undefined {
  const s = getString(val);
  if (!s) return undefined;
  const n = parseInt(s, 10);
  return isNaN(n) ? undefined : n;
}

export async function ProductListingWrapper({
  searchParams,
  categorySlug,
}: Props) {
  const params = await searchParams;

  const page = Math.max(1, getNumber(params.page) || 1);
  const pageSize = PRODUCTS_PER_PAGE;
  const sort = getString(params.sort) || "newest";
  const condition = getString(params.condition);
  const minPrice = getNumber(params.minPrice);
  const maxPrice = getNumber(params.maxPrice);
  const brand = getString(params.brand);
  const vehicleMake = getString(params.vehicleMake);
  const vehicleModel = getString(params.vehicleModel);
  const vehicleYear = getNumber(params.vehicleYear);
  const isFeatured = getString(params.isFeatured);
  const search = getString(params.search);

  // Build where clause
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  } else if (getString(params.category)) {
    where.category = { slug: getString(params.category) };
  }

  if (condition) {
    where.condition = condition as Prisma.EnumProductConditionFilter;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (brand) {
    where.brand = { equals: brand, mode: "insensitive" };
  }

  if (isFeatured === "true") {
    where.isFeatured = true;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  if (vehicleMake || vehicleModel || vehicleYear) {
    const vehicleWhere: Prisma.VehicleWhereInput = {};
    if (vehicleMake) vehicleWhere.make = { equals: vehicleMake, mode: "insensitive" };
    if (vehicleModel) vehicleWhere.model = { equals: vehicleModel, mode: "insensitive" };
    if (vehicleYear) {
      vehicleWhere.yearStart = { lte: vehicleYear };
      vehicleWhere.yearEnd = { gte: vehicleYear };
    }
    where.vehicles = { some: { vehicle: vehicleWhere } };
  }

  // Sort
  let orderBy: Prisma.ProductOrderByWithRelationInput;
  switch (sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "title":
      orderBy = { title: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
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
    }),
    db.product.count({ where }),
  ]);

  const data = products.map((p) => ({
    ...p,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
  }));

  // Build title
  let title = "All Products";
  if (vehicleMake) {
    title = `Parts for ${vehicleMake}`;
    if (vehicleModel) title += ` ${vehicleModel}`;
    if (vehicleYear) title += ` ${vehicleYear}`;
  }
  if (isFeatured === "true") title = "Featured Products";

  return (
    <ProductListing
      products={data}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      totalPages={Math.ceil(totalCount / pageSize)}
      title={title}
      description={`Quality GDM auto parts — ${totalCount} parts available`}
    />
  );
}