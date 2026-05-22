import { createSupabaseBrowser } from "./client";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Result = { ok: true } | { ok: false; reason: string };

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

// Subscribe an email via a plain INSERT (anon has INSERT but not UPDATE, so an
// upsert would be rejected). A duplicate raises unique-violation 23505, which
// we treat as success — re-subscribing is idempotent and we never reveal
// whether the address was already on the list (no SELECT; emails stay private).
export async function subscribe(email: string): Promise<Result> {
  const value = email.trim().toLowerCase();
  if (!isValidEmail(value)) {
    return { ok: false, reason: "Enter a valid email address." };
  }
  const supabase = createSupabaseBrowser();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: value, source: "site" });
  if (error && error.code !== "23505") {
    return { ok: false, reason: error.message };
  }
  return { ok: true };
}
