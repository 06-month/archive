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
    .filter((item) => item.type === "wiki")
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

export default async function WikiDetail({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const item = contentIndex[decodedSlug];

  if (!item) {
    return (
      <div className="container-custom">
        <Sidebar type="wiki" />
        <main className="content-right">
          <div className="card-custom text-center py-20">
            <h1 className="text-2xl font-bold">노트를 찾을 수 없습니다.</h1>
            <p className="mt-4 text-zinc-500">슬러그: {decodedSlug}</p>
            <Link href="/" className="mt-8 inline-block btn-icon-custom px-6 py-2 rounded-full bg-black text-white hover:bg-zinc-800">
              홈으로 돌아가기
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const createdDate = item.created ? item.created.slice(0, 10) : "";
  const sourcesList = item.frontmatter?.sources 
    ? (Array.isArray(item.frontmatter.sources) ? item.frontmatter.sources.join(", ") : item.frontmatter.sources)
    : "";

  // Helper function to resolve dynamic Obsidian wikilinks [[slug|text]] in rendered HTML
  // Note: the build-graph script doesn't convert wikilinks in html to actual <a> tags, 
  // it leaves them as [[PageName]] or similar in text, OR maybe it renders them differently?
  // Let's check how the markdown parser handles them. It parses them as normal text.
  // Wait, does build-graph convert wikilinks?
  // Let's check: in build-graph.mjs, the HTML renderer doesn't replace [[slug]] in output HTML!
  // Ah! It only parses them to build the graph nodes/edges!
  // So the HTML rendered inside `item.html` still contains strings like `[[SMPL]]` or `[[HaMeR]]`!
  // Let's check the HTML output for mano:
  // "[[SMPL]]과 <strong>같은 정식화</strong>... 이미지→<strong>MATH_INL_1</strong> 로 회귀하는..."
  // Yes! The HTML string still contains raw `[[SMPL]]` wikilink brackets!
  // Oh! We should write a parser/regex replacement function in our page component to turn 
  // `[[SlugName]]` or `[[SlugName|DisplayText]]` into actual Next.js Link components or HTML `<a>` tags!
  // This is a crucial detail! Without this, all Obsidian wikilinks on the page will just render as raw text `[[SMPL]]`!
  // Let's write a helper function to replace wikilinks in HTML with `<a>` tags pointing to the correct routes!
  
  const processHtmlWikiLinks = (html: string) => {
    // Replace [[PageName|DisplayText]] -> <a href="/wiki/slug" class="wiki-link">DisplayText</a>
    // Replace [[PageName]] -> <a href="/wiki/slug" class="wiki-link">PageName</a>
    let processed = html;
    
    // Regex for wikilinks: [[TargetName|DisplayText]]
    const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    
    processed = processed.replace(wikilinkRegex, (match, target, display) => {
      const targetText = target.trim();
      const displayText = display ? display.trim() : targetText;
      
      // Slugify to find if it exists in content-index
      const cleanTarget = targetText.split('#')[0].trim();
      const targetSlug = cleanTarget.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\s\-\u3130-\u318F\uAC00-\uD7A3]/g, '')
        .replace(/\-\-+/g, '-');
      
      const resolved = contentIndex[targetSlug];
      if (resolved) {
        const route = resolved.type === "blog" ? `/blog/${targetSlug}` : `/wiki/${targetSlug}`;
        return `<a href="${route}" class="wiki-link">${displayText}</a>`;
      }
      
      // Default fallback if not found in index
      return `<span style="color: var(--text-muted); border-bottom: 1px dashed var(--border);" title="Unresolved Link">${displayText}</span>`;
    });
    
    return processed;
  };

  const processedHtml = processHtmlWikiLinks(item.html);

  return (
    <div className="container-custom">
      {/* Wiki Sidebar */}
      <Sidebar type="wiki" />

      {/* Main Content Area */}
      <main className="content-right">
        <article className="card-custom wiki-card">
          {/* Metadata Frontmatter Header Box */}
          <div className="wiki-frontmatter">
            <div className="frontmatter-row">
              <span className="frontmatter-key">title</span>
              <span className="frontmatter-value">{item.title}</span>
            </div>
            <div className="frontmatter-row">
              <span className="frontmatter-key">area</span>
              <span className="frontmatter-value">{item.area || item.category || ""}</span>
            </div>
            {createdDate && (
              <div className="frontmatter-row">
                <span className="frontmatter-key">created</span>
                <span className="frontmatter-value">{createdDate}</span>
              </div>
            )}
            {sourcesList && (
              <div className="frontmatter-row">
                <span className="frontmatter-key">sources</span>
                <span className="frontmatter-value">{sourcesList}</span>
              </div>
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="frontmatter-row">
                <span className="frontmatter-key">tags</span>
                <div className="frontmatter-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="frontmatter-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="wiki-title">{item.title}</h1>

          {/* Wiki Body */}
          <div
            className="wiki-body"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />

          {/* Bidirectional Connections / Backlinks */}
          <div className="mt-16 pt-8 border-t border-zinc-100">
            <h3 className="text-sm font-bold tracking-wider text-zinc-400 uppercase mb-4" style={{ fontSize: "11px", letterSpacing: "0.1em", color: "var(--text-secondary)" }}>
              Backlinks (백링크)
            </h3>
            {item.backlinks && item.backlinks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {item.backlinks.map((link) => {
                  const route = link.type === "blog" ? `/blog/${link.slug}` : `/wiki/${link.slug}`;
                  return (
                    <Link
                      key={link.slug}
                      href={route}
                      className="backlink-pill"
                    >
                      {link.title.split(" (")[0]}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic" style={{ color: "var(--text-secondary)" }}>
                이 노트를 참조하는 백링크가 없습니다.
              </p>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
