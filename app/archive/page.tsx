import Link from "next/link";
import { getArchiveGroups } from "@/lib/posts";
import { BookMarked } from "lucide-react";

export default async function ArchivePage() {
  const groups = await getArchiveGroups();

  // Group by year for a nicer nested display
  const byYear = new Map<number, typeof groups>();
  for (const g of groups) {
    if (!byYear.has(g.year)) byYear.set(g.year, []);
    byYear.get(g.year)!.push(g);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <div>
      <div className="flex items-center gap-2 mb-10">
        <BookMarked className="w-5 h-5 text-accent" strokeWidth={1.75} />
        <h1 className="font-display text-2xl font-semibold">Archive</h1>
      </div>

      {years.length === 0 && (
        <p className="font-ui text-sm text-ink-faint">Nothing published yet.</p>
      )}

      <div className="space-y-10">
        {years.map((year) => (
          <div key={year}>
            <h2 className="font-display text-lg font-semibold text-ink-soft mb-3">
              {year}
            </h2>
            <div className="space-y-1">
              {byYear
                .get(year)!
                .sort((a, b) => b.month - a.month)
                .map((g) => (
                  <Link
                    key={`${g.year}-${g.month}`}
                    href={`/archive/${g.year}/${g.month + 1}`}
                    className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-sm hover:bg-paper-shade transition-colors font-ui text-sm group"
                  >
                    <span className="text-ink-soft group-hover:text-accent transition-colors">
                      {g.label}
                    </span>
                    <span className="text-ink-faint">
                      {g.count} {g.count === 1 ? "post" : "posts"}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
