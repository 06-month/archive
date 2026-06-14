import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div>
        <div className="footer-logo">RESEARCH.LOG</div>
        <p className="philosophy">
          지식은 축적되는 것이 아니라 연결되는 것입니다. 저는 이 공간을 통해
          복잡한 AI 연구의 숲을 조망하고, 새로운 통찰을 발견하고자 합니다.
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
                Blog Posts
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/wiki-map" style={{ color: "inherit", textDecoration: "none" }}>
                Knowledge Map
              </Link>
            </li>
            <li style={{ color: "inherit" }}>Resources</li>
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
            <li style={{ color: "inherit" }}>
              <a
                href="mailto:firstn1028@gmail.com"
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
