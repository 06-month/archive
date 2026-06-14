"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav>
      <div className="nav-brand">Research.Archive</div>
      <div className="nav-links-container">
        <Link href="/" className={pathname === "/" ? "active" : ""}>
          Overview
        </Link>
        <Link href="/wiki-map" className={pathname === "/wiki-map" ? "active" : ""}>
          Wiki Map
        </Link>
        <Link href="/blog" className={pathname.startsWith("/blog") ? "active" : ""}>
          Articles
        </Link>
        <Link href="/about" className={pathname === "/about" ? "active" : ""}>
          About
        </Link>
      </div>
      <div className="tag-custom">System.v.2.4</div>
    </nav>
  );
}
