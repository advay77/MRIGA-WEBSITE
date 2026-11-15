"use client";

import Link from "next/link";
import { useEffect } from "react";

// Shown when the desk cannot load, most often because the database is unreachable.
export default function DeskError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("admin desk failed to load", error);
  }, [error]);

  return (
    <main className="gate theme-heritage">
      <section className="gate-card" role="alert">
        <span>Desk</span>
        <h1>Can&apos;t load right now</h1>
        <p>The desk could not reach the database. Customers can still browse the site. Check the database connection, then try again.</p>
        <div className="cta-row">
          <button type="button" className="btn btn-d" onClick={() => retry()}>Try again</button>
          <Link className="btn btn-g" href="/">View website</Link>
        </div>
      </section>
    </main>
  );
}
