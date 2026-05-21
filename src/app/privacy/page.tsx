import type { Metadata } from "next";
import { Bullet, LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy — Nuu",
  description:
    "What Nuu collects, what it doesn't, and how to ask for your data back.",
};

export default function PrivacyPage() {
  return (
    <LegalShell eyebrow="legal" title="Privacy" lastUpdated="2026-05-21">
      <h2>The short version</h2>
      <p>
        Nuu is currently a static website with no user accounts. We collect
        almost nothing about you. As we add accounts, presence, and a
        newsletter, this page will tell you exactly what changes and when.
      </p>

      <h2>What we collect today</h2>
      <ul>
        <Bullet>
          <strong>Anonymous usage analytics</strong> — aggregate page views via
          Vercel Analytics. We do not see your IP address, name, or anything
          that personally identifies you.
        </Bullet>
        <Bullet>
          <strong>Browser logs</strong> — your browser shares its user agent
          and referrer with our hosting provider (Vercel) for security and
          performance purposes.
        </Bullet>
      </ul>

      <h2>What we don&rsquo;t collect</h2>
      <ul>
        <Bullet>We don&rsquo;t use tracking or advertising cookies.</Bullet>
        <Bullet>We don&rsquo;t run third-party advertising scripts.</Bullet>
        <Bullet>
          We don&rsquo;t sell or share any data with third parties for
          marketing.
        </Bullet>
        <Bullet>We don&rsquo;t have a mailing list (yet).</Bullet>
      </ul>

      <h2>What&rsquo;s coming</h2>
      <p>
        As Nuu grows, we plan to add the following. When we ship each, this
        page will be updated and material changes will be announced in the Nuu
        Discord.
      </p>
      <ul>
        <Bullet>
          <strong>Sign-in via Discord.</strong> When you sign in, we receive
          your Discord username, avatar, and member ID. We use this only to
          display your member card and link to your public profile.
        </Bullet>
        <Bullet>
          <strong>Member profiles.</strong> What you choose to write in your
          profile (bio, links, sprite layers) is public to anyone who visits
          the site.
        </Bullet>
        <Bullet>
          <strong>Newsletter.</strong> Strictly opt-in, sent via Resend.
          Unsubscribe at any time using the link in any email.
        </Bullet>
      </ul>

      <h2>Your rights</h2>
      <p>Wherever you live, you have the right to:</p>
      <ul>
        <Bullet>Ask what data we hold about you.</Bullet>
        <Bullet>Ask us to correct or delete it.</Bullet>
        <Bullet>Object to processing.</Bullet>
        <Bullet>Receive a copy of your data in a portable format.</Bullet>
      </ul>
      <p>
        Send any request to{" "}
        <a href="mailto:hello@nuu.community">hello@nuu.community</a> and we
        will respond within 30 days.
      </p>

      <h2>Third parties</h2>
      <p>The services we rely on, and their privacy policies:</p>
      <ul>
        <Bullet>
          <strong>Vercel</strong> — hosting and analytics (
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            policy
          </a>
          ).
        </Bullet>
        <Bullet>
          <strong>Discord</strong> — community chat (
          <a
            href="https://discord.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            policy
          </a>
          ).
        </Bullet>
      </ul>

      <h2>Children</h2>
      <p>
        Nuu is not directed at children under the age of 13, and we do not
        knowingly collect data from anyone under 13. If you believe a child has
        provided us with information, contact us and we will remove it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy as Nuu evolves. When we do, we will change
        the &ldquo;last updated&rdquo; date at the top of this page. For
        material changes (new data collected, new third party introduced), we
        will also post an announcement in the Discord.
      </p>

      <h2>Contact</h2>
      <p>
        For anything privacy-related, email{" "}
        <a href="mailto:hello@nuu.community">hello@nuu.community</a>.
      </p>
    </LegalShell>
  );
}
