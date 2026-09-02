import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { VehicleSelectorPage } from "@/components/vehicle/vehicle-selector-page";

export const metadata: Metadata = {
  title: "Find Parts for Your Vehicle",
  description:
    "Select your vehicle make, model, and year to find compatible GDM auto parts. Browse parts for Mercedes-benz, BMW, Audi, Porshe, Skoda and more.",
};

export default function VehiclesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: "Vehicles" }]} />

      <div className="mt-6 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          Find Parts for Your Vehicle
        </h1>
        <p className="mt-2 text-muted-foreground">
          Select your vehicle to see compatible parts
        </p>
      </div>

      <div className="mt-10">
        <VehicleSelectorPage />
      </div>
    </div>
  );
}