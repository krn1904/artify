"use client"

import Image from "next/image"
import React from "react"

type Img = { src: string; alt?: string }

/**
 * Horizontally scrolling, CSS-only marquee that loops seamlessly.
 * - Two mirrored rows with different speeds for visual depth
 * - Pauses on hover; honors prefers-reduced-motion
 * - Edge fade via CSS mask for a softer look
 */
export function ArtMarquee({ images, className }: { images: Img[]; className?: string }) {
  // Duplicate the list so the translateX(-50%) loop appears seamless
  const track = [...images, ...images]
  return (
    <div className={`group relative overflow-hidden ${className ?? ""}`}>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      />

      {/* Row 1 */}
      <div
        className="flex w-[200%] gap-3 will-change-transform"
        style={{
          animation: "marquee 40s linear infinite",
          animationPlayState: "running",
        }}
      >
        {track.map((img, i) => (
          <Thumb key={`r1-${i}`} img={img} />
        ))}
      </div>

      {/* Row 2 (opposite direction, smaller thumbs) */}
      <div
        className="mt-3 flex w-[200%] gap-3 will-change-transform"
        style={{
          animation: "marquee-reverse 55s linear infinite",
          animationPlayState: "running",
        }}
      >
        {track.map((img, i) => (
          <Thumb key={`r2-${i}`} img={img} small />
        ))}
      </div>

      {/* Pause animation on hover and reduce motion if requested */}
      <style jsx>{`
        .group:hover > div[style*="animation"] { animation-play-state: paused !important; }
        @media (prefers-reduced-motion: reduce) {
          .group > div[style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

function Thumb({ img, small = false }: { img: Img; small?: boolean }) {
  const h = small ? 96 : 128 // px heights for rows
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-lg bg-muted/30 ring-1 ring-muted"
      style={{ width: h, height: h }}
    >
      {/* Using next/image keeps consistency with the rest of the app */}
      <Image
        src={img.src}
        alt={img.alt ?? "Artwork"}
        fill
        sizes="(max-width: 768px) 25vw, 160px"
        className="object-cover"
        priority={false}
      />
    </div>
  )
}
