"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Car, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VehicleMake } from "@/types/vehicle";

interface VehicleModel {
  model: string;
  yearStart: number;
  yearEnd: number;
  count: number;
}

const steps = [
  { number: 1, label: "Make" },
  { number: 2, label: "Model" },
  { number: 3, label: "Year" },
];

export function VehicleSelectorPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [years, setYears] = useState<number[]>([]);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    }
    fetchMakes();
  }, []);

  async function handleMakeSelect(make: string) {
    setSelectedMake(make);
    setSelectedModel("");
    setSelectedYear(null);
    setCurrentStep(2);

    try {
      const res = await fetch(`/api/vehicles/${encodeURIComponent(make)}`);
      const json = await res.json();
      setModels(json.data || []);
    } catch {
      console.error("Failed to fetch models");
    }
  }

  async function handleModelSelect(model: string) {
    setSelectedModel(model);
    setSelectedYear(null);
    setCurrentStep(3);

    try {
      const res = await fetch(
        `/api/vehicles/${encodeURIComponent(selectedMake)}/${encodeURIComponent(model)}`
      );
      const json = await res.json();
      setYears(json.data?.years || []);
    } catch {
      console.error("Failed to fetch years");
    }
  }

  function handleYearSelect(year: number) {
    setSelectedYear(year);
  }

  function handleViewParts() {
    const params = new URLSearchParams();
    params.set("vehicleMake", selectedMake);
    if (selectedModel) params.set("vehicleModel", selectedModel);
    if (selectedYear) params.set("vehicleYear", selectedYear.toString());
    router.push(`/products?${params.toString()}`);
  }
  function handleReset() {
    setSelectedMake("");
    setSelectedModel("");
    setSelectedYear(null);
    setModels([]);
    setYears([]);
    setCurrentStep(1);
  }

  return (
    <div>
      {/* Step Indicator */}
      <div className="mb-10 flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div key={step.number} className="flex items-center gap-2">
            <button
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                currentStep > step.number
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep === step.number
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground"
              )}
              onClick={() => {
                if (step.number === 1) handleReset();
                if (step.number === 2 && selectedMake) setCurrentStep(2);
                if (step.number === 3 && selectedModel) setCurrentStep(3);
              }}
              disabled={
                (step.number === 2 && !selectedMake) ||
                (step.number === 3 && !selectedModel)
              }
            >
              {currentStep > step.number ? (
                <Check className="h-4 w-4" />
              ) : (
                step.number
              )}
            </button>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                currentStep >= step.number
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 w-8 sm:w-16",
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Selection summary */}
      {selectedMake && (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {selectedMake}
          </Badge>
          {selectedModel && (
            <Badge variant="secondary" className="text-sm">
              {selectedModel}
            </Badge>
          )}
          {selectedYear && (
            <Badge variant="secondary" className="text-sm">
              {selectedYear}
            </Badge>
          )}
          <button
            className="text-sm text-muted-foreground underline hover:text-foreground"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      )}

      {/* Step 1: Select Make */}
      {currentStep === 1 && (
        <div>
          <h2 className="mb-6 text-center text-xl font-semibold">
            Select Make
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="flex flex-col items-center p-6">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="mt-3 h-4 w-20 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {makes.map((m) => (
                <button key={m.make} onClick={() => handleMakeSelect(m.make)}>
                  <Card className="transition-all hover:border-primary hover:shadow-md">
                    <CardContent className="flex flex-col items-center p-6">
                      <Car className="h-10 w-10 text-primary" />
                      <p className="mt-3 text-sm font-semibold">{m.make}</p>
                      <p className="text-xs text-muted-foreground">
                        ({m.count} parts)
                      </p>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Model */}
      {currentStep === 2 && (
        <div>
          <h2 className="mb-6 text-center text-xl font-semibold">
            Select Model
          </h2>
          {models.length === 0 ? (
            <p className="text-center text-muted-foreground">Loading models...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {models.map((m) => (
                <button
                  key={m.model}
                  onClick={() => handleModelSelect(m.model)}
                >
                  <Card className="transition-all hover:border-primary hover:shadow-md">
                    <CardContent className="flex flex-col items-center p-6">
                      <p className="text-lg font-semibold">{m.model}</p>
                      <p className="text-xs text-muted-foreground">
                        ({m.count} parts)
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {m.yearStart}–{m.yearEnd}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Select Year */}
      {currentStep === 3 && (
        <div>
          <h2 className="mb-6 text-center text-xl font-semibold">
            Select Year
          </h2>
          {years.length === 0 ? (
            <p className="text-center text-muted-foreground">Loading years...</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {years.map((y) => (
                <button
                  key={y}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    selectedYear === y
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary hover:text-primary"
                  )}
                  onClick={() => handleYearSelect(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {selectedYear && (
            <div className="mt-8 text-center">
              <p className="text-lg font-medium">
                Showing parts for{" "}
                <span className="font-bold text-primary">
                  {selectedMake} {selectedModel} {selectedYear}
                </span>
              </p>
              <Button className="mt-4" size="lg" onClick={handleViewParts}>
                View All Parts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}