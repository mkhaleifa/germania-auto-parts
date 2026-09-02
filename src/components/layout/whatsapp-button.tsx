"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  productName?: string;
  partNumber?: string;
}

export function WhatsAppButton({ productName, partNumber }: WhatsAppButtonProps) {
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname.startsWith("/admin")) return null;

  const phone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace("+", "") || "123456789";

  let message = "Hi, I have a question about Germania Auto Parts.";
  if (productName) {
    message = `Hi, I'm interested in: ${productName}`;
    if (partNumber) {
      message += ` (Part #: ${partNumber})`;
    }
  }

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}