import { z } from "zod";
export const addressSchema = z.object({
    label : z.string().optional(),
    fullName : z.string().min(2 , "Full name is required"),
    phone : z.string().min(5 , "Phone number is required"),
    addressLine1 : z.string().min(3 , "Address line 1 is required"),
    addressLine2 : z.string().min(3 , "Address line 2 is required").optional(),
    city : z.string().min(2 , "City is required"),
    state : z.string().min(2 , "State is required"),
    postalCode : z.string().min(5 , "Postal code is required"),
    country : z.string().min(2 , "Country is required"),
    isDefault : z.boolean().optional()
})

export type AddressInput = z.infer<typeof addressSchema>;
export type AddressFormInput = z.input<typeof addressSchema>;