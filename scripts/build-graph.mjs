import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import katex from 'katex';

// Recursively get files from directory
async function getFiles(dir) {
  try {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
      })
    );
    return files.flat();
  } catch (e) {
    return [];
  }
}

// Slugify helper supporting Korean and English characters
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\s\-\u3130-\u318F\uAC00-\uD7A3]/g, '')
    .replace(/\-\-+/g, '-');
}

// Extract category and subcategory from path
function getCategoryInfo(relPath) {
  const parts = relPath.split(path.sep); // e.g. ['wiki', 'courses', '블록체인', 'ECDSA-디지털서명.md']
  if (parts.length >= 3) {
    return {
      category: parts[1],
      subcategory: parts.length > 3 ? parts[2] : null,
    };
  }
  return { category: null, subcategory: null };
}

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif'];

function isImagePath(p) {
  return IMAGE_EXTENSIONS.some((ext) => p.toLowerCase().endsWith(ext));
}

// Resolve an image reference (from an Obsidian embed or markdown link) to a
// public URL. `assetMap` maps a lowercased basename → public path (e.g.
// "nerf_image.png" → "/blog/sources/NeRF_image.png"). Obsidian embeds usually
// reference an attachment by bare filename, so the basename lookup is what makes
// them resolve.
function resolveImagePath(ref, assetMap) {
  let p = ref.split('|')[0].trim(); // drop Obsidian "|size" suffix
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (assetMap) {
    const byBase = assetMap.get(path.basename(p).toLowerCase());
    if (byBase) return byBase;
  }
  return p.startsWith('/') ? p : '/' + p;
}

// Extract first image from content (used as the card cover)
function getFirstImage(content, assetMap) {
  // 1. Match Obsidian format: ![[raw/assets/image.png]]
  const obsMatch = content.match(/!\[\[([^\]]+)\]\]/);
  if (obsMatch) return resolveImagePath(obsMatch[1], assetMap);

  // 2. Match standard markdown format: ![alt](raw/assets/image.png)
  const mdMatch = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (mdMatch) return resolveImagePath(mdMatch[1], assetMap);

  return null;
}

// KaTeX rejects exotic Unicode whitespace that often sneaks in via copy-paste
// (line/paragraph separators, non-breaking & thin spaces, zero-width chars).
// Normalize them to a plain space (or nothing) so formulas parse.
function sanitizeMath(formula) {
  return formula
    // line/paragraph separators, NBSP, en/em/thin/hair/ideographic & figure spaces
    .replace(/[\u2028\u2029\u00A0\u2000-\u200A\u202F\u205F\u3000\u2007]/g, " ")
    // zero-width space/joiner/non-joiner, word joiner, BOM
    .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, "");
}

// Parse markdown with KaTeX equations and resolve Obsidian image embeds.
function renderMarkdown(mdContent, assetMap) {
  const placeholders = [];

  // Convert Obsidian embeds ![[file]] before anything else. Images become
  // <img> tags (marked passes raw HTML through); non-image embeds are dropped.
  let temp = mdContent.replace(/!\[\[([^\]]+)\]\]/g, (match, inner) => {
    const name = inner.split('|')[0].trim();
    if (!isImagePath(name)) return '';
    const src = resolveImagePath(inner, assetMap);
    const alt = path.basename(name.split('|')[0]);
    return `\n\n<img src="${src}" alt="${alt}" loading="lazy" />\n\n`;
  });

  // Extract display math: $$...$$
  temp = temp.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    try {
      const html = katex.renderToString(sanitizeMath(formula.trim()), { displayMode: true, throwOnError: false });
      const id = `@@MATH_DISP_${placeholders.length}@@`;
      placeholders.push({ id, html });
      return id;
    } catch (e) {
      return match;
    }
  });

  // Extract inline math: $...$
  temp = temp.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
    try {
      const html = katex.renderToString(sanitizeMath(formula.trim()), { displayMode: false, throwOnError: false });
      const id = `@@MATH_INL_${placeholders.length}@@`;
      placeholders.push({ id, html });
      return id;
    } catch (e) {
      return match;
    }
  });

  // Render Markdown to HTML using marked
  let htmlContent = marked.parse(temp);

  // Restore math HTML
  for (const placeholder of placeholders) {
    htmlContent = htmlContent.replace(placeholder.id, placeholder.html);
  }

  return htmlContent;
}

// Walk the content tree, copy every image into ./public at the same relative
// path, and return a map of lowercased basename → public URL so embeds that
// reference an attachment by bare filename (Obsidian style) can be resolved.
async function collectAndCopyAssets(contentRoot, publicRoot) {
  const assetMap = new Map();
  const allFiles = await getFiles(contentRoot);
  let copied = 0;
  for (const abs of allFiles) {
    if (!isImagePath(abs)) continue;
    const rel = path.relative(contentRoot, abs);
    const dest = path.join(publicRoot, rel);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.cp(abs, dest);
    const url = '/' + rel.split(path.sep).join('/');
    assetMap.set(path.basename(abs).toLowerCase(), url);
    copied++;
  }
  console.log(`Copied ${copied} image asset(s) into public/`);
  return assetMap;
}

// Fall back to the file's modification time (YYYY-MM-DD, local) when a note has
// no explicit created/date frontmatter.
async function fileDate(absPath) {
  try {
    const { mtime } = await fs.stat(absPath);
    const y = mtime.getFullYear();
    const m = String(mtime.getMonth() + 1).padStart(2, '0');
    const d = String(mtime.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return '';
  }
}

async function main() {
  const rootDir = process.cwd();
  // Content lives in-repo under ./content (populated by scripts/sync.mjs from the Obsidian vault).
  // This keeps the repo self-contained so CI (Vercel) can rebuild without access to the vault.
  const vaultDir = process.env.CONTENT_DIR || path.join(rootDir, 'content');
  console.log(`Starting graph & content build inside: ${rootDir}, Content root: ${vaultDir}`);

  // 0. Copy image assets into public/ and build a filename → URL map.
  const publicDir = path.join(rootDir, 'public');
  const assetMap = await collectAndCopyAssets(vaultDir, publicDir);

  // 1. Gather all wiki and blog files (public)
  const wikiDir = path.join(vaultDir, 'wiki');
  const blogDir = path.join(vaultDir, 'blog');

  const rawWikiFiles = await getFiles(wikiDir);
  const rawBlogFiles = await getFiles(blogDir);

  const publicFiles = [];
  
  // Helper to compile metadata
  const processPublicFile = async (absPath, type) => {
    const relPath = path.relative(vaultDir, absPath);
    const filename = path.basename(absPath, '.md');
    
    // Skip index files from being added as individual graph nodes
    if (filename.toLowerCase() === 'index') return;
    if (!absPath.endsWith('.md')) return;

    const fileContent = await fs.readFile(absPath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    let cleanContent = content;
    let paperLink = null;
    let paperId = null;

    // Check if the content starts with a paper link line.
    // Skip leading blank lines first (e.g. the blank line left after a
    // frontmatter block) so the paper link is still detected.
    const lines = content.split('\n');
    let firstIdx = 0;
    while (firstIdx < lines.length && lines[firstIdx].trim() === '') firstIdx++;
    const firstLine = lines[firstIdx] ? lines[firstIdx].trim() : '';
    const paperMatch = firstLine.match(/^(?:논문\s*주소|논문\u00A0주소|논문주소)\s*:\s*(?:\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s\n]+))/i);
    if (paperMatch) {
      paperLink = paperMatch[2] || paperMatch[3] || paperMatch[1];
      const arxivMatch = paperLink.match(/arxiv\.org\/abs\/([0-9.]+)/i);
      if (arxivMatch) {
        paperId = `arXiv:${arxivMatch[1]}`;
      } else {
        paperId = paperMatch[1] || 'Link';
      }
      // Drop the leading blank lines + the paper link line itself.
      lines.splice(0, firstIdx + 1);
      while (lines.length > 0 && lines[0].trim() === '') {
        lines.shift();
      }
      cleanContent = lines.join('\n');
    }

    const slug = slugify(filename);
    const { category, subcategory } = getCategoryInfo(relPath);

    publicFiles.push({
      filePath: relPath,
      name: filename,
      slug,
      type,
      title: frontmatter.title || filename,
      category,
      subcategory,
      frontmatter,
      content: cleanContent,
      cover: frontmatter.cover || getFirstImage(cleanContent, assetMap) || null,
      created: frontmatter.created || frontmatter.date || (await fileDate(absPath)),
      updated: frontmatter.updated || '',
      tags: frontmatter.tags || [],
      description: frontmatter.description || '',
      area: frontmatter.area || '',
      paperLink: frontmatter.paper_link || paperLink || null,
      paperId: frontmatter.paper_id || paperId || null,
    });
  };

  for (const f of rawWikiFiles) {
    await processPublicFile(f, 'wiki');
  }
  for (const f of rawBlogFiles) {
    await processPublicFile(f, 'blog');
  }

  // 2. Gather private files (note/** and raw/**, excluding raw/assets/**)
  const noteDir = path.join(vaultDir, 'note');
  const rawDir = path.join(vaultDir, 'raw');

  const rawNoteFiles = await getFiles(noteDir);
  const rawRawFiles = await getFiles(rawDir);

  const privateFiles = [];
  const processPrivateFile = (absPath, type) => {
    const relPath = path.relative(vaultDir, absPath);
    if (relPath.startsWith(path.join('raw', 'assets'))) return; // Exclude assets
    if (!absPath.endsWith('.md')) return;

    const filename = path.basename(absPath, '.md');
    privateFiles.push({
      filePath: relPath,
      name: filename,
      type,
    });
  };

  for (const f of rawNoteFiles) processPrivateFile(f, 'note');
  for (const f of rawRawFiles) processPrivateFile(f, 'raw');

  // Helper to resolve links
  const resolveTarget = (targetText) => {
    const cleanTarget = targetText.split('#')[0].trim(); // Remove headings
    if (!cleanTarget) return null;

    // Check exact path match in public
    let found = publicFiles.find(f => f.filePath === cleanTarget || f.filePath === cleanTarget + '.md');
    if (found) return { file: found, isPrivate: false };

    // Check name match in public
    const cleanName = path.basename(cleanTarget, '.md').toLowerCase();
    found = publicFiles.find(f => f.name.toLowerCase() === cleanName || f.title.toLowerCase() === cleanTarget.toLowerCase());
    if (found) return { file: found, isPrivate: false };

    // Check match in private files
    let privFound = privateFiles.find(f => f.filePath === cleanTarget || f.filePath === cleanTarget + '.md');
    if (privFound) return { file: privFound, isPrivate: true };

    const privCleanName = path.basename(cleanTarget, '.md').toLowerCase();
    privFound = privateFiles.find(f => f.name.toLowerCase() === privCleanName);
    if (privFound) return { file: privFound, isPrivate: true };

    return null;
  };

  // Metrics tracking
  let unresolvedLinks = 0;
  let privateLinksSkipped = 0;
  let assetEmbedsSkipped = 0;
  let noteLinksSkipped = 0;

  const assetExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.pdf', '.mp4', '.mov'];

  const nodes = [];
  const edges = [];

  // Parse links and build graph
  for (const file of publicFiles) {
    const cleanContent = file.content
      .replace(/!\[\[[^\]]+\]\]/g, '')   // Remove Obsidian embeds
      .replace(/!\[[^\]]*\]\([^)]+\)/g, ''); // Remove MD images

    const outgoing = new Set();

    // 1. Parse Obsidian Wikilinks [[target|text]]
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    let match;
    while ((match = wikiLinkRegex.exec(cleanContent)) !== null) {
      const target = match[1].trim();

      // Check if it's an asset
      if (assetExtensions.some(ext => target.toLowerCase().endsWith(ext))) {
        assetEmbedsSkipped++;
        continue;
      }

      // Check if it points to note/
      if (target.startsWith('note/')) {
        noteLinksSkipped++;
        continue;
      }

      const resolved = resolveTarget(target);
      if (resolved) {
        if (resolved.isPrivate) {
          privateLinksSkipped++;
        } else {
          outgoing.add(resolved.file.slug);
        }
      } else {
        unresolvedLinks++;
      }
    }

    // 2. Parse Markdown links [text](target)
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    while ((match = mdLinkRegex.exec(cleanContent)) !== null) {
      const target = match[2].trim();

      // Skip external links
      if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('mailto:')) {
        continue;
      }

      // Check if it's an asset
      if (assetExtensions.some(ext => target.toLowerCase().endsWith(ext))) {
        assetEmbedsSkipped++;
        continue;
      }

      // Check if it points to note/
      if (target.startsWith('note/') || target.startsWith('../note/')) {
        noteLinksSkipped++;
        continue;
      }

      const resolved = resolveTarget(target);
      if (resolved) {
        if (resolved.isPrivate) {
          privateLinksSkipped++;
        } else {
          outgoing.add(resolved.file.slug);
        }
      } else {
        unresolvedLinks++;
      }
    }

    file.outgoingSlugs = Array.from(outgoing);
  }

  // Pre-calculate degrees for nodes
  const nodeDegrees = {};
  publicFiles.forEach(f => {
    nodeDegrees[f.slug] = { inDegree: 0, outDegree: f.outgoingSlugs.length };
  });

  publicFiles.forEach(f => {
    f.outgoingSlugs.forEach(targetSlug => {
      if (nodeDegrees[targetSlug]) {
        nodeDegrees[targetSlug].inDegree++;
      }
    });
  });

  // Compile final graph data
  publicFiles.forEach(f => {
    const deg = nodeDegrees[f.slug];
    nodes.push({
      id: f.slug,
      title: f.title,
      slug: f.slug,
      url: `/${f.type}/${f.slug}`,
      type: f.type,
      tags: f.tags,
      area: f.area,
      created: f.created,
      updated: f.updated,
      description: f.description,
      degree: deg.inDegree + deg.outDegree,
      inDegree: deg.inDegree,
      outDegree: deg.outDegree,
    });

    f.outgoingSlugs.forEach(targetSlug => {
      const targetFile = publicFiles.find(pf => pf.slug === targetSlug);
      if (targetFile) {
        edges.push({
          source: f.slug,
          target: targetSlug,
          sourceType: f.type,
          targetType: targetFile.type,
        });
      }
    });
  });

  // Compile final content index
  const contentIndex = {};
  for (const f of publicFiles) {
    // Render Markdown to HTML with math typesetting
    const html = renderMarkdown(f.content, assetMap);

    // Compute Backlinks for this file
    const backlinks = publicFiles
      .filter(pf => pf.outgoingSlugs.includes(f.slug))
      .map(pf => ({
        slug: pf.slug,
        title: pf.title,
        type: pf.type,
        url: `/${pf.type}/${pf.slug}`,
      }));

    // Compute Outgoing link items
    const outgoingLinks = f.outgoingSlugs
      .map(slug => {
        const targetFile = publicFiles.find(pf => pf.slug === slug);
        return targetFile ? {
          slug,
          title: targetFile.title,
          type: targetFile.type,
          url: `/${targetFile.type}/${slug}`,
        } : null;
      })
      .filter(Boolean);

    contentIndex[f.slug] = {
      title: f.title,
      slug: f.slug,
      type: f.type,
      filePath: f.filePath,
      category: f.category,
      subcategory: f.subcategory,
      frontmatter: f.frontmatter,
      cover: f.cover,
      created: f.created,
      updated: f.updated,
      tags: f.tags,
      description: f.description,
      area: f.area,
      html,
      backlinks,
      outgoingLinks,
      paperLink: f.paperLink,
      paperId: f.paperId,
    };
  }

  // Create generated folder
  const genDir = path.join(rootDir, 'src', 'generated');
  await fs.mkdir(genDir, { recursive: true });

  // Save index files
  await fs.writeFile(path.join(genDir, 'graph-data.json'), JSON.stringify({ nodes, edges }, null, 2));
  await fs.writeFile(path.join(genDir, 'content-index.json'), JSON.stringify(contentIndex, null, 2));

  // Copy raw/assets to public/raw/assets
  const rawAssetsDir = path.join(vaultDir, 'raw', 'assets');
  const publicAssetsDir = path.join(rootDir, 'public', 'raw', 'assets');
  try {
    await fs.mkdir(path.dirname(publicAssetsDir), { recursive: true });
    await fs.cp(rawAssetsDir, publicAssetsDir, { recursive: true });
    console.log(`Copied raw/assets to public/raw/assets successfully`);
  } catch (err) {
    console.warn(`Warning: Could not copy raw/assets: ${err.message}`);
  }

  // Output stats summary to log
  console.log('\nGraph build summary:');
  console.log(`- wiki files: ${publicFiles.filter(f => f.type === 'wiki').length}`);
  console.log(`- blog files: ${publicFiles.filter(f => f.type === 'blog').length}`);
  console.log(`- nodes: ${nodes.length}`);
  console.log(`- edges: ${edges.length}`);
  console.log(`- unresolved links: ${unresolvedLinks}`);
  console.log(`- private links skipped: ${privateLinksSkipped}`);
  console.log(`- asset embeds skipped: ${assetEmbedsSkipped}`);
  console.log(`- note links skipped: ${noteLinksSkipped}\n`);
}

main().catch(console.error);
