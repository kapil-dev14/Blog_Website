"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Feather, BookOpen, ScrollText, NotebookPen, Trash2, Pencil, EyeOff } from "lucide-react";
import { toast } from "sonner";
import AdminNav from "@/components/AdminNav";

const CATEGORY_ICON: Record<string, any> = {
  poem: Feather,
  novel: BookOpen,
  essay: ScrollText,
  note: NotebookPen,
};

type Row = {
  id: number;
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  published: boolean;
};

export default function AdminDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/posts?page=${page}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setRows(data.posts ?? []);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Post deleted");
      load();
    } else {
      toast.error("Couldn't delete post");
    }
  };

  return (
    <div>
      <AdminNav />

      {loading && <p className="font-ui text-sm text-ink-faint">Loading...</p>}

      {!loading && rows.length === 0 && (
        <p className="font-ui text-sm text-ink-faint">
          No posts yet.{" "}
          <Link href="/admin/new" className="text-accent underline">
            Write your first one
          </Link>
          .
        </p>
      )}

      <div className="divide-y divide-rule">
        {rows.map((post) => {
          const Icon = CATEGORY_ICON[post.category] ?? ScrollText;
          return (
            <div key={post.id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 text-ink-faint flex-shrink-0" strokeWidth={1.75} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold truncate">{post.title}</p>
                    {!post.published && (
                      <span className="flex items-center gap-1 text-xs font-ui text-ink-faint border border-rule rounded-sm px-1.5 py-0.5">
                        <EyeOff className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </div>
                  <p className="font-ui text-xs text-ink-faint mt-0.5">
                    {post.publishedAt && format(new Date(post.publishedAt), "MMM d, yyyy")} · /blog/{post.slug}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <Link
                  href={`/admin/edit/${post.id}`}
                  className="p-2 rounded-sm border border-rule text-ink-soft hover:border-accent hover:text-accent transition-colors"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" strokeWidth={1.75} />
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="p-2 rounded-sm border border-rule text-ink-soft hover:border-accent hover:text-accent transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 font-ui text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin?page=${p}`}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border ${
                p === page ? "border-accent text-accent" : "border-rule text-ink-soft hover:border-accent"
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
