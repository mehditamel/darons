// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

type WorkerEvent = {
  request?: { url: string; method: string; mode: string };
  respondWith: ReturnType<typeof vi.fn>;
  waitUntil: ReturnType<typeof vi.fn>;
};

function setupWorker() {
  const handlers: Record<string, (event: WorkerEvent) => void> = {};
  const cache = { add: vi.fn().mockResolvedValue(undefined), match: vi.fn(), put: vi.fn() };
  const caches = {
    open: vi.fn().mockResolvedValue(cache),
    keys: vi.fn().mockResolvedValue(["darons-old", "other-app", "darons-public-__BUILD_ID__"]),
    delete: vi.fn().mockResolvedValue(true),
  };
  const fetch = vi.fn().mockResolvedValue(new Response("private household data"));
  const claim = vi.fn();
  runInNewContext(readFileSync(resolve("public/sw.template.js"), "utf8"), {
    URL, Response, fetch, caches,
    self: {
      location: { origin: "https://darons.app" },
      clients: { claim },
      addEventListener: (name: string, fn: (event: WorkerEvent) => void) => { handlers[name] = fn; },
    },
  });
  function dispatch(name: string, path = "/", method = "GET", mode = "navigate") {
    const event: WorkerEvent = {
      request: { url: new URL(path, "https://darons.app").href, method, mode },
      respondWith: vi.fn(), waitUntil: vi.fn(),
    };
    handlers[name](event);
    return event;
  }
  return { cache, caches, fetch, claim, dispatch };
}

describe("service worker data isolation", () => {
  it("pre-caches only public assets", async () => {
    const { dispatch, cache } = setupWorker();
    await dispatch("install").waitUntil.mock.calls[0][0];
    expect(cache.add.mock.calls.map(([path]) => path)).toEqual([
      "/offline.html", "/manifest.json", "/icons/icon-72x72.png", "/icons/icon-192x192.png", "/icons/icon-512x512.png",
    ]);
  });

  it("purges legacy private caches without touching other apps", async () => {
    const { dispatch, caches, claim } = setupWorker();
    await dispatch("activate").waitUntil.mock.calls[0][0];
    expect(caches.delete.mock.calls).toEqual([["darons-old"]]);
    expect(claim).toHaveBeenCalledOnce();
  });

  it.each(["/dashboard", "/sante", "/confiance/token", "/callback?code=secret", "/outils"])(
    "never caches navigation responses for %s", async (path) => {
      const { dispatch, cache, fetch } = setupWorker();
      const response = await dispatch("fetch", path).respondWith.mock.calls[0][0];
      expect(await response.text()).toBe("private household data");
      expect(fetch).toHaveBeenCalledOnce();
      expect(cache.put).not.toHaveBeenCalled();
      expect(cache.match).not.toHaveBeenCalled();
    },
  );

  it("returns the neutral offline page instead of cached private data", async () => {
    const { dispatch, cache, fetch } = setupWorker();
    fetch.mockRejectedValue(new TypeError("offline"));
    cache.match.mockResolvedValue(new Response("offline page"));
    const response = await dispatch("fetch", "/sante").respondWith.mock.calls[0][0];
    expect(await response.text()).toBe("offline page");
    expect(cache.match).toHaveBeenCalledWith("/offline.html");
  });

  it("returns 503 if even the offline page is unavailable", async () => {
    const { dispatch, fetch } = setupWorker();
    fetch.mockRejectedValue(new TypeError("offline"));
    expect((await dispatch("fetch").respondWith.mock.calls[0][0]).status).toBe(503);
  });

  it.each([
    ["/api/newsletter/subscribe", "POST"], ["/sante", "POST"],
    ["/api/health", "GET"], ["/sante?_rsc=123", "GET"],
    ["https://other.example/private.png", "GET"], ["/documents/private.png", "GET"],
  ])("leaves %s %s to the network", (path, method) => {
    const { dispatch } = setupWorker();
    expect(dispatch("fetch", path, method, "cors").respondWith).not.toHaveBeenCalled();
  });

  it("can still serve public icons offline", async () => {
    const { dispatch, cache, fetch } = setupWorker();
    cache.match.mockResolvedValue(new Response("icon"));
    const response = await dispatch("fetch", "/icons/icon-192x192.png", "GET", "cors").respondWith.mock.calls[0][0];
    expect(await response.text()).toBe("icon");
    expect(fetch).not.toHaveBeenCalled();
  });
});
