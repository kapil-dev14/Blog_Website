import { NextResponse } from "next/server";
import { destroySession } from "@/lib/adminAuth";

export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true });
}
