import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import App from "./App.tsx";
import "./index.css";

// Check if this is a test session (URL param or previously flagged)
const isTestSession = new URLSearchParams(window.location.search).has('__test') ||
                      sessionStorage.getItem('__posthog_disabled') === 'true';

// Persist for the entire session (survives page navigations)
if (isTestSession) {
  sessionStorage.setItem('__posthog_disabled', 'true');
}

// Initialize PostHog (skip for test sessions)
if (import.meta.env.VITE_PUBLIC_POSTHOG_KEY && !isTestSession) {
  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://eu.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
  });
}

createRoot(document.getElementById("root")!).render(<App />);
