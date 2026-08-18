import Link from "next/link";
import Image from "next/image";
import { searchPosts } from "@/lib/posts";
import { format } from "date-fns";
import { Search as SearchIcon } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { PAGE_SIZE } from "@/lib/posts";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const { posts, total, totalPages } = await searchPosts(q, page);

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-2xl font-semibold mb-4">Search</h1>
        <SearchBar defaultValue={q} />
      </div>

      {q.trim().length < 2 && (
        <p className="font-ui text-sm text-ink-faint">
          Type at least 2 characters to search.
        </p>
      )}

      {q.trim().length >= 2 && total === 0 && (
        <div className="flex flex-col items-center text-center py-16 font-ui">
          <SearchIcon
            className="w-8 h-8 text-ink-faint mb-3"
            strokeWidth={1.25}
          />
          <p className="text-ink-soft">No results for "{q}".</p>
        </div>
      )}

      {posts.length > 0 && (
        <>
          <p className="font-ui text-xs text-ink-faint mb-6 uppercase tracking-widest">
            {total} {total === 1 ? "result" : "results"} for "{q}"
          </p>

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
            basePath="/search"
            extraParams={{ q }}
          />
        </>
      )}
    </div>
  );
}
