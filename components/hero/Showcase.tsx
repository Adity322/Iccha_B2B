"use client";

import React, { useRef, useState } from 'react'
import {
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";


function Showcase() {
  const videoRef = useRef<HTMLVideoElement>(null);

const [isPlaying, setIsPlaying] = useState(true);
const [isMuted, setIsMuted] = useState(true);
    return (
<div className="relative min-h-[600px] sm:min-h-[680px] flex items-end overflow-hidden">
  {/* Background Video */}
  <video
    ref={videoRef}
    src="/showcase.mp4"
    autoPlay
    muted
    loop
    playsInline
    className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
  />

  {/* Cinematic overlays */}
  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/10" />
  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
  <div className="absolute inset-0 bg-black/10" />
  <div className="absolute inset-0 shadow-[inset_0_0_14vw_4vw_rgba(0,0,0,0.5)]" />

  {/* Content */}
  <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
    <div className="max-w-xl">
      <h2 className="reveal font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[0.98] mb-6">
        Stitched.
        <br />
        Inspected. Shipped.
      </h2>

      <p
        className="reveal text-[15px] text-white/70 leading-relaxed max-w-lg"
        style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
      >
        Watch how every kurti lot goes through 4-point fabric inspection,
        lock-stitch reinforcement, interlock seam overcasting, and pressing
        before packing.
      </p>

      <div
        className="reveal space-y-3 text-[15px] text-white border-t border-white/15 mt-6 pt-5"
        style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
      >
        <div className="flex items-start gap-2.5">
          <span className="w-1 h-1 rounded-full bg-white shrink-0 mt-2" />
          <span>
            Liva-certified heavy 14kg rayon and 60x60 cambric cotton
          </span>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="w-1 h-1 rounded-full bg-white/60 shrink-0 mt-2" />
          <span>
            Original zari weaving and pure organza cutwork embroidery
          </span>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="w-1 h-1 rounded-full bg-white/30 shrink-0 mt-2" />
          <span>
            Guaranteed colorfastness and zero shrinkage stitching allowance
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Video Controls */}
  <div className="absolute z-20 bottom-6 right-6 sm:bottom-8 sm:right-8 flex items-center gap-2">
    {/* Play / Pause */}
    <button
      type="button"
      onClick={() => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }

        setIsPlaying(!videoRef.current.paused);
      }}
      aria-label={isPlaying ? "Pause video" : "Play video"}
      className="
        w-11 h-11
        rounded-full
        border border-white/20
        bg-black/30
        backdrop-blur-md
        text-white
        flex items-center justify-center
        transition-all duration-300
        hover:bg-white
        hover:text-black
        hover:border-white
      "
    >
      {isPlaying ? (
        <Pause className="w-4 h-4 fill-current" />
      ) : (
        <Play className="w-4 h-4 fill-current translate-x-[1px]" />
      )}
    </button>

    {/* Mute / Unmute */}
    <button
      type="button"
      onClick={() => {
        if (!videoRef.current) return;

        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
      }}
      aria-label={isMuted ? "Unmute video" : "Mute video"}
      className="
        w-11 h-11
        rounded-full
        border border-white/20
        bg-black/30
        backdrop-blur-md
        text-white
        flex items-center justify-center
        transition-all duration-300
        hover:bg-white
        hover:text-black
        hover:border-white
      "
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  </div>
</div>
  )
}

export default Showcase