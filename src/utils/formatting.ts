/*
 * Shared display-formatting helpers.
 */

// Formats a number using English number formatting with the Swedish krona suffix.
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + " kr";
}
