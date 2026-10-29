/**
 * KhoborDaily service worker.
 *
 * The news edition is server-rendered and changes every few minutes, so
 * navigations are network-first with a short timeout. Static build assets
 * are content-hashed and safe to serve cache-first. Publisher images are
 * cross-origin and deliberately left untouched.
 */
const VERSION = "v1";
const STATIC_CACHE = `kd-static-${VERSION}`;
const PAGE_CACHE = `kd-pages-${VERSION}`;
const PAGE_CACHE_LIMIT = 32;
const NAVIGATION_TIMEOUT_MS = 4_000;

const PRECACHE = [
  "/offline",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
];

/** HTML responses for these paths are kept for offline reading. */
function isCacheablePage(pathname) {
  return (
    pathname === "/" ||
    pathname === "/deshi" ||
    pathname === "/bideshi" ||
    pathname === "/about" ||
    pathname === "/privacy" ||
    pathname === "/offline" ||
    pathname.startsWith("/story/")
  );
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.svg" ||
    pathname === "/manifest.webmanifest"
  );
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const excess = keys.length - maxEntries;
  if (excess <= 0) return;
  await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
}

async function fetchWithTimeout(request, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function networkFirstPage(request) {
  const url = new URL(request.url);
  const cache = await caches.open(PAGE_CACHE);

  try {
    const response = await fetchWithTimeout(request, NAVIGATION_TIMEOUT_MS);
    const contentType = response.headers.get("content-type") || "";

    if (
      response.ok &&
      response.type === "basic" &&
      contentType.includes("text/html") &&
      isCacheablePage(url.pathname)
    ) {
      await cache.put(request, response.clone());
      await trimCache(PAGE_CACHE, PAGE_CACHE_LIMIT);
    }

    return response;
  } catch {
    const cachedPage = await cache.match(request);
    if (cachedPage) return cachedPage;

    const offlinePage = await caches.match("/offline");
    if (offlinePage) return offlinePage;

    return new Response("You are offline.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      // allSettled keeps the worker installable if one optional asset is
      // unavailable; the offline page is the only critical entry.
      .then((cache) =>
        Promise.allSettled(PRECACHE.map((url) => cache.add(url))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("kd-") && !key.endsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});
