"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Light/dark switch. The icon is chosen by CSS (`dark:`), not React state,
 * so the server and client markup are always identical. The pre-paint script
 * in the root layout has already applied the saved theme.
 */
export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const nextDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nextDark);
    root.style.colorScheme = nextDark ? "dark" : "light";
    try {
      localStorage.setItem("kd-theme", nextDark ? "dark" : "light");
    } catch {
      // Private mode can deny storage; the visual toggle still works.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="tap-target inline-flex items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
      aria-label="Change colour theme / রঙ পরিবর্তন"
    >
      <Sun size={18} strokeWidth={1.6} aria-hidden="true" className="dark:hidden" />
      <Moon
        size={18}
        strokeWidth={1.6}
        aria-hidden="true"
        className="hidden dark:block"
      />
    </button>
  );
}
