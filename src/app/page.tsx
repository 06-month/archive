"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import contentIndexRaw from "@/generated/content-index.json";
import graphDataRaw from "@/generated/graph-data.json";

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

interface MiniGraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  slug: string;
  degree: number;
  area: string;
}

interface MiniGraphEdge extends d3.SimulationLinkDatum<MiniGraphNode> {
  source: string | MiniGraphNode;
  target: string | MiniGraphNode;
}

const miniGraphData = graphDataRaw as { nodes: MiniGraphNode[]; edges: MiniGraphEdge[] };

export default function Home() {
  const heroGraphRef = useRef<SVGSVGElement>(null);

  // D3 mini graph in hero section — mirrors the wiki-map graph
  useEffect(() => {
    if (!heroGraphRef.current) return;

    d3.select(heroGraphRef.current).selectAll("*").remove();

    const width = 460;
    const height = 410;

    const svg = d3.select(heroGraphRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%");

    const g = svg.append("g");

    // Deep copy data
    const nodes: MiniGraphNode[] = JSON.parse(JSON.stringify(miniGraphData.nodes));
    const links: MiniGraphEdge[] = JSON.parse(JSON.stringify(miniGraphData.edges));

    const nodeCountMultiplier = Math.max(0.65, Math.min(1.2, Math.sqrt(40 / nodes.length)));

    function getNodeRadius(degree: number) {
      if (degree <= 1) return 1.6 * nodeCountMultiplier;
      if (degree <= 2) return 2.4 * nodeCountMultiplier;
      return Math.min(2.8 + Math.sqrt(degree) * 1.2, 9.0) * nodeCountMultiplier;
    }

    // Area color map (same as wiki-map categories)
    const areaColorMap: Record<string, string> = {
      research: "#4A4A4A",
      concepts: "#6366f1",
      courses: "#059669",
      system: "#d97706",
    };

    // Force simulation
    const simulation = d3.forceSimulation<MiniGraphNode>(nodes)
      .force("link", d3.forceLink<MiniGraphNode, MiniGraphEdge>(links).id((d) => d.id).distance(120 * nodeCountMultiplier).strength(0.18))
      .force("charge", d3.forceManyBody<MiniGraphNode>().strength((d) => d.degree === 0 ? -15 : -140 - d.degree * 30))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX<MiniGraphNode>(width / 2).strength((d) => d.degree === 0 ? 0.20 : 0.02))
      .force("y", d3.forceY<MiniGraphNode>(height / 2).strength((d) => d.degree === 0 ? 0.20 : 0.02))
      .force("collide", d3.forceCollide<MiniGraphNode>().radius((d) => getNodeRadius(d.degree) + 12 * nodeCountMultiplier));

    // Pre-run for near-final layout
    for (let i = 0; i < 200; i++) {
      simulation.tick();
    }

    // Auto-fit zoom
    const minX = d3.min(nodes, (d) => d.x) || 0;
    const maxX = d3.max(nodes, (d) => d.x) || width;
    const minY = d3.min(nodes, (d) => d.y) || 0;
    const maxY = d3.max(nodes, (d) => d.y) || height;
    const graphWidth = Math.max(100, maxX - minX);
    const graphHeight = Math.max(100, maxY - minY);
    const graphCenterX = (minX + maxX) / 2;
    const graphCenterY = (minY + maxY) / 2;
    const padding = 40;
    const scaleX = (width - padding * 2) / graphWidth;
    const scaleY = (height - padding * 2) / graphHeight;
    const fitScale = Math.max(0.25, Math.min(1.1, Math.min(scaleX, scaleY)));
    const translateX = width / 2 - fitScale * graphCenterX;
    const translateY = height / 2 - fitScale * graphCenterY;
    g.attr("transform", `translate(${translateX}, ${translateY}) scale(${fitScale})`);

    // Edges
    const link = g.append("g")
      .selectAll<SVGLineElement, MiniGraphEdge>("line")
      .data(links)
      .enter()
      .append("line")
      .style("stroke", "#E0E0E0")
      .style("stroke-width", "0.8px");

    // Node groups
    const nodeGroup = g.append("g")
      .selectAll<SVGGElement, MiniGraphNode>("g")
      .data(nodes)
      .enter()
      .append("g");

    // Node circles
    nodeGroup.append("circle")
      .attr("r", (d) => getNodeRadius(d.degree))
      .attr("fill", (d) => areaColorMap[d.area] || "#4A4A4A");

    const ticked = () => {
      link
        .attr("x1", (d) => (d.source as MiniGraphNode).x!)
        .attr("y1", (d) => (d.source as MiniGraphNode).y!)
        .attr("x2", (d) => (d.target as MiniGraphNode).x!)
        .attr("y2", (d) => (d.target as MiniGraphNode).y!);
      nodeGroup.attr("transform", (d) => `translate(${d.x!}, ${d.y!})`);
    };

    ticked();
    simulation.on("tick", ticked);

    // Perpetual gentle drift — never fully stops
    simulation.alphaMin(0).alphaTarget(0.018).alpha(0.12).restart();

    return () => { simulation.stop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch actual blog files and wiki files to build dynamic content
  const allItems = Object.values(contentIndex);

  // Sort items by creation date for recent updates
  const sortedItems = [...allItems]
    .filter(item => item.created)
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5);

  // Load featured articles dynamically
  const featuredArticles = [
    {
      slug: "3d-gaussian-splatting",
      defaultTitle: "3D 가우시안 스플래팅의 실시간 렌더링 최적화",
      defaultDesc: "3D 장면 표현과 novel view synthesis의 핵심 흐름을 정리한 글.",
      defaultCategory: "Neural Rendering",
      defaultDate: "2026.06.13",
      defaultCover: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=800",
      type: "wiki"
    },
    {
      slug: "depth-based-hand-pose-estimation-리뷰",
      defaultTitle: "Depth-Based HPE - 표준 평가 체계 리뷰",
      defaultDesc: "깊이 영상 기반 손 자세 추정의 접근 방식과 한계를 정리한 리뷰.",
      defaultCategory: "Hand Pose",
      defaultDate: "2026.06.14",
      defaultCover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      type: "blog"
    },
    {
      slug: "nerf",
      defaultTitle: "NeRF: 신경 방사장 기반 신규 뷰 합성",
      defaultDesc: "신경 복사장 기반 3D 표현과 렌더링 과정을 정리한 개념 노트.",
      defaultCategory: "Neural Fields",
      defaultDate: "2026.06.13",
      defaultCover: "https://images.unsplash.com/photo-1509228468518-180dd482180c?auto=format&fit=crop&q=80&w=800",
      type: "wiki"
    }
  ].map((f) => {
    const item = contentIndex[f.slug];
    const targetUrl = f.type === "blog" ? `/blog/${f.slug}` : `/wiki/${f.slug}`;
    const coverImage = item?.cover || f.defaultCover;
    const title = item?.title ? item.title.split(" (")[0] : f.defaultTitle;
    const description = item?.description || f.defaultDesc;
    const category = item?.subcategory || item?.category || f.defaultCategory;
    const dateString = item?.created ? item.created.slice(0, 10).replace(/-/g, ".") : f.defaultDate;

    return {
      slug: f.slug,
      targetUrl,
      coverImage,
      title,
      description,
      category,
      date: dateString
    };
  });

  return (
    <div className="container-overview">
      {/* 1. HERO BANNER */}
      <section className="card-custom hero col-span-8 flex flex-col justify-between" style={{ height: "500px" }}>
        <div className="hero-header">
          <span className="tag-custom">Research Archive</span>
        </div>
        <div className="hero-content">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight" style={{ fontSize: "42px", fontWeight: 700 }}>
            공부하고, 구현하고,<br />연결합니다
          </h1>
          <p className="mt-6 text-sm text-zinc-500 max-w-sm" style={{ color: "var(--text-secondary)" }}>
            컴퓨터 비전, 3D 재구성, 신경 렌더링을 중심으로 공부한 내용과 구현 기록, 연구 아이디어를 정리하는 개인 아카이브입니다.
          </p>
        </div>
        <div className="hero-meta flex justify-between items-end">
          <div className="nav-links-container">
            <Link href="/wiki-map" className="active">Wiki</Link>
            <Link href="/blog">Articles</Link>
          </div>
          <span className="text-xs text-zinc-300 font-semibold" style={{ fontSize: "11px", color: "var(--text-faint)" }}>
            Notes · Projects · Wiki
          </span>
        </div>

        {/* Real D3 force-directed mini graph from graph-data.json */}
        <svg ref={heroGraphRef} className="graph-viz" style={{ position: "absolute", right: "10px", top: "30px", width: "400px", height: "380px", pointerEvents: "none", opacity: 0.5 }} />
      </section>

      {/* 2. STATUS CARD */}
      <section className="card-custom research-card col-span-4 flex flex-col justify-between" style={{ backgroundColor: "var(--dark-card-bg)", color: "white" }}>
        <div>
          <span className="tag-custom" style={{ backgroundColor: "var(--dark-tag-bg)", borderColor: "var(--dark-border)", color: "var(--dark-tag-text)" }}>Connected Notes</span>
          <h3 className="mt-20 text-2xl font-bold leading-tight" style={{ fontSize: "24px", marginTop: "100px" }}>
            연결된 노트<br />{allItems.length}개
          </h3>
          <p className="mt-3 text-sm opacity-60">
            개념 정리, 구현 기록, 연구 아이디어가 서로 이어지도록 정리하고 있습니다.
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="tag-custom" style={{ backgroundColor: "var(--dark-tag-bg)", borderColor: "var(--dark-border)", color: "var(--dark-tag-text)" }}>Knowledge Base</div>
          <Link href="/wiki-map" className="btn-icon-custom" style={{ backgroundColor: "var(--dark-btn-bg)", borderColor: "var(--dark-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1V11M1 6H11" stroke="white" strokeWidth="2"></path>
            </svg>
          </Link>
        </div>
      </section>

      {/* 3. FEATURED ARTICLES */}
      <div className="section-header col-span-12">
        <h2>Recent Writing</h2>
        <hr />
      </div>

      {featuredArticles.map((art) => (
        <article key={art.slug} className="writing-card col-span-4 flex flex-col justify-between" style={{ height: "420px" }}>
          <Link href={art.targetUrl} style={{ display: "block", flexGrow: 1, overflow: "hidden", borderRadius: "16px", marginBottom: "20px" }}>
            <div className="writing-thumb" style={{ width: "100%", height: "100%", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
              <img
                src={art.coverImage}
                alt={art.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)", transition: "all 0.5s ease" }}
                className="hover:filter-none hover:scale-105"
              />
            </div>
          </Link>
          <div className="writing-header flex justify-between items-center mb-3">
            <span className="tag-custom">{art.category}</span>
            <span className="mono" style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>{art.date}</span>
          </div>
          <Link href={art.targetUrl} style={{ textDecoration: "none", color: "inherit" }}>
            <h3 className="text-lg font-bold hover:text-accent">{art.title}</h3>
          </Link>
          <p className="text-xs text-zinc-500 mt-2" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {art.description}
          </p>
        </article>
      ))}

      {/* 4. KNOWLEDGE MAP DESC */}
      <div className="section-header col-span-12">
        <h2>Knowledge Map</h2>
        <hr />
      </div>

      <section className="card-custom wiki-desc col-span-7 flex flex-col justify-between" style={{ padding: "48px" }}>
        <div>
          <span className="tag-custom" style={{ marginBottom: "24px" }}>Connected Knowledge</span>
          <p className="text-xl font-medium text-zinc-700 mt-6" style={{ fontSize: "20px", fontWeight: 500, color: "var(--text-secondary)" }}>
            공부한 내용은 개별 글로 끝나지 않습니다. 개념 정리, 구현 기록, 연구 아이디어를 서로 연결해 다음 공부의 출발점으로 만듭니다.
          </p>
        </div>
        <div className="mt-10">
          <Link href="/wiki-map" className="nav-links-container text-center py-3 px-6 active" style={{ display: "inline-block", border: "none", fontWeight: 700, textDecoration: "none" }}>
            지식 그래프 열기
          </Link>
        </div>
      </section>

      {/* Interest Grid */}
      <div className="interest-grid col-span-5 grid grid-cols-2 gap-3">
        <div className="interest-item flex flex-col gap-2">
          <span className="tag-custom">Core</span>
          <span className="font-semibold text-sm">Neural Rendering</span>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>3DGS, NeRF, novel view synthesis</p>
        </div>
        <div className="interest-item flex flex-col gap-2">
          <span className="tag-custom">Math</span>
          <span className="font-semibold text-sm">Geometry</span>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Camera geometry, SfM, epipolar geometry</p>
        </div>
        <div className="interest-item flex flex-col gap-2">
          <span className="tag-custom">Dev</span>
          <span className="font-semibold text-sm">System Design</span>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>PyTorch, CUDA, experiment logs</p>
        </div>
        <div className="interest-item flex flex-col gap-2">
          <span className="tag-custom">Exp</span>
          <span className="font-semibold text-sm">Vision Theory</span>
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Concept notes, ideas, project logs</p>
        </div>
      </div>

      {/* 5. ACTIVITY LOG */}
      <div className="section-header col-span-12">
        <h2>Recently Updated</h2>
        <hr />
      </div>

      <section className="update-table-container col-span-12">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>NOTE</th>
              <th>TYPE</th>
              <th>UPDATED</th>
              <th>OPEN</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, index) => {
              const displayCategory = item.category
                ? item.category.toUpperCase()
                : item.type === "blog"
                  ? "BLOG"
                  : "WIKI";
              const dateString = item.created ? item.created.slice(0, 10).replace(/-/g, ".") : "2026.06.13";
              const targetUrl = item.type === "blog" ? `/blog/${item.slug}` : `/wiki/${item.slug}`;

              return (
                <tr key={item.slug} style={{ cursor: "pointer" }}>
                  <td className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    NOTE-{(100 + index).toString()}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    <Link href={targetUrl} style={{ textDecoration: "none", color: "inherit" }}>
                      {item.title}
                    </Link>
                  </td>
                  <td>
                    <span className="tag-custom">{displayCategory}</span>
                  </td>
                  <td className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {dateString}
                  </td>
                  <td>
                    <Link href={targetUrl} className="btn-icon-custom" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5H9M9 5L5 1M9 5L5 9" stroke="currentColor" strokeWidth="1.5"></path>
                      </svg>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
