import { z } from "zod";


export const productCreateSchema = z.object({
  title: z.string().min(3, "Title is required").max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().int().min(1, "Price must be at least €1"),
  comparePrice: z.number().int().min(0).optional(),
  condition: z.enum(["NEW", "GRADE_A", "GRADE_B", "GRADE_C", "GRADE_D"]),
  status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"]).default("DRAFT"),
  stock: z.number().int().min(0).default(0),
  sku: z.string().optional(),
  brand: z.string().optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  donorVehicle: z.string().optional(),
  donorMileage: z.number().int().min(0).optional(),
  testingStatus: z.string().optional(),
  conditionNotes: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  vehicleIds: z.array(z.string()).default([]),
  partNumbers: z
    .array(
      z.object({
        number: z.string().min(1),
        type: z.enum(["OEM", "AFTERMARKET", "MANUFACTURER"]),
      })
    )
    .default([]),
});
export const productUpdateSchema = productCreateSchema.partial();

export const productFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["newest", "price_asc", "price_desc", "title"]).default("newest"),
  category: z.string().optional(),
  condition: z.enum(["NEW", "GRADE_A", "GRADE_B", "GRADE_C", "GRADE_D"]).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.coerce.number().int().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
