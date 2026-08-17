import Link from "next/link";
import Image from "next/image";
import { getPosts, CATEGORIES, type Category } from "@/lib/posts";
import { format } from "date-fns";
import {
  Feather,
  BookOpen,
  ScrollText,
  NotebookPen,
  LayoutGrid,
} from "lucide-react";

const CATEGORY_ICON: Record<Category, any> = {
  poem: Feather,
  novel: BookOpen,
  essay: ScrollText,
  note: NotebookPen,
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const category = (params.category as Category | undefined) || undefined;

  const { posts, totalPages, total } = await getPosts(page, category);
  const [featured, ...rest] =
    page === 1 && !category ? posts : [undefined, ...posts];
  // Only show the big "featured" hero on page 1 with no filter — otherwise treat
  // every result as a normal list item so filtered/older pages read as a plain list.
  const listPosts = featured ? rest : posts;

  return (
    <div>
      {/* Category tabs */}
      <div className="flex items-center gap-1 mb-14 font-ui text-sm flex-wrap">
        <Link
          href="/"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border transition-colors ${
            !category
              ? "border-accent text-accent"
              : "border-rule text-ink-soft hover:border-accent"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.75} />
          All
        </Link>
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICON[c.value];
          return (
            <Link
              key={c.value}
              href={`/?category=${c.value}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border transition-colors ${
                category === c.value
                  ? "border-accent text-accent"
                  : "border-rule text-ink-soft hover:border-accent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
              {c.label}
            </Link>
          );
        })}
      </div>

      {total === 0 && (
        <p className="font-ui text-ink-soft">
          {category
            ? "Nothing in this category yet."
            : "No posts yet. Head to /admin to write your first one."}
        </p>
      )}

      {/* Featured / latest post */}
      {featured && (
        <Link href={`/blog/${featured.slug}`} className="group block mb-20">
          <div className="relative w-full h-72 sm:h-96 rounded-sm overflow-hidden bg-paper-shade flex items-center justify-center">
            {featured.coverImage ? (
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                priority
                className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            ) : (
              (() => {
                const Icon = CATEGORY_ICON[featured.category];
                return (
                  <Icon
                    className="w-10 h-10 text-ink-faint"
                    strokeWidth={1.25}
                  />
                );
              })()
            )}
          </div>
          <div className="mt-8">
            <div className="flex items-center gap-3 font-ui text-xs uppercase tracking-widest text-ink-faint mb-3.5">
              <span>
                {featured.publishedAt &&
                  format(new Date(featured.publishedAt), "MMM d, yyyy")}
              </span>
              <span className="ticket font-ui normal-case tracking-normal text-ink-soft">
                {featured.readingTime}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight group-hover:text-accent transition-colors">
              {featured.title}
            </h1>
            <p className="mt-3.5 text-ink-soft text-lg leading-relaxed max-w-xl">
              {featured.summary}
            </p>
          </div>
        </Link>
      )}

      {listPosts.length > 0 && (
        <>
          {featured && (
            <div className="flex items-center gap-4 mb-10">
              <span className="font-ui text-xs uppercase tracking-widest text-ink-faint font-medium">
                More Writing
              </span>
              <div className="flex-1 border-t border-dashed border-rule" />
            </div>
          )}

          <div className="divide-y divide-rule">
            {listPosts.map((post) => {
              const Icon = CATEGORY_ICON[post.category];
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex gap-6 items-start py-8 first:pt-0"
                >
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-sm overflow-hidden bg-paper-shade flex items-center justify-center">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Icon
                        className="w-6 h-6 text-ink-faint"
                        strokeWidth={1.25}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-ui text-xs uppercase tracking-widest text-ink-faint mb-2">
                      <Icon className="w-3 h-3" strokeWidth={1.75} />
                      <span>
                        {post.publishedAt &&
                          format(new Date(post.publishedAt), "MMM d, yyyy")}
                      </span>
                      <span>· {post.readingTime}</span>
                    </div>
                    <h2 className="font-display text-xl font-semibold leading-snug group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-ink-soft mt-2 line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-14 font-ui text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/?page=${p}${category ? `&category=${category}` : ""}`}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-colors ${
                p === page
                  ? "border-accent text-accent"
                  : "border-rule text-ink-soft hover:border-accent"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
