"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  Download,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  condition: string;
  category: string;
  image: string | null;
  brand: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  OUT_OF_STOCK: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-500",
};

export function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const page = Number(searchParams.get("page")) || 1;
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    try {
      const res = await fetch(`/api/admin/products?${params}`);
      const result = await res.json();
      setProducts(result.data || []);
      setPagination(result.pagination || null);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  }, [page, search, status, category, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.set("page", "1");
    router.push(`/admin/products?${params}`);
  }

  function handleSort(column: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (sortBy === column) {
      params.set("sortOrder", sortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", column);
      params.set("sortOrder", "desc");
    }
    router.push(`/admin/products?${params}`);
  }

  function toggleAll() {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleBulkAction(newStatus: string) {
    if (selected.size === 0) return;
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: Array.from(selected), status: newStatus }),
    });
    setSelected(new Set());
    fetchProducts();
  }

  function handleExportCSV() {
    const headers = ["Title", "SKU", "Category", "Condition", "Price", "Stock", "Status"];
    const rows = products.map((p) => [
      `"${p.title}"`, p.sku, p.category, p.condition, p.price, p.stock, p.status,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams("search", search);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select value={status} onValueChange={(v) => updateParams("status", v || "")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-1 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-2">
          <span className="text-sm">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("ACTIVE")}>
            Set Active
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("ARCHIVED")}>
            Archive
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3 w-10">
                      <Checkbox
                        checked={selected.size === products.length && products.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </th>
                    <th className="p-3 w-12"></th>
                    <th className="p-3">
                      <button onClick={() => handleSort("title")} className="inline-flex items-center gap-1 font-medium hover:text-foreground">
                        Name <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="p-3 hidden md:table-cell">Category</th>
                    <th className="p-3 hidden lg:table-cell">Condition</th>
                    <th className="p-3">
                      <button onClick={() => handleSort("price")} className="inline-flex items-center gap-1 font-medium hover:text-foreground">
                        Price <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="p-3">
                      <button onClick={() => handleSort("stock")} className="inline-flex items-center gap-1 font-medium hover:text-foreground">
                        Stock <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="p-3">Status</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3">
                        <Checkbox
                          checked={selected.has(product.id)}
                          onCheckedChange={() => toggleOne(product.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[8px] text-muted-foreground">
                              N/A
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {product.title}
                        </Link>
                        <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        {product.category}
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {product.condition.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">{formatPrice(product.price)}</td>
                      <td className="p-3">
                        <span className={product.stock === 0 ? "text-red-600 font-medium" : product.stock <= 5 ? "text-amber-600 font-medium" : ""}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[product.status] || ""}`}>
                          {product.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem render={<Link href={`/admin/products/${product.id}`} />}>
                              <Pencil className="mr-2 h-3 w-3" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem render={<Link href={`/products/${product.slug}`} target="_blank" />}>
                              <ExternalLink className="mr-2 h-3 w-3" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleBulkAction("ARCHIVED")}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.perPage + 1}–
            {Math.min(pagination.page * pagination.perPage, pagination.totalCount)} of{" "}
            {pagination.totalCount}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map(
              (p) => (
                <Button
                  key={p}
                  variant={p === pagination.page ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateParams("page", String(p))}
                >
                  {p}
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}