"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";

type Comment = {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
};

export default function CommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadComments = () => {
    fetch(`/api/comments/${slug}`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments ?? []));
  };

  useEffect(() => {
    loadComments();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error("Please fill in your name and comment.");
      return;
    }

    setSubmitting(true);
    const res = await fetch(`/api/comments/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorName: name, content }),
    });

    if (res.ok) {
      toast.success("Comment posted!");
      setName("");
      setContent("");
      loadComments();
    } else {
      toast.error("Couldn't post your comment, try again.");
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-14">
      <h2 className="font-display text-xl font-semibold mb-6">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-10 font-ui">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-rule rounded-sm px-3 py-2.5 text-sm bg-transparent focus:outline-none focus:border-accent transition-colors"
        />
        <textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full border border-rule rounded-sm px-3 py-2.5 text-sm bg-transparent focus:outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 bg-ink text-paper px-4 py-2.5 rounded-sm text-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" strokeWidth={1.75} />
          Post Comment
        </button>
      </form>

      <div className="space-y-6 font-ui">
        {comments.map((c) => (
          <div key={c.id} className="border-b border-rule pb-5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{c.author_name}</span>
              <span className="text-xs text-ink-faint">
                {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-ink-soft mt-1.5 text-sm leading-relaxed">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-ink-faint">Be the first to comment.</p>
        )}
      </div>
    </section>
  );
}
