"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const NAV_INDICATOR_KEY = "research-archive-nav-indicator";

interface NavIndicatorSnapshot {
  left: number;
  width: number;
  ready: boolean;
  index: number;
}

const navItems = [
  {
    href: "/",
    label: "Overview",
    isActive: (pathname: string) => pathname === "/",
  },
  {
    href: "/wiki-map",
    label: "Wiki",
    isActive: (pathname: string) => pathname === "/wiki-map" || pathname.startsWith("/wiki/"),
  },
  {
    href: "/blog",
    label: "Articles",
    isActive: (pathname: string) => pathname.startsWith("/blog"),
  },
  {
    href: "/about",
    label: "About",
    isActive: (pathname: string) => pathname === "/about",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const firstMeasureRef = useRef(true);
  const [indicator, setIndicator] = useState<NavIndicatorSnapshot>({ left: 4, width: 0, ready: false, index: 0 });
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedTheme = window.localStorage.getItem("research-archive-theme") as "light" | "dark";
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("research-archive-theme", nextTheme);
  };

  const activeIndex = Math.max(0, navItems.findIndex((item) => item.isActive(pathname)));

  const measureIndicator = (index = activeIndex) => {
    const nav = navRef.current;
    const link = linkRefs.current[index];
    if (!nav || !link) return null;

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    return {
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      ready: true,
      index,
    };
  };

  const storeIndicatorSnapshotForIndex = (index: number) => {
    const fromLocation = measureIndicator(activeIndex);
    const toLocation = measureIndicator(index);

    if (fromLocation) {
      window.sessionStorage.setItem(NAV_INDICATOR_KEY, JSON.stringify(fromLocation));
    }
    if (toLocation) {
      setIndicator(toLocation);
    }
  };

  useLayoutEffect(() => {
    if (!mounted) return;
    const current = measureIndicator();
    if (!current) return;
    let firstFrame = 0;
    let secondFrame = 0;

    if (firstMeasureRef.current) {
      firstMeasureRef.current = false;
      const stored = window.sessionStorage.getItem(NAV_INDICATOR_KEY);

      if (stored) {
        try {
          const previous = JSON.parse(stored) as NavIndicatorSnapshot;
          const shouldAnimateFromPrevious = previous.index !== activeIndex && previous.width > 0;

          if (shouldAnimateFromPrevious) {
            setIndicator({ ...previous, ready: true });
            firstFrame = window.requestAnimationFrame(() => {
              secondFrame = window.requestAnimationFrame(() => {
                setIndicator(current);
              });
            });
          } else {
            setIndicator(current);
          }
        } catch {
          setIndicator(current);
        }
      } else {
        setIndicator(current);
      }
    } else {
      setIndicator(current);
    }

    window.sessionStorage.setItem(NAV_INDICATOR_KEY, JSON.stringify(current));

    const handleResize = () => {
      const next = measureIndicator();
      if (next) setIndicator(next);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname, activeIndex, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const isWikiMap = pathname === "/wiki-map";

  return (
    <nav style={{ maxWidth: isWikiMap ? "1400px" : "1200px" }}>
      <div className="nav-brand">Research.Archive</div>
      <div className={`nav-links-container nav-pill-group ${mounted && indicator.ready ? "js-ready" : ""}`} ref={navRef}>
        <span
          className="nav-pill-indicator"
          aria-hidden="true"
          style={{
            transform: `translateX(${mounted ? indicator.left : 4}px)`,
            width: `${mounted ? indicator.width : 0}px`,
          }}
        />
        {navItems.map((item, index) => {
          const isActive = item.isActive(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(element) => {
                linkRefs.current[index] = element;
              }}
              className={isActive ? "active" : ""}
              onPointerDown={() => storeIndicatorSnapshotForIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  storeIndicatorSnapshotForIndex(index);
                }
              }}
              onClick={() => storeIndicatorSnapshotForIndex(index)}
            >
              <span className="nav-link-text">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          aria-label="Toggle theme"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text)",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.7,
            transition: "opacity 0.2s ease"
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
          onMouseOut={(e) => e.currentTarget.style.opacity = "0.7"}
        >
          {theme === "light" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
        <div className="tag-custom">System.v.2.4</div>
      </div>
    </nav>
  );
}
