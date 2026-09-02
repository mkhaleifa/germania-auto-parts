"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Car, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

interface Vehicle {
  id: string;
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  generation?: string | null;
  productCount: number;
}

interface VehicleFormData {
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  generation: string;
}

const defaultForm: VehicleFormData = {
  make: "",
  model: "",
  yearStart: 1990,
  yearEnd: 2025,
  generation: "",
};

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vehicles");
      const result = await res.json();
      setVehicles(result.data || []);
    } catch {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const filtered = vehicles.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (v.generation?.toLowerCase().includes(q) ?? false)
    );
  });

  function openAdd() {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  }

  function openEdit(v: Vehicle) {
    setEditingId(v.id);
    setForm({
      make: v.make,
      model: v.model,
      yearStart: v.yearStart,
      yearEnd: v.yearEnd,
      generation: v.generation || "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.make.trim() || !form.model.trim()) {
      toast.error("Make and model are required");
      return;
    }
    if (form.yearEnd < form.yearStart) {
      toast.error("Year To must be >= Year From");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        make: form.make.trim(),
        model: form.model.trim(),
        yearStart: form.yearStart,
        yearEnd: form.yearEnd,
        generation: form.generation.trim() || undefined,
      };

      const res = editingId
        ? await fetch("/api/admin/vehicles", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingId, ...payload }),
          })
        : await fetch("/api/admin/vehicles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to save");
      }

      toast.success(editingId ? "Vehicle updated" : "Vehicle added");
      setDialogOpen(false);
      fetchVehicles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save vehicle");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/vehicles?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to delete");
      }
      toast.success("Vehicle deleted");
      fetchVehicles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete vehicle");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Vehicle Database</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const headers = ["Make", "Model", "Year From", "Year To", "Generation", "Parts"];
              const rows = filtered.map((v) => [
                v.make, v.model, v.yearStart, v.yearEnd, v.generation || "", v.productCount,
              ]);
              const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "vehicles.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={filtered.length === 0}
          >
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search makes/models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
              <Car className="h-8 w-8" />
              <p>No vehicles found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3 font-medium">Make</th>
                    <th className="p-3 font-medium">Model</th>
                    <th className="p-3 font-medium">Years</th>
                    <th className="p-3 font-medium hidden md:table-cell">Generation</th>
                    <th className="p-3 font-medium">Parts</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-medium">{v.make}</td>
                      <td className="p-3">{v.model}</td>
                      <td className="p-3 text-muted-foreground">
                        {v.yearStart}–{v.yearEnd}
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        {v.generation || "—"}
                      </td>
                      <td className="p-3">{v.productCount}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openEdit(v)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  disabled={deleting === v.id}
                                />
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete {v.make} {v.model} ({v.yearStart}–{v.yearEnd})?
                                  {v.productCount > 0 &&
                                    ` This vehicle has ${v.productCount} products assigned and cannot be deleted.`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(v.id)}
                                  disabled={v.productCount > 0}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        {filtered.length} vehicle{filtered.length !== 1 ? "s" : ""} total
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={form.make}
                onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                placeholder="Toyota"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                placeholder="Corolla"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="yearStart">Year From *</Label>
                <Input
                  id="yearStart"
                  type="number"
                  min={1970}
                  max={2030}
                  value={form.yearStart}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, yearStart: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="yearEnd">Year To *</Label>
                <Input
                  id="yearEnd"
                  type="number"
                  min={1970}
                  max={2030}
                  value={form.yearEnd}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, yearEnd: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="generation">Generation</Label>
              <Input
                id="generation"
                value={form.generation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, generation: e.target.value }))
                }
                placeholder="E120, GR Corolla, etc."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Vehicle" : "Save Vehicle"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}