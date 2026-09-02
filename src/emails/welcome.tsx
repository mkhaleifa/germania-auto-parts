import { Heading, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface WelcomeEmailProps {
  customerName: string;
}

export function WelcomeEmail({ customerName }: WelcomeEmailProps) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://.com";

  return (
    <EmailLayout preview="Welcome to Germania Auto Parts — Quality DEM parts from German">
      <Heading style={heading}>Welcome to Germania Auto Parts!</Heading>
      <Text style={paragraph}>
        Hi {customerName}, thank you for creating an account with us. We&apos;re
        excited to have you as part of the Germania Auto Parts community.
      </Text>

      <Text style={paragraph}>
        We specialize in quality German Domestic Market (GDM) and aftermarket auto
        parts, shipped directly from German to your doorstep.
      </Text>

      <Section style={featureBox}>
        <Text style={featureTitle}>What you can do with your account:</Text>
        <Text style={featureList}>
          • Browse our full catalog of GDM parts
          <br />
          • Save items to your wishlist
          <br />
          • Track your orders in real-time
          <br />
          • Save addresses for faster checkout
          <br />
          • Request quotes for specific parts
        </Text>
      </Section>

      <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
        <Link href={`${SITE_URL}/products`} style={button}>
          Start Shopping
        </Link>
      </Section>

      <Text style={paragraph}>
        Have questions? Feel free to{" "}
        <Link href={`${SITE_URL}/contact`} style={linkStyle}>
          contact us
        </Link>{" "}
        or message us on{" "}
        <Link
          href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+123456789").replace(/[^0-9+]/g, "")}`}
          style={linkStyle}
        >
          WhatsApp
        </Link>
        .
      </Text>
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

const featureBox: React.CSSProperties = {
  backgroundColor: "#f5f5f5",
  borderRadius: "6px",
  padding: "16px 20px",
};

const featureTitle: React.CSSProperties = {
  color: "#0A0A0A",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const featureList: React.CSSProperties = {
  color: "#525252",
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

const linkStyle: React.CSSProperties = {
  color: "#DC2626",
  textDecoration: "none",
};