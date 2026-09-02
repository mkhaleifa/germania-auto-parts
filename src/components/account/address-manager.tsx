"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, Loader2, MapPin, Pencil, Plus, Trash2, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { addressSchema, type AddressFormInput } from "@/lib/validators/address";
import { COUNTRIES } from "@/lib/constant";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Address {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  initialAddresses: Address[];
}

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "De", isDefault: false },
  });

  const isDefault = watch("isDefault");

  function openAdd() {
    setEditingId(null);
    reset({ label: "", fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "EG", isDefault: false });
    setDialogOpen(true);
  }

  function openEdit(addr: Address) {
    setEditingId(addr.id);
    reset({
      label: addr.label || "",
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state || "",
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: AddressFormInput) {
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch("/api/account/addresses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...data }),
        });
        if (!res.ok) throw new Error("Failed to update");
        const result = await res.json();
        setAddresses((prev) =>
          prev.map((a) =>
            a.id === editingId
              ? result.data
              : data.isDefault
                ? { ...a, isDefault: false }
                : a
          )
        );
      } else {
        const res = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create");
        const result = await res.json();
        setAddresses((prev) =>
          data.isDefault
            ? [...prev.map((a) => ({ ...a, isDefault: false })), result.data]
            : [...prev, result.data]
        );
      }
      setDialogOpen(false);
      router.refresh();
    } catch {
      // error handled silently
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      }
    } finally {
      setDeleting(null);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const addr = addresses.find((a) => a.id === id);
      if (!addr) return;
      await fetch("/api/account/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addr, id, isDefault: true }),
      });
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      router.refresh();
    } catch {
      // error handled silently
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved Addresses</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button onClick={openAdd} size="sm" />}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add New Address
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Address" : "Add New Address"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <Label htmlFor="addr-label">Label (optional)</Label>
                <Input id="addr-label" placeholder="Home, Office..." {...register("label")} />
              </div>
              <div>
                <Label htmlFor="addr-name">Full Name *</Label>
                <Input id="addr-name" {...register("fullName")} className={errors.fullName ? "border-red-500" : ""} />
                {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="addr-phone">Phone *</Label>
                <Input id="addr-phone" type="tel" {...register("phone")} className={errors.phone ? "border-red-500" : ""} />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>
              <div>
                <Label htmlFor="addr-line1">Address Line 1 *</Label>
                <Input id="addr-line1" {...register("addressLine1")} className={errors.addressLine1 ? "border-red-500" : ""} />
                {errors.addressLine1 && <p className="mt-1 text-xs text-red-600">{errors.addressLine1.message}</p>}
              </div>
              <div>
                <Label htmlFor="addr-line2">Address Line 2</Label>
                <Input id="addr-line2" {...register("addressLine2")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="addr-city">City *</Label>
                  <Input id="addr-city" {...register("city")} className={errors.city ? "border-red-500" : ""} />
                </div>
                <div>
                  <Label htmlFor="addr-state">State/Province</Label>
                  <Input id="addr-state" {...register("state")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="addr-zip">Postal Code *</Label>
                  <Input id="addr-zip" {...register("postalCode")} className={errors.postalCode ? "border-red-500" : ""} />
                </div>
                <div>
                  <Label>Country *</Label>
                  <Select
                    value={watch("country")}
                    onValueChange={(val) => { if (val) setValue("country", val); }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="addr-default"
                  checked={isDefault}
                  onCheckedChange={(checked) => setValue("isDefault", checked === true)}
                />
                <label htmlFor="addr-default" className="text-sm ">Set as default address</label>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Save Changes" : "Add Address"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
            <MapPin className="h-12 w-12" />
            <p className="mt-3">No saved addresses yet.</p>
            <Button variant="outline" className="mt-3" onClick={openAdd}>
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {addr.label?.toLowerCase().includes("office") ? (
                      <Building className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Home className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">
                      {addr.label || "Address"}
                    </span>
                    {addr.isDefault && (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                  <p className="text-foreground">{addr.fullName}</p>
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}
                    {addr.state ? `, ${addr.state}` : ""} {addr.postalCode}
                  </p>
                  <p>{addr.country}</p>
                  {addr.phone && <p>{addr.phone}</p>}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(addr)}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={<Button variant="outline" size="sm" />}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Address</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this address? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(addr.id)}
                          disabled={deleting === addr.id}
                        >
                          {deleting === addr.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {!addr.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(addr.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
