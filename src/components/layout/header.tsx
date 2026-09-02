"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Heart,
  LogIn,
  Menu,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Image from "next/image";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { CATEGORIES } from "@/lib/constant";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openCart, getItemCount } = useCartStore();
  const wishlistCount = useWishlistStore((s) => s.count);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const itemCount = hasHydrated ? getItemCount() : 0;
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="lg:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Image
                    src="/fast.png"
                    alt="Germania Auto Parts"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="text-xl font-bold text-primary">Germania Auto Parts</span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === link.href && "bg-accent text-primary"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 border-t pt-2">
                <p className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
                  Categories
                </p>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              <div className="mt-4 border-t pt-4 space-y-1">
                {session ? (
                  <>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                    <Link
                      href="/account/wishlist"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Wishlist
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setMobileOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        setMobileOpen(false);
                        signOut();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                )}
              </div>

              <div className="mt-2 px-3">
                <ThemeToggle />
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/fast.png"
            alt="Germania Auto Parts"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="hidden text-lg font-bold sm:inline-block">
            Germania <span className="text-primary">Auto Parts</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) =>
            link.label === "Products" ? (
              <DropdownMenu key={link.href}>
                <DropdownMenuTrigger
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                    pathname.startsWith("/products") && "text-primary"
                  )}
                >
                  Products
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem render={<Link href="/products" />}>
                    All Products
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {CATEGORIES.map((cat) => (
                    <DropdownMenuItem
                      key={cat.slug}
                      render={<Link href={`/categories/${cat.slug}`} />}
                    >
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  pathname === link.href && "text-primary"
                )}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Search bar (desktop) */}
        <div className="hidden flex-1 justify-center lg:flex">
          <SearchAutocomplete className="w-full max-w-md" />
        </div>

        {/* Mobile search toggle */}
        <div className="flex-1 lg:hidden">
          {searchOpen ? (
            <SearchAutocomplete
              placeholder="Search parts..."
              autoFocus
              onClose={() => setSearchOpen(false)}
            />
          ) : (
            <div className="flex justify-end">
              <button
                className="p-2 hover:bg-muted rounded-md"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle — visible on all screen sizes */}
          <ThemeToggle />

          {session && (
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              <Link
                href="/account/wishlist"
                className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
                aria-label={`Wishlist (${wishlistCount} items)`}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </Badge>
                )}
              </Link>
            </div>
          )}

          {/* Cart button */}
          <button
            className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
            onClick={openCart}
            aria-label={`Cart (${itemCount} items)`}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]">
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </button>

          {/* User menu (desktop) */}
          <div className="hidden lg:block">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
                  aria-label="Account menu"
                >
                  <User className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">
                      {session.user?.name || "Account"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/account" />}>
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/account/orders" />}>
                    <Package className="mr-2 h-4 w-4" />
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/account/wishlist" />}>
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem render={<Link href="/admin" />}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/account/settings" />}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}