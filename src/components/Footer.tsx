"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isWikiMap = pathname === "/wiki-map";

  return (
    <footer style={{ maxWidth: isWikiMap ? "1400px" : "1200px" }}>
      <div>
        <div className="footer-logo">RESEARCH.ARCHIVE</div>
        <p className="philosophy">
          공부한 내용과 구현 기록을 다시 꺼내 쓸 수 있도록
          연결 가능한 지식으로 정리합니다.
        </p>
        <p style={{ fontSize: "11px", marginTop: "20px", color: "#AAA" }}>
          © 2024 Research Archive. Built with Obsidian-style Logic.
        </p>
      </div>
      <div className="footer-links">
        <div className="link-group">
          <h4>Internal</h4>
          <ul>
            <li className="mb-2">
              <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>
                Articles
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/wiki-map" style={{ color: "inherit", textDecoration: "none" }}>
                Wiki
              </Link>
            </li>
          </ul>
        </div>
        <div className="link-group">
          <h4>Social</h4>
          <ul>
            <li className="mb-2">
              <a
                href="https://github.com/06-month"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="mailto:junjeon@edu.hanbat.ac.kr"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Email Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
