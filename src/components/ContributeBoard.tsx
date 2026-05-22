"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabaseUser } from "@/lib/supabase/use-user";
import { MarkdownArticle } from "./MarkdownArticle";
import {
  createContribution,
  updateContribution,
  submitContribution,
  deleteContribution,
  fetchMyContributions,
  fetchReviewQueue,
  publishContribution,
  rejectContribution,
  computeReadMinutes,
  TAG_OPTIONS,
  type MyContribution,
  type ReviewItem,
} from "@/lib/supabase/contributions";
import type { ContributionStatus } from "@/lib/supabase/types";

type FormState = {
  id: string | null;
  title: string;
  excerpt: string;
  tag: string;
  bodyMd: string;
};

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  excerpt: "",
  tag: TAG_OPTIONS[0],
  bodyMd: "",
};

export function ContributeBoard() {
  const { user, loading } = useSupabaseUser();
  const [mine, setMine] = useState<MyContribution[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = async () => {
    const view = await fetchMyContributions();
    setMine(view.contributions);
    setIsAdmin(view.isAdmin);
    if (view.isAdmin) setQueue(await fetchReviewQueue());
    setReady(true);
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setReady(true);
      return;
    }
    refresh();
  }, [user, loading]);

  if (loading || !ready) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="border border-border rounded-xl p-8 text-center">
        <p className="text-foreground mb-2 font-medium">Sign in to contribute</p>
        <p className="text-sm text-muted">
          Use the Sign in button in the top navigation, then come back here to
          write your article.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <Editor onSaved={refresh} />
      <MyContributions items={mine} onChanged={refresh} />
      {isAdmin && <ReviewQueue items={queue} onChanged={refresh} />}
    </div>
  );
}

function Editor({ onSaved }: { onSaved: () => Promise<void> }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Expose a loader so the contributions list can populate the editor.
  useEffect(() => {
    const onEdit = (e: Event) => {
      const c = (e as CustomEvent<MyContribution>).detail;
      setForm({
        id: c.id,
        title: c.title,
        excerpt: c.excerpt,
        tag: c.tag,
        bodyMd: c.bodyMd,
      });
      setTab("write");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("nuu:edit-contribution", onEdit);
    return () => window.removeEventListener("nuu:edit-contribution", onEdit);
  }, []);

  const reset = () => {
    setForm(EMPTY_FORM);
    setStatus("idle");
    setErrorMsg("");
  };

  const persist = async (): Promise<string | null> => {
    const input = {
      title: form.title,
      excerpt: form.excerpt,
      tag: form.tag,
      bodyMd: form.bodyMd,
    };
    if (form.id) {
      const r = await updateContribution(form.id, input);
      if (!r.ok) {
        setErrorMsg(r.reason);
        return null;
      }
      return form.id;
    }
    const r = await createContribution(input);
    if (!r.ok) {
      setErrorMsg(r.reason);
      return null;
    }
    setForm((f) => ({ ...f, id: r.id ?? null }));
    return r.id ?? null;
  };

  const onSaveDraft = async () => {
    if (!form.title.trim() || status === "saving") return;
    setStatus("saving");
    setErrorMsg("");
    const id = await persist();
    if (id) {
      setStatus("idle");
      await onSaved();
    } else {
      setStatus("error");
    }
  };

  const onSubmit = async () => {
    if (!form.title.trim() || status === "saving") return;
    setStatus("saving");
    setErrorMsg("");
    const id = await persist();
    if (!id) {
      setStatus("error");
      return;
    }
    const r = await submitContribution(id);
    if (r.ok) {
      reset();
      await onSaved();
    } else {
      setErrorMsg(r.reason);
      setStatus("error");
    }
  };

  const field =
    "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors";
  const label =
    "block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5";

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-[family-name:var(--font-pixel)] text-xl">
          {form.id ? "Edit draft" : "New article"}
        </h2>
        {form.id && (
          <button
            type="button"
            onClick={reset}
            className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground"
          >
            + Start new
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-4">
        <label>
          <span className={label}>Title</span>
          <input
            className={field}
            value={form.title}
            maxLength={140}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="A title for your piece"
          />
        </label>
        <label>
          <span className={label}>Tag</span>
          <select
            className={field}
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
          >
            {TAG_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span className={label}>Excerpt</span>
        <input
          className={field}
          value={form.excerpt}
          maxLength={200}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          placeholder="One line that sells the read"
        />
      </label>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className={label.replace("mb-1.5", "")}>Body (Markdown)</span>
          <div className="flex gap-1 font-mono text-[10px] uppercase tracking-widest">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`px-2 py-0.5 rounded ${
                tab === "write" ? "bg-foreground text-background" : "text-muted"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`px-2 py-0.5 rounded ${
                tab === "preview"
                  ? "bg-foreground text-background"
                  : "text-muted"
              }`}
            >
              Preview
            </button>
          </div>
        </div>
        {tab === "write" ? (
          <textarea
            className={`${field} min-h-[320px] resize-y font-mono`}
            value={form.bodyMd}
            onChange={(e) => setForm({ ...form, bodyMd: e.target.value })}
            placeholder={"## A heading\n\nWrite in Markdown — **bold**, _italic_, lists, > quotes, and [links](https://example.com)."}
          />
        ) : (
          <div className="border border-border rounded-lg p-5 min-h-[320px]">
            {form.bodyMd.trim() ? (
              <MarkdownArticle body={form.bodyMd} />
            ) : (
              <p className="text-sm text-muted">Nothing to preview yet.</p>
            )}
          </div>
        )}
        <p className="mt-1.5 font-mono text-[10px] text-muted">
          ~{computeReadMinutes(form.bodyMd)} min read
        </p>
      </div>

      {status === "error" && (
        <p className="text-xs text-[#c5302c]">{errorMsg}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={status === "saving" || !form.title.trim()}
          className="inline-flex items-center h-9 px-4 text-sm font-medium border border-border rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-strong transition-colors"
        >
          {status === "saving" ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={status === "saving" || !form.title.trim()}
          className="inline-flex items-center h-9 px-5 text-sm font-medium bg-foreground text-background rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-subtle transition-colors"
        >
          Submit for review
        </button>
      </div>
    </section>
  );
}

const STATUS_LABEL: Record<ContributionStatus, string> = {
  draft: "Draft",
  submitted: "In review",
  published: "Published",
  rejected: "Needs changes",
};

function MyContributions({
  items,
  onChanged,
}: {
  items: MyContribution[];
  onChanged: () => Promise<void>;
}) {
  if (items.length === 0) return null;

  const edit = (c: MyContribution) => {
    window.dispatchEvent(
      new CustomEvent("nuu:edit-contribution", { detail: c }),
    );
  };

  const onDelete = async (c: MyContribution) => {
    if (!confirm(`Delete “${c.title}”?`)) return;
    const r = await deleteContribution(c.id);
    if (r.ok) await onChanged();
    else alert(`Couldn’t delete: ${r.reason}`);
  };

  const onSubmit = async (c: MyContribution) => {
    const r = await submitContribution(c.id);
    if (r.ok) await onChanged();
    else alert(`Couldn’t submit: ${r.reason}`);
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-[family-name:var(--font-pixel)] text-xl">
        Your contributions
      </h2>
      <ul className="divide-y divide-border border-y border-border">
        {items.map((c) => (
          <li
            key={c.id}
            className="py-4 flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{c.title || "Untitled"}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted border border-border rounded-full px-2 py-0.5">
                  {STATUS_LABEL[c.status]}
                </span>
              </div>
              {c.excerpt && (
                <p className="text-sm text-muted leading-relaxed mt-1 line-clamp-2">
                  {c.excerpt}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0 font-mono text-[10px] uppercase tracking-widest">
              {c.status === "published" ? (
                <Link
                  href={`/library/${c.slug}`}
                  className="text-muted hover:text-foreground"
                >
                  View
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => edit(c)}
                    className="text-muted hover:text-foreground"
                  >
                    Edit
                  </button>
                  {(c.status === "draft" || c.status === "rejected") && (
                    <button
                      type="button"
                      onClick={() => onSubmit(c)}
                      className="text-muted hover:text-foreground"
                    >
                      Submit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(c)}
                    className="text-muted hover:text-[#c5302c]"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReviewQueue({
  items,
  onChanged,
}: {
  items: ReviewItem[];
  onChanged: () => Promise<void>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const onPublish = async (c: ReviewItem) => {
    const r = await publishContribution(c.id);
    if (r.ok) await onChanged();
    else alert(`Couldn’t publish: ${r.reason}`);
  };

  const onReject = async (c: ReviewItem) => {
    if (!confirm(`Send “${c.title}” back to the author for changes?`)) return;
    const r = await rejectContribution(c.id);
    if (r.ok) await onChanged();
    else alert(`Couldn’t reject: ${r.reason}`);
  };

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-[family-name:var(--font-pixel)] text-xl">
          Review queue
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {items.length} awaiting
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">Nothing to review right now.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((c) => (
            <li key={c.id} className="border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{c.title}</span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                      {c.tag} · {c.readMinutes} min
                    </span>
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
                    by{" "}
                    {c.authorSlug ? (
                      <Link
                        href={`/members/${c.authorSlug}`}
                        className="hover:text-foreground"
                      >
                        {c.authorName}
                      </Link>
                    ) : (
                      c.authorName
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(openId === c.id ? null : c.id)}
                  className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground"
                >
                  {openId === c.id ? "Hide" : "Read"}
                </button>
              </div>

              {openId === c.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <MarkdownArticle body={c.bodyMd} />
                </div>
              )}

              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onReject(c)}
                  className="inline-flex items-center h-8 px-4 text-xs font-medium border border-border rounded-full hover:border-border-strong transition-colors"
                >
                  Send back
                </button>
                <button
                  type="button"
                  onClick={() => onPublish(c)}
                  className="inline-flex items-center h-8 px-5 text-xs font-medium bg-foreground text-background rounded-full hover:bg-accent-subtle transition-colors"
                >
                  Publish
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
