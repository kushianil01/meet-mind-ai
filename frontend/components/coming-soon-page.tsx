import Link from "next/link";

import {
  ArrowLeft,
  Clock3,
  Sparkles,
} from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description: string;
}

export function ComingSoonPage({
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <main className="coming-soon-page">
      <div className="coming-soon-glow" />

      <section className="coming-soon-card">
        <div className="coming-soon-icon">
          <Sparkles size={28} />
        </div>

        <span className="coming-soon-badge">
          <Clock3 size={14} />

          Coming soon
        </span>

        <h1>{title}</h1>

        <p>{description}</p>

        <Link
          href="/"
          className="coming-soon-home-button"
        >
          <ArrowLeft size={17} />

          Back to meetings
        </Link>
      </section>
    </main>
  );
}