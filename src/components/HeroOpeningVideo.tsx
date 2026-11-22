"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Quote,
} from "lucide-react";

interface HeroOpeningVideoProps {
  videoSrc?: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function HeroOpeningVideo({
  videoSrc = "/videos/opening-day.mp4",
}: HeroOpeningVideoProps) {
  const { locale, dir } = useLanguage();
  const isRTL = locale === "ar" || dir === "rtl";

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Toggle sound
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);

    // If unmuting and video was paused, resume play
    if (!newMuted && video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Handle video progress updates
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
  };

  // Seek when clicking or touching the progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressBarRef.current;
    if (!video || !bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clickX = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percent * duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Autoplay muted on mount (compliant with browser autoplay policies)
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[310px] sm:max-w-[340px] lg:max-w-[360px] mx-auto select-none group"
    >
      {/* ── Ambient Glow Background Blobs ── */}
      <div className="absolute -top-6 -start-6 w-48 h-48 bg-emerald-400/25 rounded-full blur-2xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute -bottom-8 -end-8 w-56 h-56 bg-teal-400/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ── Main Smartphone-Style Video Showcase Container ── */}
      <div className="relative rounded-[2.2rem] p-2.5 sm:p-3 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900 shadow-2xl shadow-emerald-950/20 border border-slate-700/60 backdrop-blur-md">
        
        {/* Inner Screen Bezel - Exact 9:16 Aspect Ratio matching native video */}
        <div className="relative rounded-[1.7rem] overflow-hidden bg-black aspect-[9/16] shadow-inner">
          
          {/* HTML5 Video Element with CSS Hardware Sharpness & Color Boost */}
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            loop
            muted={isMuted}
            preload="auto"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            style={{
              filter: "contrast(1.05) saturate(1.08) brightness(1.01)",
              imageRendering: "-webkit-optimize-contrast",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Top Floating Badge: #اليوم_الإفتتاحي */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{isRTL ? "#اليوم_الإفتتاحي" : "#Opening_Day"}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-mono font-bold border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>EduHub</span>
            </span>
          </div>

          {/* Center Play/Pause Overlay indicator when paused */}
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isRTL ? "تشغيل الفيديو" : "Play Video"}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 backdrop-blur-xs"
            >
              <Play className="w-6 h-6 fill-white ms-0.5" />
            </button>
          )}

          {/* Bottom Gradient for Controls Readability */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

          {/* Bottom Interactive Controls Panel */}
          <div className="absolute bottom-2.5 inset-x-3 z-20 space-y-1.5 pointer-events-auto">
            
            {/* Interactive Timeline Progress Bar (خط التقديم والترجيع) */}
            <div
              ref={progressBarRef}
              onClick={handleSeek}
              onTouchStart={handleSeek}
              onTouchMove={handleSeek}
              className="w-full py-1.5 cursor-pointer group/bar flex items-center"
              title={isRTL ? "اسحب أو اضغط للتقديم أو الترجيع" : "Click to seek"}
            >
              <div className="relative w-full h-1.5 group-hover/bar:h-2 rounded-full bg-white/25 backdrop-blur-md overflow-hidden transition-all">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 rounded-full transition-all duration-75 relative"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Bottom Controls Row: Play/Pause, Sound Toggle, and Time Counter */}
            <div className="flex items-center justify-between pt-0.5">
              
              {/* Left: Play / Pause */}
              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? (isRTL ? "إيقاف مؤقت" : "Pause") : (isRTL ? "تشغيل" : "Play")}
                className="w-8 h-8 rounded-full bg-black/70 hover:bg-emerald-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xs active:scale-90"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-white" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white ms-0.5" />
                )}
              </button>

              {/* Center: Prominent Sound Toggle (🔊 تشغيل الصوت / كتم) */}
              <button
                type="button"
                onClick={toggleMute}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-md ${
                  isMuted
                    ? "bg-emerald-600/95 hover:bg-emerald-500 text-white animate-pulse"
                    : "bg-black/75 hover:bg-black/90 text-emerald-300 border border-emerald-400/30"
                }`}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>{isRTL ? "تشغيل الصوت 🔊" : "Unmute 🔊"}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isRTL ? "كتم الصوت" : "Mute"}</span>
                  </>
                )}
              </button>

              {/* Right: Digital Time Display (Current / Duration) */}
              <div className="px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[10.5px] font-mono font-bold text-slate-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Inspiring Quote Card (Under the Video) ── */}
      <div className="mt-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200/80 shadow-md shadow-emerald-950/5 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 via-teal-500 to-emerald-600" />
        
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Quote className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <p className="text-xs sm:text-[13px] font-black text-brand-navy leading-snug">
              {isRTL
                ? "رسمنا بالخُطى درباً لنصنعه.. فمن عتمات واقعنا نما الأملُ ✨"
                : "Forging our path forward... where hope rises from our reality ✨"}
            </p>
            <p className="text-[10.5px] text-slate-500 mt-1 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>
                {isRTL
                  ? "اليوم الافتتاحي لمساحة إديوهب غزة التعليمية"
                  : "Opening Day at EduHub Gaza Educational Hub"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
