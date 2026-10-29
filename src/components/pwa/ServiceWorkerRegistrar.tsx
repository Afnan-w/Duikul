"use client";

import { useEffect } from "react";

/**
 * Registers the production service worker. Development is skipped on
 * purpose: caching Turbopack's changing chunks would make hot reload
 * unreliable and hide real network behaviour.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error: unknown) => {
          console.warn("[pwa] service worker registration failed", error);
        });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
