const VERSION = "v2";
const CACHE_NAME = `apex-scorecard-${VERSION}`;
const RUNTIME_CACHE = `apex-runtime-${VERSION}`;

const APP_SHELL = [
  "/",
  "/login",
  "/scorecard",
  "/client-portal/dashboard",
  "/offline",
  "/favicon.ico",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/apple-touch-icon-180x180.png",
  "/maskable-192x192.png",
  "/maskable-512x512.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
];

// Precache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Claim clients on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (![CACHE_NAME, RUNTIME_CACHE].includes(key)) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Skip waiting message listener
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

function isHTML(request) {
  return (
    request.mode === "navigate" ||
    (request.headers.get("accept")?.includes("text/html") ?? false)
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/screenshots/") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?)$/)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Do not cache APIs or Supabase requests
  if (url.pathname.startsWith("/api") || url.hostname.includes("supabase")) return;

  // Strategy 1: HTML pages - Network first, offline fallback
  if (isHTML(request)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const responseClone = response.clone();
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(request, responseClone);
          return response;
        } catch {
          const cachedResponse = await caches.match(request);
          return cachedResponse || (await caches.match("/offline"));
        }
      })()
    );
    return;
  }

  // Strategy 2: Static assets - Stale-while-revalidate
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(async (cached) => {
        const networkFetch = fetch(request)
          .then(async (response) => {
            const cache = await caches.open(RUNTIME_CACHE);
            await cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Strategy 3: Default network-first with cache fallback
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put(request, response.clone());
        return response;
      } catch {
        return caches.match(request);
      }
    })()
  );
});
