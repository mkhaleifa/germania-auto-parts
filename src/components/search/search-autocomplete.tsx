"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Package, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice, cn } from "@/lib/utils";
import { CONDITION_LABELS, type ProductCondition } from "@/types/product";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  price: number;
  condition: ProductCondition;
  images: { url: string; alt: string | null }[];
}

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

export function SearchAutocomplete({
  placeholder = "Search parts, vehicles...",
  className,
  onClose,
  autoFocus,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(query)}&limit=5`
        );
        const json = await res.json();
        setResults(json.data || []);
        setIsOpen(true);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateToResult = useCallback(
    (slug: string) => {
      setIsOpen(false);
      setQuery("");
      router.push(`/products/${slug}`);
    },
    [router]
  );

  const navigateToSearch = useCallback(() => {
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }, [query, router]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsOpen(false);
      onClose?.();
      return;
    }

    if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        navigateToResult(results[activeIndex].slug);
      } else {
        navigateToSearch();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < results.length ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > -1 ? prev - 1 : -1));
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          className="pl-9 pr-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          autoFocus={autoFocus}
        />
        {query && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border bg-popover shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent",
                    index === activeIndex && "bg-accent"
                  )}
                  onClick={() => navigateToResult(result.slug)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-muted">
                    {result.images[0]?.url ? (
                      <Image
                        src={result.images[0].url}
                        alt={result.images[0].alt || result.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{result.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {CONDITION_LABELS[result.condition]}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-sm font-bold text-primary">
                    {formatPrice(result.price)}
                  </span>
                </button>
              ))}
            </>
          )}

          {/* See all results */}
          {query.trim() && (
            <button
              className={cn(
                "flex w-full items-center justify-center gap-2 border-t px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-accent",
                activeIndex === results.length && "bg-accent"
              )}
              onClick={navigateToSearch}
              onMouseEnter={() => setActiveIndex(results.length)}
            >
              <Search className="h-3.5 w-3.5" />
              See all results for &ldquo;{query}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}