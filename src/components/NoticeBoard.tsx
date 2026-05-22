"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createPost,
  deletePost,
  fetchPostsBrowser,
  POST_MAX,
  type NoticeBoardView,
  type PostItem,
} from "@/lib/supabase/posts";

const EMPTY: NoticeBoardView = { posts: [], signedIn: false };

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
  });
}

export function NoticeBoard() {
  const [view, setView] = useState<NoticeBoardView>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = async () => setView(await fetchPostsBrowser());

  useEffect(() => {
    let active = true;
    fetchPostsBrowser()
      .then((next) => {
        if (active) setView(next);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="pt-6 border-t border-border space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-[family-name:var(--font-pixel)] text-lg">
          Notice board
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {view.posts.length} post{view.posts.length === 1 ? "" : "s"}
        </span>
      </div>

      {view.signedIn ? (
        <Composer onPosted={refresh} />
      ) : (
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Sign in to post to the board
        </p>
      )}

      {view.posts.length === 0 ? (
        <p className="text-sm text-muted">
          {loading ? "Loading…" : "No posts yet. Be the first to say something."}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {view.posts.map((p) => (
            <PostRow key={p.id} post={p} onDeleted={refresh} />
          ))}
        </ul>
      )}
    </section>
  );
}

function PostRow({
  post,
  onDeleted,
}: {
  post: PostItem;
  onDeleted: () => void;
}) {
  const onDelete = async () => {
    if (!confirm("Delete this post?")) return;
    const result = await deletePost(post.id);
    if (result.ok) onDeleted();
    else alert(`Couldn’t delete: ${result.reason}`);
  };

  return (
    <li className="py-3 flex flex-col gap-1">
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
        {post.body}
      </p>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
        {post.authorSlug ? (
          <Link
            href={`/members/${post.authorSlug}`}
            className="hover:text-foreground transition-colors"
          >
            {post.authorName}
          </Link>
        ) : (
          <span>{post.authorName}</span>
        )}
        <span aria-hidden>·</span>
        <span>{relativeTime(post.createdAt)}</span>
        {post.canDelete && (
          <>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={onDelete}
              className="hover:text-[#c5302c] transition-colors uppercase"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function Composer({ onPosted }: { onPosted: () => void }) {
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || status === "saving") return;
    setStatus("saving");
    setErrorMsg("");
    const result = await createPost(body);
    if (result.ok) {
      setBody("");
      setStatus("idle");
      onPosted();
    } else {
      setErrorMsg(result.reason);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={POST_MAX}
        rows={2}
        placeholder="Say something to the khural…"
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors resize-y min-h-[56px]"
      />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted">
          {body.length}/{POST_MAX}
        </span>
        <div className="flex items-center gap-3">
          {status === "error" && (
            <span className="text-xs text-[#c5302c]">{errorMsg}</span>
          )}
          <button
            type="submit"
            disabled={status === "saving" || !body.trim()}
            className="inline-flex items-center h-8 px-4 text-xs font-medium bg-foreground text-background rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-subtle transition-colors"
          >
            {status === "saving" ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </form>
  );
}
