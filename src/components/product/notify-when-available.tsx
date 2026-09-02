"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NotifyWhenAvailableProps {
  productSlug: string;
}

export function NotifyWhenAvailable({ productSlug }: NotifyWhenAvailableProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch(`/api/products/${productSlug}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("We'll email you when this is back in stock!");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error?.message || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to subscribe. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
        <Check className="h-4 w-4 flex-shrink-0" />
        {message}
      </div>
    );
  }

  return (
    <div className="rounded-md border p-4">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">Notify When Available</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Enter your email and we&apos;ll let you know when this item is back in stock.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 text-sm"
          required
        />
        <Button type="submit" size="sm" disabled={status === "loading"}>
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Notify Me"
          )}
        </Button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-600">{message}</p>
      )}
    </div>
  );
}