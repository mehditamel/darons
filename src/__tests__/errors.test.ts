import { describe, it, expect } from "vitest";
import { AppError, getErrorMessage, isAppError, toUserMessage } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/constants";

describe("AppError", () => {
  it("creates error with correct code and message", () => {
    const error = new AppError("AUTH_001");
    expect(error.code).toBe("AUTH_001");
    expect(error.message).toBe(ERROR_CODES.AUTH_001);
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("AppError");
  });

  it("supports custom status code", () => {
    const error = new AppError("AUTH_001", 401);
    expect(error.statusCode).toBe(401);
  });
});

describe("getErrorMessage", () => {
  it("returns correct message for known code", () => {
    expect(getErrorMessage("AUTH_001")).toBe(ERROR_CODES.AUTH_001);
    expect(getErrorMessage("DOC_001")).toBe(ERROR_CODES.DOC_001);
    expect(getErrorMessage("STRIPE_001")).toBe(ERROR_CODES.STRIPE_001);
  });
});

describe("isAppError", () => {
  it("returns true for AppError", () => {
    expect(isAppError(new AppError("AUTH_001"))).toBe(true);
  });

  it("returns false for regular Error", () => {
    expect(isAppError(new Error("test"))).toBe(false);
  });

  it("returns false for non-error", () => {
    expect(isAppError("string")).toBe(false);
    expect(isAppError(null)).toBe(false);
  });
});

describe("toUserMessage", () => {
  it("returns AppError message directly", () => {
    const error = new AppError("DOC_001");
    expect(toUserMessage(error)).toBe(ERROR_CODES.DOC_001);
  });

  it("returns generic message for regular Error", () => {
    expect(toUserMessage(new Error("internal"))).toBe(
      "Une erreur inattendue est survenue. Veuillez réessayer."
    );
  });

  it("returns generic message for non-error", () => {
    expect(toUserMessage("string")).toBe(
      "Une erreur inattendue est survenue."
    );
  });
});
