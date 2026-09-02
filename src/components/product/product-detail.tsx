"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/seperator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ImageGallery } from "@/components/product/image-gallery";
import { NotifyWhenAvailable } from "@/components/product/notify-when-available";
import { useCartStore } from "@/stores/cart-store";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice, getStockStatus, cn } from "@/lib/utils";
import { CONDITION_LABELS, CONDITION_DESCRIPTIONS, type ProductCondition } from "@/types/product";
import { toast } from "sonner";

interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    comparePrice: number | null;
    condition: ProductCondition;
    stock: number;
    sku: string | null;
    brand: string | null;
    weight: number | null;
    dimensions: string | null;
    material: string | null;
    donorVehicle: string | null;
    donorMileage: number | null;
    testingStatus: string | null;
    conditionNotes: string | null;
    specs: Record<string, string> | null;
    images: { id: string; url: string; alt: string | null }[];
    partNumbers: { id: string; number: string; type: string }[];
    category: { id: string; name: string; slug: string };
    vehicles: { vehicle: { id: string; make: string; model: string; yearStart: number; yearEnd: number } }[];
  };
}

export function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { isWishlisted, loading: wishlistLoading, toggle: toggleWishlist } = useWishlist(product.id, product.slug);
  const [quantity, setQuantity] = useState(1);
  const [copiedPartNumber, setCopiedPartNumber] = useState<string | null>(null);

  const stockStatus = getStockStatus(product.stock);
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace("+", "") || "123456789";
  const oemNumber = product.partNumbers.find((pn) => pn.type === "OEM")?.number;
  const whatsappMessage = `Hi, I'm interested in: ${product.title}${oemNumber ? ` (OEM: ${oemNumber})` : ""}`;

  function handleAddToCart() {
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      image: product.images[0]?.url || "",
      condition: product.condition,
      maxStock: product.stock,
      quantity,
    });
    toast.success(`${product.title} added to cart`);
  }

  async function copyPartNumber(num: string) {
    await navigator.clipboard.writeText(num);
    setCopiedPartNumber(num);
    setTimeout(() => setCopiedPartNumber(null), 2000);
  }

  // Build specs table
  const specRows: { label: string; value: string }[] = [];
  if (product.brand) specRows.push({ label: "Brand", value: product.brand });
  specRows.push({ label: "Condition", value: `${CONDITION_LABELS[product.condition]} — ${CONDITION_DESCRIPTIONS[product.condition]}` });
  if (product.weight) specRows.push({ label: "Weight", value: `${product.weight} kg` });
  if (product.dimensions) specRows.push({ label: "Dimensions", value: product.dimensions });
  if (product.material) specRows.push({ label: "Material", value: product.material });
  if (product.donorVehicle) specRows.push({ label: "Donor Vehicle", value: product.donorVehicle });
  if (product.donorMileage) specRows.push({ label: "Donor Mileage", value: `${product.donorMileage.toLocaleString()} km` });
  if (product.testingStatus) specRows.push({ label: "Testing", value: product.testingStatus });
  if (product.specs) {
    for (const [key, value] of Object.entries(product.specs)) {
      specRows.push({ label: key, value: String(value) });
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Image Gallery */}
      <ImageGallery images={product.images} title={product.title} />

      {/* Product Info */}
      <div>
        {/* Title & SKU */}
        <h1 className="text-2xl font-bold md:text-3xl">{product.title}</h1>
        {product.sku && (
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            SKU: {product.sku}
          </p>
        )}

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.comparePrice!)}
              </span>
              <Badge variant="destructive">
                {discountPercent}% off
              </Badge>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Tax included</p>

        {/* Condition */}
        <div className="mt-4">
          <Badge variant="secondary" className="text-sm">
            {product.condition === "NEW" ? "New" : `Used — ${CONDITION_LABELS[product.condition]}`}
          </Badge>
          {product.conditionNotes && (
            <p className="mt-1 text-sm text-muted-foreground">
              {product.conditionNotes}
            </p>
          )}
        </div>

        {/* Stock */}
        <p className={cn("mt-3 text-sm font-medium", stockStatus.color)}>
          {stockStatus.label}
        </p>

        {/* Part Numbers */}
        {product.partNumbers.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold">Part Numbers</p>
            <div className="mt-1 space-y-1">
              {product.partNumbers.map((pn) => (
                <div key={pn.id} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {pn.type}
                  </Badge>
                  <span className="font-mono text-sm">{pn.number}</span>
                  <button
                    className="p-1 text-muted-foreground hover:text-foreground"
                    onClick={() => copyPartNumber(pn.number)}
                    aria-label={`Copy ${pn.number}`}
                  >
                    {copiedPartNumber === pn.number ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehicle Compatibility */}
        {product.vehicles.length > 0 && (
          <div className="mt-4 rounded-md border p-3">
            <p className="text-sm font-semibold">Compatible Vehicles</p>
            <div className="mt-2 space-y-1">
              {product.vehicles.map((pv) => (
                <p key={pv.vehicle.id} className="flex items-center gap-2 text-sm">
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  {pv.vehicle.make} {pv.vehicle.model} {pv.vehicle.yearStart}–{pv.vehicle.yearEnd}
                </p>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Quantity & Add to Cart */}
        {!isOutOfStock && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled={wishlistLoading}
            onClick={toggleWishlist}
          >
            <Heart className={cn("mr-2 h-5 w-5", isWishlisted && "fill-red-600 text-red-600")} />
            {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
          </Button>
        </div>

        {/* Notify when available */}
        {isOutOfStock && (
          <div className="mt-4">
            <NotifyWhenAvailable productSlug={product.slug} />
          </div>
        )}

        {/* WhatsApp & Quote */}
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            nativeButton={false}
            render={
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Ask on WhatsApp
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Truck, label: "Free shipping", desc: "Over $10,000" },
            { icon: Shield, label: "30-day returns", desc: "Easy returns" },
            { icon: RefreshCw, label: "6-month warranty", desc: "On used parts" },
          ].map((badge) => (
            <div key={badge.label} className="text-center">
              <badge.icon className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-1 text-xs font-medium">{badge.label}</p>
              <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs (Desktop) */}
      <div className="hidden md:col-span-2 md:block">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4">
            <div className="prose max-w-none dark:prose-invert">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="mt-4">
            {specRows.length > 0 ? (
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <tbody>
                    {specRows.map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                        <td className="px-4 py-2 font-medium">{row.label}</td>
                        <td className="px-4 py-2 text-muted-foreground">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No specifications available.</p>
            )}
          </TabsContent>
          <TabsContent value="compatibility" className="mt-4">
            {product.vehicles.length > 0 ? (
              <div className="space-y-2">
                {product.vehicles.map((pv) => (
                  <div key={pv.vehicle.id} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>
                      {pv.vehicle.make} {pv.vehicle.model} ({pv.vehicle.yearStart}–{pv.vehicle.yearEnd})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No vehicle compatibility data available. Contact us for fitment info.
              </p>
            )}
          </TabsContent>
          <TabsContent value="shipping" className="mt-4">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">German Mark</p>
                <p className="text-muted-foreground">
                  From €800. Free shipping on orders over €10,000.
                </p>
              </div>
              <div>
                <p className="font-medium">International</p>
                <p className="text-muted-foreground">
                  From $3,000. Calculated at checkout based on weight and destination.
                </p>
              </div>
              <div>
                <p className="font-medium">Processing Time</p>
                <p className="text-muted-foreground">
                  Orders are processed within 1–2 business days. International shipping typically takes 5–14 business days.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Accordion (Mobile) */}
      <div className="col-span-full md:hidden">
        <Accordion defaultValue={["description"]}>
          <AccordionItem value="description">
            <AccordionTrigger>Description</AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line text-sm">{product.description}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="specifications">
            <AccordionTrigger>Specifications</AccordionTrigger>
            <AccordionContent>
              {specRows.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {specRows.map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="font-medium">{row.label}</span>
                      <span className="text-muted-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No specifications available.</p>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="compatibility">
            <AccordionTrigger>Compatibility</AccordionTrigger>
            <AccordionContent>
              {product.vehicles.length > 0 ? (
                <div className="space-y-1 text-sm">
                  {product.vehicles.map((pv) => (
                    <p key={pv.vehicle.id} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      {pv.vehicle.make} {pv.vehicle.model} {pv.vehicle.yearStart}–{pv.vehicle.yearEnd}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No compatibility data available.</p>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">German:</span>{" "}
                  <span className="text-muted-foreground">From €800. Free over €10,000.</span>
                </p>
                <p>
                  <span className="font-medium">International:</span>{" "}
                  <span className="text-muted-foreground">From $3,000.</span>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}