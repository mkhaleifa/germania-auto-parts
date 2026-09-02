import { Heading, Hr, Link, Section, Text, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
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
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

function formatPrice(amount: number): string {
  return `¥${amount.toLocaleString("en-US")}`;
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  total,
  shippingAddress,
  paymentMethod,
  bankDetails,
}: OrderConfirmationEmailProps) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://germaniaautoparts.com";

  return (
    <EmailLayout preview={`Order Confirmed — ${orderNumber}`}>
      <Heading style={heading}>Order Confirmed</Heading>
      <Text style={paragraph}>
        Hi {customerName}, thank you for your order! We&apos;ve received your order and
        will begin processing it shortly.
      </Text>

      <Section style={orderBox}>
        <Text style={orderLabel}>Order Number</Text>
        <Text style={orderValue}>{orderNumber}</Text>
      </Section>

      {/* Items */}
      <Section style={{ marginTop: "24px" }}>
        <Text style={sectionTitle}>Items Ordered</Text>
        {items.map((item, i) => (
          <Row key={i} style={itemRow}>
            <Column style={{ width: "70%" }}>
              <Text style={itemName}>
                {item.title} × {item.quantity}
              </Text>
            </Column>
            <Column style={{ width: "30%", textAlign: "right" as const }}>
              <Text style={itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </Column>
          </Row>
        ))}
        <Hr style={divider} />
        <Row style={totalRow}>
          <Column style={{ width: "70%" }}>
            <Text style={totalLabel}>Subtotal</Text>
          </Column>
          <Column style={{ width: "30%", textAlign: "right" as const }}>
            <Text style={totalValue}>{formatPrice(subtotal)}</Text>
          </Column>
        </Row>
        <Row style={totalRow}>
          <Column style={{ width: "70%" }}>
            <Text style={totalLabel}>Shipping</Text>
          </Column>
          <Column style={{ width: "30%", textAlign: "right" as const }}>
            <Text style={totalValue}>
              {shipping === 0 ? "Free" : formatPrice(shipping)}
            </Text>
          </Column>
        </Row>
        <Hr style={divider} />
        <Row style={totalRow}>
          <Column style={{ width: "70%" }}>
            <Text style={{ ...totalLabel, fontWeight: "bold", fontSize: "16px" }}>
              Total
            </Text>
          </Column>
          <Column style={{ width: "30%", textAlign: "right" as const }}>
            <Text style={{ ...totalValue, fontWeight: "bold", fontSize: "16px", color: "#DC2626" }}>
              {formatPrice(total)}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Shipping Address */}
      <Section style={{ marginTop: "24px" }}>
        <Text style={sectionTitle}>Shipping To</Text>
        <Text style={addressText}>
          {shippingAddress.name}
          <br />
          {shippingAddress.address}
          <br />
          {shippingAddress.city}
          {shippingAddress.state ? `, ${shippingAddress.state}` : ""} {shippingAddress.zip}
          <br />
          {shippingAddress.country}
        </Text>
      </Section>

      {/* Bank Transfer Instructions */}
      {paymentMethod === "BANK_TRANSFER" && bankDetails && (
        <Section style={bankBox}>
          <Text style={{ ...sectionTitle, color: "#DC2626" }}>
            Payment Required — Bank Transfer
          </Text>
          <Text style={paragraph}>
            Please transfer the total amount within <strong>72 hours</strong> to
            complete your order:
          </Text>
          <Text style={bankDetail}>
            <strong>Bank:</strong> {bankDetails.bankName}
            <br />
            <strong>Account:</strong> {bankDetails.accountNumber}
            <br />
            <strong>Holder:</strong> {bankDetails.accountHolder}
            <br />
            <strong>Amount:</strong> {formatPrice(total)}
            <br />
            <strong>Reference:</strong> {orderNumber}
          </Text>
        </Section>
      )}

      {paymentMethod === "STRIPE" && (
        <Text style={paragraph}>
          Your payment has been confirmed. We&apos;ll send you tracking information
          once your order ships.
        </Text>
      )}

      <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
        <Link href={`${SITE_URL}/order-lookup?order=${orderNumber}`} style={button}>
          View Order Status
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

const orderBox: React.CSSProperties = {
  backgroundColor: "#f5f5f5",
  borderRadius: "6px",
  padding: "16px",
  textAlign: "center" as const,
};

const orderLabel: React.CSSProperties = {
  color: "#737373",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px",
};

const orderValue: React.CSSProperties = {
  color: "#0A0A0A",
  fontSize: "20px",
  fontWeight: "bold",
  fontFamily: "monospace",
  margin: "0",
};

const sectionTitle: React.CSSProperties = {
  color: "#0A0A0A",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 12px",
};

const itemRow: React.CSSProperties = {
  padding: "8px 0",
};

const itemName: React.CSSProperties = {
  color: "#404040",
  fontSize: "14px",
  margin: "0",
};

const itemPrice: React.CSSProperties = {
  color: "#0A0A0A",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const divider: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "8px 0",
};

const totalRow: React.CSSProperties = {
  padding: "4px 0",
};

const totalLabel: React.CSSProperties = {
  color: "#737373",
  fontSize: "14px",
  margin: "0",
};

const totalValue: React.CSSProperties = {
  color: "#0A0A0A",
  fontSize: "14px",
  margin: "0",
};

const addressText: React.CSSProperties = {
  color: "#404040",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const bankBox: React.CSSProperties = {
  backgroundColor: "#FEF2F2",
  borderRadius: "6px",
  border: "1px solid #FECACA",
  padding: "16px",
  marginTop: "24px",
};

const bankDetail: React.CSSProperties = {
  color: "#404040",
  fontSize: "14px",
  lineHeight: "24px",
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