"use client";

import { useState } from "react";
import { toast } from "sonner";

type State = "idle" | "loading" | "success" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setState("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "Failed to subscribe");
        setState("error");
        return;
      }

      setState("success");
      setEmail("");
      toast.success(data.data?.message || "You're subscribed!");
    } catch {
      setState("error");
      toast.error("Something went wrong. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <p className="text-sm text-green-400">
        You&apos;re subscribed! Thanks for joining.
      </p>
    );
  }

  return (
<form onSubmit={handleSubmit} className="mt-3 flex gap-2">
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="your@email.com"
    required
    className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
  />

  <button
    type="submit"
    disabled={state === "loading"}
    className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
  >
    {state === "loading" ? "..." : "Subscribe"}
  </button>
</form>
  );
}