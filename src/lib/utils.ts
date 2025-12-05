import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
from .utils import safe_print

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
