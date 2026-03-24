const CACHE_NAME = "darons-20260323";
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

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...STATIC_ASSETS, ...DASHBOARD_PAGES]);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
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

  // Stale-while-revalidate for dashboard pages
  const isDashboardPage = DASHBOARD_PAGES.some((p) => url.pathname === p || url.pathname.startsWith(p + "/"));
  if (isDashboardPage || url.pathname === "/dashboard") {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
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
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for fonts and images
  if (
    url.pathname.startsWith("/icons/") ||
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
