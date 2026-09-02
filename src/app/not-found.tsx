import Link from "next/link";
import { Search, Home, ChevronRight } from "lucide-react";

const popularCategories = [
  { label: "Engine Parts", href: "/categories/engine-parts" },
  { label: "Suspension", href: "/categories/suspension" },
  { label: "Brakes", href: "/categories/brakes" },
  { label: "Body Parts", href: "/categories/body-parts" },
  { label: "Electrical", href: "/categories/electrical" },
  { label: "Transmission", href: "/categories/transmission" },
];

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="mx-auto max-w-lg text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The part you&apos;re looking for doesn&apos;t exist or may have been moved.
          Try searching for it or browse our categories below.
        </p>

        {/* Search */}
        <form action="/search" method="GET" className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Search for auto parts..."
              className="w-full rounded-md border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </form>

        {/* Popular Categories */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground mb-3">Popular Categories</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm hover:bg-muted transition-colors"
              >
                {cat.label}
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>

        {/* Go Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}