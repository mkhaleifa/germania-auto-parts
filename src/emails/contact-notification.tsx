import { Heading, Hr, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

interface ContactNotificationEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export function ContactNotificationEmail({
  name,
  email,
  phone,
  subject,
  message,
}: ContactNotificationEmailProps) {
  return (
    <EmailLayout preview={`New inquiry from ${name}: ${subject}`}>
      <Heading style={heading}>New Contact Form Submission</Heading>

      <Section style={detailBox}>
        <Text style={detailRow}>
          <strong>From:</strong> {name}
        </Text>
        <Text style={detailRow}>
          <strong>Email:</strong>{" "}
          <Link href={`mailto:${email}`} style={linkStyle}>
            {email}
          </Link>
        </Text>
        {phone && (
          <Text style={detailRow}>
            <strong>Phone:</strong> {phone}
          </Text>
        )}
        <Text style={detailRow}>
          <strong>Subject:</strong> {subject}
        </Text>
      </Section>

      <Hr style={divider} />

      <Section>
        <Text style={messageLabel}>Message:</Text>
        <Text style={messageText}>{message}</Text>
      </Section>

      <Hr style={divider} />

      <Section style={{ marginTop: "16px" }}>
        <Text style={paragraph}>
          <Link href={`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`} style={button}>
            Reply via Email
          </Link>
        </Text>
        {phone && (
          <Text style={{ ...paragraph, marginTop: "8px" }}>
            <Link
              href={`https://wa.me/${phone.replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(`Hi ${name}, regarding your inquiry about "${subject}"`)}`}
              style={{ ...button, backgroundColor: "#25D366" }}
            >
              Reply via WhatsApp
            </Link>
          </Text>
        )}
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
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const detailBox: React.CSSProperties = {
  backgroundColor: "#f5f5f5",
  borderRadius: "6px",
  padding: "16px",
};

const detailRow: React.CSSProperties = {
  color: "#404040",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 4px",
};

const divider: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "16px 0",
};

const messageLabel: React.CSSProperties = {
  color: "#737373",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px",
};

const messageText: React.CSSProperties = {
  color: "#0A0A0A",
  fontSize: "14px",
  lineHeight: "24px",
  whiteSpace: "pre-wrap" as const,
  margin: "0",
};

const linkStyle: React.CSSProperties = {
  color: "#DC2626",
  textDecoration: "none",
};

const button: React.CSSProperties = {
  backgroundColor: "#DC2626",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  padding: "10px 20px",
  textDecoration: "none",
};