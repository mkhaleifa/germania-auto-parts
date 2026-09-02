import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { SHIPPING_RATES, TAX_RATE_GERMANY } from "@/lib/constant";

const estimateSchema = z.object({
    country: z.string().min(1, 'Country is required'),
    weight: z.coerce.number().min(0).default(1),
    subtotal: z.coerce.number().min(0).default(0),
})
export async function GET(request:NextRequest) {

    try{

    
    const params= Object.fromEntries(request.nextUrl.searchParams)
    const parsed = estimateSchema.safeParse(params)

        if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid parameters" } },
        { status: 400 }
      );
    }
    const { country, weight, subtotal } = parsed.data;
    const isGerman = ["germany", "de", "deutschland"].includes(country.toLowerCase());


    let shippingCost: number;
    let freeShipping = false;

    if (isGerman) {
      // German domestic: weight-based, free over $10,000
      if (subtotal >= SHIPPING_RATES.germany.freeThreshold) {
        shippingCost = 0;
        freeShipping = true;
      } else if (weight <= 2) {
        shippingCost = SHIPPING_RATES.germany.small;
      } else if (weight <= 10) {
        shippingCost = SHIPPING_RATES.germany.medium;
      } else {
        shippingCost = SHIPPING_RATES.germany.large;
      }
    } else {
      // International: flat rate based on weight
      if (weight <= 5) {
        shippingCost = SHIPPING_RATES.international.small;
      } else {
        shippingCost = SHIPPING_RATES.international.large;
      }
    }

    const tax = isGerman ? Math.round(subtotal * TAX_RATE_GERMANY) : 0

        return NextResponse.json({
      data: {
        country,
        shippingCost,
        freeShipping,
        tax,
        taxRate: isGerman ? TAX_RATE_GERMANY : 0,
        isGerman,
      },
    });
}
    catch (error) {
    console.error("GET /api/shipping/estimate error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to estimate shipping" } },
      { status: 500 }
    );
  }
}
