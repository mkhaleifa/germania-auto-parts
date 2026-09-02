import {
  PrismaClient,
  type Vehicle,
  type Category,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const db = new PrismaClient({ adapter });

// ============================================================
// VEHICLES
// Germania Auto Parts
// European / German vehicles
// ============================================================

const vehicles = [
  // ───────────────────────── BMW ─────────────────────────

  {
    make: "BMW",
    model: "3 Series",
    yearStart: 2012,
    yearEnd: 2019,
    generation: "F30",
  },
  {
    make: "BMW",
    model: "M340i",
    yearStart: 2019,
    yearEnd: 2024,
    generation: "G20",
  },
  {
    make: "BMW",
    model: "M3 Competition",
    yearStart: 2021,
    yearEnd: 2024,
    generation: "G80",
  },
  {
    make: "BMW",
    model: "M2",
    yearStart: 2023,
    yearEnd: 2024,
    generation: "G87",
  },
  {
    make: "BMW",
    model: "4 Series",
    yearStart: 2014,
    yearEnd: 2020,
    generation: "F32",
  },
  {
    make: "BMW",
    model: "5 Series",
    yearStart: 2017,
    yearEnd: 2023,
    generation: "G30",
  },
  {
    make: "BMW",
    model: "7 Series",
    yearStart: 2022,
    yearEnd: 2024,
    generation: "G70",
  },
  {
    make: "BMW",
    model: "X3",
    yearStart: 2017,
    yearEnd: 2024,
    generation: "G01",
  },
  {
    make: "BMW",
    model: "X5",
    yearStart: 2018,
    yearEnd: 2024,
    generation: "G05",
  },
  {
    make: "BMW",
    model: "X6",
    yearStart: 2020,
    yearEnd: 2024,
    generation: "G06",
  },

  // ───────────────────── MERCEDES-BENZ ─────────────────────

  {
    make: "Mercedes-Benz",
    model: "A-Class",
    yearStart: 2018,
    yearEnd: 2024,
    generation: "W177",
  },
  {
    make: "Mercedes-Benz",
    model: "C-Class",
    yearStart: 2014,
    yearEnd: 2021,
    generation: "W205",
  },
  {
    make: "Mercedes-Benz",
    model: "E-Class",
    yearStart: 2016,
    yearEnd: 2023,
    generation: "W213",
  },
  {
    make: "Mercedes-Benz",
    model: "S-Class",
    yearStart: 2020,
    yearEnd: 2024,
    generation: "W223",
  },
  {
    make: "Mercedes-Benz",
    model: "G-Class",
    yearStart: 2018,
    yearEnd: 2024,
    generation: "W463",
  },
  {
    make: "Mercedes-Benz",
    model: "GLC",
    yearStart: 2016,
    yearEnd: 2022,
    generation: "X253",
  },
  {
    make: "Mercedes-Benz",
    model: "GLE",
    yearStart: 2019,
    yearEnd: 2024,
    generation: "W167",
  },

  // ───────────────────────── AUDI ─────────────────────────

  {
    make: "Audi",
    model: "A3",
    yearStart: 2013,
    yearEnd: 2020,
    generation: "8V",
  },
  {
    make: "Audi",
    model: "A4",
    yearStart: 2015,
    yearEnd: 2024,
    generation: "B9",
  },
  {
    make: "Audi",
    model: "A6",
    yearStart: 2018,
    yearEnd: 2024,
    generation: "C8",
  },
  {
    make: "Audi",
    model: "RS6 Avant",
    yearStart: 2020,
    yearEnd: 2024,
    generation: "C8",
  },
  {
    make: "Audi",
    model: "RS7",
    yearStart: 2020,
    yearEnd: 2024,
    generation: "C8",
  },
  {
    make: "Audi",
    model: "RS5",
    yearStart: 2017,
    yearEnd: 2024,
    generation: "B9",
  },
  {
    make: "Audi",
    model: "RS3",
    yearStart: 2017,
    yearEnd: 2024,
    generation: "8V/8Y",
  },
  {
    make: "Audi",
    model: "Q5",
    yearStart: 2017,
    yearEnd: 2024,
    generation: "FY",
  },
  {
    make: "Audi",
    model: "Q8",
    yearStart: 2018,
    yearEnd: 2024,
    generation: "4M",
  },

  // ───────────────────────── PORSCHE ─────────────────────────

  {
    make: "Porsche",
    model: "Macan",
    yearStart: 2014,
    yearEnd: 2024,
    generation: "95B",
  },
  {
    make: "Porsche",
    model: "911",
    yearStart: 2019,
    yearEnd: 2024,
    generation: "992",
  },
  {
    make: "Porsche",
    model: "718 Cayman",
    yearStart: 2016,
    yearEnd: 2024,
    generation: "982",
  },
  {
    make: "Porsche",
    model: "Cayenne",
    yearStart: 2018,
    yearEnd: 2024,
    generation: "9YA/9YB",
  },
  {
    make: "Porsche",
    model: "Panamera",
    yearStart: 2017,
    yearEnd: 2024,
    generation: "971",
  },
  {
    make: "Porsche",
    model: "Taycan",
    yearStart: 2019,
    yearEnd: 2024,
    generation: "J1",
  },

  // ───────────────────── VOLKSWAGEN ─────────────────────

  {
    make: "Volkswagen",
    model: "Golf",
    yearStart: 2013,
    yearEnd: 2020,
    generation: "Mk7",
  },
  {
    make: "Volkswagen",
    model: "Golf GTI",
    yearStart: 2020,
    yearEnd: 2024,
    generation: "Mk8",
  },
  {
    make: "Volkswagen",
    model: "Passat",
    yearStart: 2014,
    yearEnd: 2023,
    generation: "B8",
  },
  {
    make: "Volkswagen",
    model: "Tiguan",
    yearStart: 2016,
    yearEnd: 2024,
    generation: "Mk2",
  },
  {
    make: "Volkswagen",
    model: "Arteon",
    yearStart: 2017,
    yearEnd: 2024,
    generation: "Mk1",
  },
] as const;

// ============================================================
// CATEGORIES
// ============================================================

const categories = [
  {
    name: "Engine & Drivetrain",
    slug: "engine-drivetrain",
    description:
      "Engine, transmission, clutch, turbocharger and drivetrain components.",
    sortOrder: 1,
  },
  {
    name: "Brakes & Suspension",
    slug: "brakes-suspension",
    description:
      "Brake pads, brake discs, calipers, shocks, springs and suspension components.",
    sortOrder: 2,
  },
  {
    name: "Electrical & Lighting",
    slug: "electrical-lighting",
    description:
      "Alternators, starters, sensors, ECUs, headlights and electrical components.",
    sortOrder: 3,
  },
  {
    name: "Body & Exterior",
    slug: "body-exterior",
    description:
      "Bumpers, grilles, mirrors, doors, fenders and exterior body components.",
    sortOrder: 4,
  },
  {
    name: "Interior & Accessories",
    slug: "interior-accessories",
    description:
      "Interior trim, seats, steering wheels and automotive accessories.",
    sortOrder: 5,
  },
  {
    name: "Exhaust & Emissions",
    slug: "exhaust-emissions",
    description:
      "Exhaust systems, catalytic converters, DPF, EGR and emissions components.",
    sortOrder: 6,
  },
  {
    name: "Cooling & HVAC",
    slug: "cooling-hvac",
    description:
      "Radiators, water pumps, AC compressors, condensers and HVAC components.",
    sortOrder: 7,
  },
  {
    name: "Wheels & Tires",
    slug: "wheels-tires",
    description:
      "Wheels, tires, wheel accessories and related components.",
    sortOrder: 8,
  },
  {
    name: "Filters & Fluids",
    slug: "filters-fluids",
    description:
      "Oil filters, air filters, fuel filters, oils and automotive fluids.",
    sortOrder: 9,
  },
];

// ============================================================
// PRODUCT TYPE
// ============================================================

interface ProductSeed {
  title: string;
  slug: string;
  description: string;

  // Your schema appears to use numeric price values.
  price: number;
  comparePrice?: number;

  condition:
    | "NEW"
    | "GRADE_A"
    | "GRADE_B"
    | "GRADE_C"
    | "GRADE_D";

  status: "ACTIVE" | "DRAFT" | "OUT_OF_STOCK";

  stock: number;
  sku: string;

  brand?: string;
  weight?: number;
  material?: string;

  donorVehicle?: string;
  donorMileage?: number;

  testingStatus?: string;
  conditionNotes?: string;

  categorySlug: string;
  tags: string[];

  isFeatured: boolean;

  vehicleIndices: number[];

  // IMPORTANT:
  // CROSS_REF removed because your Prisma enum
  // PartNumberType does not contain CROSS_REF.
  partNumbers: {
    number: string;
    type: "OEM" | "AFTERMARKET";
  }[];
}

// ============================================================
// GERMAN / EUROPEAN DEMO PRODUCTS
// ============================================================

const products: ProductSeed[] = [
  // ==========================================================
  // ENGINE & DRIVETRAIN
  // ==========================================================

  {
    title: "BMW B58 Timing Chain Kit — G20 M340i",
    slug: "bmw-b58-timing-chain-kit-g20-m340i",
    description:
      "Complete timing chain service kit for BMW G20 M340i with B58 engine. Includes timing chain, guides, tensioner and required installation components. Suitable for professional engine servicing.",
    price: 48500,
    comparePrice: 62000,
    condition: "NEW",
    status: "ACTIVE",
    stock: 8,
    sku: "GER-ENG-001",
    brand: "INA",
    weight: 4.2,
    material: "Steel / Polymer",
    categorySlug: "engine-drivetrain",
    tags: ["BMW", "B58", "timing chain", "engine", "german"],
    isFeatured: true,
    vehicleIndices: [1],
    partNumbers: [
      {
        number: "11318685091",
        type: "OEM",
      },
      {
        number: "559 0120 10",
        type: "AFTERMARKET",
      },
    ],
  },

  {
    title: "BMW G30 5 Series Automatic Transmission Mount",
    slug: "bmw-g30-5-series-transmission-mount",
    description:
      "High-quality transmission mount for BMW G30 5 Series. Designed to restore correct drivetrain alignment and reduce vibration.",
    price: 7800,
    condition: "NEW",
    status: "ACTIVE",
    stock: 14,
    sku: "GER-ENG-002",
    brand: "Lemförder",
    weight: 1.1,
    material: "Rubber / Aluminum",
    categorySlug: "engine-drivetrain",
    tags: ["BMW", "G30", "transmission", "mount", "Lemförder"],
    isFeatured: false,
    vehicleIndices: [5],
    partNumbers: [
      {
        number: "22316853470",
        type: "OEM",
      },
      {
        number: "37814 01",
        type: "AFTERMARKET",
      },
    ],
  },

  {
    title: "Audi 2.0 TFSI Turbocharger",
    slug: "audi-20-tfsi-turbocharger",
    description:
      "Replacement turbocharger for selected Audi 2.0 TFSI applications. Professionally inspected and supplied ready for installation.",
    price: 42000,
    comparePrice: 65000,
    condition: "GRADE_A",
    status: "ACTIVE",
    stock: 2,
    sku: "GER-ENG-003",
    brand: "BorgWarner",
    weight: 8.5,
    material: "Cast Iron / Aluminum",
    testingStatus: "Tested & Working",
    conditionNotes:
      "Turbocharger inspected for shaft play, oil leakage and actuator operation.",
    categorySlug: "engine-drivetrain",
    tags: ["Audi", "TFSI", "turbo", "BorgWarner"],
    isFeatured: true,
    vehicleIndices: [18, 19],
    partNumbers: [
      {
        number: "06K145702K",
        type: "OEM",
      },
      {
        number: "53039880460",
        type: "AFTERMARKET",
      },
    ],
  },

  // ==========================================================
  // BRAKES & SUSPENSION
  // ==========================================================

  {
    title: "BMW G20 Front Brake Pad Set",
    slug: "bmw-g20-front-brake-pad-set",
    description:
      "Premium front brake pad set for BMW G20 3 Series. Low-dust compound with excellent braking performance and quiet operation.",
    price: 9200,
    condition: "NEW",
    status: "ACTIVE",
    stock: 20,
    sku: "GER-BRK-001",
    brand: "ATE",
    weight: 2.1,
    material: "Ceramic / Semi-metallic",
    categorySlug: "brakes-suspension",
    tags: ["BMW", "G20", "brake pads", "ATE", "brakes"],
    isFeatured: true,
    vehicleIndices: [1],
    partNumbers: [
      {
        number: "34116889599",
        type: "OEM",
      },
      {
        number: "13.0460-7198.2",
        type: "AFTERMARKET",
      },
    ],
  },

  {
    title: "Mercedes-Benz W213 Front Brake Disc",
    slug: "mercedes-w213-front-brake-disc",
    description:
      "Front ventilated brake disc for Mercedes-Benz E-Class W213. High-quality replacement manufactured to OE specifications.",
    price: 14500,
    comparePrice: 19000,
    condition: "NEW",
    status: "ACTIVE",
    stock: 12,
    sku: "GER-BRK-002",
    brand: "Brembo",
    weight: 9.4,
    material: "Cast Iron",
    categorySlug: "brakes-suspension",
    tags: ["Mercedes", "W213", "brake disc", "Brembo"],
    isFeatured: true,
    vehicleIndices: [13],
    partNumbers: [
      {
        number: "2134210312",
        type: "OEM",
      },
      {
        number: "09.B436.11",
        type: "AFTERMARKET",
      },
    ],
  },

  {
    title: "Audi Q5 Front Shock Absorber",
    slug: "audi-q5-front-shock-absorber",
    description:
      "Replacement front shock absorber for Audi Q5 FY. Designed to restore handling, comfort and suspension stability.",
    price: 11800,
    condition: "NEW",
    status: "ACTIVE",
    stock: 7,
    sku: "GER-BRK-003",
    brand: "Sachs",
    weight: 4.8,
    material: "Steel",
    categorySlug: "brakes-suspension",
    tags: ["Audi", "Q5", "suspension", "shock absorber", "Sachs"],
    isFeatured: false,
    vehicleIndices: [25],
    partNumbers: [
      {
        number: "80A413031",
        type: "OEM",
      },
      {
        number: "317 593",
        type: "AFTERMARKET",
      },
    ],
  },

  // ==========================================================
  // ELECTRICAL & LIGHTING
  // ==========================================================

  {
    title: "BMW G30 LED Headlight Assembly",
    slug: "bmw-g30-led-headlight-assembly",
    description:
      "Original-style LED headlight assembly for BMW G30 5 Series. Professionally inspected and suitable for replacement of damaged lighting units.",
    price: 62000,
    comparePrice: 89000,
    condition: "GRADE_A",
    status: "ACTIVE",
    stock: 2,
    sku: "GER-ELC-001",
    brand: "Hella",
    weight: 5.6,
    material: "Polycarbonate / Aluminum",
    testingStatus: "Tested & Working",
    conditionNotes:
      "Lens is clear and mounting points are intact. Electronics tested.",
    categorySlug: "electrical-lighting",
    tags: ["BMW", "G30", "LED", "headlight", "Hella"],
    isFeatured: true,
    vehicleIndices: [5],
    partNumbers: [
      {
        number: "63117419620",
        type: "OEM",
      },
      {
        number: "1EX 012 976-421",
        type: "AFTERMARKET",
      },
    ],
  },

  {
    title: "Mercedes-Benz W205 Alternator",
    slug: "mercedes-w205-alternator",
    description:
      "Remanufactured alternator for Mercedes-Benz C-Class W205. Tested to ensure correct charging output and electrical performance.",
    price: 17500,
    comparePrice: 28000,
    condition: "GRADE_A",
    status: "ACTIVE",
    stock: 4,
    sku: "GER-ELC-002",
    brand: "Bosch",
    weight: 7.2,
    material: "Aluminum / Steel",
    testingStatus: "Tested & Working",
    conditionNotes:
      "Charging voltage tested and bearings inspected.",
    categorySlug: "electrical-lighting",
    tags: ["Mercedes", "W205", "alternator", "Bosch", "electrical"],
    isFeatured: false,
    vehicleIndices: [12],
    partNumbers: [
      {
        number: "2741540202",
        type: "OEM",
      },
      {
        number: "0124655007",
        type: "AFTERMARKET",
      },
    ],
  },

  {
    title: "Audi A4 B9 ABS Wheel Speed Sensor",
    slug: "audi-a4-b9-abs-wheel-speed-sensor",
    description:
      "ABS wheel speed sensor for Audi A4 B9. Direct replacement designed to provide accurate wheel speed information to the ABS and stability systems.",
    price: 4800,
    condition: "NEW",
    status: "ACTIVE",
    stock: 18,
    sku: "GER-ELC-003",
    brand: "Bosch",
    weight: 0.3,
    material: "Plastic / Copper",
    categorySlug: "electrical-lighting",
    tags: ["Audi", "A4", "B9", "ABS", "sensor"],
    isFeatured: false,
    vehicleIndices: [19],
    partNumbers: [
      {
        number: "8W0927807",
        type: "OEM",
      },
      {
        number: "0265007882",
        type: "AFTERMARKET",
      },
    ],
  },

  // ==========================================================
  // BODY & EXTERIOR
  // ==========================================================

  {
    title: "BMW G20 M Sport Front Bumper",
    slug: "bmw-g20-m-sport-front-bumper",
    description:
      "Used OEM-style M Sport front bumper for BMW G20 3 Series. Suitable for restoration or replacement after front-end damage.",
    price: 26000,
    comparePrice: 42000,
    condition: "GRADE_B",
    status: "ACTIVE",
    stock: 1,
    sku: "GER-BDY-001",
    brand: "BMW",
    weight: 8.2,
    material: "ABS Plastic",
    donorVehicle: "2021 BMW G20 330i",
    donorMileage: 68000,
    testingStatus: "Visual Inspection",
    conditionNotes:
      "Minor cosmetic scratches. Mounting points intact.",
    categorySlug: "body-exterior",
    tags: ["BMW", "G20", "M Sport", "bumper", "body"],
    isFeatured: false,
    vehicleIndices: [1],
    partNumbers: [
      {
        number: "51118073475",
        type: "OEM",
      },
    ],
  },

  {
    title: "Mercedes-Benz W213 Front Grille",
    slug: "mercedes-w213-front-grille",
    description:
      "Replacement front grille for Mercedes-Benz E-Class W213. Clean used condition with intact mounting points.",
    price: 13500,
    condition: "GRADE_A",
    status: "ACTIVE",
    stock: 2,
    sku: "GER-BDY-002",
    brand: "Mercedes-Benz",
    weight: 2.4,
    material: "ABS / Chrome",
    categorySlug: "body-exterior",
    tags: ["Mercedes", "W213", "grille", "exterior"],
    isFeatured: false,
    vehicleIndices: [13],
    partNumbers: [
      {
        number: "2138800183",
        type: "OEM",
      },
    ],
  },

  // ==========================================================
  // INTERIOR & ACCESSORIES
  // ==========================================================

  {
    title: "BMW G30 Digital Instrument Cluster",
    slug: "bmw-g30-digital-instrument-cluster",
    description:
      "Used digital instrument cluster for BMW G30 5 Series. Screen and display tested before removal.",
    price: 29000,
    comparePrice: 45000,
    condition: "GRADE_A",
    status: "ACTIVE",
    stock: 2,
    sku: "GER-INT-001",
    brand: "Continental",
    weight: 1.4,
    material: "Plastic / Electronics",
    donorVehicle: "2019 BMW G30 520d",
    donorMileage: 84000,
    testingStatus: "Tested & Working",
    conditionNotes:
      "Display fully functional. No dead pixels observed.",
    categorySlug: "interior-accessories",
    tags: ["BMW", "G30", "dashboard", "instrument cluster"],
    isFeatured: true,
    vehicleIndices: [5],
    partNumbers: [
      {
        number: "62108701072",
        type: "OEM",
      },
    ],
  },

  {
    title: "Audi A4 B9 Leather Steering Wheel",
    slug: "audi-a4-b9-leather-steering-wheel",
    description:
      "Used leather steering wheel for Audi A4 B9. Clean condition with normal signs of use.",
    price: 15500,
    condition: "GRADE_A",
    status: "ACTIVE",
    stock: 3,
    sku: "GER-INT-002",
    brand: "Audi",
    weight: 2.8,
    material: "Leather / Aluminum",
    categorySlug: "interior-accessories",
    tags: ["Audi", "A4", "B9", "steering wheel", "leather"],
    isFeatured: false,
    vehicleIndices: [19],
    partNumbers: [
      {
        number: "8W0419091",
        type: "OEM",
      },
    ],
  },

  // ==========================================================
  // EXHAUST & EMISSIONS
  // ==========================================================

  {
    title: "BMW G20 Diesel DPF Filter",
    slug: "bmw-g20-diesel-dpf-filter",
    description:
      "Diesel particulate filter for selected BMW G20 diesel engines. Used unit inspected for physical condition and blockage.",
    price: 38000,
    comparePrice: 62000,
    condition: "GRADE_B",
    status: "ACTIVE",
    stock: 2,
    sku: "GER-EXH-001",
    brand: "Eberspächer",
    weight: 12.5,
    material: "Cordierite / Stainless Steel",
    testingStatus: "Inspected",
    conditionNotes:
      "No cracks. Internal condition inspected before sale.",
    categorySlug: "exhaust-emissions",
    tags: ["BMW", "G20", "DPF", "diesel", "emissions"],
    isFeatured: true,
    vehicleIndices: [1],
    partNumbers: [
      {
        number: "18307815485",
        type: "OEM",
      },
    ],
  },

  {
    title: "Volkswagen Golf Mk7 EGR Valve",
    slug: "volkswagen-golf-mk7-egr-valve",
    description:
      "EGR valve replacement for selected Volkswagen Golf Mk7 diesel engines. Helps restore correct exhaust gas recirculation operation.",
    price: 9200,
    condition: "NEW",
    status: "ACTIVE",
    stock: 9,
    sku: "GER-EXH-002",
    brand: "Pierburg",
    weight: 1.7,
    material: "Aluminum / Steel",
    categorySlug: "exhaust-emissions",
    tags: ["Volkswagen", "Golf", "Mk7", "EGR", "diesel"],
    isFeatured: false,
    vehicleIndices: [29],
    partNumbers: [
      {
        number: "04L131501P",
        type: "OEM",
      },
      {
        number: "7.10334.02.0",
        type: "AFTERMARKET",
      },
    ],
  },

  // ==========================================================
  // COOLING & HVAC
  // ==========================================================

  {
    title: "BMW G30 Water Pump",
    slug: "bmw-g30-water-pump",
    description:
      "Electric water pump for selected BMW G30 engines. High-quality replacement designed for reliable engine cooling.",
    price: 19500,
    comparePrice: 28000,
    condition: "NEW",
    status: "ACTIVE",
    stock: 6,
    sku: "GER-COL-001",
    brand: "Pierburg",
    weight: 2.6,
    material: "Aluminum / Plastic",
    categorySlug: "cooling-hvac",
    tags: ["BMW", "G30", "water pump", "cooling"],
    isFeatured: false,
    vehicleIndices: [5],
    partNumbers: [
      {
        number: "11517632426",
        type: "OEM",
      },
      {
        number: "7.02851.20.0",
        type: "AFTERMARKET",
      },
    ],
  },

  {
    title: "Mercedes-Benz W205 AC Compressor",
    slug: "mercedes-w205-ac-compressor",
    description:
      "Air conditioning compressor for Mercedes-Benz C-Class W205. Tested used unit suitable for replacement applications.",
    price: 24000,
    comparePrice: 42000,
    condition: "GRADE_A",
    status: "ACTIVE",
    stock: 2,
    sku: "GER-COL-002",
    brand: "Denso",
    weight: 6.4,
    material: "Aluminum / Steel",
    testingStatus: "Tested & Working",
    conditionNotes:
      "Compressor tested for operation and abnormal noise.",
    categorySlug: "cooling-hvac",
    tags: ["Mercedes", "W205", "AC", "compressor", "HVAC"],
    isFeatured: true,
    vehicleIndices: [12],
    partNumbers: [
      {
        number: "A2058350102",
        type: "OEM",
      },
      {
        number: "DCP17020",
        type: "AFTERMARKET",
      },
    ],
  },

  // ==========================================================
  // WHEELS & TIRES
  // ==========================================================

  {
    title: "BMW M Sport 18-inch Alloy Wheel",
    slug: "bmw-m-sport-18-inch-alloy-wheel",
    description:
      "Genuine BMW M Sport 18-inch alloy wheel. Used condition with minor cosmetic marks. No cracks or bends.",
    price: 18000,
    comparePrice: 28000,
    condition: "GRADE_A",
    status: "ACTIVE",
    stock: 4,
    sku: "GER-WHL-001",
    brand: "BMW",
    weight: 11.2,
    material: "Cast Aluminum",
    testingStatus: "Visual Inspection",
    conditionNotes:
      "Minor cosmetic marks. Wheel checked for cracks and bends.",
    categorySlug: "wheels-tires",
    tags: ["BMW", "M Sport", "wheel", "18 inch"],
    isFeatured: false,
    vehicleIndices: [0, 1],
    partNumbers: [
      {
        number: "36116855150",
        type: "OEM",
      },
    ],
  },

  {
    title: "Audi Q5 19-inch Alloy Wheel",
    slug: "audi-q5-19-inch-alloy-wheel",
    description:
      "Genuine Audi 19-inch alloy wheel suitable for selected Q5 applications. Clean used condition.",
    price: 22000,
    condition: "GRADE_B",
    status: "ACTIVE",
    stock: 3,
    sku: "GER-WHL-002",
    brand: "Audi",
    weight: 12.4,
    material: "Cast Aluminum",
    categorySlug: "wheels-tires",
    tags: ["Audi", "Q5", "wheel", "19 inch"],
    isFeatured: false,
    vehicleIndices: [25],
    partNumbers: [
      {
        number: "80A601025",
        type: "OEM",
      },
    ],
  },

  // ==========================================================
  // FILTERS & FLUIDS
  // ==========================================================

  {
    title: "BMW Oil Filter — 3 Series / 5 Series",
    slug: "bmw-oil-filter-3-series-5-series",
    description:
      "High-quality oil filter for selected BMW petrol and diesel engines. Designed for efficient filtration and reliable engine protection.",
    price: 1800,
    condition: "NEW",
    status: "ACTIVE",
    stock: 40,
    sku: "GER-FLT-001",
    brand: "MANN-FILTER",
    weight: 0.4,
    material: "Filter Paper / Metal",
    categorySlug: "filters-fluids",
    tags: ["BMW", "oil filter", "MANN", "engine"],
    isFeatured: false,
    vehicleIndices: [0, 1, 5],
    partNumbers: [
      {
        number: "11428507683",
        type: "OEM",
      },
      {
        number: "HU 816 X",
        type: "AFTERMARKET",
      },
    ],
  },

  {
    title: "Volkswagen Golf Mk7 Air Filter",
    slug: "volkswagen-golf-mk7-air-filter",
    description:
      "Premium replacement air filter for Volkswagen Golf Mk7. Provides effective filtration and consistent airflow to the engine.",
    price: 2200,
    condition: "NEW",
    status: "ACTIVE",
    stock: 25,
    sku: "GER-FLT-002",
    brand: "MANN-FILTER",
    weight: 0.6,
    material: "Filter Media",
    categorySlug: "filters-fluids",
    tags: ["Volkswagen", "Golf", "air filter", "MANN"],
    isFeatured: false,
    vehicleIndices: [29, 30],
    partNumbers: [
      {
        number: "5Q0129620B",
        type: "OEM",
      },
      {
        number: "C 35 154",
        type: "AFTERMARKET",
      },
    ],
  },

  {
    title: "Mercedes-Benz Engine Air Filter",
    slug: "mercedes-benz-engine-air-filter",
    description:
      "Premium engine air filter for selected Mercedes-Benz applications. Designed to protect the engine from dust and contaminants.",
    price: 2400,
    condition: "NEW",
    status: "ACTIVE",
    stock: 30,
    sku: "GER-FLT-003",
    brand: "MAHLE",
    weight: 0.7,
    material: "Synthetic Filter Media",
    categorySlug: "filters-fluids",
    tags: ["Mercedes", "air filter", "MAHLE", "engine"],
    isFeatured: false,
    vehicleIndices: [10, 12, 13],
    partNumbers: [
      {
        number: "2740940004",
        type: "OEM",
      },
      {
        number: "LX 2046",
        type: "AFTERMARKET",
      },
    ],
  },

  // ==========================================================
  // ADDITIONAL PRODUCTS
  // ==========================================================

  {
    title: "Porsche Macan Front Brake Caliper",
    slug: "porsche-macan-front-brake-caliper",
    description:
      "Used front brake caliper removed from Porsche Macan. Inspected and suitable for refurbishment or direct replacement depending on application.",
    price: 32000,
    comparePrice: 55000,
    condition: "GRADE_B",
    status: "ACTIVE",
    stock: 2,
    sku: "GER-BRK-004",
    brand: "Brembo",
    weight: 8.5,
    material: "Aluminum",
    donorVehicle: "2019 Porsche Macan",
    donorMileage: 72000,
    testingStatus: "Inspected",
    conditionNotes:
      "No cracks. Normal cosmetic wear. Piston area inspected.",
    categorySlug: "brakes-suspension",
    tags: ["Porsche", "Macan", "Brembo", "caliper"],
    isFeatured: true,
    vehicleIndices: [27],
    partNumbers: [
      {
        number: "95B615123",
        type: "OEM",
      },
    ],
  },

  {
    title: "Porsche Cayenne V6 Water Pump",
    slug: "porsche-cayenne-v6-water-pump",
    description:
      "Replacement water pump for selected Porsche Cayenne V6 applications.",
    price: 17500,
    condition: "NEW",
    status: "ACTIVE",
    stock: 5,
    sku: "GER-COL-003",
    brand: "INA",
    weight: 2.2,
    material: "Aluminum / Composite",
    categorySlug: "cooling-hvac",
    tags: ["Porsche", "Cayenne", "water pump", "cooling"],
    isFeatured: false,
    vehicleIndices: [30],
    partNumbers: [
      {
        number: "95810603300",
        type: "OEM",
      },
    ],
  },

  {
    title: "Audi Q8 LED Tail Light",
    slug: "audi-q8-led-tail-light",
    description:
      "Used LED rear tail light assembly for Audi Q8 4M. Fully inspected before listing.",
    price: 28500,
    comparePrice: 45000,
    condition: "GRADE_A",
    status: "ACTIVE",
    stock: 2,
    sku: "GER-ELC-004",
    brand: "Valeo",
    weight: 3.2,
    material: "Polycarbonate / Electronics",
    testingStatus: "Tested & Working",
    conditionNotes:
      "LED operation tested. Lens is clean with minor cosmetic marks.",
    categorySlug: "electrical-lighting",
    tags: ["Audi", "Q8", "LED", "tail light"],
    isFeatured: true,
    vehicleIndices: [26],
    partNumbers: [
      {
        number: "4M0945093",
        type: "OEM",
      },
    ],
  },
];

// ============================================================
// SEED
// ============================================================

async function seed() {
  console.log("🌱 Starting Germania Auto Parts seed...\n");

  // ==========================================================
  // 1. VEHICLES
  // ==========================================================

  console.log("🚗 Seeding vehicles...");

  const vehicleRecords: Vehicle[] = [];

  for (const v of vehicles) {
    const record = await db.vehicle.upsert({
      where: {
        make_model_yearStart_yearEnd: {
          make: v.make,
          model: v.model,
          yearStart: v.yearStart,
          yearEnd: v.yearEnd,
        },
      },
      update: {
        generation: v.generation,
      },
      create: v,
    });

    vehicleRecords.push(record);
  }

  console.log(
    `   ✓ ${vehicleRecords.length} vehicles seeded\n`
  );

  // ==========================================================
  // 2. CATEGORIES
  // ==========================================================

  console.log("📂 Seeding categories...");

  const categoryRecords: Category[] = [];

  for (const c of categories) {
    const record = await db.category.upsert({
      where: {
        slug: c.slug,
      },
      update: {
        name: c.name,
        description: c.description,
        sortOrder: c.sortOrder,
      },
      create: c,
    });

    categoryRecords.push(record);
  }

  console.log(
    `   ✓ ${categoryRecords.length} categories seeded\n`
  );

  // ==========================================================
  // 3. PRODUCTS
  // ==========================================================

  console.log("📦 Seeding products...");

  let productCount = 0;

  for (const p of products) {
    const category = categoryRecords.find(
      (c) => c.slug === p.categorySlug
    );

    if (!category) {
      console.warn(
        `   ⚠ Category not found: ${p.categorySlug}`
      );
      continue;
    }

    const existing = await db.product.findUnique({
      where: {
        slug: p.slug,
      },
    });

    if (existing) {
      console.log(
        `   → Skipping existing: ${p.title}`
      );
      continue;
    }

    const product = await db.product.create({
      data: {
        title: p.title,
        slug: p.slug,
        description: p.description,

        price: p.price,
        comparePrice: p.comparePrice ?? null,

        condition: p.condition,
        status: p.status,

        stock: p.stock,
        sku: p.sku,

        brand: p.brand ?? null,
        weight: p.weight ?? null,
        material: p.material ?? null,

        donorVehicle: p.donorVehicle ?? null,
        donorMileage: p.donorMileage ?? null,

        testingStatus: p.testingStatus ?? null,
        conditionNotes: p.conditionNotes ?? null,

        categoryId: category.id,

        tags: p.tags,

        isFeatured: p.isFeatured,

        // ------------------------------------------------------

        partNumbers: {
          create: p.partNumbers.map((pn) => ({
            number: pn.number,
            type: pn.type,
          })),
        },

        // ------------------------------------------------------
        // Vehicle compatibility
        // ------------------------------------------------------

        vehicles: {
          create: p.vehicleIndices
            .filter((i) => vehicleRecords[i])
            .map((i) => ({
              vehicleId: vehicleRecords[i].id,
            })),
        },
      },
    });

    productCount++;

    console.log(
      `   ✓ ${product.title}`
    );
  }

  console.log(
    `   ✓ ${productCount} products seeded\n`
  );

  // ==========================================================
  // 4. ADMIN USER
  // ==========================================================

  console.log("👤 Seeding users...");

 const adminPassword = await hash(
  process.env.ADMIN_PASSWORD!,
  12
);

const admin = await db.user.upsert({
  where: {
    email: process.env.ADMIN_EMAIL!,
  },

  update: {
    role: "ADMIN",
    passwordHash: adminPassword,
  },

  create: {
    name: "Mohamed",
    email: process.env.ADMIN_EMAIL!,
    passwordHash: adminPassword,
    role: "ADMIN",
    emailVerified: new Date(),
  },
});

  console.log(
    `   ✓ Admin: ${admin.email}`
  );

  // ==========================================================
  // TEST CUSTOMER 1
  // ==========================================================

  const testPassword = await hash(
    "test123",
    12
  );

  const testUser = await db.user.upsert({
    where: {
      email: "customer@germaniaautoparts.com",
    },

    update: {
      passwordHash: testPassword,
      role: "USER",
    },

    create: {
      name: "Test Customer",
      email: "customer@germaniaautoparts.com",
      passwordHash: testPassword,
      role: "USER",
      emailVerified: new Date(),
    },
  });

  console.log(
    `   ✓ Test customer: ${testUser.email}`
  );

  // ==========================================================
  // TEST CUSTOMER 2
  // ==========================================================

  const buyer = await db.user.upsert({
    where: {
      email: "buyer@germaniaautoparts.com",
    },

    update: {
      passwordHash: testPassword,
      role: "USER",
    },

    create: {
      name: "Ali Baba",
      email: "buyer@germaniaautoparts.com",
      passwordHash: testPassword,
      role: "USER",
      emailVerified: new Date(),

      phone: "+20-100-123-4567",

      addresses: {
        create: {
          label: "Home",
          fullName: "Ali Baba",
          phone: "+20-100-123-4567",
          addressLine1: "15 Example Street",
          city: "Cairo",
          state: "Cairo",
          postalCode: "11511",
          country: "EG",
          isDefault: true,
        },
      },
    },
  });

  console.log(
    `   ✓ Test customer: ${buyer.email}\n`
  );

  // ==========================================================
  // 5. ORDER COUNTER
  // ==========================================================

  console.log("🔢 Seeding order counter...");

  const today = new Date()
    .toISOString()
    .split("T")[0];

  await db.orderCounter.upsert({
    where: {
      date: today,
    },

    update: {},

    create: {
      date: today,
      counter: 0,
    },
  });

  console.log(
    `   ✓ Order counter initialized for ${today}\n`
  );

  // ==========================================================
  // SUMMARY
  // ==========================================================

  console.log("======================================");
  console.log("   GERMANIA AUTO PARTS SEED COMPLETE");
  console.log("======================================");
  console.log(`🚗 Vehicles:    ${vehicleRecords.length}`);
  console.log(`📂 Categories:  ${categoryRecords.length}`);
  console.log(`📦 Products:    ${productCount}`);
  console.log(`👤 Admin:       ${admin.email}`);
  console.log(`👤 Customers:   2`);
  console.log("======================================");
}

seed()
  .catch((e) => {
    console.error(
      "❌ Seed failed:",
      e
    );

    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });