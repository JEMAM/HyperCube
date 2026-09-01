"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { usePreferences } from "./PreferencesContext";

// Dynamically import the real 3D WebGL OLAP Cube with SSR disabled
const MiniOlapCube3DLogo = dynamic(() => import("./MiniOlapCube3DLogo"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 animate-pulse" />
    </div>
  ),
});

interface DynamicLogoProps {
  isExpanded?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "hero" | "3x";
  onLogoClick?: () => void;
  showText?: boolean;
  layout?: "horizontal" | "vertical";
}

export default function DynamicLogo({
  isExpanded = true,
  size = "xl",
  onLogoClick,
  showText = true,
  layout = "horizontal",
}: DynamicLogoProps) {
  const { theme } = usePreferences();
  const isDark = theme === "dark";
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const handleClick = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 1200);
    if (onLogoClick) onLogoClick();
  };

  const is3x = size === "3x";
  const isHero = size === "hero";
  const isXl = size === "xl";
  const isLg = size === "lg";
  const isMd = size === "md";
  const isSm = size === "sm";
  const isVertical = layout === "vertical" || isHero || isXl;

  // Well-proportioned dimensions for the 3D OLAP Cube
  // 3x size provides ~108-112px emblem (tripled from previous 36px)
  const containerClasses = isHero
    ? "w-36 h-36 sm:w-40 sm:h-40 rounded-3xl"
    : is3x
    ? "w-24 h-24 sm:w-28 sm:h-28 rounded-2xl"
    : isXl
    ? "w-28 h-28 sm:w-32 sm:h-32 rounded-3xl"
    : isLg
    ? "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl"
    : isMd
    ? "w-16 h-16 rounded-2xl"
    : isSm
    ? "w-9 h-9 sm:w-10 sm:h-10 rounded-xl"
    : isExpanded
    ? "w-16 h-16 rounded-2xl"
    : "w-12 h-12 rounded-xl";

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group cursor-pointer select-none transition-all duration-300 ${
        isVertical ? "flex flex-col items-center text-center" : "inline-flex items-center"
      }`}
      title="HyperCube OLAP 3D Engine (Cubo 3D Reativo interagindo com IA)"
    >
      <div className={`flex items-center ${isVertical ? "flex-col gap-3" : is3x ? "gap-4 sm:gap-5" : "gap-3.5"}`}>
        {/* 3D OLAP Cube WebGL Emblem Container */}
        <div className="relative flex-shrink-0">
          {/* Ambient Multi-Layer Volumetric Glow Aura */}
          <div
            className={`absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#f59e0b] via-[#38bdf8] to-[#10b981] opacity-45 blur-xl transition-all duration-700 ${
              isHovered ? "opacity-95 scale-125 blur-2xl" : ""
            } ${isPulsing ? "animate-ping opacity-100 scale-150" : ""} ${
              isHero || isXl || is3x ? "opacity-55 blur-2xl" : ""
            }`}
          />

          {/* Rotating Orbital Axis Ring on Hover */}
          <div
            className={`absolute -inset-3.5 rounded-full border border-dashed border-sky-400/40 animate-spin transition-opacity duration-700 ${
              isHovered ? "opacity-100 border-amber-400/70" : "opacity-35"
            }`}
            style={{ animationDuration: isHovered ? "10s" : "26s" }}
          />

          {/* Core Emblem Container holding the Real 3D OLAP Cube WebGL Canvas */}
          <div
            className={`relative ${containerClasses} bg-gradient-to-b from-[#0e274a]/90 via-[#091b35]/95 to-[#040e1c] border-2 border-[#1c487f] shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500 ${
              isHovered ? "scale-105 border-sky-400/90 shadow-[0_0_35px_rgba(56,189,248,0.45)]" : ""
            }`}
          >
            {/* Background 3D Radial Grid Reflection */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.25),transparent_75%)] pointer-events-none" />

            {/* REAL 3D OLAP CUBE WEBGL CANVAS: Rotating & Voxels Moving in/out with AI */}
            <div className="w-full h-full flex items-center justify-center p-1">
              <MiniOlapCube3DLogo className="w-full h-full" />
            </div>
          </div>

          {/* Active Calculation Micro-Badge Dot */}
          <span className={`absolute -bottom-1 -right-1 flex ${is3x || isHero ? "h-5 w-5" : "h-4 w-4"}`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
            <span className={`relative inline-flex rounded-full ${is3x || isHero ? "h-5 w-5 border-[2.5px]" : "h-4 w-4 border-2"} bg-emerald-500 border-[#0c2340]`}></span>
          </span>
        </div>

        {/* Brand Text Block */}
        {showText && (isExpanded || isHero) && (
          <div className={`overflow-hidden flex flex-col ${isVertical ? "items-center text-center" : "justify-center"}`}>
            {/* Title with Gradient Highlight */}
            <div className="flex items-center justify-start gap-1.5 leading-tight">
              <span className={`font-black tracking-tight transition-colors ${
                isDark ? "text-white group-hover:text-slate-100" : "text-slate-900 group-hover:text-black"
              } ${
                isHero ? "text-3xl sm:text-4xl" : is3x ? "text-2xl sm:text-3xl" : isXl ? "text-2xl sm:text-[26px]" : isLg ? "text-xl sm:text-2xl" : isSm ? "text-lg" : "text-xl"
              }`}>
                Hyper
              </span>
              <span className={`font-black tracking-tight bg-gradient-to-r from-[#ff7a59] via-[#f59e0b] to-[#38bdf8] bg-clip-text text-transparent group-hover:brightness-110 transition-all ${
                isHero ? "text-3xl sm:text-4xl" : is3x ? "text-2xl sm:text-3xl" : isXl ? "text-2xl sm:text-[26px]" : isLg ? "text-xl sm:text-2xl" : isSm ? "text-lg" : "text-xl"
              }`}>
                Cube
              </span>
              <span className={`rounded-md font-mono font-black tracking-normal shadow-xs ${
                isDark ? "bg-[#14335a] text-[#38bdf8] border border-[#1e4475]" : "bg-sky-100 text-sky-900 border border-sky-300"
              } ${
                isHero ? "text-sm px-3 py-1 ml-1.5" : is3x ? "text-xs px-2.5 py-1 ml-1.5" : isXl ? "text-xs px-2.5 py-0.5 ml-1" : "text-[10px] px-1.5 py-0.5 ml-1"
              }`}>
                OLAP 3D
              </span>
            </div>

            {/* Subtitle & Engine Indicator */}
            <div className={`flex items-center justify-start gap-2 ${isVertical ? "mt-1.5" : is3x ? "mt-1.5" : "mt-1"}`}>
              <span className={`text-[#ff7a59] uppercase tracking-widest font-black leading-none ${
                isHero ? "text-sm" : is3x ? "text-xs sm:text-sm" : isXl ? "text-xs" : isLg ? "text-[11px]" : "text-[10px]"
              }`}>
                Connected Planning
              </span>
              {(isHero || is3x) && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-sky-400 font-mono font-semibold hidden sm:inline">Reactive 3D Tensor</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
