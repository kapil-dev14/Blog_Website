"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

// Generates (or reuses) a random anonymous id stored in the visitor's browser,
// so the same person can't like a post twice, without requiring login.
function getVisitorId(): string {
  const key = "blog_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function LikeButton({ slug }: { slug: string }) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/likes/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setCount(data.count);
        const visitorId = getVisitorId();
        setLiked(data.likedBy?.includes(visitorId));
      });
  }, [slug]);

  const handleLike = async () => {
    if (liked || loading) return;
    setLoading(true);
    const visitorId = getVisitorId();

    const res = await fetch(`/api/likes/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
    });

    if (res.ok) {
      setCount((c) => c + 1);
      setLiked(true);
      toast.success("Thanks for the like!");
    } else {
      toast.error("Something went wrong, try again.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleLike}
      disabled={liked || loading}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-sm border font-ui text-sm transition-colors",
        liked
          ? "bg-accent/5 border-accent text-accent"
          : "border-rule text-ink-soft hover:border-accent hover:text-accent"
      )}
    >
      <Heart
        className={clsx("w-4 h-4", liked && "fill-accent text-accent")}
        strokeWidth={1.75}
      />
      <span className="font-medium">{count}</span>
    </button>
  );
}
