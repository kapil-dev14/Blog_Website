import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function buildHref(
  basePath: string,
  page: number,
  extraParams?: Record<string, string>,
) {
  const params = new URLSearchParams(extraParams);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// Builds a page-number sequence with ellipses, e.g. 1 … 4 5 [6] 7 8 … 20
function getPageSequence(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const seq = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...seq]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) result.push("...");
    result.push(page);
  });
  return result;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  basePath = "/",
  extraParams,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  basePath?: string;
  extraParams?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  const sequence = getPageSequence(currentPage, totalPages);

  return (
    <div className="mt-16 pt-8 border-t border-rule font-ui">
      <p className="text-center text-xs text-ink-faint mb-5">
        Showing {from}–{to} of {totalItems}{" "}
        {totalItems === 1 ? "post" : "posts"}
      </p>

      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <Link
          href={buildHref(basePath, Math.max(1, currentPage - 1), extraParams)}
          aria-disabled={currentPage === 1}
          className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-colors ${
            currentPage === 1
              ? "border-rule text-ink-faint pointer-events-none opacity-40"
              : "border-rule text-ink-soft hover:border-accent hover:text-accent"
          }`}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
        </Link>

        {sequence.map((p, i) =>
          p === "..." ? (
            <span
              key={`dots-${i}`}
              className="w-8 h-8 flex items-center justify-center text-ink-faint text-sm"
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(basePath, p, extraParams)}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border text-sm transition-colors ${
                p === currentPage
                  ? "border-accent text-accent bg-accent/5"
                  : "border-rule text-ink-soft hover:border-accent hover:text-accent"
              }`}
            >
              {p}
            </Link>
          ),
        )}

        <Link
          href={buildHref(
            basePath,
            Math.min(totalPages, currentPage + 1),
            extraParams,
          )}
          aria-disabled={currentPage === totalPages}
          className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-colors ${
            currentPage === totalPages
              ? "border-rule text-ink-faint pointer-events-none opacity-40"
              : "border-rule text-ink-soft hover:border-accent hover:text-accent"
          }`}
        >
          <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}
