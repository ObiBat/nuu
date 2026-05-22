"use client";

import { useState } from "react";
import { isValidEmail, subscribe } from "@/lib/supabase/newsletter";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "saving") return;
    if (!isValidEmail(email)) {
      setErrorMsg("Enter a valid email address.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setErrorMsg("");
    const result = await subscribe(email);
    if (result.ok) {
      setEmail("");
      setStatus("done");
    } else {
      setErrorMsg(result.reason);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1">
          Newsletter
        </h4>
        <p className="text-sm text-foreground leading-relaxed">
          Occasional notes on the khural — new gatherings, library pieces, and
          what the diaspora is building.
        </p>
      </div>

      {status === "done" ? (
        <p className="text-sm text-foreground">
          You&rsquo;re on the list. Talk soon.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              aria-label="Email address for the newsletter"
              className="flex-1 min-w-0 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors"
            />
            <button
              type="submit"
              disabled={status === "saving" || !email.trim()}
              className="shrink-0 inline-flex items-center h-[38px] px-4 text-sm font-medium bg-foreground text-background rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-subtle transition-colors"
            >
              {status === "saving" ? "…" : "Subscribe"}
            </button>
          </div>
          {status === "error" && (
            <p className="text-xs text-[#c5302c]">{errorMsg}</p>
          )}
        </form>
      )}
    </div>
  );
}
