import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function logError(context: string, error: any) {
  const errorObj = {
    message: error?.message || String(error),
    stack: error?.stack,
    context,
    time: new Date().toISOString()
  };

  // 1. Structured Console Logging
  console.error(`[ERROR_MONITOR] [${context}]`, errorObj);

  // 2. Send to internal monitor API (non-blocking)
  try {
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorObj)
    }).catch(() => {}); // silent fail if monitor is down
  } catch(e) {}
}
