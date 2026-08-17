import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_slug", slug)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: data });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { authorName, content } = await req.json();

  if (!authorName?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Missing name or content" }, { status: 400 });
  }

  // Simple length guard against spam/abuse
  if (content.length > 2000 || authorName.length > 80) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const { error } = await supabase.from("comments").insert({
    post_slug: slug,
    author_name: authorName.trim(),
    content: content.trim(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
