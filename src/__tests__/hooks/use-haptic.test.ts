import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHaptic } from "@/hooks/use-haptic";

describe("useHaptic", () => {
  const originalVibrate = navigator.vibrate;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    if (originalVibrate === undefined) {
      delete (navigator as unknown as { vibrate?: unknown }).vibrate;
    } else {
      (navigator as unknown as { vibrate: typeof originalVibrate }).vibrate = originalVibrate;
    }
    window.matchMedia = originalMatchMedia;
  });

  it("calls navigator.vibrate when available", () => {
    const vibrate = vi.fn().mockReturnValue(true);
    (navigator as unknown as { vibrate: typeof vibrate }).vibrate = vibrate;

    const { result } = renderHook(() => useHaptic());
    act(() => result.current.tap());
    act(() => result.current.success());
    act(() => result.current.error());

    expect(vibrate).toHaveBeenCalledTimes(3);
    expect(vibrate).toHaveBeenNthCalledWith(1, 15);
    expect(vibrate).toHaveBeenNthCalledWith(2, [20, 40, 20]);
    expect(vibrate).toHaveBeenNthCalledWith(3, [120, 60, 120]);
  });

  it("is a no-op when navigator.vibrate is undefined", () => {
    delete (navigator as unknown as { vibrate?: unknown }).vibrate;

    const { result } = renderHook(() => useHaptic());
    expect(() => act(() => result.current.tap())).not.toThrow();
    expect(() => act(() => result.current.success())).not.toThrow();
  });

  it("respects prefers-reduced-motion", () => {
    const vibrate = vi.fn();
    (navigator as unknown as { vibrate: typeof vibrate }).vibrate = vibrate;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useHaptic());
    act(() => result.current.tap());

    expect(vibrate).not.toHaveBeenCalled();
  });

  it("swallows errors thrown by navigator.vibrate", () => {
    const vibrate = vi.fn(() => {
      throw new Error("nope");
    });
    (navigator as unknown as { vibrate: typeof vibrate }).vibrate = vibrate;

    const { result } = renderHook(() => useHaptic());
    expect(() => act(() => result.current.tap())).not.toThrow();
  });
});
