import { Resend } from "resend";
import { render } from "@react-email/components";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { ShippingUpdateEmail } from "@/emails/shipping-update";
import { WelcomeEmail } from "@/emails/welcome";
import { ContactNotificationEmail } from "@/emails/contact-notification";
import { LowStockAlertEmail } from "@/emails/low-stock-alert";

// Lazy singleton — avoids "Missing API key" crash at build time when env vars are absent
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

const FROM_EMAIL = "Germania Auto Parts <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mohamedkhaleifa@gmial.com";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error("Email send error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
}

export async function sendAdminNotification(subject: string, html: string) {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[AHF Admin] ${subject}`,
    html,
  });
}

// ── Typed email helpers ────────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  customerName: string;
  items: { title: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
  };
  paymentMethod: "STRIPE" | "BANK_TRANSFER";
  bankDetails?: { bankName: string; accountNumber: string; accountHolder: string };
}) {
  const html = await render(
    OrderConfirmationEmail({
      orderNumber: params.orderNumber,
      customerName: params.customerName,
      items: params.items,
      subtotal: params.subtotal,
      shipping: params.shipping,
      total: params.total,
      shippingAddress: params.shippingAddress,
      paymentMethod: params.paymentMethod,
      bankDetails: params.bankDetails,
    })
  );

  return sendEmail({
    to: params.to,
    subject: `Order Confirmed — ${params.orderNumber}`,
    html,
  });
}

export async function sendShippingUpdateEmail(params: {
  to: string;
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  trackingCarrier?: string;
  trackingUrl?: string;
}) {
  const html = await render(
    ShippingUpdateEmail({
      orderNumber: params.orderNumber,
      customerName: params.customerName,
      trackingNumber: params.trackingNumber,
      trackingCarrier: params.trackingCarrier,
      trackingUrl: params.trackingUrl,
    })
  );

  return sendEmail({
    to: params.to,
    subject: `Your order ${params.orderNumber} has shipped!`,
    html,
  });
}

export async function sendWelcomeEmail(params: { to: string; name: string }) {
  const html = await render(WelcomeEmail({ customerName: params.name }));
  return sendEmail({
    to: params.to,
    subject: "Welcome to Germania Auto Parts!",
    html,
  });
}

export async function sendContactNotificationEmail(params: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const html = await render(
    ContactNotificationEmail({
      name: params.name,
      email: params.email,
      phone: params.phone,
      subject: params.subject,
      message: params.message,
    })
  );

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Contact] ${params.subject} — from ${params.name}`,
    html,
    replyTo: params.email,
  });
}

export async function sendLowStockAlertEmail(
  products: { name: string; sku: string; currentStock: number; productId: string }[]
) {
  if (products.length === 0) return;

  const html = await render(LowStockAlertEmail({ products }));
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Low Stock] ${products.length} product${products.length > 1 ? "s" : ""} need restocking`,
    html,
  });
}