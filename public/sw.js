/*
  DUIKUL OFFLINE WORKER (service worker)
  --------------------------------------
  Makes the installed app open without internet: pages you already
  loaded are served from the phone's cache, static files are kept
  forever, and everything else shows the bilingual offline page.

  This file is plain browser JavaScript - it never runs on the
  server. Update VERSION whenever the shell changes to bust caches.
*/

const VERSION = "duikul-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(["/", OFFLINE_URL]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never touch other servers (feeds, social share, photo hosts).
  if (url.origin !== self.location.origin) return;

  // News pages: network first (so visitors always get the newest
  // feed data), cached copy as fallback, then the offline page.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches
            .open(VERSION)
            .then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Site assets (Next bundles, icons, fonts): cache first, they are
  // content-hashed - a cached version is always the same file.
  const isAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/favicon.ico" ||
    /\.(woff2?|png|svg)$/.test(url.pathname);

  if (isAsset) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            const copy = response.clone();
            caches
              .open(VERSION)
              .then((cache) => cache.put(event.request, copy));
            return response;
          })
      )
    );
  }
});
