import { z } from "zod";
export const orderUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "AWAITING_PAYMENT",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]).default("PENDING"),
  trackingNumber: z.string().optional(),
  trackingCarrier: z.string().optional(),
  adminNote: z.string().max(1000).optional(),
});


export const verifyPaymentSchema = z.object({
  verified: z.boolean(),
  adminNote: z.string().max(500).optional(),
});

export const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  yearStart: z.number().int().min(1970).max(2030),
  yearEnd: z.number().int().min(1970).max(2030),
  generation: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/ , "Slug must be lowercase and can only contain letters, numbers, and hyphens"),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const inquiryUpdateSchema = z.object({
  status: z.enum(["UNREAD", "READ", "REPLIED"]),
  adminNote: z.string().max(1000).optional(),
});

export const bulkProductUpdateSchema = z.object({
  productIds: z.array(z.string()).min(1),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
});

export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>;
export type BulkProductUpdateInput = z.infer<typeof bulkProductUpdateSchema>;
