import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";
import { Feather, Archive as ArchiveIcon, Rss } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "अक्षरहरू|The Unwritten Hour",
    template: "%s | My Blog",
  },
  description: "Thoughts, stories, and ideas — written by me.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col">
        {/* Book cover header — dark leather + gold foil, the one bold move */}
        <header className="book-cover border-b border-gold-foil/20">
          <div className="max-w-3xl mx-auto px-6 py-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Feather className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-display text-2xl font-semibold tracking-wide group-hover:opacity-80 transition-opacity">
                My Blog
              </span>
            </Link>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="flourish">❧</span>
              <span className="font-ui text-[0.7rem] uppercase tracking-[0.2em] opacity-70">
                Prose, Poems &amp; Chapters by{" "}
                <span className="foil font-medium">Kapil</span>
              </span>
              <span className="flourish">❧</span>
            </div>

            <div className="flex items-center justify-center gap-3 mt-5">
              <SearchBar compact />
              <Link
                href="/archive"
                aria-label="Archive"
                className="p-2 rounded-sm border border-gold-foil/30 text-gold-foil hover:border-gold-foil transition-colors"
              >
                <ArchiveIcon className="w-4 h-4" strokeWidth={1.75} />
              </Link>
              <Link
                href="/feed.xml"
                aria-label="RSS feed"
                className="p-2 rounded-sm border border-gold-foil/30 text-gold-foil hover:border-gold-foil transition-colors"
              >
                <Rss className="w-4 h-4" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
          {children}
        </main>

        {/* Inside-back-cover footer, echoing the header */}
        <footer className="book-cover mt-auto py-8 border-t border-gold-foil/20">
          <div className="max-w-3xl mx-auto px-6 flex items-center justify-center gap-3 font-ui text-xs opacity-70">
            <span>© {new Date().getFullYear()} My Blog</span>
            <span className="flourish">·</span>
            <span>Written with care.</span>
          </div>
        </footer>

        <Toaster
          richColors
          position="bottom-center"
          toastOptions={{
            style: {
              fontFamily: "Inter, sans-serif",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}
