"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import {
  Car,
  CreditCard,
  Landmark,
  Lock,
  Loader2,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/seperator";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const checkoutFormSchema = z.object({
  email: z.email("Please enter a valid email"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(5, "Phone number is required"),
  addressLine1: z.string().min(3, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  paymentMethod: z.enum(["STRIPE", "BANK_TRANSFER"]),
  customerNote: z.string().max(500).optional(),
  agreeToTerms: z.literal(true, { message: "You must agree to the terms" }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const COUNTRIES = [
  "Germany", "Japan", "United States", "United Kingdom", "Australia",
  "Canada", "Egypt", "France", "United Arab Emirates", "Saudi Arabia",
  "India", "Malaysia", "Singapore", "Thailand", "Philippines", "Other",
];

export function CheckoutContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotal, getItemCount, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const subtotal = getTotal();
  const itemCount = getItemCount();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: session?.user?.email || "",
      fullName: session?.user?.name || "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Japan",
      paymentMethod: "STRIPE",
      customerNote: "",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const country = watch("country");

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add some items to your cart before checking out.
        </p>
        <Button className="mt-6" render={<Link href="/products" />}>
          Browse Products
        </Button>
      </div>
    );
  }

  async function onSubmit(data: CheckoutFormValues) {
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || undefined,
          city: data.city,
          state: data.state || undefined,
          postalCode: data.postalCode,
          country: data.country,
        },
        paymentMethod: data.paymentMethod,
        customerNote: data.customerNote || undefined,
        guestEmail: !session ? data.email : undefined,
      };

      const endpoint =
        data.paymentMethod === "BANK_TRANSFER"
          ? "/api/checkout/bank-transfer"
          : "/api/checkout";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error?.message || "Checkout failed");
      }

      if (data.paymentMethod === "STRIPE" && result.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.url;
      } else if (data.paymentMethod === "BANK_TRANSFER" && result.data?.orderId) {
        // Redirect to success page with bank transfer details
        clearCart();
        router.push(
          `/checkout/success?orderId=${result.data.orderId}&method=bank_transfer`
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      {/* Minimal header */}
      <div className="flex items-center justify-between border-b pb-4">
        <Link href="/" className="flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">
            Germania <span className="text-primary">Auto Parts</span>
          </span>
        </Link>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          Secure Checkout
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left: Form */}
          <div className="space-y-8">
            {/* Guest / Sign in */}
            {!session && (
              <div className="rounded-md border p-4">
                <p className="text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>{" "}
                  for faster checkout
                </p>
              </div>
            )}

            {/* Contact */}
            <div>
              <h2 className="text-lg font-semibold">Contact</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="email">Email address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="fullName">Full name *</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="addressLine1">Address line 1 *</Label>
                  <Input
                    id="addressLine1"
                    {...register("addressLine1")}
                    className={errors.addressLine1 ? "border-red-500" : ""}
                  />
                  {errors.addressLine1 && (
                    <p className="mt-1 text-xs text-red-600">{errors.addressLine1.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address line 2</Label>
                  <Input id="addressLine2" {...register("addressLine2")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>
                    )}
                  </div>  
                  <div>
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" {...register("state")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postal code *</Label>
                    <Input
                      id="postalCode"
                      {...register("postalCode")}
                      className={errors.postalCode ? "border-red-500" : ""}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-xs text-red-600">{errors.postalCode.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={country}
                      onValueChange={(val: string | null) =>
                        setValue("country", val || "Japan")
                      }
                    >
                      <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="mt-1 text-xs text-red-600">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-lg font-semibold">Payment Method</h2>
              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-md border p-4 transition-colors hover:bg-accent">
                  <input
                    type="radio"
                    value="STRIPE"
                    {...register("paymentMethod")}
                    className="h-4 w-4 text-primary"
                  />
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Credit / Debit Card</p>
                    <p className="text-xs text-muted-foreground">
                      Visa, Mastercard, JCB, Apple Pay, Google Pay
                    </p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-md border p-4 transition-colors hover:bg-accent">
                  <input
                    type="radio"
                    value="BANK_TRANSFER"
                    {...register("paymentMethod")}
                    className="h-4 w-4 text-primary"
                  />
                  <Landmark className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">
                      Manual bank transfer — payment within 72 hours
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <Label htmlFor="customerNote">Order notes (optional)</Label>
              <Textarea
                id="customerNote"
                placeholder="Special instructions for your order..."
                className="mt-1"
                {...register("customerNote")}
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="agreeToTerms"
                onCheckedChange={(checked) =>
                  setValue("agreeToTerms", checked === true ? true : (false as unknown as true))
                }
              />
              <Label htmlFor="agreeToTerms" className="text-sm leading-snug">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-xs text-red-600">{errors.agreeToTerms.message}</p>
            )}

            {/* Submit (mobile) */}
            <div className="lg:hidden">
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {paymentMethod === "STRIPE"
                  ? `Pay ${formatPrice(subtotal)}`
                  : "Place Order"}
              </Button>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:sticky lg:top-24">
            <Card>
              <CardContent className="p-6">
                {/* Mobile toggle */}
                <button
                  type="button"
                  className="flex w-full items-center justify-between lg:pointer-events-none"
                  onClick={() => setSummaryOpen(!summaryOpen)}
                >
                  <h2 className="text-lg font-semibold">
                    Order Summary ({itemCount})
                  </h2>
                  <span className="lg:hidden">
                    {summaryOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </span>
                </button>

                <div className={summaryOpen ? "block" : "hidden lg:block"}>
                  {/* Items */}
                  <div className="mt-4 space-y-3">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-xs text-muted-foreground">
                        Calculated at next step
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Submit (desktop) */}
                <div className="mt-6 hidden lg:block">
                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {paymentMethod === "STRIPE"
                      ? `Pay ${formatPrice(subtotal)}`
                      : "Place Order"}
                  </Button>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {paymentMethod === "STRIPE"
                      ? "You will be redirected to Stripe to complete payment"
                      : "You will receive bank transfer details after placing the order"}
                  </p>
                </div>

                <div className="mt-3 text-center">
                  <Link
                    href="/cart"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ← Return to Cart
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}