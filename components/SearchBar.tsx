"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar({
  defaultValue = "",
  compact = false,
}: {
  defaultValue?: string;
  compact?: boolean; // compact = small icon-trigger version for the masthead
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(!compact);
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  };

  if (compact && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="p-2 rounded-sm border border-gold-foil/30 text-gold-foil hover:border-gold-foil transition-colors"
      >
        <Search className="w-4 h-4" strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`relative font-ui ${compact ? "w-56" : "max-w-md"}`}
    >
      <Search
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
          compact ? "text-gold-foil/70" : "text-ink-faint"
        }`}
        strokeWidth={1.75}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search essays, stories, poems..."
        autoFocus={compact}
        className={
          compact
            ? "w-full border border-gold-foil/30 rounded-sm pl-9 pr-9 py-2 text-sm bg-transparent text-gold-foil placeholder:text-gold-foil/40 focus:outline-none focus:border-gold-foil transition-colors"
            : "w-full border border-rule rounded-sm pl-9 pr-9 py-2.5 text-sm bg-transparent focus:outline-none focus:border-accent transition-colors"
        }
      />
      {compact && (
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setValue("");
          }}
          aria-label="Close search"
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="w-4 h-4 text-gold-foil/70 hover:text-gold-foil" />
        </button>
      )}
    </form>
  );
}
