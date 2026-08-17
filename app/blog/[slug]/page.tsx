import { getAllSlugs, getPostBySlug, CATEGORIES } from "@/lib/posts";
import { format } from "date-fns";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Feather, BookOpen, ScrollText, NotebookPen } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

const CATEGORY_ICON: Record<string, any> = {
  poem: Feather,
  novel: BookOpen,
  essay: ScrollText,
  note: NotebookPen,
};

// Pre-render every published post at build time
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Dynamic <head> tags — THIS is what makes WhatsApp/Facebook show a nice preview card
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      url,
      images: [{ url: post.coverImage }],
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${siteUrl}/blog/${post.slug}`;
  const Icon = CATEGORY_ICON[post.category] ?? ScrollText;
  const categoryLabel =
    CATEGORIES.find((c) => c.value === post.category)?.label ?? "Essay";

  return (
    <article>
      <div className="flex items-center gap-3 font-ui text-xs uppercase tracking-widest text-ink-faint mb-6">
        <span className="flex items-center gap-1.5 text-accent">
          <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
          {categoryLabel}
        </span>
        <span>
          {post.publishedAt &&
            format(new Date(post.publishedAt), "MMM d, yyyy")}
        </span>
        <span className="ticket font-ui normal-case tracking-normal text-ink-soft">
          {post.readingTime}
        </span>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
        {post.title}
      </h1>
      <p className="font-ui text-sm text-ink-soft mt-3.5">By {post.author}</p>

      {post.coverImage && (
        <div className="relative w-full h-64 sm:h-80 rounded-sm overflow-hidden mt-8 mb-2 bg-paper-shade">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div
        className={`prose-article mt-10 ${post.category === "poem" ? "prose-article--poem" : ""}`}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <div className="mt-12 flex items-center justify-between border-y border-rule py-5">
        <LikeButton slug={post.slug} />
        <ShareButtons url={url} title={post.title} />
      </div>

      <CommentSection slug={post.slug} />
    </article>
  );
}
