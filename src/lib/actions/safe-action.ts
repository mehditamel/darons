/**
 * Wraps an async server action in a try/catch to prevent
 * unhandled exceptions from bubbling up to the client.
 */
export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function safeAction<T>(
  fn: () => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}
