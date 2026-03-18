import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInMonths, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, pattern: string = "dd/MM/yyyy"): string {
  return format(new Date(date), pattern, { locale: fr });
}

export function formatRelativeDate(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function calculateAge(birthDate: Date | string): {
  years: number;
  months: number;
  label: string;
} {
  const birth = new Date(birthDate);
  const now = new Date();
  const years = differenceInYears(now, birth);
  const totalMonths = differenceInMonths(now, birth);
  const months = totalMonths % 12;

  let label: string;
  if (years === 0) {
    label = `${totalMonths} mois`;
  } else if (months === 0) {
    label = `${years} an${years > 1 ? "s" : ""}`;
  } else {
    label = `${years} an${years > 1 ? "s" : ""} et ${months} mois`;
  }

  return { years, months, label };
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}
