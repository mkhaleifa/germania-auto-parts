import type {
    Product as PrismaProduct ,
    ProductImage ,
    PartNumber , 
    ProductVehicle ,
    Vehicle ,
    Category ,
} from "@/generated/prisma/client"

export type { ProductImage , PartNumber }

export type ProductCondition = "NEW" | "GRADE_A" | "GRADE_B" | "GRADE_C" | "GRADE_D";
export type ProductStatus =  "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED"; 
export type PartNumberType = "OEM" | "AFTERMARKET" | "CROSS_REF";

export interface ProductWithRelations extends PrismaProduct {
    images: ProductImage[];
    partNumbers: PartNumber[];
    vehicles: ProductVehicle[];
    categories: Category[];
}

export interface ProductCartData {
    id: string;
    title: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    condition: ProductCondition;
    status: ProductStatus;
    stock: number;
    brand: string | null;
    isFeatured: boolean;
    images: { url: string; alt: string | null }[];
    category: { name: string; slug: string };
}

export const  CONDITION_LABELS: Record<ProductCondition, string> =  {
    NEW: "New",
    GRADE_A: "Grade A",
    GRADE_B: "Grade B",
    GRADE_C: "Grade C",
    GRADE_D: "Grade D"
}

export const CONDITION_DESCRIPTIONS: Record<ProductCondition, string> = {
  NEW: "Brand new, unused",
  GRADE_A: "Excellent — minimal wear",
  GRADE_B: "Good — normal wear, fully functional",
  GRADE_C: "Fair — visible wear, functional",
  GRADE_D: "For rebuild — needs repair, sold as-is",
};