"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("page failed to load", error);
  }, [error]);

  return (
    <main className="gate theme-heritage">
      <section className="gate-card" role="alert">
        <span>MRIGA</span>
        <h1>Something went wrong</h1>
        <p>This page could not load. Please try again in a moment.</p>
        <div className="cta-row">
          <button type="button" className="btn btn-d" onClick={() => retry()}>Try again</button>
          <Link className="btn btn-g" href="/">Home</Link>
        </div>
      </section>
    </main>
  );
}
