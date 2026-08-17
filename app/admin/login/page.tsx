"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Feather } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Incorrect password");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="flex flex-col items-center text-center mb-8">
        <Feather className="w-8 h-8 text-accent mb-3" strokeWidth={1.5} />
        <h1 className="font-display text-2xl font-semibold">The Writer's Desk</h1>
        <p className="font-ui text-sm text-ink-faint mt-1">Enter your password to write.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-rule rounded-sm px-3 py-2.5 text-sm bg-transparent focus:outline-none focus:border-accent transition-colors font-ui"
        />
        {error && <p className="text-sm text-accent font-ui">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper px-4 py-2.5 rounded-sm text-sm hover:bg-accent transition-colors disabled:opacity-50 font-ui"
        >
          {loading ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
