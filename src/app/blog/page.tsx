"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import contentIndexRaw from "@/generated/content-index.json";

interface Backlink {
  slug: string;
  title: string;
  type: string;
  url: string;
}

interface IndexItem {
  title: string;
  slug: string;
  type: string;
  filePath: string;
  category: string | null;
  subcategory: string | null;
  frontmatter: any;
  cover: string | null;
  created: string;
  updated: string;
  tags: string[];
  description: string;
  area: string;
  html: string;
  backlinks: Backlink[];
  outgoingLinks: Backlink[];
  paperLink: string | null;
  paperId: string | null;
}

const contentIndex = contentIndexRaw as Record<string, IndexItem>;

export default function BlogList() {
  // Extract all blog items
  const blogItems = Object.values(contentIndex)
    .filter((item) => item.type === "blog")
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  // Default mock covers just in case they don't have one
  const defaultCovers = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1509228468518-180dd482180c?auto=format&fit=crop&q=80&w=800"
  ];

  return (
    <div className="container-custom">
      <Navbar />
      {/* Blog Sidebar */}
      <Sidebar type="blog" />

      {/* Main Content Area */}
      <main className="content-right">
        {/* HERO BANNER */}
        <section className="card-custom hero-banner flex flex-col justify-between" style={{ minHeight: "220px" }}>
          <div className="hero-header">
            <span className="eyebrow" style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Writing · Reviews &amp; Logs
            </span>
          </div>
          <div className="hero-content">
            <h1 style={{ fontSize: "38px", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}>Articles</h1>
            <p className="mt-3 text-zinc-500 text-sm leading-relaxed max-w-xl" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              하나의 주제를 끝까지 따라간 글을 모읍니다. 논문을 읽고 이해한 것, 직접 구현하며 막혔던 지점, 공부하다 정리하게 된 흐름.
              개념 단위로 쪼갠 정의는 Wiki에, 읽는 순서가 있는 글은 여기에 둡니다.
            </p>
          </div>
          <div className="hero-meta">
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#BBB" }}>LAT: 37.5665 / LONG: 126.9780</span>
          </div>
        </section>

        {/* POSTS LIST */}
        <div className="section-header">
          <h2>전체 글</h2>
          <hr />
        </div>

        <div className="posts-list-horizontal flex flex-col gap-5">
          {blogItems.map((item, index) => {
            const dateString = item.created ? item.created.slice(0, 10).replace(/-/g, ".") : "2026.06.14";
            const coverImage = item.cover || defaultCovers[index % defaultCovers.length];
            const displayCategory = item.subcategory || item.category || "AI";

            return (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="writing-card-horizontal"
              >
                <div className="writing-thumb-horizontal">
                  <img
                    src={coverImage}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="writing-content-horizontal flex flex-col justify-between flex-grow">
                  <div className="writing-meta-horizontal flex justify-between items-center mb-1">
                    <span className="tag-custom">{displayCategory}</span>
                    <span className="mono" style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>
                      {dateString}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold" style={{ fontSize: "20px", color: "var(--text)" }}>
                    {item.title}
                  </h3>
                  <p className="desc text-sm" style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>
                    {item.description || `${item.title} 논문 리뷰 및 개념 분석 정리 노트.`}
                  </p>
                  <div className="writing-footer-horizontal flex justify-between items-center mt-4 pt-4 border-t border-zinc-100">
                    <div className="writing-tags-horizontal flex gap-1.5">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs font-bold" style={{ fontSize: "12px", color: "var(--text)" }}>
                      Read →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* BOTTOM METADATA GRIDS */}
        <div className="section-header">
          <h2>어떤 글이 있나</h2>
          <hr />
        </div>

        <div className="kinds-grid grid grid-cols-3 gap-5">
          <div className="kind-card flex flex-col gap-3">
            <div className="tag-custom" style={{ width: "fit-content" }}>논문 리뷰</div>
            <h3 style={{ marginTop: "4px", fontWeight: 700 }}>Understanding</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              한 편의 논문을 왜 이렇게 설계했는지까지 따라가며 정리한 글. 요약이 아니라 이해의 기록.
            </p>
          </div>
          <div className="kind-card flex flex-col gap-3">
            <div className="tag-custom" style={{ width: "fit-content" }}>구현 기록</div>
            <h3 style={{ marginTop: "4px", fontWeight: 700 }}>Implementation</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              직접 돌려보며 부딪힌 것들. 동작한 방법뿐 아니라, 왜 안 됐는지도 남깁니다.
            </p>
          </div>
          <div className="kind-card flex flex-col gap-3">
            <div className="tag-custom" style={{ width: "fit-content" }}>공부 노트</div>
            <h3 style={{ marginTop: "4px", fontWeight: 700 }}>Research Flow</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              여러 개념을 하나의 흐름으로 엮어 본 글. 정리되고 나면 일부는 Wiki로 쪼개집니다.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
