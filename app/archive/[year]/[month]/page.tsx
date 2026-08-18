import Link from "next/link";
import Image from "next/image";
import { getPostsByMonth, PAGE_SIZE } from "@/lib/posts";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Pagination from "@/components/Pagination";
import { notFound } from "next/navigation";

export default async function ArchiveMonthPage({
  params,
  searchParams,
}: {
  params: Promise<{ year: string; month: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { year: yearStr, month: monthStr } = await params;
  const { page: pageParam } = await searchParams;

  const year = Number(yearStr);
  const month = Number(monthStr) - 1; // URL is 1-indexed, JS Date is 0-indexed
  const page = Math.max(1, Number(pageParam ?? "1") || 1);

  if (Number.isNaN(year) || Number.isNaN(month) || month < 0 || month > 11)
    notFound();

  const { posts, total, totalPages } = await getPostsByMonth(year, month, page);
  const label = new Date(year, month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <Link
        href="/archive"
        className="inline-flex items-center gap-1.5 font-ui text-xs uppercase tracking-widest text-ink-faint hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
        Archive
      </Link>

      <h1 className="font-display text-2xl font-semibold mb-10">{label}</h1>

      {posts.length === 0 && (
        <p className="font-ui text-sm text-ink-faint">
          Nothing published this month.
        </p>
      )}

      <div className="divide-y divide-rule">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex gap-5 items-start py-7 first:pt-0"
          >
            <div className="relative w-20 h-20 flex-shrink-0 rounded-sm overflow-hidden bg-paper-shade">
              {post.coverImage && (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-ui text-xs uppercase tracking-widest text-ink-faint mb-1.5">
                {post.publishedAt &&
                  format(new Date(post.publishedAt), "MMM d, yyyy")}{" "}
                · {post.readingTime}
              </div>
              <h2 className="font-display text-lg font-semibold leading-snug group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <p className="text-ink-soft mt-1.5 line-clamp-2 leading-relaxed text-sm">
                {post.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={PAGE_SIZE}
        basePath={`/archive/${year}/${month + 1}`}
      />
    </div>
  );
}
