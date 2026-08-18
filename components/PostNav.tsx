import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PostMeta } from "@/lib/posts";

export default function PostNav({
  older,
  newer,
}: {
  older: PostMeta | null;
  newer: PostMeta | null;
}) {
  if (!older && !newer) return null;

  return (
    <div className="mt-12 grid grid-cols-2 gap-4 font-ui">
      {older ? (
        <Link
          href={`/blog/${older.slug}`}
          className="group flex flex-col gap-1.5 p-4 rounded-sm border border-rule hover:border-accent transition-colors"
        >
          <span className="flex items-center gap-1 text-xs uppercase tracking-widest text-ink-faint">
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            Previous Entry
          </span>
          <span className="font-display font-semibold group-hover:text-accent transition-colors line-clamp-2">
            {older.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {newer ? (
        <Link
          href={`/blog/${newer.slug}`}
          className="group flex flex-col gap-1.5 p-4 rounded-sm border border-rule hover:border-accent transition-colors text-right items-end"
        >
          <span className="flex items-center gap-1 text-xs uppercase tracking-widest text-ink-faint">
            Next Entry
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </span>
          <span className="font-display font-semibold group-hover:text-accent transition-colors line-clamp-2">
            {newer.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
