"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { toast } from "sonner";
import clsx from "clsx";
import {
  Bold,
  Italic,
  Heading2,
  Quote,
  List,
  ListOrdered,
  ImagePlus,
  Link2,
  CornerDownLeft,
  Save,
  Loader2,
} from "lucide-react";
import { CATEGORIES, slugify, type Category } from "@/lib/posts";

export type PostEditorInitial = {
  id?: number;
  title: string;
  slug: string;
  summary: string;
  contentHtml: string;
  coverImage: string;
  author: string;
  category: Category;
  published: boolean;
};

const EMPTY: PostEditorInitial = {
  title: "",
  slug: "",
  summary: "",
  contentHtml: "",
  coverImage: "",
  author: "You",
  category: "essay",
  published: true,
};

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data.url as string;
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={clsx(
        "p-2 rounded-sm border transition-colors",
        active ? "border-accent text-accent bg-accent/5" : "border-transparent text-ink-soft hover:border-rule"
      )}
    >
      {children}
    </button>
  );
}

export default function PostEditor({ initial = EMPTY }: { initial?: PostEditorInitial }) {
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [summary, setSummary] = useState(initial.summary);
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [author, setAuthor] = useState(initial.author);
  const [category, setCategory] = useState<Category>(initial.category);
  const [published, setPublished] = useState(initial.published);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExt,
      LinkExt.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder:
          category === "poem"
            ? "Write your poem. Press Shift+Enter for a line break within a stanza..."
            : "Start writing...",
      }),
    ],
    content: initial.contentHtml || "<p></p>",
    immediatelyRender: false,
  });

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadImage(file);
      setCoverImage(url);
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't upload cover image");
    }
    setUploadingCover(false);
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't upload image");
    }
    if (contentImageInputRef.current) contentImageInputRef.current.value = "";
  };

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Link URL");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Give your post a title first.");
      return;
    }
    const contentHtml = editor?.getHTML() ?? "";
    if (!contentHtml || contentHtml === "<p></p>") {
      toast.error("Your post is empty.");
      return;
    }

    setSaving(true);
    const body = {
      title,
      slug,
      summary,
      contentHtml,
      coverImage,
      author,
      category,
      published,
    };

    const res = await fetch(initial.id ? `/api/admin/posts/${initial.id}` : "/api/admin/posts", {
      method: initial.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (res.ok) {
      toast.success(published ? "Post published!" : "Draft saved.");
      router.push("/admin");
      router.refresh();
    } else {
      toast.error(data.error ?? "Couldn't save post — the URL slug might already be taken.");
    }
  };

  return (
    <div>
      <div className="grid gap-5 mb-8">
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full font-display text-3xl font-semibold bg-transparent focus:outline-none placeholder:text-ink-faint"
        />

        <div className="flex items-center gap-2 font-ui text-sm text-ink-faint">
          <span>/blog/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className="bg-transparent focus:outline-none border-b border-dashed border-rule focus:border-accent flex-1"
          />
        </div>

        <textarea
          placeholder="One-line summary (shown on the homepage and link previews)"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          className="w-full font-ui text-sm border border-rule rounded-sm px-3 py-2.5 bg-transparent focus:outline-none focus:border-accent resize-none"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-ui text-xs uppercase tracking-widest text-ink-faint block mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full font-ui text-sm border border-rule rounded-sm px-3 py-2 bg-transparent focus:outline-none focus:border-accent"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-ui text-xs uppercase tracking-widest text-ink-faint block mb-1.5">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full font-ui text-sm border border-rule rounded-sm px-3 py-2 bg-transparent focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="font-ui text-xs uppercase tracking-widest text-ink-faint block mb-1.5">
            Cover image
          </label>
          <div className="flex items-center gap-3">
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="" className="w-16 h-16 object-cover rounded-sm border border-rule" />
            )}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="font-ui text-sm border border-rule rounded-sm px-3 py-2 text-ink-soft hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
            >
              {uploadingCover ? "Uploading..." : coverImage ? "Replace image" : "Upload image"}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      {editor && (
        <div className="flex items-center gap-1 border border-rule rounded-t-sm px-2 py-1.5 bg-paper-shade/40 flex-wrap">
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-4 h-4" strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-4 h-4" strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton
            label="Heading"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="w-4 h-4" strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="w-4 h-4" strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="w-4 h-4" strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="w-4 h-4" strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
            <Link2 className="w-4 h-4" strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton label="Insert image" onClick={() => contentImageInputRef.current?.click()}>
            <ImagePlus className="w-4 h-4" strokeWidth={1.75} />
          </ToolbarButton>
          <ToolbarButton
            label="Line break (great for poem stanzas — Shift+Enter also works)"
            onClick={() => editor.chain().focus().setHardBreak().run()}
          >
            <CornerDownLeft className="w-4 h-4" strokeWidth={1.75} />
          </ToolbarButton>
          <input
            ref={contentImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleContentImageUpload}
          />
        </div>
      )}

      <div
        className={clsx(
          "border border-t-0 border-rule rounded-b-sm px-4 py-4 min-h-[320px] prose-article cursor-text",
          category === "poem" && "text-center"
        )}
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-rule">
        <label className="flex items-center gap-2 font-ui text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published (uncheck to save as a private draft)
        </label>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-ink text-paper px-5 py-2.5 rounded-sm text-sm hover:bg-accent transition-colors disabled:opacity-50 font-ui"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={1.75} />}
          {saving ? "Saving..." : published ? "Publish" : "Save draft"}
        </button>
      </div>
    </div>
  );
}
