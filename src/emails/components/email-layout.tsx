import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://germaniaautoparts.com";

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${SITE_URL}/logo.png`}
              width="140"
              height="40"
              alt="Germania Auto Parts"
              style={{ margin: "0 auto" }}
            />
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Germania Auto Parts — Quality GDM & aftermarket parts from German
            </Text>
            <Text style={footerLinks}>
              <Link href={SITE_URL} style={footerLink}>
                Shop
              </Link>
              {" • "}
              <Link href={`${SITE_URL}/contact`} style={footerLink}>
                Contact Us
              </Link>
              {" • "}
              <Link
                href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+123456789").replace(/[^0-9+]/g, "")}`}
                style={footerLink}
              >
                WhatsApp
              </Link>
            </Text>
            <Text style={footerMuted}>
              © {new Date().getFullYear()} Germania Auto Parts. All rights reserved.
              <br />
              Berlin, German
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  backgroundColor: "#0A0A0A",
  padding: "24px 32px",
  textAlign: "center" as const,
};

const content: React.CSSProperties = {
  padding: "32px",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "0",
};

const footer: React.CSSProperties = {
  padding: "24px 32px",
};

const footerText: React.CSSProperties = {
  color: "#525252",
  fontSize: "14px",
  lineHeight: "22px",
  textAlign: "center" as const,
  margin: "0 0 8px",
};

const footerLinks: React.CSSProperties = {
  color: "#525252",
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const footerLink: React.CSSProperties = {
  color: "#DC2626",
  textDecoration: "none",
};

const footerMuted: React.CSSProperties = {
  color: "#a3a3a3",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center" as const,
  margin: "0",
};