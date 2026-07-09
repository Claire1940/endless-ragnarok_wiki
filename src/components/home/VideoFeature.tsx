"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
  poster?: string;
}

export function VideoFeature({
  videoId,
  title,
  poster = "/images/hero.webp",
}: VideoFeatureProps) {
  const [playing, setPlaying] = useState(false);

  const watchUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${videoId}`,
    [videoId],
  );

  const embedUrl = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0`,
    [videoId],
  );

  return (
    <div className="space-y-4">
      <div
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        {playing ? (
          <iframe
            className="absolute top-0 left-0 h-full w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            <Image
              src={poster}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 transition-colors group-hover:from-black/50" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] shadow-lg shadow-[hsl(var(--nav-theme))/0.5] ring-4 ring-white/20 transition-transform group-hover:scale-110 md:h-20 md:w-20">
                <Play className="h-7 w-7 translate-x-0.5 fill-white text-white md:h-9 md:w-9" />
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
