"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Volume2, VolumeX, Sparkles } from "lucide-react";

export default function ViolinAmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element with sweet ambient violin track
    const audio = new Audio("/audio/sweet-violin-ambient.mp3");
    audio.loop = true;
    audio.volume = 0.22; // Gentle, sweet luxury background level
    audioRef.current = audio;

    // Check saved preference
    const savedMute = localStorage.getItem("ayor_violin_muted");
    if (savedMute === "true") {
      setIsMuted(true);
      audio.muted = true;
    }

    // Try starting on first user interaction (browser policy compliant)
    const handleFirstInteraction = () => {
      if (audioRef.current && !hasInteracted && savedMute !== "true") {
        setHasInteracted(true);
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setShowPrompt(false);
          })
          .catch(() => {
            // Browser blocked autoplay without explicit click on player
          });
      }
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("scroll", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [hasInteracted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem("ayor_violin_muted", "true");
    } else {
      audioRef.current.muted = false;
      setIsMuted(false);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setShowPrompt(false);
          localStorage.removeItem("ayor_violin_muted");
        })
        .catch((err) => console.log("Audio play error:", err));
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 select-none">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Mute sweet violin ambient music" : "Play sweet violin ambient music"}
        title={isPlaying ? "Mute sweet violin ambient music" : "Play sweet violin ambient music"}
        className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 ${
          isPlaying
            ? "bg-[#0E382B] text-white border-[#0E382B] hover:bg-[#144636]"
            : "bg-white/95 text-[#111111] border-[#DDD8D0] hover:border-[#0E382B]"
        }`}
      >
        {/* Violin / Note Icon & Animated Waves */}
        <div className="relative flex items-center justify-center w-5 h-5">
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-0.5 bg-[#C5A880] rounded-full animate-bounce h-3" style={{ animationDuration: "0.8s" }} />
              <span className="w-0.5 bg-white rounded-full animate-bounce h-2" style={{ animationDuration: "1.1s" }} />
              <span className="w-0.5 bg-[#C5A880] rounded-full animate-bounce h-3.5" style={{ animationDuration: "0.9s" }} />
              <span className="w-0.5 bg-white rounded-full animate-bounce h-1.5" style={{ animationDuration: "1.3s" }} />
            </div>
          ) : (
            <Music size={14} className="text-[#0E382B]" />
          )}
        </div>

        {/* Text Label */}
        <span className="text-[11px] font-serif tracking-wider uppercase font-medium">
          {isPlaying ? "Violin Ambient" : "Sweet Violin"}
        </span>

        {/* Volume Icon */}
        <div className="text-current opacity-80 group-hover:opacity-100 pl-0.5">
          {isPlaying ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </div>
      </button>
    </div>
  );
}

