import Link from "next/link";
import { getArchiveGroups, CATEGORIES, type Category } from "@/lib/posts";
import { BookMarked, Feather } from "lucide-react";

export default async function ArchivePage() {
  const groups = await getArchiveGroups();

  const byYear = new Map<number, typeof groups>();
  for (const group of groups) {
    if (!byYear.has(group.year)) byYear.set(group.year, []);
    byYear.get(group.year)!.push(group);
  }

  const years = [...byYear.keys()].sort((a, b) => b - a);
  const totalPosts = groups.reduce((sum, group) => sum + group.count, 0);

  const categoryTotals = groups.reduce(
    (totals, group) => {
      for (const [category, count] of Object.entries(group.categories)) {
        const key = category as Category;
        totals[key] = (totals[key] ?? 0) + (count ?? 0);
      }
      return totals;
    },
    {} as Partial<Record<Category, number>>,
  );

  return (
    <div>
      <div className="mb-10 border-b border-rule pb-8">
        <div className="flex items-center gap-2 text-accent mb-3">
          <BookMarked className="w-5 h-5" strokeWidth={1.75} />
          <span className="font-ui text-[0.68rem] uppercase tracking-[0.2em]">
            The library
          </span>
        </div>
        <h1 className="font-display text-3xl font-semibold">Archive</h1>
        <p className="font-ui text-sm text-ink-soft mt-2 max-w-xl leading-relaxed">
          A record of the things written here — gathered by month, year, and
          kind.
        </p>
      </div>

      {years.length === 0 ? (
        <div className="paper-note py-12 text-center">
          <Feather
            className="mx-auto w-6 h-6 text-accent mb-3"
            strokeWidth={1.5}
          />
          <p className="font-ui text-sm text-ink-faint">
            Nothing has found its way into these pages yet.
          </p>
        </div>
      ) : (
        <>
          <div className="archive-summary mb-12">
            <div>
              <span className="archive-stat-number">{totalPosts}</span>
              <span className="archive-stat-label">
                {totalPosts === 1 ? "piece" : "pieces"}
              </span>
            </div>
            <div>
              <span className="archive-stat-number">{years.length}</span>
              <span className="archive-stat-label">
                {years.length === 1 ? "year" : "years"}
              </span>
            </div>
            <div className="archive-categories">
              {CATEGORIES.map((category) => {
                const count = categoryTotals[category.value] ?? 0;
                if (!count) return null;
                return (
                  <span key={category.value} className="archive-category">
                    {category.label} {count}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-12">
            {years.map((year) => {
              const yearGroups = [...byYear.get(year)!].sort(
                (a, b) => b.month - a.month,
              );
              const yearTotal = yearGroups.reduce(
                (sum, group) => sum + group.count,
                0,
              );

              return (
                <section key={year} aria-labelledby={`archive-${year}`}>
                  <div className="flex items-end justify-between gap-4 mb-4">
                    <div>
                      <h2
                        id={`archive-${year}`}
                        className="font-display text-2xl font-semibold"
                      >
                        {year}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {CATEGORIES.map((category) => {
                          const count = yearGroups.reduce(
                            (sum, group) =>
                              sum + (group.categories[category.value] ?? 0),
                            0,
                          );
                          if (!count) return null;
                          return (
                            <span
                              key={category.value}
                              className="font-ui text-[0.65rem] uppercase tracking-widest text-ink-faint"
                            >
                              {category.label} {count}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <span className="font-ui text-xs text-ink-faint whitespace-nowrap">
                      {yearTotal} {yearTotal === 1 ? "piece" : "pieces"}
                    </span>
                  </div>

                  <div className="archive-months">
                    {yearGroups.map((group) => (
                      <Link
                        key={`${group.year}-${group.month}`}
                        href={`/archive/${group.year}/${group.month + 1}`}
                        className="archive-month group"
                      >
                        <span className="archive-month-name">
                          {group.label.split(" ")[0]}
                        </span>
                        <span className="archive-month-line" />
                        <span className="archive-month-count">
                          {group.count} {group.count === 1 ? "piece" : "pieces"}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
