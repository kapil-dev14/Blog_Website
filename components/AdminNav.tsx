"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Feather, Plus, LogOut, ArrowLeft } from "lucide-react";

export default function AdminNav({ backHref }: { backHref?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between mb-10 pb-5 border-b border-rule">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link href={backHref} className="text-ink-soft hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          </Link>
        )}
        <Feather className="w-5 h-5 text-accent" strokeWidth={1.75} />
        <span className="font-display text-lg font-semibold">The Writer's Desk</span>
      </div>
      <div className="flex items-center gap-4 font-ui text-sm">
        <Link
          href="/admin/new"
          className="flex items-center gap-1.5 text-ink-soft hover:text-accent transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          New post
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-ink-soft hover:text-accent transition-colors"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          Log out
        </button>
      </div>
    </div>
  );
}
