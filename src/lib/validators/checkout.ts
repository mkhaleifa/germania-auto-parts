import { z } from "zod";
import { addressSchema } from "./address";

export const cartItemSchema = z.object({
    productId : z.string().min(1 , "Product ID is required"),
    quantity : z.number().min(1 , "Quantity must be at least 1"),
})
export const cartValidateSchema = z.object({
    items : z.array(cartItemSchema).min(1 , "Cart items  are empty"),
})  

export const checkoutSchema = z.object({
    cartItems : z.array(cartItemSchema).min(1 , "Cart items  are required"),
    shippingAddress : addressSchema,
    billingAddress : addressSchema.optional(),
    paymentMethod : z.enum(["STRIPE" , "BANK_TRANSFER"], "Payment method is required"),
    customerNote : z.string().optional(),
    guestEmail : z.email("Invalid email address").optional(),
}) 

export type cartItemInput = z.infer<typeof cartItemSchema>;
export type cartValidateInput = z.infer<typeof cartValidateSchema>;
export type checkoutInput = z.infer<typeof checkoutSchema>;