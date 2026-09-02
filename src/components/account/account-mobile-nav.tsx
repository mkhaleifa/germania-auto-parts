"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, MapPin, Package, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils"

const tabs = [
    {href: "/account" , label: "overview" , icon: User},
    { href: "/account/orders", label: "Orders", icon: Package },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
    { href: "/account/settings", label: "Settings", icon: Settings },
]

export function AccountMobileNav(){
    const pathname = usePathname()
    return  (
        <div className="w-full overflow-x-flow lg:hidden">
            <div className="flex gap-1 border-b pb-2">
            {tabs.map((tab) => {
            const isActive =
            tab.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(tab.href);
              const Icon = tab.icon;
            return (
            <Link 
            key={tab.href}
            href={tab.href} 
            className={cn(`
            flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent`,
            isActive && "bg-accent text-primary"
            )}
            >
                <Icon className="h-4 w-4"/>
                {tab.label}
            </Link>
          );    
                })}
            </div>
        </div>
    );
}