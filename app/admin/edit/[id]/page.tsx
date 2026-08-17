"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import PostEditor, { type PostEditorInitial } from "@/components/PostEditor";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<PostEditorInitial | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/posts/${id}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        const p = data.post;
        setInitial({
          id: p.id,
          title: p.title,
          slug: p.slug,
          summary: p.summary ?? "",
          contentHtml: p.content_html ?? "",
          coverImage: p.cover_image ?? "",
          author: p.author ?? "You",
          category: p.category ?? "essay",
          published: p.published ?? true,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div>
      <AdminNav backHref="/admin" />
      {notFound && <p className="font-ui text-sm text-ink-faint">Post not found.</p>}
      {!notFound && !initial && <p className="font-ui text-sm text-ink-faint">Loading...</p>}
      {initial && <PostEditor initial={initial} />}
    </div>
  );
}
