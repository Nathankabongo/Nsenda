import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address?: string): string {
  if (!address) return "";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatPrice(priceInWei: bigint | string | number): string {
  try {
    const value = typeof priceInWei === "bigint" ? priceInWei : BigInt(priceInWei);
    return Number(formatEther(value)).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  } catch {
    return "0";
  }
}

export function parseMetadata(tokenURI: string) {
  try {
    if (tokenURI.startsWith("data:application/json;utf8,")) {
      const jsonStr = decodeURIComponent(tokenURI.replace("data:application/json;utf8,", ""));
      return JSON.parse(jsonStr);
    }
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const jsonStr = atob(tokenURI.replace("data:application/json;base64,", ""));
      return JSON.parse(jsonStr);
    }
  } catch (err) {
    console.warn("Failed to parse inline metadata URI:", err);
  }
  return null;
}
