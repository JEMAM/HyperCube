import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ShieldCheck, Cpu, Lock, Zap, Server } from "lucide-react";

interface OllamaBadgeProps {
  title: string;
  subtitle: string;
  icon?: "shield" | "cpu" | "lock" | "zap" | "server";
  delay?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center-right";
  color?: "emerald" | "cyan" | "purple" | "amber";
}

export const OllamaBadge: React.FC<OllamaBadgeProps> = ({
  title,
  subtitle,
  icon = "shield",
  delay = 0,
  position = "top-right",
  color = "emerald",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);
  const entrance = spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.8,
    },
  });

  const floatY = Math.sin(frame / 20) * 5;
  const pulse = Math.sin(frame / 12) * 0.2 + 0.8;

  const colorThemes = {
    emerald: {
      border: "#A7F3D0",
      bg: "rgba(255, 255, 255, 0.95)",
      glow: "0 10px 30px rgba(16, 185, 129, 0.25)",
      title: "#065F46",
      subtitle: "#334155",
      pillBg: "#ECFDF5",
      iconColor: "#059669",
      dot: "#10B981",
    },
    cyan: {
      border: "#BAE6FD",
      bg: "rgba(255, 255, 255, 0.95)",
      glow: "0 10px 30px rgba(6, 182, 212, 0.25)",
      title: "#0369A1",
      subtitle: "#334155",
      pillBg: "#F0F9FF",
      iconColor: "#0284C7",
      dot: "#06B6D4",
    },
    purple: {
      border: "#E9D5FF",
      bg: "rgba(255, 255, 255, 0.95)",
      glow: "0 10px 30px rgba(168, 85, 247, 0.25)",
      title: "#6B21A8",
      subtitle: "#334155",
      pillBg: "#FAF5FF",
      iconColor: "#7E22CE",
      dot: "#A855F7",
    },
    amber: {
      border: "#FED7AA",
      bg: "rgba(255, 255, 255, 0.95)",
      glow: "0 10px 30px rgba(245, 158, 11, 0.25)",
      title: "#9A3412",
      subtitle: "#334155",
      pillBg: "#FFF7ED",
      iconColor: "#EA580C",
      dot: "#F59E0B",
    },
  };

  const theme = colorThemes[color];

  const posStyles: Record<string, React.CSSProperties> = {
    "top-right": { top: 75, right: 75 },
    "top-left": { top: 75, left: 75 },
    "bottom-right": { bottom: 85, right: 75 },
    "bottom-left": { bottom: 85, left: 75 },
    "center-right": { top: "50%", right: 75, transform: "translateY(-50%)" },
  };

  const icons = {
    shield: <ShieldCheck size={28} color={theme.iconColor} />,
    cpu: <Cpu size={28} color={theme.iconColor} />,
    lock: <Lock size={28} color={theme.iconColor} />,
    zap: <Zap size={28} color={theme.iconColor} />,
    server: <Server size={28} color={theme.iconColor} />,
  };

  if (frame < delay) return null;

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 50,
        ...posStyles[position],
        transform: `${posStyles[position].transform || ""} scale(${entrance}) translateY(${floatY}px)`,
        opacity: interpolate(entrance, [0, 1], [0, 1]),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 22px",
          borderRadius: 20,
          background: theme.bg,
          border: `2px solid ${theme.border}`,
          boxShadow: theme.glow,
          backdropFilter: "blur(16px)",
          minWidth: 320,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 14,
            background: theme.pillBg,
            border: `1px solid ${theme.border}`,
            flexShrink: 0,
          }}
        >
          {icons[icon]}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: theme.title,
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "0.01em",
              }}
            >
              {title}
            </span>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: theme.dot,
                boxShadow: `0 0 8px ${theme.dot}`,
                opacity: pulse,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: theme.subtitle,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  );
};
