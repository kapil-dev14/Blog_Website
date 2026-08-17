import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";
import { adminGetPost, adminUpsertPost, adminDeletePost, slugify } from "@/lib/posts";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await params;
  const post = await adminGetPost(Number(id));
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { title, summary, contentHtml, coverImage, author, category, published, slug } = body;

  if (!title?.trim() || !contentHtml?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const finalSlug = slug?.trim() ? slugify(slug) : slugify(title);

  try {
    const post = await adminUpsertPost({
      id: Number(id),
      slug: finalSlug,
      title: title.trim(),
      summary: summary?.trim() ?? "",
      contentHtml,
      coverImage: coverImage?.trim() ?? "",
      author: author?.trim() ?? "You",
      category: category ?? "essay",
      published: published ?? true,
    });
    return NextResponse.json({ post });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to save post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await params;
  await adminDeletePost(Number(id));
  return NextResponse.json({ success: true });
}
