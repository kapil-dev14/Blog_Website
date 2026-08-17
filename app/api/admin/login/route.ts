import { NextRequest, NextResponse } from "next/server";
import { checkPassword, createSession } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: "Missing password" }, { status: 400 });
  }

  const ok = await checkPassword(password);
  if (!ok) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ success: true });
}
