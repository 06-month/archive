"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

interface Node {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  label: string;
}

interface Edge {
  from: number;
  to: number;
}

export default function Home() {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Animation Nodes
  const [nodes, setNodes] = useState<Node[]>([
    { baseX: 100, baseY: 100, x: 100, y: 100, vx: 0, vy: 0, label: "NeRF" },
    { baseX: 200, baseY: 150, x: 200, y: 150, vx: 0, vy: 0, label: "3DGS" },
    { baseX: 150, baseY: 250, x: 150, y: 250, vx: 0, vy: 0, label: "Scaffold-GS" },
    { baseX: 300, baseY: 120, x: 300, y: 120, vx: 0, vy: 0, label: "COLMAP" },
    { baseX: 350, baseY: 200, x: 350, y: 200, vx: 0, vy: 0, label: "Mamba" },
    { baseX: 280, baseY: 300, x: 280, y: 300, vx: 0, vy: 0, label: "Hamba" }
  ]);

  const edges: Edge[] = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 3, to: 4 },
    { from: 2, to: 5 },
    { from: 4, to: 5 }
  ];

  // Animated Floating Effect in Hero SVG
  useEffect(() => {
    let animationId: number;
    const startTime = Date.now();
    const timeScale = 0.001;

    const centerX = 200;
    const centerY = 200;
    const repulsion = 300;
    const springLength = 90;
    const springK = 0.03;
    const gravity = 0.004;
    const friction = 0.92;

    const animate = () => {
      const time = (Date.now() - startTime) * timeScale;

      setNodes((prevNodes) => {
        const nextNodes = prevNodes.map((n, i) => {
          let vx = n.vx + Math.sin(time + i * 1.5) * 0.03;
          let vy = n.vy + Math.cos(time + i * 2.1) * 0.03;
          return { ...n, vx, vy };
        });

        // Apply forces
        for (let i = 0; i < nextNodes.length; i++) {
          const n = nextNodes[i];
          let fx = 0, fy = 0;

          // Repulsion
          for (let j = 0; j < nextNodes.length; j++) {
            if (i === j) continue;
            const o = nextNodes[j];
            const dx = n.x - o.x;
            const dy = n.y - o.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsion / (dist * dist);
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }

          // Spring forces
          edges.forEach((e) => {
            if (e.from === i || e.to === i) {
              const o = nextNodes[e.from === i ? e.to : e.from];
              const dx = o.x - n.x;
              const dy = o.y - n.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const force = (dist - springLength) * springK;
              fx += (dx / dist) * force;
              fy += (dy / dist) * force;
            }
          });

          // Gravity back to base center
          fx += (centerX - n.x) * gravity;
          fy += (centerY - n.y) * gravity;

          n.vx = (n.vx + fx) * friction;
          n.vy = (n.vy + fy) * friction;
          n.x += n.vx;
          n.y += n.vy;
        }

        return nextNodes;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Fetch actual blog files and wiki files to build dynamic content
  const allItems = Object.values(contentIndex);
  
  // Sort items by creation date for Activity Log
  const sortedItems = [...allItems]
    .filter(item => item.created)
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5);

  // Load featured articles dynamically
  const featuredArticles = [
    {
      slug: "3d-gaussian-splatting",
      defaultTitle: "3D 가우시안 스플래팅의 실시간 렌더링 최적화",
      defaultDesc: "전통적인 메시 구조를 넘어선 포인트 클라우드 기반의 혁신적인 래스터화 방식 연구.",
      defaultCategory: "Neural Rendering",
      defaultDate: "2026.06.13",
      defaultCover: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=800",
      type: "wiki"
    },
    {
      slug: "depth-based-hand-pose-estimation-리뷰",
      defaultTitle: "Depth-Based HPE - 표준 평가 체계 리뷰",
      defaultDesc: "HPE 분야 최초의 표준화된 평가 프레임워크와 In-the-Wild 데이터셋 분석.",
      defaultCategory: "Hand Pose",
      defaultDate: "2026.06.14",
      defaultCover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      type: "blog"
    },
    {
      slug: "nerf",
      defaultTitle: "NeRF: 신경 방사장 기반 신규 뷰 합성",
      defaultDesc: "정밀한 3D 표현을 위한 다층 퍼셉트론(MLP) 기반 볼륨 렌더링 최적화.",
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
      <Navbar />
      {/* 1. HERO BANNER */}
      <section className="card-custom hero col-span-8 flex flex-col justify-between" style={{ height: "500px" }}>
        <div className="hero-header">
          <span className="tag-custom">AI Research Nodes</span>
        </div>
        <div className="hero-content">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight" style={{ fontSize: "42px", fontWeight: 700 }}>
            시각적 지능과<br />신경 렌더링의 탐구
          </h1>
          <p className="mt-6 text-sm text-zinc-500 max-w-sm" style={{ color: "var(--text-secondary)" }}>
            이곳은 3D 가우시안 스플래팅부터 기하학적 딥러닝까지, 최신 AI 연구를 기록하는 개인 지식 저장소입니다.
          </p>
        </div>
        <div className="hero-meta flex justify-between items-end">
          <div className="nav-links-container" style={{ background: "#F0F0F0" }}>
            <Link href="/wiki-map" className="active">Explore Wiki</Link>
            <Link href="/blog">Read Blog</Link>
          </div>
          <span className="text-xs text-zinc-300 font-semibold" style={{ fontSize: "11px", color: "#BBB" }}>
            LAT: 37.5665 / LONG: 126.9780
          </span>
        </div>

        {/* Floating Animation SVG */}
        <svg ref={svgRef} className="graph-viz" viewBox="0 0 400 400" style={{ position: "absolute", right: "-50px", top: "50px", width: "450px", height: "400px", pointerEvents: "none" }}>
          {/* Edges */}
          {edges.map((e, index) => {
            const fromNode = nodes[e.from];
            const toNode = nodes[e.to];
            if (!fromNode || !toNode) return null;
            return (
              <line
                key={index}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                style={{ stroke: "#DDD", strokeWidth: 1 }}
              />
            );
          })}
          {/* Nodes */}
          {nodes.map((node, index) => (
            <g key={index}>
              <circle
                cx={node.x}
                cy={node.y}
                r={index === 1 || index === 5 ? 6 : index === 3 ? 5 : 4}
                style={{ fill: "#1A1A1A" }}
              />
              <text
                x={node.x + 10}
                y={node.y + 4}
                style={{ fontSize: "10px", fontWeight: 600, fill: "#888" }}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </section>

      {/* 2. STATUS CARD */}
      <section className="card-custom research-card col-span-4 flex flex-col justify-between" style={{ backgroundColor: "#1A1A1A", color: "white" }}>
        <div>
          <span className="tag-custom" style={{ backgroundColor: "#2A2A2A", borderColor: "#333", color: "#AAA" }}>Status</span>
          <h3 className="mt-20 text-2xl font-bold leading-tight" style={{ fontSize: "24px", marginTop: "100px" }}>
            연결된 지식노드<br />{allItems.length}개 분석완료
          </h3>
          <p className="mt-3 text-sm opacity-60">
            현재 3D Vision, Mamba, 블록체인 등 전공 및 연구 도메인의 핵심 개념들을 상호 인덱싱했습니다.
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="tag-custom" style={{ backgroundColor: "#2A2A2A", borderColor: "#333", color: "#AAA" }}>AI-TR-418</div>
          <Link href="/wiki-map" className="btn-icon-custom" style={{ backgroundColor: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1V11M1 6H11" stroke="white" strokeWidth="2"></path>
            </svg>
          </Link>
        </div>
      </section>

      {/* 3. FEATURED ARTICLES */}
      <div className="section-header col-span-12">
        <h2>Featured Articles</h2>
        <hr />
      </div>

      {featuredArticles.map((art) => (
        <article key={art.slug} className="writing-card col-span-4 flex flex-col justify-between" style={{ height: "420px" }}>
          <Link href={art.targetUrl} style={{ display: "block", flexGrow: 1, overflow: "hidden", borderRadius: "16px", marginBottom: "20px" }}>
            <div className="writing-thumb" style={{ width: "100%", height: "100%", border: "1px solid #EEE", position: "relative", overflow: "hidden" }}>
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
          <span className="tag-custom" style={{ marginBottom: "24px" }}>Connected Philosophy</span>
          <p className="text-xl font-medium text-zinc-700 mt-6" style={{ fontSize: "20px", fontWeight: 500, color: "#444" }}>
            모든 지식은 고립되어 있지 않습니다. 제 연구 노트는 각각의 논문과 개념이 그래프로 연결되어, 하나의 아이디어가 어떻게 다른 기술적 진보로 이어지는지 추적합니다.
          </p>
        </div>
        <div className="mt-10">
          <Link href="/wiki-map" className="nav-links-container text-center py-3 px-6 active" style={{ display: "inline-block", border: "none", fontWeight: 700, textDecoration: "none" }}>
            Open Knowledge Graph
          </Link>
        </div>
      </section>

      {/* Interest Grid */}
      <div className="interest-grid col-span-5 grid grid-cols-2 gap-3">
        <div className="interest-item flex flex-col gap-2 p-5 bg-white border border-zinc-200 rounded-2xl" style={{ borderRadius: "16px", border: "1px solid var(--border)", padding: "20px" }}>
          <span className="tag-custom">Core</span>
          <span className="font-semibold text-sm">Neural Rendering</span>
          <p style={{ fontSize: "11px", color: "#888" }}>Radiance Fields, Splatting, Hybrid Models</p>
        </div>
        <div className="interest-item flex flex-col gap-2 p-5 bg-white border border-zinc-200 rounded-2xl" style={{ borderRadius: "16px", border: "1px solid var(--border)", padding: "20px" }}>
          <span className="tag-custom">Math</span>
          <span className="font-semibold text-sm">Geometry</span>
          <p style={{ fontSize: "11px", color: "#888" }}>Projective Geometry, Epipolar, SFM</p>
        </div>
        <div className="interest-item flex flex-col gap-2 p-5 bg-white border border-zinc-200 rounded-2xl" style={{ borderRadius: "16px", border: "1px solid var(--border)", padding: "20px" }}>
          <span className="tag-custom">Dev</span>
          <span className="font-semibold text-sm">System Design</span>
          <p style={{ fontSize: "11px", color: "#888" }}>CUDA Kernels, PyTorch, C++ Optimization</p>
        </div>
        <div className="interest-item flex flex-col gap-2 p-5 bg-white border border-zinc-200 rounded-2xl" style={{ borderRadius: "16px", border: "1px solid var(--border)", padding: "20px" }}>
          <span className="tag-custom">Exp</span>
          <span className="font-semibold text-sm">Vision Theory</span>
          <p style={{ fontSize: "11px", color: "#888" }}>Perception, Optics, Human Vision Systems</p>
        </div>
      </div>

      {/* 5. ACTIVITY LOG */}
      <div className="section-header col-span-12">
        <h2>Activity Log</h2>
        <hr />
      </div>

      <section className="update-table-container col-span-12">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Last Modified</th>
              <th>Action</th>
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
                    #NT-{(100 + index).toString()}
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
                        <path d="M1 5H9M9 5L5 1M9 5L5 9" stroke="black" stroke-width="1.5"></path>
                      </svg>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <Footer />
    </div>
  );
}
