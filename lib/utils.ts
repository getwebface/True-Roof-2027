import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Since we cannot install packages, we use a simplified version or just standard string interpolation if libraries were missing.
// However, in this environment, I will write a simple helper.

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
};
