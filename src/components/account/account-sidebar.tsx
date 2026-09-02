"use client"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Heart, LogOut, MapPin, Package, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils"

import Link from "next/link";
const sidebarLinks = [
    {href: "/account" , label: "overview" , icon: User},
    { href: "/account/orders", label: "Orders", icon: Package },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
    { href: "/account/settings", label: "Settings", icon: Settings },
]


export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {sidebarLinks.map((link) => {
        const isActive =
          link.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
              isActive && "bg-accent text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
      <button 
        onClick={()=> signOut({callbackUrl: '/'})}
        className="flex flex-items gap-2 rounded-md px-3 py-2 text-small font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
        <LogOut className="h-4 w-4"/>
        SignOut
      </button>
      </nav>
  )}