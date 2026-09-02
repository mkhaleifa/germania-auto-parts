"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const page = Number(searchParams.get("page")) || 1;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/admin/customers?${params}`);
      const result = await res.json();
      setCustomers(result.data || []);
      setTotalPages(result.pagination?.totalPages || 0);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set("search", search);
    else params.delete("search");
    params.set("page", "1");
    router.push(`/admin/customers?${params}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customers</h1>

      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </form>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No customers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium hidden md:table-cell">Phone</th>
                    <th className="p-3 font-medium">Orders</th>
                    <th className="p-3 font-medium">Total Spent</th>
                    <th className="p-3 font-medium hidden lg:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-medium">{c.name || "—"}</td>
                      <td className="p-3 text-muted-foreground">{c.email}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{c.phone || "—"}</td>
                      <td className="p-3">{c.orderCount}</td>
                      <td className="p-3 font-medium">{formatPrice(c.totalSpent)}</td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(p));
                router.push(`/admin/customers?${params}`);
              }}
            >
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}