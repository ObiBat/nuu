import type { Metadata } from "next";
import { Bullet, LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Code of Conduct — Nuu",
  description:
    "How we treat each other in the Nuu community — on the website, on Discord, and at events.",
};

export default function CodeOfConductPage() {
  return (
    <LegalShell
      eyebrow="community"
      title="Code of Conduct"
      lastUpdated="2026-05-21"
    >
      <h2>Our pledge</h2>
      <p>
        Nuu is a community of Mongolian builders, breakers, and shippers —
        people who care about the work and the people around them. We pledge to
        make participation in our community a respectful, harassment-free
        experience for everyone, regardless of age, body size, visible or
        invisible disability, ethnicity, sex characteristics, gender identity
        and expression, level of experience, education, socio-economic status,
        nationality, personal appearance, race, religion, or sexual identity
        and orientation.
      </p>

      <h2>Where this applies</h2>
      <p>
        This Code of Conduct applies to every Nuu space — the{" "}
        <a href="/">nuu.community website</a>, the Nuu Discord server, all Nuu
        events (online and in person), and any other space where someone is
        representing Nuu publicly.
      </p>

      <h2>Our standards</h2>
      <p>Behavior that builds the community looks like:</p>
      <ul>
        <Bullet>
          Welcoming and inclusive language — in Mongolian, English, or any
          other shared tongue.
        </Bullet>
        <Bullet>
          Respect for differing viewpoints and experiences. The diaspora is
          built from many paths; we honor each of them.
        </Bullet>
        <Bullet>Gracefully accepting constructive feedback.</Bullet>
        <Bullet>
          Focusing on what is best for the community and the people in it.
        </Bullet>
        <Bullet>Showing empathy toward fellow members.</Bullet>
      </ul>
      <p>Behavior that we will not tolerate looks like:</p>
      <ul>
        <Bullet>
          Sexualised language or imagery, and sexual attention or advances of
          any kind.
        </Bullet>
        <Bullet>
          Trolling, insulting or derogatory comments, and personal or political
          attacks.
        </Bullet>
        <Bullet>Public or private harassment.</Bullet>
        <Bullet>
          Publishing others&rsquo; private information — such as a physical or
          email address — without their explicit permission.
        </Bullet>
        <Bullet>
          Discrimination on the basis of ethnicity, including comments about
          being &ldquo;more&rdquo; or &ldquo;less&rdquo; Mongolian.
        </Bullet>
        <Bullet>
          Any other conduct which could reasonably be considered inappropriate
          in a professional setting.
        </Bullet>
      </ul>

      <h2>Enforcement responsibilities</h2>
      <p>
        Community admins are responsible for clarifying and enforcing our
        standards of acceptable behavior and will take appropriate and fair
        corrective action in response to any behavior that they deem
        inappropriate, threatening, offensive, or harmful.
      </p>
      <p>
        Admins have the right and responsibility to remove, edit, or reject
        contributions that are not aligned with this Code of Conduct, and will
        communicate reasons for moderation decisions when appropriate.
      </p>

      <h2>Reporting</h2>
      <p>
        If you experience or witness behavior that violates this Code of
        Conduct, please report it by emailing{" "}
        <a href="mailto:hello@nuu.community">hello@nuu.community</a>. All
        reports will be reviewed and investigated promptly and fairly. The
        community is obligated to respect the privacy and security of the
        reporter of any incident.
      </p>

      <h2>Enforcement guidelines</h2>
      <p>
        Admins will follow these guidelines in determining the consequences for
        any action they deem in violation of this Code of Conduct.
      </p>
      <ol>
        <li>
          <strong>Correction.</strong> A private, written warning, providing
          clarity around the nature of the violation and an explanation of why
          the behavior was inappropriate.
        </li>
        <li>
          <strong>Warning.</strong> A warning with consequences for continued
          behavior. No interaction with the people involved for a specified
          period of time. Violating these terms may lead to a temporary or
          permanent ban.
        </li>
        <li>
          <strong>Temporary ban.</strong> A temporary ban from any sort of
          interaction or public communication with the community for a
          specified period of time.
        </li>
        <li>
          <strong>Permanent ban.</strong> A permanent ban from any sort of
          public interaction within the community.
        </li>
      </ol>

      <h2>Attribution</h2>
      <p>
        This Code of Conduct is adapted from the{" "}
        <a
          href="https://www.contributor-covenant.org/version/2/1/code_of_conduct/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contributor Covenant
        </a>
        , version 2.1, with adjustments for the Nuu community context.
      </p>
    </LegalShell>
  );
}
