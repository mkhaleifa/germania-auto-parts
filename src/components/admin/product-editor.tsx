"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/seperator";
import { ImageUpload } from "@/components/admin/image-upload";

// Form schema — slightly different from API schema for form defaults
const formSchema = z.object({
  title: z.string().min(3, "Title is required").max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().int().min(1, "Price is required"),
  comparePrice: z.coerce.number().int().min(0).optional(),
  condition: z.enum(["NEW", "GRADE_A", "GRADE_B", "GRADE_C", "GRADE_D"]),
  status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"]),
  stock: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  brand: z.string().optional(),
  weight: z.coerce.number().min(0).optional(),
  donorVehicle: z.string().optional(),
  donorMileage: z.coerce.number().int().min(0).optional(),
  testingStatus: z.string().optional(),
  conditionNotes: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  isFeatured: z.boolean(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  partNumbers: z.array(z.object({
    number: z.string().min(1),
    type: z.enum(["OEM", "AFTERMARKET", "MANUFACTURER"]),
  })),
  specs: z.array(z.object({ key: z.string(), value: z.string() })),
  vehicleIds: z.array(z.string()),
  metaDescription: z.string().optional(),
});

type FormData = z.input<typeof formSchema>;

interface Category {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
}

interface ProductEditorProps {
  productId?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function ProductEditor({ productId }: ProductEditorProps) {
  const router = useRouter();
  const isEdit = !!productId;
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      price: 0,
      condition: "NEW",
      status: "DRAFT",
      stock: 0,
      categoryId: "",
      isFeatured: false,
      images: [],
      tags: [],
      partNumbers: [],
      specs: [],
      vehicleIds: [],
    },
  });

  const { fields: partFields, append: addPart, remove: removePart } = useFieldArray({ control, name: "partNumbers" });
  const { fields: specFields, append: addSpec, remove: removeSpec } = useFieldArray({ control, name: "specs" });

  const title = watch("title");
  const tags = watch("tags");
  const vehicleIds = watch("vehicleIds");
  const images = watch("images");

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && title) {
      setValue("slug", slugify(title));
    }
  }, [title, isEdit, setValue]);

  // Load categories and vehicles
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/vehicles").then((r) => r.json()),
    ]).then(([catResult, vehResult]) => {
      setCategories(catResult.data || []);
      // Flatten vehicles from makes into individual vehicles
      const allVehicles: Vehicle[] = [];
      if (Array.isArray(vehResult.data)) {
        // The API returns makes with models — we need actual vehicle records
        // Fetch from admin API instead
        fetch("/api/admin/vehicles")
          .then((r) => r.json())
          .then((result) => setVehicles(result.data || []))
          .catch(() => {});
      }
    });
  }, []);

  // Load existing product data for edit
  useEffect(() => {
    if (!productId) return;
    fetch(`/api/admin/products/${productId}`)
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          const p = result.data;
          setValue("title", p.title);
          setValue("slug", p.slug);
          setValue("description", p.description || "");
          setValue("price", p.price);
          setValue("comparePrice", p.comparePrice || undefined);
          setValue("condition", p.condition);
          setValue("status", p.status);
          setValue("stock", p.stock);
          setValue("sku", p.sku || "");
          setValue("brand", p.brand || "");
          setValue("weight", p.weight || undefined);
          setValue("donorVehicle", p.donorVehicle || "");
          setValue("donorMileage", p.donorMileage || undefined);
          setValue("testingStatus", p.testingStatus || "");
          setValue("conditionNotes", p.conditionNotes || "");
          setValue("categoryId", p.categoryId);
          setValue("isFeatured", p.featured || false);
          setValue("images", p.images || []);
          setValue("tags", p.tags || []);
          setValue("metaDescription", p.metaDescription || "");

          if (p.partNumbers) {
            setValue("partNumbers", p.partNumbers.map((pn: { number: string; type: string }) => ({
              number: pn.number,
              type: pn.type,
            })));
          }

          if (p.specs && typeof p.specs === "object") {
            const specEntries = Object.entries(p.specs as Record<string, string>);
            setValue("specs", specEntries.map(([key, value]) => ({ key, value })));
          }

          if (p.vehicles) {
            setValue("vehicleIds", p.vehicles.map((v: Vehicle) => v.id));
          }
        }
      });
  }, [productId, setValue]);

  async function onSubmit(data: FormData) {
    setSaving(true);
    setErrorMsg("");

    // Convert specs array to object
    const specsObj: Record<string, string> = {};
    data.specs?.forEach((s) => {
      if (s.key && s.value) specsObj[s.key] = s.value;
    });

    const payload = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      price: data.price,
      comparePrice: data.comparePrice || undefined,
      condition: data.condition,
      status: data.status,
      stock: data.stock,
      sku: data.sku || undefined,
      brand: data.brand || undefined,
      weight: data.weight || undefined,
      donorVehicle: data.donorVehicle || undefined,
      donorMileage: data.donorMileage || undefined,
      testingStatus: data.testingStatus || undefined,
      conditionNotes: data.conditionNotes || undefined,
      categoryId: data.categoryId,
      isFeatured: data.isFeatured,
      tags: data.tags,
      partNumbers: data.partNumbers,
      vehicleIds: data.vehicleIds,
      images: data.images,
      specs: specsObj,
      metaDescription: data.metaDescription || undefined,
    };

    try {
      const url = isEdit ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error?.message || "Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  }

  function addTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setValue("tags", tags.filter((t) => t !== tag));
  }

  function addVehicle(id: string) {
    if (!vehicleIds.includes(id)) {
      setValue("vehicleIds", [...vehicleIds, id]);
    }
  }

  function removeVehicle(id: string) {
    setValue("vehicleIds", vehicleIds.filter((v) => v !== id));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Product" : "Add New Product"}</h1>
        </div>
        <div className="flex gap-2">
          {isEdit && (
            <Link href={`/products/${watch("slug")}`} target="_blank">
              <Button type="button" variant="outline" size="sm">
                <ExternalLink className="mr-1 h-4 w-4" />
                Preview
              </Button>
            </Link>
          )}
          <Button
            type="submit"
            disabled={saving}
            onClick={() => setValue("status", "DRAFT")}
            variant="outline"
          >
            Save Draft
          </Button>
          <Button
            type="submit"
            disabled={saving}
            onClick={() => setValue("status", "ACTIVE")}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Publish
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/20">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Card>
            <CardContent className="space-y-4 py-4">
              <h2 className="font-semibold">Basic Info</h2>
              <div>
                <Label htmlFor="title">Product Name *</Label>
                <Input id="title" {...register("title")} className={errors.title ? "border-red-500" : ""} />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input id="slug" {...register("slug")} className={errors.slug ? "border-red-500" : ""} />
                {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" rows={6} {...register("description")} className={errors.description ? "border-red-500" : ""} />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div>
                  <Label>Category *</Label>
                  <Select value={watch("categoryId")} onValueChange={(v) => { if (v) setValue("categoryId", v); }}>
                    <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Condition *</Label>
                  <Select value={watch("condition")} onValueChange={(v) => { if (v) setValue("condition", v as FormData["condition"]); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="GRADE_A">Grade A</SelectItem>
                      <SelectItem value="GRADE_B">Grade B</SelectItem>
                      <SelectItem value="GRADE_C">Grade C</SelectItem>
                      <SelectItem value="GRADE_D">Grade D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" {...register("brand")} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardContent className="space-y-4 py-4">
              <h2 className="font-semibold">Pricing & Inventory</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="price">Price (¥) *</Label>
                  <Input id="price" type="number" {...register("price")} className={errors.price ? "border-red-500" : ""} />
                </div>
                <div>
                  <Label htmlFor="comparePrice">Compare Price (¥)</Label>
                  <Input id="comparePrice" type="number" {...register("comparePrice")} />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="Auto-generated" {...register("sku")} />
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input id="stock" type="number" {...register("stock")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" step="0.1" {...register("weight")} />
                </div>
                <div>
                  <Label htmlFor="donorVehicle">Donor Vehicle</Label>
                  <Input id="donorVehicle" {...register("donorVehicle")} />
                </div>
                <div>
                  <Label htmlFor="donorMileage">Donor Mileage (km)</Label>
                  <Input id="donorMileage" type="number" {...register("donorMileage")} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Part Numbers */}
          <Card>
            <CardContent className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Part Numbers</h2>
                <Button type="button" variant="outline" size="sm" onClick={() => addPart({ number: "", type: "OEM" })}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>
              {partFields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input placeholder="Part number" {...register(`partNumbers.${i}.number`)} className="flex-1" />
                  <Select value={watch(`partNumbers.${i}.type`)} onValueChange={(v) => { if (v) setValue(`partNumbers.${i}.type`, v as "OEM" | "AFTERMARKET" | "MANUFACTURER"); }}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OEM">OEM</SelectItem>
                      <SelectItem value="AFTERMARKET">Aftermarket</SelectItem>
                      <SelectItem value="MANUFACTURER">Manufacturer Ref</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePart(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {partFields.length === 0 && (
                <p className="text-sm text-muted-foreground">No part numbers added.</p>
              )}
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardContent className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Specifications</h2>
                <Button type="button" variant="outline" size="sm" onClick={() => addSpec({ key: "", value: "" })}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>
              {specFields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input placeholder="Key" {...register(`specs.${i}.key`)} className="w-1/3" />
                  <Input placeholder="Value" {...register(`specs.${i}.value`)} className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {specFields.length === 0 && (
                <p className="text-sm text-muted-foreground">No specifications added.</p>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Compatibility */}
          <Card>
            <CardContent className="space-y-4 py-4">
              <h2 className="font-semibold">Vehicle Compatibility</h2>
              {vehicleIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {vehicleIds.map((id) => {
                    const v = vehicles.find((veh) => veh.id === id);
                    return (
                      <Badge key={id} variant="outline" className="gap-1">
                        {v ? `${v.make} ${v.model} ${v.yearStart}-${v.yearEnd}` : id}
                        <button type="button" onClick={() => removeVehicle(id)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              {vehicles.length > 0 && (
                <Select onValueChange={(v) => { if (typeof v === "string" && v) addVehicle(v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add vehicle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles
                      .filter((v) => !vehicleIds.includes(v.id))
                      .map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.make} {v.model} ({v.yearStart}-{v.yearEnd})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardContent className="space-y-4 py-4">
              <h2 className="font-semibold">Status</h2>
              <Select value={watch("status")} onValueChange={(v) => { if (v) setValue("status", v as FormData["status"]); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={watch("isFeatured")}
                  onCheckedChange={(checked) => setValue("isFeatured", checked === true)}
                />
                <label htmlFor="featured" className="text-sm">Featured product</label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardContent className="space-y-4 py-4">
              <h2 className="font-semibold">Images</h2>
              {isEdit ? (
                <ImageUpload
                  images={images}
                  onChange={(urls) => setValue("images", urls)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Save the product first, then come back to upload images.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="space-y-4 py-4">
              <h2 className="font-semibold">Tags</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardContent className="space-y-4 py-4">
              <h2 className="font-semibold">SEO</h2>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  rows={3}
                  {...register("metaDescription")}
                  placeholder="Brief description for search engines..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
