import type { Vehicle as PrismaVehicle } from "@/generated/prisma/client";

export type { PrismaVehicle as Vehicle };

export interface VehicleMake {
  make: string;
  count: number;
}

export interface VehicleModel {
  model: string;
  yearStart: number;
  yearEnd: number;
  generation: string | null;
}

export interface VehicleSelection {
  make: string;
  model: string;
  year: number;
}
