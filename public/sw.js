const CACHE_NAME = "darons-1775538735";
const FONT_CACHE_NAME = "darons-fonts-v1";
const MAX_DYNAMIC_CACHE_SIZE = 50;
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];
const DASHBOARD_PAGES = [
  "/budget",
  "/sante",
  "/identite",
  "/fiscal",
  "/parametres",
  "/alertes",
  "/documents",
  "/activites",
  "/developpement",
  "/garde",
  "/demarches",
];

// Trim cache to max size (LRU eviction by insertion order)
async function trimCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    const toDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...STATIC_ASSETS, ...DASHBOARD_PAGES]);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches + enable navigation preload
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clean old caches (keep font cache across versions)
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== FONT_CACHE_NAME)
          .map((name) => caches.delete(name))
      );

      // Enable navigation preload for faster first load
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
  self.clients.claim();
});

// Fetch: stale-while-revalidate for dashboard pages, network-first for rest
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests — but store them in the offline queue if offline
  if (request.method !== "GET") {
    if (!navigator.onLine && request.method === "POST") {
      // Queue POST requests for later (handled by offline-queue.ts on client)
      event.respondWith(
        new Response(JSON.stringify({ queued: true }), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        })
      );
    }
    return;
  }

  // Skip Next.js internals
  if (url.pathname.startsWith("/_next/")) {
    return;
  }

  // Skip API calls — let them go to network (or fail)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Cache Google Fonts with cache-first strategy (they're immutable)
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(
      caches.open(FONT_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for dashboard pages
  const isDashboardPage = DASHBOARD_PAGES.some((p) => url.pathname === p || url.pathname.startsWith(p + "/"));
  if (isDashboardPage || url.pathname === "/dashboard") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        // Use navigation preload response if available
        const preloadResponse = event.preloadResponse
          ? await event.preloadResponse
          : null;

        const fetchPromise = (preloadResponse && preloadResponse.ok
          ? Promise.resolve(preloadResponse)
          : fetch(request)
        )
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            if (cached) return cached;
            if (request.mode === "navigate") {
              return caches.match("/offline.html");
            }
            return new Response("Hors ligne", { status: 503, headers: { "Content-Type": "text/plain" } });
          });

        // Return cached version immediately, update in background
        return cached || fetchPromise;
      })()
    );
    return;
  }

  // Stale-while-revalidate for fonts and images
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/screenshots/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetched = fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
          return cached || fetched;
        });
      })
    );
    return;
  }

  // Network-first strategy with offline fallback for everything else
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
            // LRU: trim dynamic cache to prevent unbounded growth
            trimCache(CACHE_NAME, MAX_DYNAMIC_CACHE_SIZE);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === "navigate") {
            return caches.match("/offline.html");
          }
          return new Response("Hors ligne", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        });
      })
  );
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
