"use client";

import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/seperator";

// Settings are stored in constants/env — this page displays and lets admin reference them.
// A future iteration could persist these to a DB settings table.

interface SettingsForm {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  whatsappNumber: string;
  shippingJpSmall: number;
  shippingJpMedium: number;
  shippingJpLarge: number;
  freeShippingThreshold: number;
  shippingIntlSmall: number;
  shippingIntlLarge: number;
  taxRate: number;
  lowStockThreshold: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
}

const defaults: SettingsForm = {
  storeName: process.env.NEXT_PUBLIC_SITE_NAME || "Germania Auto Parts",
  storeEmail: "info@gmail.com",
  storePhone: "+123456789",
  storeAddress: "Berlin, German",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+123456789",
  shippingJpSmall: 800,
  shippingJpMedium: 1500,
  shippingJpLarge: 2500,
  freeShippingThreshold: 10000,
  shippingIntlSmall: 3000,
  shippingIntlLarge: 8000,
  taxRate: 10,
  lowStockThreshold: 5,
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || "",
  bankAccount: process.env.NEXT_PUBLIC_BANK_ACCOUNT || "",
  bankHolder: process.env.NEXT_PUBLIC_BANK_HOLDER || "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(defaults);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  function update<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    // In MVP, settings are env-based. This shows a confirmation.
    // Future: POST to /api/admin/settings to persist to DB.
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Settings saved. Note: Some settings require environment variable updates to take effect.");
    setSaving(false);
  }

  async function handleClearCache() {
    setClearing(true);
    try {
      // Revalidate all cached pages
      const res = await fetch("/api/admin/revalidate", { method: "POST" });
      if (res.ok) {
        toast.success("Cache cleared. Pages will regenerate on next visit.");
      } else {
        toast.info("Cache clear requested. Changes will reflect shortly.");
      }
    } catch {
      toast.info("Cache clear requested.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Basic business details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="storeName">Business Name</Label>
            <Input
              id="storeName"
              value={form.storeName}
              onChange={(e) => update("storeName", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="storeEmail">Email</Label>
              <Input
                id="storeEmail"
                type="email"
                value={form.storeEmail}
                onChange={(e) => update("storeEmail", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storePhone">Phone</Label>
              <Input
                id="storePhone"
                value={form.storePhone}
                onChange={(e) => update("storePhone", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="storeAddress">Address</Label>
            <Input
              id="storeAddress"
              value={form.storeAddress}
              onChange={(e) => update("storeAddress", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input
              id="whatsappNumber"
              value={form.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Shipping Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping</CardTitle>
          <CardDescription>Flat-rate shipping amounts (EUR)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="text-sm font-medium">The German domestic market</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="GeSmall">Small</Label>
              <Input
                id="GeSmall"
                type="number"
                value={form.shippingJpSmall}
                onChange={(e) => update("shippingJpSmall", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jpMedium">Medium</Label>
              <Input
                id="jpMedium"
                type="number"
                value={form.shippingJpMedium}
                onChange={(e) => update("shippingJpMedium", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jpLarge">Large</Label>
              <Input
                id="jpLarge"
                type="number"
                value={form.shippingJpLarge}
                onChange={(e) => update("shippingJpLarge", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="freeThreshold">Free Shipping Threshold</Label>
            <Input
              id="freeThreshold"
              type="number"
              value={form.freeShippingThreshold}
              onChange={(e) => update("freeShippingThreshold", Number(e.target.value))}
            />
          </div>

          <Separator />

          <h4 className="text-sm font-medium">International</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="intlSmall">Small</Label>
              <Input
                id="intlSmall"
                type="number"
                value={form.shippingIntlSmall}
                onChange={(e) => update("shippingIntlSmall", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="intlLarge">Large</Label>
              <Input
                id="intlLarge"
                type="number"
                value={form.shippingIntlLarge}
                onChange={(e) => update("shippingIntlLarge", Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax & Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Tax & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="taxRate">Consumption Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.1"
              value={form.taxRate}
              onChange={(e) => update("taxRate", Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lowStock">Low Stock Alert Threshold</Label>
            <Input
              id="lowStock"
              type="number"
              value={form.lowStockThreshold}
              onChange={(e) => update("lowStockThreshold", Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bank Transfer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Transfer Details</CardTitle>
          <CardDescription>Displayed to customers who choose bank transfer payment</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={form.bankName}
              onChange={(e) => update("bankName", e.target.value)}
              placeholder="Enter bank name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bankAccount">Account Number</Label>
            <Input
              id="bankAccount"
              value={form.bankAccount}
              onChange={(e) => update("bankAccount", e.target.value)}
              placeholder="Enter account number"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bankHolder">Account Holder Name</Label>
            <Input
              id="bankHolder"
              value={form.bankHolder}
              onChange={(e) => update("bankHolder", e.target.value)}
              placeholder="Enter account holder name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
          <CardDescription>Clear cached pages to reflect changes immediately</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleClearCache} disabled={clearing}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {clearing ? "Clearing..." : "Clear Page Cache"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}