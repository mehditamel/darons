const CACHE_NAME = "darons-public-__BUILD_ID__";
const STATIC_ASSETS = [
  "/offline.html",
  "/manifest.json",
  "/icons/icon-72x72.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(STATIC_ASSETS.map((url) => cache.add(url).catch(() => undefined)));
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Remove legacy caches that could contain another household's private pages.
    // Leave unrelated applications' caches alone.
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("darons-") && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never pretend a mutation succeeded or retain API, auth, RSC or private data.
  // Explicit client queues must report their own persistence and replay status.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (STATIC_ASSETS.includes(url.pathname) && !url.search) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && !response.redirected) await cache.put(request, response.clone());
      return response;
    })());
    return;
  }

  // Navigations always revalidate authentication through the network. Offline,
  // show a neutral page, never a previously authenticated HTML response.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match("/offline.html") || new Response("Connexion indisponible. Réessaie lorsque tu es en ligne.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    })());
  }
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "Nouvelle notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/dashboard" },
    actions: [
      { action: "open", title: "Voir" },
      { action: "dismiss", title: "Ignorer" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Darons", options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// Background sync — replay queued mutations when back online
self.addEventListener("sync", (event) => {
  if (event.tag === "darons-offline-sync") {
    event.waitUntil(replayOfflineQueue());
  }
});

async function replayOfflineQueue() {
  // The actual replay logic is in the client-side offline-queue.ts
  // This just triggers client-side sync via message
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "SYNC_OFFLINE_QUEUE" });
  }
}
