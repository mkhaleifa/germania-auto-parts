import { NextRequest, NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/validators/contact";
import { sendAdminNotification, sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quoteRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid quote request", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Notify admin (Fahad)
    await sendAdminNotification(
      `Bulk Quote Request from ${data.name}`,
      `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
        <p><strong>Vehicle:</strong> ${data.vehicleMake} ${data.vehicleModel} ${data.vehicleYear}</p>
        <p><strong>Parts Needed:</strong> ${data.partsNeeded}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ""}
      `
    );

    // Confirmation to customer
    try {
      await sendEmail({
        to: data.email,
        subject: "Quote Request Received — AHF Auto Parts",
        html: `
          <h2>Quote Request Received</h2>
          <p>Hi ${data.name},</p>
          <p>Thank you for your quote request. We've received the following details:</p>
          <ul>
            <li><strong>Vehicle:</strong> ${data.vehicleMake} ${data.vehicleModel} ${data.vehicleYear}</li>
            <li><strong>Parts:</strong> ${data.partsNeeded}</li>
            <li><strong>Quantity:</strong> ${data.quantity}</li>
          </ul>
          <p>We'll respond within 24 hours with pricing and availability.</p>
          <p>Best regards,<br/>AHF Auto Parts Team</p>
        `,
      });
    } catch {
      // Non-critical — don't fail the request
    }

    return NextResponse.json({
      data: { message: "Quote request received. We'll respond within 24 hours." },
    });
  } catch (error) {
    console.error("POST /api/quote error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to submit quote request" } },
      { status: 500 }
    );
  }
}