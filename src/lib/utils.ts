import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ItemStatus } from "@prisma/client";
import { STATUS_FLOW } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateProfit(
  salePrice: number,
  purchasePrice: number,
  platformFee: number,
  shippingCost: number,
  otherCosts: number = 0
): number {
  return salePrice - purchasePrice - platformFee - shippingCost - otherCosts;
}

export function getNextStatus(current: ItemStatus): ItemStatus | null {
  return STATUS_FLOW[current] ?? null;
}

export function formatCurrency(value: number | string | null): string {
  if (value === null) return "–";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "–";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
