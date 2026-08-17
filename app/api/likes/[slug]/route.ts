import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { data, error } = await supabase.from("likes").select("visitor_id").eq("post_slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    count: data.length,
    likedBy: data.map((row) => row.visitor_id),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { visitorId } = await req.json();

  if (!visitorId) {
    return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });
  }

  // unique constraint (post_slug, visitor_id) in the DB prevents duplicate likes
  const { error } = await supabase.from("likes").insert({ post_slug: slug, visitor_id: visitorId });

  if (error && error.code !== "23505") {
    // 23505 = unique violation, i.e. already liked — treat as success (idempotent)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
