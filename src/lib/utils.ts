import  {clsx , type ClassValue} from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string):string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(num);

}

export function slugify(text: string):string {
    return text 
    .toLocaleLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .trim();
}

export function getStockStatus(stock: number): {
  label: string;
  color: string;
} {
  if (stock <= 0) return { label: "Out of Stock", color: "text-red-600" };
  if (stock <= 10)
    return { label: `Only ${stock} left`, color: "text-amber-600" };
  return { label: "In Stock", color: "text-green-600" };
}
