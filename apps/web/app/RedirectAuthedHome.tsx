"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * The "/" landing is statically rendered and edge-cached for crawlers, so it
 * can't branch on the session server-side. On the client we ask next-auth for
 * the current session and send logged-in users into the app (the /continue
 * resolver). Crawlers don't run JS, so they just see the static landing.
 */
export default function RedirectAuthedHome() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((session) => {
        if (!cancelled && session && session.user) {
          router.replace("/continue");
        }
      })
      .catch(() => {
        /* stay on the landing */
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
