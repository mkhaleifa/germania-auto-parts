"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Save, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/seperator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  customerNote: string | null;
  adminNote: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string | null;
  shippingZip: string;
  shippingCountry: string;
  guestEmail: string | null;
  bankTransferProof: string | null;
  paymentVerifiedAt: string | null;
  createdAt: string;
  user: { name: string; email: string; phone: string | null } | null;
  items: Array<{
    id: string;
    title: string;
    image: string | null;
    price: number;
    quantity: number;
    product: { slug: string } | null;
  }>;
}

const statusOptions = [
  "PENDING", "AWAITING_PAYMENT", "CONFIRMED", "PROCESSING",
  "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
];

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          setOrder(result.data);
          setStatus(result.data.status);
          setTrackingNumber(result.data.trackingNumber || "");
          setTrackingCarrier(result.data.trackingCarrier || "");
          setAdminNote(result.data.adminNote || "");
        }
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || undefined,
          trackingCarrier: trackingCarrier || undefined,
          adminNote: adminNote || undefined,
        }),
      });

      if (res.ok) {
        router.refresh();
        // Refetch
        const result = await fetch(`/api/admin/orders/${orderId}`).then((r) => r.json());
        if (result.data) setOrder(result.data);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-muted-foreground">Order not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">
            Order <span className="font-mono">{order.orderNumber}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <Card>
            <CardContent className="p-0">
              <div className="p-4">
                <h2 className="font-semibold">Items</h2>
              </div>
              <Separator />
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b p-4 last:border-0">
                  {item.image && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                      <Image src={item.image} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
              <Separator />
              <div className="space-y-1 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Shipping */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="py-4">
                <h3 className="mb-2 font-semibold">Customer</h3>
                <p className="text-sm">{order.user?.name || order.shippingName}</p>
                <p className="text-sm text-muted-foreground">{order.user?.email || order.guestEmail}</p>
                {(order.user?.phone || order.shippingPhone) && (
                  <p className="text-sm text-muted-foreground">{order.user?.phone || order.shippingPhone}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <h3 className="mb-2 font-semibold">Shipping Address</h3>
                <p className="text-sm">{order.shippingName}</p>
                <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingCity}{order.shippingState ? `, ${order.shippingState}` : ""} {order.shippingZip}
                </p>
                <p className="text-sm text-muted-foreground">{order.shippingCountry}</p>
              </CardContent>
            </Card>
          </div>

          {/* Customer note */}
          {order.customerNote && (
            <Card>
              <CardContent className="py-4">
                <h3 className="mb-2 font-semibold">Customer Note</h3>
                <p className="text-sm text-muted-foreground">{order.customerNote}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — Status & Actions */}
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 py-4">
              <h2 className="font-semibold">Update Order</h2>

              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => { if (v) setStatus(v); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="carrier">Carrier</Label>
                <Input
                  id="carrier"
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  placeholder="e.g. Japan Post, Yamato"
                />
              </div>

              <div>
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <Label htmlFor="admin-note">Admin Notes</Label>
                <Textarea
                  id="admin-note"
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Internal notes..."
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Update Order
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <h3 className="mb-2 font-semibold">Payment</h3>
              <p className="text-sm">
                {order.paymentMethod === "STRIPE" ? "Credit Card (Stripe)" : "Bank Transfer"}
              </p>
              {order.paymentMethod === "BANK_TRANSFER" && (
                <div className="mt-2">
                  {order.paymentVerifiedAt ? (
                    <Badge className="bg-green-100 text-green-800">Payment Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600">Awaiting Payment</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}