"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import graphDataRaw from "@/generated/graph-data.json";
import contentIndexRaw from "@/generated/content-index.json";

// Type declarations
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  slug: string;
  url: string;
  type: string;
  tags: string[];
  area: string;
  created: string;
  updated: string;
  description: string;
  degree: number;
  inDegree: number;
  outDegree: number;
}

interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  sourceType: string;
  targetType: string;
}

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
}

const graphData = graphDataRaw as { nodes: GraphNode[]; edges: GraphEdge[] };
const contentIndex = contentIndexRaw as Record<string, IndexItem>;

export default function WikiMap() {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Selected Node State
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedSlugRef = useRef<string | null>(null);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomScale, setZoomScale] = useState(100);

  // Get active node details from index
  const activeNodeDetails = useMemo(() => {
    if (!selectedSlug) return null;
    return contentIndex[selectedSlug] || null;
  }, [selectedSlug]);

  // Handle Search Suggestions list
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return graphData.nodes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [searchQuery]);

  // Main D3 force-directed simulation logic
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%");

    // Container for zooming/panning
    const g = svg.append("g");

    // Add zoom/pan behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomScale(Math.round(event.transform.k * 100));

        const k = event.transform.k;
        // Zoom-dependent label opacity:
        // k <= 1.1 -> opacity 0
        // k >= 1.8 -> opacity 0.8
        const targetOpacity = Math.max(0, Math.min(0.8, (k - 1.1) * 1.2));
        g.selectAll(".node-label").style("opacity", targetOpacity);
      });

    svg.call(zoomBehavior);

    // Deep copy nodes and edges for simulation stability
    const nodes: GraphNode[] = JSON.parse(JSON.stringify(graphData.nodes));
    const links: GraphEdge[] = JSON.parse(JSON.stringify(graphData.edges));

    // Scale factor based on total node count
    const nodeCountMultiplier = Math.max(0.65, Math.min(1.2, Math.sqrt(40 / nodes.length)));

    // Helper to calculate node radius based on connections degree (high contrast hub scaling)
    function getNodeRadius(degree: number) {
      if (degree <= 1) return 1.6 * nodeCountMultiplier;
      if (degree <= 2) return 2.4 * nodeCountMultiplier;
      return Math.min(2.8 + Math.sqrt(degree) * 1.2, 9.0) * nodeCountMultiplier;
    }

    // Force simulation setup
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphEdge>(links).id((d) => d.id).distance(120 * nodeCountMultiplier).strength(0.18))
      .force("charge", d3.forceManyBody<GraphNode>().strength((d) => d.degree === 0 ? -15 : -140 - d.degree * 30))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX<GraphNode>(width / 2).strength((d) => d.degree === 0 ? 0.20 : 0.02))
      .force("y", d3.forceY<GraphNode>(height / 2).strength((d) => d.degree === 0 ? 0.20 : 0.02))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => getNodeRadius(d.degree) + 12 * nodeCountMultiplier));

    // Pre-run simulation for near-final layout; remaining energy creates Obsidian-like settling
    for (let i = 0; i < 200; i++) {
      simulation.tick();
    }

    // Calculate bounding box of nodes to auto-scale and center the graph
    let minX = d3.min(nodes, (d) => d.x) || 0;
    let maxX = d3.max(nodes, (d) => d.x) || width;
    let minY = d3.min(nodes, (d) => d.y) || 0;
    let maxY = d3.max(nodes, (d) => d.y) || height;

    const graphWidth = Math.max(100, maxX - minX);
    const graphHeight = Math.max(100, maxY - minY);
    const graphCenterX = (minX + maxX) / 2;
    const graphCenterY = (minY + maxY) / 2;

    const padding = 70; // Padding around the graph bounds
    const scaleX = (width - padding * 2) / graphWidth;
    const scaleY = (height - padding * 2) / graphHeight;
    const initialScale = Math.max(0.25, Math.min(1.1, Math.min(scaleX, scaleY)));

    const translateX = width / 2 - initialScale * graphCenterX;
    const translateY = height / 2 - initialScale * graphCenterY;

    // Apply the computed fit-zoom transform
    const initialTransform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(initialScale);

    svg.call(zoomBehavior.transform, initialTransform);

    // Links layer
    const link = g.append("g")
      .attr("id", "edges-layer")
      .selectAll<SVGLineElement, GraphEdge>("line")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "edge")
      .style("stroke", "#E0E0E0")
      .style("stroke-width", "0.8px");

    // Nodes container layer
    const nodeGroup = g.append("g")
      .attr("id", "nodes-layer")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .style("cursor", "pointer");

    // Node circles
    const node = nodeGroup.append("circle")
      .attr("class", "node")
      .attr("r", (d) => getNodeRadius(d.degree))
      .attr("fill", "#4A4A4A");

    // Node labels
    const label = nodeGroup.append("text")
      .attr("class", "node-label")
      .attr("dx", (d) => getNodeRadius(d.degree) + 3)
      .attr("dy", 3)
      .text((d) => d.title.split(" (")[0])
      .style("font-size", `${7.5 * nodeCountMultiplier}px`)
      .style("font-weight", "500")
      .style("fill", "#1A1A1A")
      .style("opacity", Math.max(0, Math.min(0.8, (initialScale - 1.1) * 1.2))) // Set initial opacity based on scale (hidden at k <= 1.0)
      .style("pointer-events", "none");

    // Drag behavior functions
    const dragstarted = (event: any, d: GraphNode) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event: any, d: GraphNode) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (event: any, d: GraphNode) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    nodeGroup.call(
      d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    // Hover highlight neighbors logic
    nodeGroup.on("mouseenter", function (event, d) {
      const adjacentNodes = new Set<string>();
      adjacentNodes.add(d.id);

      links.forEach((l) => {
        const sourceId = typeof l.source === "object" ? (l.source as GraphNode).id : l.source;
        const targetId = typeof l.target === "object" ? (l.target as GraphNode).id : l.target;
        if (sourceId === d.id) adjacentNodes.add(targetId);
        if (targetId === d.id) adjacentNodes.add(sourceId);
      });

      // Dim non-neighbors
      nodeGroup.style("opacity", (n) => (adjacentNodes.has(n.id) ? 1 : 0.15));
      link.style("opacity", (l) => {
        const sourceId = typeof l.source === "object" ? (l.source as GraphNode).id : l.source;
        const targetId = typeof l.target === "object" ? (l.target as GraphNode).id : l.target;
        return sourceId === d.id || targetId === d.id ? 1 : 0.1;
      });

      // Highlight active hovered node
      d3.select(this).select("circle")
        .style("fill", "var(--accent)")
        .attr("r", getNodeRadius(d.degree) + 2);
      
      link.filter((l) => {
        const sourceId = typeof l.source === "object" ? (l.source as GraphNode).id : l.source;
        const targetId = typeof l.target === "object" ? (l.target as GraphNode).id : l.target;
        return sourceId === d.id || targetId === d.id;
      })
      .style("stroke", "var(--accent)")
      .style("stroke-width", "1.6px");
    });

    nodeGroup.on("mouseleave", function (event, d) {
      nodeGroup.style("opacity", 1);
      link.style("opacity", 1);
      
      d3.select(this).select("circle")
        .style("fill", d.slug === selectedSlugRef.current ? "var(--accent)" : "#4A4A4A")
        .attr("r", getNodeRadius(d.degree));

      link.style("stroke", "#E0E0E0").style("stroke-width", "0.8px");
    });

    // Click behavior
    nodeGroup.on("click", (event, d) => {
      setSelectedSlug(d.slug);
    });

    // Double click to navigate
    nodeGroup.on("dblclick", (event, d) => {
      router.push(`/wiki/${d.slug}`);
    });



    const ticked = () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      nodeGroup.attr("transform", (d) => `translate(${d.x!}, ${d.y!})`);
    };

    // Initialize visual elements to their pre-run stable positions immediately
    ticked();

    // Simulation tick callback
    simulation.on("tick", ticked);

    // Gentle sloshing on initial load (Obsidian-like settling animation)
    simulation.alpha(0.12).restart();

    return () => {
      simulation.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep selectedSlugRef in sync
  useEffect(() => {
    selectedSlugRef.current = selectedSlug;
  }, [selectedSlug]);

  // Highlight selected node without restarting simulation
  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll<SVGCircleElement, GraphNode>(".node")
      .style("fill", (n) => (n.slug === selectedSlug ? "var(--accent)" : "#4A4A4A"));
  }, [selectedSlug]);

  // Apply search query highlighting inside the graph
  useEffect(() => {
    if (!svgRef.current) return;

    const nodeGroups = d3.select(svgRef.current).selectAll(".node-group");
    const links = d3.select(svgRef.current).selectAll(".edge");

    if (!searchQuery.trim()) {
      nodeGroups.style("opacity", 1);
      links.style("opacity", 1);
      return;
    }

    const q = searchQuery.toLowerCase();
    const matchingNodeIds = new Set<string>();

    graphData.nodes.forEach((n) => {
      if (
        n.title.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        matchingNodeIds.add(n.id);
      }
    });

    nodeGroups.style("opacity", (n: any) => (matchingNodeIds.has(n.id) ? 1 : 0.15));
    links.style("opacity", (l: any) => {
      const sourceId = typeof l.source === "object" ? l.source.id : l.source;
      const targetId = typeof l.target === "object" ? l.target.id : l.target;
      return matchingNodeIds.has(sourceId) && matchingNodeIds.has(targetId) ? 1 : 0.05;
    });
  }, [searchQuery]);

  const handleSuggestionClick = (slug: string) => {
    setSelectedSlug(slug);
    setSearchQuery("");
  };

  const mappedZoomScale = zoomScale;

  return (
    <div className="container-custom-wide">
      <Navbar />
      {/* Dynamic Left Sidebar */}
      <Sidebar type="wiki" zoomScale={zoomScale} activeSlug={selectedSlug} />

      {/* Main interactive graph map */}
      <main className="card-custom graph-container">
        <svg ref={svgRef} id="knowledge-graph"></svg>
        <div style={{ position: "absolute", bottom: "24px", left: "24px", display: "flex", gap: "8px" }}>
          <div className="tag-custom" style={{ background: "white" }}>Zoom: {mappedZoomScale}%</div>
          <div className="tag-custom" style={{ background: "white" }}>Nodes: {graphData.nodes.length}</div>
        </div>
      </main>

      {/* Sidebar Right info panel */}
      <aside className="sidebar-right">
        {/* Search Panel */}
        <div className="card-custom" style={{ padding: "20px", overflow: "visible" }}>
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#888" strokeWidth="1.5"></circle>
              <path d="M11 11L14 14" stroke="#888" strokeWidth="1.5"></path>
            </svg>
            <input
              type="text"
              placeholder="Search concept or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchSuggestions.length > 0 && (
            <div className="suggest-list">
              <p style={{ fontSize: "11px", textTransform: "uppercase", color: "#BBB", margin: "10px 0 5px" }}>Suggested</p>
              {searchSuggestions.map((node) => (
                <div
                  key={node.id}
                  className="suggest-item"
                  onClick={() => handleSuggestionClick(node.slug)}
                >
                  {node.title.split(" (")[0]}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Node details Panel */}
        <div 
          className="card-custom flex flex-col justify-between" 
          style={{ 
            minHeight: "450px", 
            padding: "28px", 
            border: "1px solid var(--border)", 
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            background: "var(--surface)" 
          }}
        >
          {activeNodeDetails ? (
            <div className="flex flex-col h-full justify-between flex-grow">
              {/* Content Preview Area */}
              <div className="flex flex-col gap-5">
                {/* Category Pill */}
                <div>
                  <span 
                    className="tag-custom" 
                    style={{ 
                      textTransform: "uppercase", 
                      fontSize: "10px", 
                      fontWeight: 600, 
                      letterSpacing: "0.05em",
                      background: "#F4F4F5",
                      border: "none",
                      color: "#71717A",
                      padding: "4px 8px"
                    }}
                  >
                    {activeNodeDetails.area || activeNodeDetails.category || "General"}
                  </span>
                </div>

                {/* Title and Metadata */}
                <div className="flex flex-col gap-2.5">
                  <h4 
                    className="text-zinc-950 font-bold" 
                    style={{ 
                      fontSize: "18px", 
                      fontWeight: 700, 
                      lineHeight: "1.4",
                      color: "#18181B",
                      letterSpacing: "-0.02em"
                    }}
                  >
                    {activeNodeDetails.title.split(" (")[0]}
                  </h4>

                  {/* Metadata Row */}
                  <div className="flex flex-col gap-1 text-xs text-zinc-400 font-medium" style={{ color: "#8E8E93" }}>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold" style={{ minWidth: "65px" }}>Category:</span>
                      <span className="text-zinc-600" style={{ color: "#3F3F46" }}>
                        {activeNodeDetails.area || activeNodeDetails.category || "General"}
                      </span>
                    </div>
                    {activeNodeDetails.created && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold" style={{ minWidth: "65px" }}>Date:</span>
                        <span className="text-zinc-600" style={{ color: "#3F3F46" }}>
                          {activeNodeDetails.created.slice(0, 10)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Preview */}
                {activeNodeDetails.description && (
                  <p 
                    style={{ 
                      fontSize: "13px", 
                      lineHeight: "1.6", 
                      color: "#52525B",
                      margin: "0" 
                    }}
                  >
                    {activeNodeDetails.description}
                  </p>
                )}

                {/* Tags Section */}
                {activeNodeDetails.tags && activeNodeDetails.tags.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2">
                    <span 
                      className="font-bold tracking-wider text-zinc-400 uppercase" 
                      style={{ fontSize: "10px", color: "#A1A1AA", letterSpacing: "0.08em" }}
                    >
                      TAGS
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeNodeDetails.tags.slice(0, 6).map((tag) => (
                        <span 
                          key={tag} 
                          className="tag-custom" 
                          style={{ 
                            fontSize: "10px", 
                            padding: "3px 8px", 
                            background: "#FAFAFA", 
                            border: "1px solid #E4E4E7",
                            color: "#52525B",
                            borderRadius: "4px",
                            fontFamily: "var(--font-mono)"
                          }}
                        >
                          #{tag.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Backlinks Section */}
                <div className="flex flex-col gap-2 pt-2">
                  <span 
                    className="font-bold tracking-wider text-zinc-400 uppercase" 
                    style={{ fontSize: "10px", color: "#A1A1AA", letterSpacing: "0.08em" }}
                  >
                    BACKLINKS
                  </span>
                  {activeNodeDetails.backlinks && activeNodeDetails.backlinks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activeNodeDetails.backlinks.slice(0, 4).map((link) => {
                        const route = link.type === "blog" ? `/blog/${link.slug}` : `/wiki/${link.slug}`;
                        return (
                          <Link
                            key={link.slug}
                            href={route}
                            className="tag-custom hover:bg-zinc-50 hover:text-black transition"
                            style={{ 
                              fontSize: "10.5px", 
                              padding: "4px 8px", 
                              background: "#FFFFFF", 
                              border: "1px solid #E4E4E7",
                              color: "#27272A",
                              borderRadius: "4px"
                            }}
                          >
                            {link.title.split(" (")[0].toUpperCase()}
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <span style={{ fontSize: "11px", color: "#A1A1AA", fontStyle: "italic" }}>
                      No backlinks found
                    </span>
                  )}
                </div>
              </div>

              {/* Subtle Divider and CTA Button */}
              <div className="mt-8 pt-5 border-t border-zinc-100 flex flex-col gap-3" style={{ borderColor: "#F4F4F5" }}>
                <Link
                  href={`/wiki/${activeNodeDetails.slug}`}
                  className="flex items-center justify-center font-semibold text-sm transition-all duration-200"
                  style={{ 
                    textDecoration: "none",
                    height: "44px",
                    width: "100%",
                    borderRadius: "8px",
                    background: "#18181B",
                    color: "#FFFFFF",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#27272A";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#18181B";
                  }}
                >
                  Open Wiki
                </Link>
              </div>
            </div>
          ) : (
            <div
              id="node-info-empty"
              className="text-zinc-400 text-sm flex flex-col items-center justify-center flex-grow text-center py-20"
              style={{ height: "100%" }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D4D4D8"
                strokeWidth="1.5"
                style={{ marginBottom: "16px" }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v4M12 16h.01"></path>
              </svg>
              <span style={{ color: "#71717A", fontWeight: 500 }}>Select a node to view connections and metadata.</span>
              <span className="text-xs opacity-60 mt-2" style={{ color: "#A1A1AA" }}>Double click to open note page directly.</span>
            </div>
          )}
        </div>
      </aside>

      {/* Dynamic bottom updates log */}
      <div className="bottom-section col-span-3">
        <div className="section-header">
          <h2>Latest Wiki Updates</h2>
          <hr />
        </div>
        <div className="update-table-container">
          <table>
            <thead>
              <tr>
                <th>Concept Name</th>
                <th>Category</th>
                <th>Date Modified</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(contentIndex)
                .filter((item) => item.type === "wiki" && item.created)
                .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
                .slice(0, 4)
                .map((item) => {
                  const dateString = item.created ? item.created.slice(0, 10).replace(/-/g, ".") : "2026.06.13";
                  const displayCategory = item.subcategory || item.category || "concepts";
                  
                  return (
                    <tr
                      key={item.slug}
                      style={{ cursor: "pointer" }}
                      onClick={() => router.push(`/wiki/${item.slug}`)}
                    >
                      <td style={{ fontWeight: 600 }}>{item.title.split(" (")[0]}</td>
                      <td>
                        <span className="tag-custom">{displayCategory}</span>
                      </td>
                      <td className="mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {dateString}
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--accent)" }}>● Verified</span>
                      </td>
                      <td>
                        <button
                          className="btn-icon-custom"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/wiki/${item.slug}`);
                          }}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 5H9M9 5L5 1M9 5L5 9" stroke="black" stroke-width="1.5"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
