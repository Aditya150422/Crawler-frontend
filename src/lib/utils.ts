import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-emerald-400";
    case "crawling":
    case "embedding":
      return "text-amber-400";
    case "pending":
      return "text-blue-400";
    case "error":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-emerald-500/20 border-emerald-500/30";
    case "crawling":
    case "embedding":
      return "bg-amber-500/20 border-amber-500/30";
    case "pending":
      return "bg-blue-500/20 border-blue-500/30";
    case "error":
      return "bg-red-500/20 border-red-500/30";
    default:
      return "bg-gray-500/20 border-gray-500/30";
  }
}
