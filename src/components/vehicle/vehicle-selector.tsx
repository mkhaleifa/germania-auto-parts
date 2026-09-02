"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Car, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VehicleMake } from "@/types/vehicle";

interface VehicleModel {
  model: string;
  yearStart: number;
  yearEnd: number;
  count: number;
}

interface VehicleSelectorProps {
  variant?: "hero" | "sidebar" | "page";
  onSelect?: (selection: { make: string; model: string; year: number }) => void;
}

export function VehicleSelector({
  variant = "hero",
  onSelect,
}: VehicleSelectorProps) {
  const router = useRouter();
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [years, setYears] = useState<number[]>([]);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

  // Fetch makes on mount
  useEffect(() => {
    async function fetchMakes() {
      try {
        const res = await fetch("/api/vehicles");
        const json = await res.json();
        setMakes(json.data || []);
      } catch {
        console.error("Failed to fetch makes");
      } finally {
        setLoadingMakes(false);
      }
    }
    fetchMakes();
  }, []);

  // Fetch models when make changes
  const fetchModels = useCallback(async (make: string) => {
    setLoadingModels(true);
    setModels([]);
    setYears([]);
    setSelectedModel("");
    setSelectedYear("");
    try {
      const res = await fetch(`/api/vehicles/${encodeURIComponent(make)}`);
      const json = await res.json();
      setModels(json.data || []);
    } catch {
      console.error("Failed to fetch models");
    } finally {
      setLoadingModels(false);
    }
  }, []);

  // Fetch years when model changes
  const fetchYears = useCallback(
    async (make: string, model: string) => {
      setLoadingYears(true);
      setYears([]);
      setSelectedYear("");
      try {
        const res = await fetch(
          `/api/vehicles/${encodeURIComponent(make)}/${encodeURIComponent(model)}`
        );
        const json = await res.json();
        setYears(json.data?.years || []);
      } catch {
        console.error("Failed to fetch years");
      } finally {
        setLoadingYears(false);
      }
    },
    []
  );

  function handleMakeChange(value: string | null) {
    if (!value) return;
    setSelectedMake(value);
    fetchModels(value);
  }

  function handleModelChange(value: string | null) {
    if (!value) return;
    setSelectedModel(value);
    fetchYears(selectedMake, value);
  }

  function handleYearChange(value: string | null) {
    if (!value) return;
    setSelectedYear(value);
  }

  function handleFindParts() {
    if (!selectedMake) return;
    const params = new URLSearchParams();
    params.set("make", selectedMake);
    if (selectedModel) params.set("model", selectedModel);
    if (selectedYear) params.set("year", selectedYear);

    if (onSelect && selectedModel && selectedYear) {
      onSelect({
        make: selectedMake,
        model: selectedModel,
        year: parseInt(selectedYear),
      });
    }

    router.push(`/products?vehicleMake=${selectedMake}${selectedModel ? `&vehicleModel=${selectedModel}` : ""}${selectedYear ? `&vehicleYear=${selectedYear}` : ""}`);
  }

  function handleReset() {
    setSelectedMake("");
    setSelectedModel("");
    setSelectedYear("");
    setModels([]);
    setYears([]);
  }

  const isCompact = variant === "sidebar";

  return (
    <div
      className={
        isCompact
          ? "space-y-3"
          : "flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2"
      }
    >
      {/* Make */}
      <div className={isCompact ? "" : "flex-1"}>
        {isCompact && (
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Make
          </label>
        )}
        <Select
          value={selectedMake}
          onValueChange={handleMakeChange}
          disabled={loadingMakes}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingMakes ? "Loading..." : "Select Make"} />
          </SelectTrigger>
          <SelectContent>
            {makes.map((m) => (
              <SelectItem key={m.make} value={m.make}>
                {m.make} ({m.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model */}
      <div className={isCompact ? "" : "flex-1"}>
        {isCompact && (
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Model
          </label>
        )}
        <Select
          value={selectedModel}
          onValueChange={handleModelChange}
          disabled={!selectedMake || loadingModels}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                loadingModels
                  ? "Loading..."
                  : !selectedMake
                    ? "Select Make first"
                    : "Select Model"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.model} value={m.model}>
                {m.model} ({m.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year */}
      <div className={isCompact ? "" : "flex-1"}>
        {isCompact && (
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Year
          </label>
        )}
        <Select
          value={selectedYear}
          onValueChange={handleYearChange}
          disabled={!selectedModel || loadingYears}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                loadingYears
                  ? "Loading..."
                  : !selectedModel
                    ? "Select Model first"
                    : "Select Year"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div
        className={
          isCompact
            ? "flex gap-2"
            : "flex gap-2 sm:flex-shrink-0"
        }
      >
        <Button
          onClick={handleFindParts}
          disabled={!selectedMake}
          className={isCompact ? "flex-1" : ""}
        >
          <Search className="mr-2 h-4 w-4" />
          Find Parts
        </Button>
        {(selectedMake || selectedModel || selectedYear) && (
          <Button variant="outline" size="icon" onClick={handleReset} aria-label="Reset">
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}