"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  return (
    <Suspense fallback={null}>
      <BlogListContent />
    </Suspense>
  );
}

function BlogListContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const selectedSubcategory = searchParams.get("subcategory");

  // Extract all blog items
  const blogItems = Object.values(contentIndex)
    .filter((item) => item.type === "blog")
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  const getItemCategory = (item: IndexItem) => item.category || "AI";
  const getItemSubcategory = (item: IndexItem) => item.subcategory || "Other";
  const filteredBlogItems = blogItems.filter((item) => {
    const matchesCategory = selectedCategory ? getItemCategory(item) === selectedCategory : true;
    const matchesSubcategory = selectedSubcategory ? getItemSubcategory(item) === selectedSubcategory : true;
    return matchesCategory && matchesSubcategory;
  });

  const heroTitle = selectedSubcategory
    ? selectedSubcategory
    : selectedCategory
      ? selectedCategory
      : "All Articles";

  const heroDescription = selectedSubcategory
    ? `${selectedSubcategory}에 해당하는 논문 리뷰와 구현 기록을 모았습니다. 같은 문제의식 아래에서 이어지는 글을 순서대로 확인할 수 있습니다.`
    : selectedCategory
      ? `${selectedCategory} 영역에 속한 글을 모았습니다. 더 좁은 주제는 왼쪽 카테고리에서 선택할 수 있습니다.`
      : "논문 리뷰와 구현 기록을 카테고리별로 모아 둔 연구 블로그 아카이브입니다. 개념 단위로 쪼갠 내용은 Wiki와 연결됩니다.";

  const sectionTitle = selectedSubcategory
    ? selectedSubcategory
    : selectedCategory
      ? selectedCategory
      : "All Articles";

  const articleSummaries: Record<string, string> = {
    "nerf-representing-scenes-as-neural-radiance-fields-for-view-synthesis-리뷰": "NeRF가 2D 이미지 집합으로부터 3D 장면을 연속적인 radiance field로 표현해 새로운 시점을 합성하는 방식을 정리한 리뷰입니다.",
    "3d-gaussian-splatting-for-real-time-radiance-field-rendering-리뷰": "3D Gaussian Splatting이 NeRF의 느린 학습·렌더링을 보완하며 실시간 렌더링을 가능하게 한 구조를 정리했습니다.",
    "deformable-3d-gaussians-for-high-fidelity-monocular-dynamic-scene-reconstruction-리뷰": "Deformable 3D Gaussians가 3DGS의 빠른 rasterization을 유지하면서 동적 장면 변형을 deformation field로 모델링하는 방식을 정리했습니다.",
    "4d-gaussian-splatting-for-real-time-dynamic-scene-rendering-리뷰": "4D Gaussian Splatting이 동적 장면을 실시간으로 렌더링하기 위해 시공간 변형을 효율적으로 다루는 방식을 정리했습니다.",
    "depth-based-hand-pose-estimation-리뷰": "깊이 기반 손 자세 추정 연구의 문제 설정, 평가 방식, 데이터셋 구성을 따라가며 정리한 글입니다.",
    "model-based-deep-hand-pose-estimation-리뷰": "모델 기반 손 자세 추정에서 손 구조와 딥러닝 표현을 결합하는 방식을 정리했습니다.",
    "modeling-and-capturing-hands-and-bodies-together-mano-리뷰": "MANO가 손 형상과 포즈를 어떻게 파라메트릭 모델로 표현하는지 정리한 리뷰입니다.",
    "region-ensemble-network-ren-리뷰": "REN이 손 영역을 나누어 특징을 모으고 자세를 추정하는 흐름을 정리했습니다."
  };

  const renderSentenceLines = (text: string) => text
    .split(/(?<=\.)\s+/)
    .map((sentence, index, sentences) => (
      <span key={sentence}>
        {sentence}
        {index < sentences.length - 1 && <br />}
      </span>
    ));

  // Default mock covers just in case they don't have one
  const defaultCovers = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1509228468518-180dd482180c?auto=format&fit=crop&q=80&w=800"
  ];

  return (
    <div className="container-custom blog-layout">
      {/* Blog Sidebar */}
      <Sidebar type="blog" activeCategory={selectedCategory} activeSubcategory={selectedSubcategory} />

      {/* Main Content Area */}
      <main className="content-right blog-main">
        {/* HERO BANNER */}
        <section className="card-custom hero-banner flex flex-col justify-between" style={{ minHeight: "220px" }}>
          <div className="hero-header">
            <span className="eyebrow" style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Articles Archive
            </span>
          </div>
          <div className="hero-content">
            <h1 style={{ fontSize: "38px", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}>{heroTitle}</h1>
            <p className="mt-3 text-zinc-500 text-sm leading-relaxed max-w-xl" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              {renderSentenceLines(heroDescription)}
            </p>
          </div>
          <div className="hero-meta">
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#BBB" }}>Research Blog · Paper Reviews · Implementation Logs</span>
          </div>
        </section>

        {/* POSTS LIST */}
        <div className="section-header blog-list-header">
          <div className="blog-list-title-group">
            <span>Current Selection</span>
            <h2>{sectionTitle}</h2>
          </div>
          <hr />
          <span className="tag-custom blog-post-count">{filteredBlogItems.length} POSTS</span>
        </div>

        <div className="posts-list-horizontal flex flex-col gap-5">
          {filteredBlogItems.map((item, index) => {
            const dateString = item.created ? item.created.slice(0, 10).replace(/-/g, ".") : "2026.06.14";
            const coverImage = item.cover || defaultCovers[index % defaultCovers.length];
            const displayCategory = item.subcategory || item.category || "AI";
            const description = item.description || articleSummaries[item.slug] || "논문을 읽고 핵심 구조, 실험 흐름, 구현 관점에서 다시 정리한 연구 노트입니다.";

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
                  <p className="desc blog-card-desc text-sm" style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>
                    {description}
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
          {filteredBlogItems.length === 0 && (
            <div className="card-custom" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>표시할 글이 없습니다.</h3>
              <p style={{ marginTop: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                선택한 카테고리에 연결된 글이 아직 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM METADATA GRIDS */}
        <div className="section-header writing-tracks-header">
          <h2>글의 흐름</h2>
          <hr />
        </div>

        <div className="kinds-grid grid grid-cols-3 gap-5">
          <div className="kind-card flex flex-col gap-3">
            <div className="tag-custom" style={{ width: "fit-content" }}>논문 이해</div>
            <h3 style={{ marginTop: "4px", fontWeight: 700 }}>Understanding</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              논문이 어떤 문제를 풀고, 왜 그런 구조로 설계되었는지 따라가며 정리합니다.
            </p>
          </div>
          <div className="kind-card flex flex-col gap-3">
            <div className="tag-custom" style={{ width: "fit-content" }}>구현 기록</div>
            <h3 style={{ marginTop: "4px", fontWeight: 700 }}>Implementation</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              읽은 내용을 직접 구현하며 마주친 선택, 오류, 실험 기록을 남깁니다.
            </p>
          </div>
          <div className="kind-card flex flex-col gap-3">
            <div className="tag-custom" style={{ width: "fit-content" }}>Wiki 연결</div>
            <h3 style={{ marginTop: "4px", fontWeight: 700 }}>Research Flow</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              분산된 개념들을 하나의 흐름으로 묶고, 정리된 내용은 Wiki로 연결합니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
