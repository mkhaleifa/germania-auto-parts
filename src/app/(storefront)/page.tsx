import Link from "next/link";
import {
  Car,
  Cog,
  CircleDot,
  Zap,
  Armchair,
  Wind,
  Thermometer,
  Circle,
  Droplets,
  Truck,
  Shield,
  Globe,
  Headphones,
  Package,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constant";
import { VehicleSelector } from "@/components/vehicle/vehicle-selector";
import { ProductCard } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import type { ProductCondition } from "@/types/product";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "engine-drivetrain": Cog,
  "brakes-suspension": CircleDot,
  "electrical-lighting": Zap,
  "body-exterior": Car,
  "interior-accessories": Armchair,
  "exhaust-emissions": Wind,
  "cooling-hvac": Thermometer,
  "wheels-tires": Circle,
  "filters-fluids": Droplets,
};

const POPULAR_MAKES = [
  "Mercedes-Benz",
  "BMW",
  "Porsche",
  "Volkswagen",
  "Audi",
  "Skoda",
];

export const revalidate = 60;

async function getFeaturedProducts() {
  try {
    const products = await db.product.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        comparePrice: true,
        condition: true,
        stock: true,
        brand: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 2,
          select: { url: true, alt: true },
        },
        category: { select: { name: true, slug: true } },
      },
    });
    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }));
  } catch {
    return [];
  }
}

async function getNewArrivals() {
  try {
    const products = await db.product.findMany({
      where: { status: "ACTIVE" },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        comparePrice: true,
        condition: true,
        stock: true,
        brand: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 2,
          select: { url: true, alt: true },
        },
        category: { select: { name: true, slug: true } },
      },
    });
    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }));
  } catch {
    return [];
  }
}

async function getProductCount() {
  try {
    return await db.product.count({ where: { status: "ACTIVE" } });
  } catch {
    return 0;
  }
}

export default async function HomePage() {
  const [featuredProducts, newArrivals, productCount] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getProductCount(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              German parts,{" "}
              <span className="text-primary">chosen with confidence.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Genuine OEM and premium aftermarket components for German vehicles.
              Clearly graded, fairly priced and shipped from Germany.
            </p>
            <div className="mt-8 rounded-lg border bg-background/80 p-4 backdrop-blur-sm">
              <p className="mb-3 text-sm font-medium">Find parts for your vehicle</p>
              <VehicleSelector variant="hero" />
            </div>
            <div className="mt-4 flex items-center gap-4">
            <Button
              variant="outline"
              render={<Link href="/products" />}
              nativeButton={false}
            >
              Browse All Products
            </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b bg-muted/30 py-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 md:grid-cols-4 md:px-6">
          {[
            { icon: Truck, label: "Free German Shipping", desc: "Orders over €250" },
            { icon: Shield, label: "Quality Verified", desc: "Every part inspected" },
            { icon: Package, label: "Transparent Pricing", desc: "All prices in EUR" },
            { icon: Globe, label: "Worldwide Shipping", desc: "Germany + international" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="h-8 w-8 flex-shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Shop by Category</h2>
            <p className="mt-2 text-muted-foreground">
              Browse our German-market parts catalogue
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] || Package;
              return (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group"
                >
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <Icon className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
                      <p className="mt-3 text-sm font-semibold">{cat.name}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <p className="mt-2 text-muted-foreground">
                  Hand-picked quality parts
                </p>
              </div>
              <Button
                variant="outline"
                render={<Link href="/products?isFeatured=true" />}
                nativeButton={false}
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  condition={product.condition as ProductCondition}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shop by Vehicle */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Shop by Vehicle</h2>
            <p className="mt-2 text-muted-foreground">
              Find parts compatible with your car
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {POPULAR_MAKES.map((make) => (
              <Link key={make} href={`/products?vehicleMake=${make}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-5 py-2.5 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {make}
                </Badge>
              </Link>
            ))}
            <Link href="/vehicles">
              <Badge className="cursor-pointer px-5 py-2.5 text-sm font-medium">
                Use Vehicle Selector
                <ArrowRight className="ml-1 h-3 w-3" />
              </Badge>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">New Arrivals</h2>
                <p className="mt-2 text-muted-foreground">
                  Latest parts added to our catalog
                </p>
              </div>
              <Button
                variant="outline"
                render={<Link href="/products?sort=newest" />}
                nativeButton={false}
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  condition={product.condition as ProductCondition}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Germania */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Why Germania Auto Parts?</h2>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Package,
                title: "Direct from Germany",
                desc: "We source parts from Germany's specialist suppliers and dismantlers, with clear condition grading for every item.",
              },
              {
                icon: CheckCircle,
                title: "Quality Guaranteed",
                desc: "Every used part is professionally inspected and graded before listing. Know exactly what you're getting.",
              },
              {
                icon: Headphones,
                title: "Expert Support",
                desc: "Real auto parts knowledge via WhatsApp. We help you find the right part for your vehicle.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6 text-center">
                  <item.icon className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-primary py-12 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center md:grid-cols-4 md:px-6">
          {[
            { value: productCount > 0 ? `${productCount}+` : "500+", label: "Parts Available" },
            { value: "15+", label: "Countries Shipped" },
            { value: "10+", label: "Years Experience" },
            { value: "4.8/5", label: "Customer Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-xl px-4 text-center md:px-6">
          <h2 className="text-2xl font-bold">Stay Updated</h2>
          <p className="mt-2 text-muted-foreground">
            Get notified about new German-market arrivals and exclusive deals.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
