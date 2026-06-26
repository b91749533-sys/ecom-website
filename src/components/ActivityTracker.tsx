"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ActivityTracker() {
  const pathname = usePathname();
  const { items, loading } = useCart();
  const lastPathnameRef = useRef<string>(pathname);
  const startTimeRef = useRef<number>(Date.now());
  const initialMountRef = useRef<boolean>(true);

  // Parse browser and device from User-Agent
  const getBrowserAndDevice = () => {
    if (typeof window === "undefined") {
      return { browser: "Unknown", device: "Desktop" };
    }
    const ua = window.navigator.userAgent;
    let browser = "Unknown";
    let device = "Desktop";

    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Chrome") && !ua.includes("Chromium") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

    if (ua.includes("Mobi") || ua.includes("Android") || ua.includes("iPhone")) device = "Mobile";
    else if (ua.includes("Tablet") || ua.includes("iPad") || ua.includes("PlayBook") || ua.includes("BB10")) device = "Tablet";

    return { browser, device };
  };

  // Helper to send page view duration
  const trackActivity = async (page: string, durationMs: number) => {
    try {
      const { browser, device } = getBrowserAndDevice();
      await fetch("/api/crm/track-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          duration: durationMs / 1000, // convert to seconds
          device,
          browser,
        }),
      });
    } catch (err) {
      console.error("Failed to track activity:", err);
    }
  };

  // 1. Page view tracking (duration-based)
  useEffect(() => {
    // If it's not the initial mount, it means we changed pages.
    // Send duration for the PREVIOUS page.
    if (!initialMountRef.current) {
      const timeSpent = Date.now() - startTimeRef.current;
      trackActivity(lastPathnameRef.current, timeSpent);
    } else {
      initialMountRef.current = false;
    }

    // Update references for the current page
    lastPathnameRef.current = pathname;
    startTimeRef.current = Date.now();

    // Trigger initial log for current page
    trackActivity(pathname, 0);

    return () => {
      // When unmounting or user navigates away
      const timeSpent = Date.now() - startTimeRef.current;
      trackActivity(lastPathnameRef.current, timeSpent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Handle page unload (browser close or tab close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTimeRef.current;
      // Use keepalive fetch to ensure the request is completed during unload
      const { browser, device } = getBrowserAndDevice();
      fetch("/api/crm/track-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: lastPathnameRef.current,
          duration: timeSpent / 1000,
          device,
          browser,
        }),
        keepalive: true,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 2. Cart updates tracking
  // We use a ref to prevent syncing during initial load of cart context,
  // or duplicate logs if items reference hasn't changed.
  const prevItemsHashRef = useRef<string>("");

  useEffect(() => {
    if (loading) return;

    // Simple hash to see if item IDs/quantities changed
    const currentHash = items
      .map((item) => `${item.product.id}:${item.quantity}`)
      .sort()
      .join(",");

    if (prevItemsHashRef.current !== currentHash) {
      prevItemsHashRef.current = currentHash;
      
      // Debounce slightly to prevent spamming while user is clicking "+" multiple times rapidly
      const timer = setTimeout(() => {
        fetch("/api/crm/track-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).catch((err) => console.error("Failed to sync cart update:", err));
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [items, loading]);

  return null; // This component tracks in the background, renders no UI.
}
