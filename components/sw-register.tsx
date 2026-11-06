"use client";

/*
  SERVICE-WORKER REGISTRATION  (the piece that turns the site into
  an installable app). Registered ONLY in production - the dev
  server hot-reloads and a cache would show stale code.
*/

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installing is a bonus, never a requirement.
      });
    };

    // Wait until the page has settled so it never competes with
    // the first render for the connection.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
