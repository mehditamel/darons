import { ERROR_CODES } from "@/lib/constants";

export type ErrorCode = keyof typeof ERROR_CODES;

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, statusCode: number = 400) {
    super(ERROR_CODES[code]);
    this.code = code;
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_CODES[code] ?? "Une erreur inattendue est survenue.";
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toUserMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return "Une erreur inattendue est survenue. Veuillez réessayer.";
  }
  return "Une erreur inattendue est survenue.";
}
