// apps/frontend/src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @description A utility function to conditionally join Tailwind CSS classes.
 * It combines `clsx` for conditional class application and `tailwind-merge`
 * for intelligently merging Tailwind classes without conflicts.
 * @param inputs - An array of ClassValue (strings, objects, arrays) representing Tailwind classes.
 * @returns A single string of merged Tailwind classes.
 * @author shadcn/ui (modified by Gemini)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
