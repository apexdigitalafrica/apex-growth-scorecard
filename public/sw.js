// public/sw.js

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

// Precache shell
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// Cleanup old caches
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

function isHTML(request) {
  return request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
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

// Fetch strategies:
// 1) Navigations: network-first, offline fallback
// 2) Static: stale-while-revalidate
// 3) Everything else GET: network-first with cache fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache Supabase or APIs
  if (url.pathname.startsWith("/api") || url.hostname.includes("supabase")) return;

  // 1) HTML pages
  if (isHTML(request)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match("/offline");
        })
    );
    return;
  }

  // 2) Static assets (stale-while-revalidate)
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((res) => {
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, res.clone()));
            return res;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // 3) Default: network-first
  event.respondWith(
    fetch(request)
      .then((res) => {
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, res.clone()));
        return res;
      })
      .catch(() => caches.match(request))
  );
});
