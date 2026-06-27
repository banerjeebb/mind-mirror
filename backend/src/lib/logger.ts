/** Logs errors only in development. Prevents leaking stack traces in production. */
export function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[${context}]`, error);
  }
}
