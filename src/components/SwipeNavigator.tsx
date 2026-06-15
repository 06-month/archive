"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Same order as the navbar. A swipe left advances to the next page,
// a swipe right goes back to the previous one.
const PAGES = ["/", "/wiki-map", "/blog", "/about"];

function currentIndex(pathname: string): number {
  if (pathname === "/") return 0;
  if (pathname === "/wiki-map" || pathname.startsWith("/wiki/")) return 1;
  if (pathname.startsWith("/blog")) return 2;
  if (pathname === "/about") return 3;
  return -1;
}

export default function SwipeNavigator() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let tracking = false;

    // Don't hijack horizontal gestures meant for an interactive element:
    // the wiki-map graph (d3 pan), horizontally scrollable tables, or the
    // scrollable nav pill bar.
    const isExcluded = (target: EventTarget | null): boolean => {
      let el = target as HTMLElement | null;
      while (el && el !== document.body) {
        if (el.dataset && el.dataset.noSwipe !== undefined) return true;
        if (
          el.classList &&
          (el.classList.contains("graph-container") ||
            el.classList.contains("update-table-container") ||
            el.classList.contains("nav-pill-wrap"))
        ) {
          return true;
        }
        const style = window.getComputedStyle(el);
        if (
          (style.overflowX === "auto" || style.overflowX === "scroll") &&
          el.scrollWidth > el.clientWidth + 4
        ) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    const onStart = (e: TouchEvent) => {
      // Mobile layout only, single finger, not on an interactive area.
      if (window.innerWidth > 992 || e.touches.length !== 1 || isExcluded(e.target)) {
        tracking = false;
        return;
      }
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startTime = Date.now();
      tracking = true;
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;

      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const elapsed = Date.now() - startTime;

      // Must be a deliberate, mostly-horizontal flick.
      if (absX < 70 || absX < absY * 2 || elapsed > 800) return;

      const idx = currentIndex(pathname);
      if (idx === -1) return;

      const nextIdx = dx < 0 ? idx + 1 : idx - 1;
      if (nextIdx < 0 || nextIdx >= PAGES.length) return;

      router.push(PAGES[nextIdx]);
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, [pathname, router]);

  return null;
}
