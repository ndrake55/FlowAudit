import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeWaterUsage(usage: number, unit: 'GAL' | 'CCF' | 'HCF' | 'Units'): number {
  if (unit === 'CCF' || unit === 'HCF') {
    return usage * 748;
  }
  return usage;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
