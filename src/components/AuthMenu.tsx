"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/supabase/use-user";

type Theme = "dark" | "light";

export function AuthMenu({ theme = "light" }: { theme?: Theme }) {
  const { user, loading } = useSupabaseUser();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (loading) {
    return (
      <span
        className={`hidden md:inline-block w-16 h-8 rounded-full ${
          theme === "dark" ? "bg-background/10" : "bg-border/40"
        }`}
        aria-hidden
      />
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex items-center h-8 px-4 text-sm font-medium rounded-full transition-colors ${
          user
            ? theme === "dark"
              ? "border border-background/30 text-background hover:border-background/60"
              : "border border-border text-foreground hover:border-border-strong"
            : theme === "dark"
              ? "bg-background text-foreground hover:bg-background/90"
              : "bg-foreground text-background hover:bg-accent-subtle"
        }`}
      >
        {user ? labelForUser(user.email) : "Sign in"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border-strong rounded-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] z-50 overflow-hidden">
          {user ? <SignedInPanel email={user.email} /> : <SignInForm />}
        </div>
      )}
    </div>
  );
}

function labelForUser(email: string | undefined) {
  if (!email) return "Account";
  const handle = email.split("@")[0];
  return handle.length > 14 ? `${handle.slice(0, 13)}…` : handle;
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");
    setErrorMsg("");
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  return (
    <form onSubmit={submit} className="p-5 space-y-4">
      <div>
        <p className="font-[family-name:var(--font-pixel)] text-base mb-1">
          Sign in
        </p>
        <p className="text-xs text-muted leading-relaxed">
          We&rsquo;ll email you a one-tap sign-in link. No password.
        </p>
      </div>

      {status === "sent" ? (
        <div className="rounded-lg border border-border bg-border/20 px-3 py-2.5 text-xs leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-1">
            check your inbox
          </span>
          We sent a link to <span className="font-medium">{email}</span>. Open
          it on this device to finish signing in.
        </div>
      ) : (
        <>
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
              Email
            </span>
            <input
              type="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors"
            />
          </label>

          {status === "error" && (
            <p className="text-xs text-[#c5302c]">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending" || !email}
            className="w-full inline-flex items-center justify-center h-10 px-4 text-sm font-medium bg-foreground text-background rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-subtle transition-colors"
          >
            {status === "sending" ? "Sending…" : "Send sign-in link"}
          </button>
        </>
      )}
    </form>
  );
}

function SignedInPanel({ email }: { email: string | undefined }) {
  return (
    <div className="p-5 space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
          signed in as
        </p>
        <p className="text-sm font-medium truncate">{email ?? "—"}</p>
      </div>
      <div className="flex gap-2">
        <a
          href="#customize"
          className="flex-1 inline-flex items-center justify-center h-9 px-3 text-xs font-medium border border-border rounded-full hover:border-border-strong transition-colors"
        >
          Edit profile
        </a>
        <form action="/auth/sign-out" method="post" className="flex-1">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center h-9 px-3 text-xs font-medium border border-border rounded-full text-muted hover:text-foreground hover:border-border-strong transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
