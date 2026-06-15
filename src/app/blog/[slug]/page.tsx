import Link from "next/link";
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

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  Object.values(contentIndex)
    .filter((item) => item.type === "blog")
    .forEach((item) => {
      params.push({ slug: item.slug });
      const encoded = encodeURIComponent(item.slug);
      if (encoded !== item.slug) {
        params.push({ slug: encoded });
      }
    });
  return params;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetail({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const item = contentIndex[decodedSlug];

  if (!item) {
    return (
      <div className="container-custom">
        <Sidebar type="blog" />
        <main className="content-right">
          <div className="card-custom text-center py-20">
            <h1 className="text-2xl font-bold">포스트를 찾을 수 없습니다.</h1>
            <p className="mt-4 text-zinc-500">슬러그: {decodedSlug}</p>
            <Link href="/blog" className="mt-8 inline-block btn-icon-custom px-6 py-2 rounded-full bg-black text-white hover:bg-zinc-800">
              블로그 목록으로 돌아가기
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const dateString = item.created ? item.created.slice(0, 10).replace(/-/g, ".") : "2026.06.14";
  const displayCategory = item.subcategory || item.category || "AI";
  const paperLink = item.paperLink;
  const paperId = item.paperId;

  return (
    <div className="container-custom">
      {/* Blog Sidebar */}
      <Sidebar type="blog" />

      {/* Main Content Area */}
      <main className="content-right">
        <article className="card-custom article-card">
          {/* Header */}
          <header className="article-header flex flex-col gap-4 pb-8 mb-8 border-b border-zinc-200">
            <div className="article-meta flex items-center gap-4">
              <span className="tag-custom">{displayCategory}</span>
              <span className="mono" style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>
                {dateString}
              </span>
            </div>
            
            <h1 className="article-title text-3xl font-extrabold tracking-tight leading-tight" style={{ fontSize: "34px", fontWeight: 800 }}>
              {item.title}
            </h1>
            
            <div className="article-author-info flex items-center gap-3 mt-2">
              <div className="author-avatar" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent) 0%, #00B1A5 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "white" }}>
                J
              </div>
              <span className="author-name" style={{ fontSize: "13.5px", fontWeight: 600 }}>
                Reviewed by Jun Jeon
              </span>
            </div>

            {paperLink && (
              <a
                href={paperLink}
                className="paper-link-btn flex items-center gap-2 mt-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "1px" }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Paper: {paperId}
              </a>
            )}
          </header>

          {/* Article Body */}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: item.html }}
          />
        </article>
      </main>
    </div>
  );
}
