import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { console } from "inspector";
import { sl } from "zod/v4/locales";

const notifySchema = z.object({
    email : z.email("please entre a valid email address")
})

export async function POST(
    request:NextRequest,
    {params}:{params: Promise<{slug:string}>}
) {
    try{
        const {slug} =await params 
        const body = request.json()
        const parsed = notifySchema.safeParse(body)

        if (!parsed.success) {
        return NextResponse.json(
            { error: { code: "VALIDATION_ERROR", message: "Invalid email address" } },
            { status: 400 }
        );
        }

        const {email} = parsed.data

        const product = await db.product.findUnique({
            where: {slug},
            select: {id:true, stock:true}
        })

        if (!product) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "Product not found" } },
            { status: 404 }
        );
        }

        if (product.stock > 0) {
        return NextResponse.json(
            { error: { code: "BAD_REQUEST", message: "This product is currently in stock" } },
            { status: 400 }
        );
        }

        // Upsert to prevent duplicates
        await db.stockNotification.upsert({
        where: {
            email_productId: { email, productId: product.id },
        },
        create: { email, productId: product.id },
        update: {}, // No-op on duplicate
        });

        return NextResponse.json({
            data:{message: "You'll be notified when this product is back in stock."}
        })
        

    }catch (error) {
    console.error("POST /api/products/[slug]/notify error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to subscribe" } },
      { status: 500 }
    );
  }

}