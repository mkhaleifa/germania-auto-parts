import { cn } from "./utils";

export const PRODUCTS_PER_PAGE = 20;
export const MAX_PRODUCTS_PER_PAGE = 100;

export const STOCK_LOW_THRESHOLD = 5;
export const STOCK_RESERVATION_TTL_MINUTES = 30;
export const BANK_TRANSFER_EXPIRY_HOURS = 72;

export const TAX_RATE_GERMANY = 0.19;

export const FREE_SHIPPING_THRESHOLD_EUR = 250;

export const SHIPPING_RATES = {
    germany : {
        small: 6.9,
        medium: 12.9,
        large: 24.9,
        freeThreshold: 250
    },
    international :{
        small : 24.9,
        large : 59.9,
    }
} as const;


export const MAX_IMAGES_PER_PRODUCT = 8;
export const MAX_IMAGE_SIZE_MB = 20;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

export const COUNTRIES = [
  { code: "DE", name: "Germany" },
  { code: "EG", name: "Egypt" },
  { code: "PK", name: "Pakistan" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "JP", name: "Japan" },
  { code: "FR", name: "France" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "IN", name: "India" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "OTHER", name: "Other" },
] as const;

export const CATEGORIES = [
  { name: "Engine & Drivetrain", slug: "engine-drivetrain", icon: "Cog" },
  { name: "Brakes & Suspension", slug: "brakes-suspension", icon: "CircleDot" },
  { name: "Electrical & Lighting", slug: "electrical-lighting", icon: "Zap" },
  { name: "Body & Exterior", slug: "body-exterior", icon: "Car" },
  { name: "Interior & Accessories", slug: "interior-accessories", icon: "Armchair" },
  { name: "Exhaust & Emissions", slug: "exhaust-emissions", icon: "Wind" },
  { name: "Cooling & HVAC", slug: "cooling-hvac", icon: "Thermometer" },
  { name: "Wheels & Tires", slug: "wheels-tires", icon: "Circle" },
  { name: "Filters & Fluids", slug: "filters-fluids", icon: "Droplets" },
] as const;
