"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { quoteRequestSchema, type QuoteRequestInput, type QuoteRequestFormInput } from "@/lib/validators/contact";

interface QuoteFormProps {
  prefillProduct?: string;
}

export function QuoteForm({ prefillProduct }: QuoteFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteRequestFormInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      partsNeeded: prefillProduct || "",
      quantity: 1,
    },
  });

  async function onSubmit(data: QuoteRequestFormInput) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error?.message || "Failed to submit");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center p-8 text-center">
          <Check className="h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-semibold">Quote Request Received!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll respond within 24 hours with pricing and availability.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="q-name">Name *</Label>
              <Input
                id="q-name"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="q-email">Email *</Label>
              <Input
                id="q-email"
                type="email"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="q-phone">Phone</Label>
            <Input id="q-phone" type="tel" {...register("phone")} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="q-make">Vehicle Make *</Label>
              <Input
                id="q-make"
                {...register("vehicleMake")}
                placeholder="Toyota"
                className={errors.vehicleMake ? "border-red-500" : ""}
              />
              {errors.vehicleMake && (
                <p className="mt-1 text-xs text-red-600">{errors.vehicleMake.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="q-model">Vehicle Model *</Label>
              <Input
                id="q-model"
                {...register("vehicleModel")}
                placeholder="Corolla"
                className={errors.vehicleModel ? "border-red-500" : ""}
              />
              {errors.vehicleModel && (
                <p className="mt-1 text-xs text-red-600">{errors.vehicleModel.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="q-year">Year *</Label>
              <Input
                id="q-year"
                type="number"
                {...register("vehicleYear", { valueAsNumber: true })}
                placeholder="2020"
                className={errors.vehicleYear ? "border-red-500" : ""}
              />
              {errors.vehicleYear && (
                <p className="mt-1 text-xs text-red-600">{errors.vehicleYear.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="q-parts">Parts Needed *</Label>
            <Textarea
              id="q-parts"
              {...register("partsNeeded")}
              placeholder="Describe the parts you need (e.g., front brake pads, alternator...)"
              rows={3}
              className={errors.partsNeeded ? "border-red-500" : ""}
            />
            {errors.partsNeeded && (
              <p className="mt-1 text-xs text-red-600">{errors.partsNeeded.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="q-qty">Quantity *</Label>
            <Input
              id="q-qty"
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              min={1}
              className="w-24"
            />
          </div>

          <div>
            <Label htmlFor="q-notes">Additional Notes</Label>
            <Textarea
              id="q-notes"
              {...register("notes")}
              placeholder="Any additional requirements..."
              rows={2}
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Quote Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}