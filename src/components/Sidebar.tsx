"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import contentIndexRaw from "@/generated/content-index.json";

// Types for index content
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

const contentIndex = contentIndexRaw as Record<string, IndexItem>;

interface SidebarProps {
  type: "wiki" | "blog";
  zoomScale?: number;
  activeSlug?: string | null;
}

export default function Sidebar({ type, zoomScale, activeSlug }: SidebarProps) {
  const pathname = usePathname();
  
  // Display actual zoom percentage from D3
  const mappedPercent = zoomScale !== undefined ? zoomScale : 100;
  const barWidth = Math.min(100, Math.round((mappedPercent / 400) * 100));
  
  // Find current slug from pathname
  // e.g. "/wiki/mano" -> "mano"
  const currentSlug = pathname.split("/").pop() || "";
  const slugToUse = activeSlug || currentSlug;
  
  // Grouping items based on type
  const items = Object.values(contentIndex).filter((item) => item.type === type);

  // Posts authored in the current month (computed client-side to avoid a
  // build-time vs view-time month mismatch under static export)
  const [postsThisMonth, setPostsThisMonth] = useState<number | null>(null);
  useEffect(() => {
    const now = new Date();
    const nowYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setPostsThisMonth(items.filter((it) => (it.created || "").slice(0, 7) === nowYm).length);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Determine which sections should be expanded by default based on slugToUse
    const initialExpanded: Record<string, boolean> = {};
    
    if (type === "wiki") {
      // Wiki sections: concepts, research, courses, system
      const currentItem = Object.values(contentIndex).find(
        (item) => item.slug === slugToUse && item.type === "wiki"
      );
      
      // Only expand the category if the current note matches it, no default expanded sections
      if (currentItem && currentItem.category) {
        initialExpanded[currentItem.category] = true;
        if (currentItem.category === "courses" && currentItem.subcategory) {
          initialExpanded[`courses-${currentItem.subcategory}`] = true;
        }
      }
    } else {
      // Blog: keep every category expanded so the "AI / hand pose" subcategory
      // labels are always visible, but leave subcategories collapsed so the
      // posts under them only appear when a subcategory is clicked.
      items.forEach((item) => {
        initialExpanded[item.category || "AI"] = true;
      });
    }
    
    setExpandedSections(initialExpanded);
  }, [slugToUse, type]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Helper to check if a link is active
  const isActive = (slug: string) => slug === currentSlug;

  if (type === "wiki") {
    // Group wiki items
    const concepts = items.filter((item) => item.category === "concepts");
    const research = items.filter((item) => item.category === "research");
    const system = items.filter((item) => item.category === "system");
    
    // Group courses by subcategory
    const coursesGrouped: Record<string, IndexItem[]> = {};
    items
      .filter((item) => item.category === "courses")
      .forEach((item) => {
        const sub = item.subcategory || "기타";
        if (!coursesGrouped[sub]) {
          coursesGrouped[sub] = [];
        }
        coursesGrouped[sub].push(item);
      });

    return (
      <aside className="sidebar-left">
        {/* Concepts Accordion */}
        <div className="category-group">
          <div className="category-header" onClick={() => toggleSection("concepts")}>
            <h4>Concepts</h4>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              style={{ transform: expandedSections["concepts"] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            >
              <path d="M1 1L5 5L9 1" stroke="#888" strokeWidth="1.5"></path>
            </svg>
          </div>
          {expandedSections["concepts"] && (
            <div className="category-content">
              {concepts.map((item) => (
                <Link
                  key={item.slug}
                  href={`/wiki/${item.slug}`}
                  className={`concept-link ${isActive(item.slug) ? "active" : ""}`}
                >
                  <span className="dot-small"></span> {item.title.split(" (")[0]}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Research Accordion */}
        <div className="category-group">
          <div className="category-header" onClick={() => toggleSection("research")}>
            <h4>Research</h4>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              style={{ transform: expandedSections["research"] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            >
              <path d="M1 1L5 5L9 1" stroke="#888" strokeWidth="1.5"></path>
            </svg>
          </div>
          {expandedSections["research"] && (
            <div className="category-content">
              {research.map((item) => (
                <Link
                  key={item.slug}
                  href={`/wiki/${item.slug}`}
                  className={`concept-link ${isActive(item.slug) ? "active" : ""}`}
                >
                  <span className="dot-small"></span> {item.title.split(" (")[0]}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Courses Accordion */}
        <div className="category-group">
          <div className="category-header" onClick={() => toggleSection("courses")}>
            <h4>Courses</h4>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              style={{ transform: expandedSections["courses"] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            >
              <path d="M1 1L5 5L9 1" stroke="#888" strokeWidth="1.5"></path>
            </svg>
          </div>
          {expandedSections["courses"] && (
            <div className="category-content">
              {Object.entries(coursesGrouped).map(([subName, subItems]) => {
                const subKey = `courses-${subName}`;
                return (
                  <div key={subName} className="subcategory-group" style={{ width: "100%" }}>
                    <div
                      className="subcategory-header"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "4px 0",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(subKey);
                      }}
                    >
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
                        {subName}
                      </span>
                      <svg
                        width="8"
                        height="5"
                        viewBox="0 0 10 6"
                        fill="none"
                        style={{ transform: expandedSections[subKey] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                      >
                        <path d="M1 1L5 5L9 1" stroke="#888" strokeWidth="1.5"></path>
                      </svg>
                    </div>
                    {expandedSections[subKey] && (
                      <div
                        className="subcategory-content"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          marginLeft: "14px",
                          marginTop: "4px",
                          paddingBottom: "8px",
                        }}
                      >
                        {subItems.map((item) => (
                          <Link
                            key={item.slug}
                            href={`/wiki/${item.slug}`}
                            className={`concept-link ${isActive(item.slug) ? "active" : ""}`}
                          >
                            <span className="dot-small"></span> {item.title.split(" (")[0]}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System Accordion */}
        <div className="category-group">
          <div className="category-header" onClick={() => toggleSection("system")}>
            <h4>System</h4>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              style={{ transform: expandedSections["system"] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            >
              <path d="M1 1L5 5L9 1" stroke="#888" strokeWidth="1.5"></path>
            </svg>
          </div>
          {expandedSections["system"] && (
            <div className="category-content">
              {system.map((item) => (
                <Link
                  key={item.slug}
                  href={`/wiki/${item.slug}`}
                  className={`concept-link ${isActive(item.slug) ? "active" : ""}`}
                >
                  <span className="dot-small"></span> {item.title.split(" (")[0]}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Graph Scope Card */}
        <div className="dark-card" style={{ marginTop: "auto", padding: "20px" }}>
          <p style={{ fontSize: "12px", opacity: 0.6, marginBottom: "10px" }}>GRAPH SCOPE</p>
          <h3 style={{ fontSize: "24px", fontWeight: 700 }}>{mappedPercent}%</h3>
          <div style={{ height: "4px", background: "#333", borderRadius: "2px", marginTop: "12px" }}>
            <div style={{ width: `${barWidth}%`, height: "100%", backgroundColor: "var(--accent)", borderRadius: "2px" }}></div>
          </div>
        </div>
      </aside>
    );
  } else {
    // Group blog items by category & subcategory
    const blogCategories: Record<string, Record<string, IndexItem[]>> = {};
    items.forEach((item) => {
      const cat = item.category || "AI";
      const sub = item.subcategory || "Other";
      if (!blogCategories[cat]) {
        blogCategories[cat] = {};
      }
      if (!blogCategories[cat][sub]) {
        blogCategories[cat][sub] = [];
      }
      blogCategories[cat][sub].push(item);
    });

    return (
      <aside className="sidebar-left">
        {Object.entries(blogCategories).map(([catName, subGroups]) => {
          return (
            <div key={catName} className="category-group">
              <div className="category-header" onClick={() => toggleSection(catName)}>
                <h4>{catName}</h4>
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  style={{ transform: expandedSections[catName] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                >
                  <path d="M1 1L5 5L9 1" stroke="#888" strokeWidth="1.5"></path>
                </svg>
              </div>
              {expandedSections[catName] && (
                <div className="category-content">
                  {Object.entries(subGroups).map(([subName, subItems]) => {
                    const subKey = `${catName}-${subName}`;
                    return (
                      <div key={subName} className="subcategory-group" style={{ marginLeft: "8px", width: "100%" }}>
                        <div
                          className="subcategory-header"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "6px 0",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSection(subKey);
                          }}
                        >
                          <span style={{ fontSize: "13px", fontWeight: isActive(subItems[0]?.slug) ? 700 : 500, color: "var(--text)" }}>
                            {subName}
                          </span>
                          <svg
                            width="8"
                            height="5"
                            viewBox="0 0 10 6"
                            fill="none"
                            style={{ transform: expandedSections[subKey] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                          >
                            <path d="M1 1L5 5L9 1" stroke="#888" strokeWidth="1.5"></path>
                          </svg>
                        </div>
                        {expandedSections[subKey] && (
                          <div
                            className="subcategory-content"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              marginLeft: "14px",
                              marginTop: "4px",
                              paddingBottom: "8px",
                            }}
                          >
                            {subItems.map((item) => (
                              <Link
                                key={item.slug}
                                href={`/blog/${item.slug}`}
                                className={`concept-link ${isActive(item.slug) ? "active" : ""}`}
                              >
                                <span className="dot-small"></span> {item.title.split(" - ")[0]}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Recent Activity Card */}
        <div className="dark-card" style={{ marginTop: "auto", padding: "20px" }}>
          <p style={{ fontSize: "12px", opacity: 0.6, marginBottom: "10px" }}>RECENT ACTIVITY</p>
          <h3 style={{ fontSize: "24px", fontWeight: 700 }}>
            <span style={{ color: "var(--accent)" }}>{postsThisMonth ?? "—"}</span>{" "}
            {postsThisMonth === 1 ? "post" : "posts"}
          </h3>
          <p style={{ fontSize: "12px", opacity: 0.6, marginTop: "8px" }}>this month</p>
        </div>
      </aside>
    );
  }
}
