"use client";

import { MessageCircle, Facebook, Twitter, Link2 } from "lucide-react";
import { toast } from "sonner";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      icon: MessageCircle,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: Twitter,
    },
  ];

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-ui text-xs uppercase tracking-widest text-ink-faint mr-1 hidden sm:inline">
        Share
      </span>
      {links.map(({ name, href, icon: Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${name}`}
          className="p-2 rounded-sm border border-rule text-ink-soft hover:border-accent hover:text-accent transition-colors"
        >
          <Icon className="w-4 h-4" strokeWidth={1.75} />
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="p-2 rounded-sm border border-rule text-ink-soft hover:border-accent hover:text-accent transition-colors"
      >
        <Link2 className="w-4 h-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
