import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";
import { adminGetAllPosts, adminUpsertPost, slugify } from "@/lib/posts";

export async function GET(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const result = await adminGetAllPosts(page);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { title, summary, contentHtml, coverImage, author, category, published, slug } = body;

  if (!title?.trim() || !contentHtml?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const finalSlug = (slug?.trim() ? slugify(slug) : slugify(title)) || `post-${Date.now()}`;

  try {
    const post = await adminUpsertPost({
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
    // Most likely cause: slug already exists (unique constraint).
    return NextResponse.json({ error: err.message ?? "Failed to save post" }, { status: 500 });
  }
}
