"use client";

import { BookOpen, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ReadingMode({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("reading-mode-active", enabled);

    return () => {
      document.body.classList.remove("reading-mode-active");
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEnabled(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);

  return (
    <>
      <button
        type="button"
        onClick={() => setEnabled((value) => !value)}
        aria-pressed={enabled}
        aria-label={enabled ? "Exit reading mode" : "Enter reading mode"}
        title={enabled ? "Exit reading mode (Esc)" : "Reading mode"}
        className="reading-mode-toggle fixed right-5 top-5 z-50 inline-flex items-center gap-2 rounded-sm border border-rule bg-paper/95 px-3 py-2 font-ui text-xs text-ink-soft shadow-sm backdrop-blur-sm transition-all hover:border-accent hover:text-accent"
      >
        {enabled ? (
          <X className="h-4 w-4" strokeWidth={1.75} />
        ) : (
          <BookOpen className="h-4 w-4" strokeWidth={1.75} />
        )}
        <span className="hidden sm:inline">
          {enabled ? "Exit reading mode" : "Reading mode"}
        </span>
      </button>

      {children}
    </>
  );
}
