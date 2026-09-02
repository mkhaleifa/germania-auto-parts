import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ProductCondition } from "@/generated/prisma/client";

interface ImportRow {
  title: string;
  description: string;
  price: number;
  condition: string;
  sku: string;
  oem_number?: string;
  category_slug: string;
  stock: number;
  brand?: string;
  weight?: string;
}

const VALID_CONDITIONS = ["NEW", "GRADE_A", "GRADE_B", "GRADE_C", "GRADE_D"];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
      { status: 403 }
    );
  }

  const body = await request.json();
  const rows: ImportRow[] = body.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "No rows provided" } },
      { status: 400 }
    );
  }

  if (rows.length > 500) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Maximum 500 rows per import" } },
      { status: 400 }
    );
  }

  // Validate all rows
  const errors: { row: number; field: string; message: string }[] = [];
  const categorySlugs = [...new Set(rows.map((r) => r.category_slug))];
  const categories = await db.category.findMany({
    where: { slug: { in: categorySlugs } },
    select: { id: true, slug: true },
  });
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  rows.forEach((row, i) => {
    if (!row.title?.trim()) errors.push({ row: i, field: "title", message: "Title is required" });
    if (!row.description?.trim()) errors.push({ row: i, field: "description", message: "Description is required" });
    if (!row.price || row.price <= 0) errors.push({ row: i, field: "price", message: "Valid price is required" });
    if (!VALID_CONDITIONS.includes(row.condition)) errors.push({ row: i, field: "condition", message: `Invalid condition: ${row.condition}` });
    if (!row.sku?.trim()) errors.push({ row: i, field: "sku", message: "SKU is required" });
    if (!row.category_slug?.trim()) errors.push({ row: i, field: "category_slug", message: "Category slug is required" });
    else if (!categoryMap.has(row.category_slug)) errors.push({ row: i, field: "category_slug", message: `Unknown category: ${row.category_slug}` });
    if (row.stock == null || row.stock < 0) errors.push({ row: i, field: "stock", message: "Valid stock is required" });
  });

  if (errors.length > 0) {
    return NextResponse.json({
      error: { code: "VALIDATION_ERRORS", message: `${errors.length} validation errors found` },
      errors,
    }, { status: 400 });
  }

  // Generate slugs and create products
  let created = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const baseSlug = row.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Ensure unique slug
      const existing = await db.product.findUnique({ where: { slug: baseSlug } });
      const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

      await db.product.create({
        data: {
          title: row.title.trim(),
          slug,
          description: row.description.trim(),
          price: row.price,
          condition: row.condition as ProductCondition,
          sku: row.sku.trim(),
          categoryId: categoryMap.get(row.category_slug)!,
          stock: row.stock,
          brand: row.brand?.trim() || null,
          weight: row.weight?.trim() || null,
          status: "DRAFT",
          specs: {},
          tags: [],
        },
      });
      created++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({
    data: {
      total: rows.length,
      created,
      failed,
      message: `Successfully imported ${created} products${failed > 0 ? `, ${failed} failed` : ""}`,
    },
  });
}