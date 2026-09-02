import { Heading, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface ShippingUpdateEmailProps {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  trackingCarrier?: string;
  trackingUrl?: string;
}

export function ShippingUpdateEmail({
  orderNumber,
  customerName,
  trackingNumber,
  trackingCarrier,
  trackingUrl,
}: ShippingUpdateEmailProps) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://germaniaautoparts.com";

  return (
    <EmailLayout preview={`Your order ${orderNumber} has shipped!`}>
      <Heading style={heading}>Your Order Has Shipped!</Heading>
      <Text style={paragraph}>
        Hi {customerName}, great news! Your order <strong>{orderNumber}</strong> is on
        its way.
      </Text>

      <Section style={trackingBox}>
        <Text style={trackingLabel}>Tracking Number</Text>
        <Text style={trackingValue}>{trackingNumber}</Text>
        {trackingCarrier && (
          <Text style={carrierText}>Carrier: {trackingCarrier}</Text>
        )}
      </Section>

      {trackingUrl && (
        <Section style={{ textAlign: "center" as const, marginTop: "16px" }}>
          <Link href={trackingUrl} style={button}>
            Track Your Package
          </Link>
        </Section>
      )}

      <Text style={paragraph}>
        Estimated delivery times vary by destination:
      </Text>
      <Text style={deliveryInfo}>
        • German domestic: 1–3 business days
        <br />
        • International: 7–14 business days
      </Text>

      <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
        <Link href={`${SITE_URL}/order-lookup?order=${orderNumber}`} style={linkStyle}>
          View Order Details →
        </Link>
      </Section>
    </EmailLayout>
  );
}

const heading: React.CSSProperties = {
  color: "#0A0A0A",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: "#404040",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const trackingBox: React.CSSProperties = {
  backgroundColor: "#f5f5f5",
  borderRadius: "6px",
  padding: "16px",
  textAlign: "center" as const,
};

const trackingLabel: React.CSSProperties = {
  color: "#737373",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px",
};

const trackingValue: React.CSSProperties = {
  color: "#0A0A0A",
  fontSize: "18px",
  fontWeight: "bold",
  fontFamily: "monospace",
  margin: "0 0 4px",
};

const carrierText: React.CSSProperties = {
  color: "#737373",
  fontSize: "13px",
  margin: "0",
};

const button: React.CSSProperties = {
  backgroundColor: "#DC2626",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
};

const deliveryInfo: React.CSSProperties = {
  color: "#525252",
  fontSize: "13px",
  lineHeight: "22px",
  margin: "0 0 16px",
  paddingLeft: "8px",
};

const linkStyle: React.CSSProperties = {
  color: "#DC2626",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "none",
};