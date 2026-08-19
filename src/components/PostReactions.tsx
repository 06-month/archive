"use client";

import { useEffect, useState } from "react";
import { sb, supabaseEnabled } from "@/lib/supabase";

interface Comment {
  id: number;
  nickname: string;
  body: string;
  created_at: string;
}

interface Stats {
  views: number;
  likes: number;
}

export default function PostReactions({ slug }: { slug: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [nickname, setNickname] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseEnabled) return;

    const q = encodeURIComponent(slug);
    // One view per tab session, not per render.
    const viewKey = `viewed:${slug}`;
    const firstView = !sessionStorage.getItem(viewKey);
    if (firstView) sessionStorage.setItem(viewKey, "1");
    setLiked(localStorage.getItem(`liked:${slug}`) === "1");

    (async () => {
      try {
        const row = firstView
          ? await sb<Stats>("rpc/increment_view", {
              method: "POST",
              body: JSON.stringify({ p_slug: slug }),
            })
          : (await sb<Stats[]>(`post_stats?slug=eq.${q}&select=views,likes`))[0];
        setStats(row ?? { views: 0, likes: 0 });

        setComments(
          await sb<Comment[]>(
            `comments?slug=eq.${q}&select=id,nickname,body,created_at&order=created_at.asc`
          )
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [slug]);

  async function toggleLike() {
    if (!stats) return;
    const delta = liked ? -1 : 1;

    // Optimistic: the counter is cosmetic, a failed request just gets rolled back.
    setLiked(!liked);
    setStats({ ...stats, likes: Math.max(stats.likes + delta, 0) });
    localStorage.setItem(`liked:${slug}`, liked ? "0" : "1");

    try {
      const likes = await sb<number>("rpc/bump_like", {
        method: "POST",
        body: JSON.stringify({ p_slug: slug, p_delta: delta }),
      });
      setStats((s) => (s ? { ...s, likes } : s));
    } catch {
      setLiked(liked);
      setStats(stats);
      localStorage.setItem(`liked:${slug}`, liked ? "1" : "0");
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (sending || !nickname.trim() || !body.trim()) return;

    setSending(true);
    setError(null);
    try {
      const [created] = await sb<Comment[]>("comments", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ slug, nickname: nickname.trim(), body: body.trim() }),
      });
      setComments((list) => [...(list ?? []), created]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  }

  if (!supabaseEnabled) return null;

  return (
    <section className="post-reactions">
      <div className="reaction-bar">
        <button
          type="button"
          onClick={toggleLike}
          disabled={!stats}
          aria-pressed={liked}
          aria-label={liked ? "공감 취소" : "공감하기"}
          className={`like-btn${liked ? " is-liked" : ""}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          <span>{stats?.likes ?? "–"}</span>
        </button>

        <span className="view-count" aria-label="조회수">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {stats?.views ?? "–"}
        </span>
      </div>

      <h2 className="comments-title">댓글 {comments?.length ?? 0}</h2>

      <ul className="comment-list">
        {comments?.map((c) => (
          <li key={c.id} className="comment-item">
            <div className="comment-head">
              <strong>{c.nickname}</strong>
              <time dateTime={c.created_at}>{c.created_at.slice(0, 10).replace(/-/g, ".")}</time>
            </div>
            <p className="comment-body">{c.body}</p>
          </li>
        ))}
        {comments?.length === 0 && <li className="comment-empty">첫 댓글을 남겨보세요.</li>}
      </ul>

      <form className="comment-form" onSubmit={submitComment}>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          maxLength={20}
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="댓글을 입력하세요"
          maxLength={1000}
          rows={3}
          required
        />
        <button type="submit" disabled={sending}>
          {sending ? "등록 중…" : "댓글 등록"}
        </button>
      </form>

      {error && <p className="comment-error">문제가 발생했습니다: {error}</p>}
    </section>
  );
}
