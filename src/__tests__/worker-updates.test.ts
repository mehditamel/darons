import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { observeWorkerUpdates } from "@/lib/pwa/worker-updates";

function fixtures() {
  const worker = Object.assign(new EventTarget(), { state: "installed", postMessage: vi.fn() });
  const registration = Object.assign(new EventTarget(), { waiting: worker as typeof worker | null, installing: null as typeof worker | null, update: vi.fn().mockResolvedValue(undefined) });
  const workers = Object.assign(new EventTarget(), { controller: {} as object | null, register: vi.fn().mockResolvedValue(registration) });
  const reload = vi.fn();
  const dismiss = vi.fn();
  const prompt = vi.fn().mockReturnValue(dismiss);
  const start = () => observeWorkerUpdates(workers as unknown as ServiceWorkerContainer, prompt, reload);
  return { worker, workers, registration, reload, dismiss, prompt, start };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe("service worker update lifecycle", () => {
  it("keeps the page on first install and updates accepted in another tab", async () => {
    const f = fixtures();
    f.workers.controller = null;
    const stop = f.start();
    await Promise.resolve();
    f.workers.dispatchEvent(new Event("controllerchange"));
    expect(f.prompt).not.toHaveBeenCalled();
    expect(f.reload).not.toHaveBeenCalled();
    stop();
    f.workers.controller = {};
    const stopAgain = f.start();
    await Promise.resolve();
    f.workers.dispatchEvent(new Event("controllerchange"));
    expect(f.reload).not.toHaveBeenCalled();
    stopAgain();
  });

  it("activates only after acceptance, then reloads exactly once", async () => {
    const f = fixtures();
    const stop = f.start();
    await Promise.resolve();
    expect(f.prompt).toHaveBeenCalledOnce();
    expect(f.worker.postMessage).not.toHaveBeenCalled();
    f.prompt.mock.calls[0][0]();
    expect(f.worker.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
    f.workers.dispatchEvent(new Event("controllerchange"));
    f.workers.dispatchEvent(new Event("controllerchange"));
    expect(f.reload).toHaveBeenCalledOnce();
    stop();
  });

  it("cleans up polling, listeners and the update prompt on unmount", async () => {
    const f = fixtures();
    const stop = f.start();
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(1);
    stop();
    expect(vi.getTimerCount()).toBe(0);
    expect(f.dismiss).toHaveBeenCalledOnce();
    document.dispatchEvent(new Event("visibilitychange"));
    f.workers.dispatchEvent(new Event("controllerchange"));
    f.registration.dispatchEvent(new Event("updatefound"));
    f.prompt.mock.calls[0][0]();
    expect(f.registration.update).not.toHaveBeenCalled();
    expect(f.worker.postMessage).not.toHaveBeenCalled();
    expect(f.reload).not.toHaveBeenCalled();
  });

  it("does not install listeners when registration finishes after unmount", async () => {
    const f = fixtures();
    let resolve!: (value: typeof f.registration) => void;
    f.workers.register.mockReturnValue(new Promise(done => { resolve = done; }));
    const stop = f.start();
    stop();
    resolve(f.registration);
    await Promise.resolve();
    expect(f.prompt).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(f.registration.update).not.toHaveBeenCalled();
  });

  it("still honors Reload if another tab has already activated the update", async () => {
    const f = fixtures();
    const stop = f.start();
    await Promise.resolve();
    f.worker.state = "activated";
    f.workers.dispatchEvent(new Event("controllerchange"));
    expect(f.reload).not.toHaveBeenCalled();
    f.prompt.mock.calls[0][0]();
    expect(f.reload).toHaveBeenCalledOnce();
    stop();
  });

  it("watches in-progress installation once and removes its state listener", async () => {
    const f = fixtures();
    f.worker.state = "installing";
    f.registration.waiting = null;
    f.registration.installing = f.worker;
    const remove = vi.spyOn(f.worker, "removeEventListener");
    const stop = f.start();
    await Promise.resolve();
    f.registration.dispatchEvent(new Event("updatefound"));
    expect(f.prompt).not.toHaveBeenCalled();
    f.worker.state = "installed";
    f.worker.dispatchEvent(new Event("statechange"));
    f.worker.dispatchEvent(new Event("statechange"));
    expect(f.prompt).toHaveBeenCalledOnce();
    stop();
    expect(remove).toHaveBeenCalledOnce();
  });

  it("checks for updates only in a visible tab and absorbs update failures", async () => {
    const f = fixtures();
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    const stop = f.start();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(f.registration.update).not.toHaveBeenCalled();
    visibility.mockReturnValue("visible");
    f.registration.update.mockRejectedValue(new Error("offline"));
    document.dispatchEvent(new Event("visibilitychange"));
    await Promise.resolve();
    expect(f.registration.update).toHaveBeenCalledOnce();
    stop();
  });
});
