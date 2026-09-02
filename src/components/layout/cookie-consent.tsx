"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "ahf_cookie_consent";
const CONSENT_EXPIRY_DAYS = 365;

function getStoredConsent(): "accepted" | "declined" | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const { value, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

function setStoredConsent(value: "accepted" | "declined") {
  const expiry = Date.now() + CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, expiry }));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // Small delay so it doesn't flash on first paint
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    setStoredConsent("accepted");
    setVisible(false);
    // Signal analytics consent (Vercel Analytics uses this)
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: { accepted: true } }));
  }

  function handleDecline() {
    setStoredConsent("declined");
    setVisible(false);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: { accepted: false } }));
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm px-4 py-4 md:py-5 shadow-lg"
    >
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
          We use cookies to keep your cart active, maintain your login session, and understand how
          visitors use our site.{" "}
          <Link href="/privacy" className="text-red-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}