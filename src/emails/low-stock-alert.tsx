import { Heading, Link, Section, Text, Hr } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface LowStockProduct {
  name: string;
  sku: string;
  currentStock: number;
  productId: string;
}

interface LowStockAlertEmailProps {
  products: LowStockProduct[];
}

export function LowStockAlertEmail({ products }: LowStockAlertEmailProps) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ahfautoparts.com";

  return (
    <EmailLayout preview={`Low stock alert: ${products.length} product(s) need restocking`}>
      <Heading style={heading}>Low Stock Alert</Heading>
      <Text style={paragraph}>
        The following product{products.length > 1 ? "s" : ""} {products.length > 1 ? "have" : "has"}{" "}
        reached the low stock threshold and may need restocking:
      </Text>

      {products.map((product, i) => (
        <React.Fragment key={product.productId}>
          {i > 0 && <Hr style={divider} />}
          <Section style={productRow}>
            <Text style={productName}>{product.name}</Text>
            <Text style={productSku}>SKU: {product.sku}</Text>
            <Text style={stockCount}>
              Current Stock: <strong style={{ color: product.currentStock === 0 ? "#DC2626" : "#D97706" }}>{product.currentStock}</strong>
            </Text>
            <Link
              href={`${SITE_URL}/admin/products/${product.productId}`}
              style={linkStyle}
            >
              Edit Product →
            </Link>
          </Section>
        </React.Fragment>
      ))}

      <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
        <Link href={`${SITE_URL}/admin/products`} style={button}>
          View All Products
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

const divider: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "8px 0",
};

const productRow: React.CSSProperties = {
  padding: "8px 0",
};

const productName: React.CSSProperties = {
  color: "#0A0A0A",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0 0 2px",
};

const productSku: React.CSSProperties = {
  color: "#737373",
  fontSize: "13px",
  fontFamily: "monospace",
  margin: "0 0 4px",
};

const stockCount: React.CSSProperties = {
  color: "#404040",
  fontSize: "14px",
  margin: "0 0 4px",
};

const linkStyle: React.CSSProperties = {
  color: "#DC2626",
  fontSize: "13px",
  textDecoration: "none",
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