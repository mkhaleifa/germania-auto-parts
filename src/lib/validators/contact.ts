import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export const quoteRequestSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().optional(),
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleYear: z.number().int().min(1970).max(2030),
  partsNeeded: z.string().min(10, "Please describe the parts you need").max(2000),
  quantity: z.number().int().min(1).default(1),
  notes: z.string().max(1000).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
export type QuoteRequestFormInput = z.input<typeof quoteRequestSchema>;
