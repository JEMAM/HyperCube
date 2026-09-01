import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Sparkles, Cpu, Zap, ShieldCheck } from "lucide-react";

interface FeatureCalloutProps {
  label: string;
  highlight: string;
  sublabel: string;
  icon?: "cpu" | "shield" | "zap" | "sparkles";
}

export const FeatureCallout: React.FC<FeatureCalloutProps> = ({
  label,
  highlight,
  sublabel,
  icon = "cpu",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const icons = {
    cpu: <Cpu size={22} color="#059669" />,
    shield: <ShieldCheck size={22} color="#0284C7" />,
    zap: <Zap size={22} color="#EA580C" />,
    sparkles: <Sparkles size={22} color="#7C3AED" />,
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 35,
        left: "50%",
        transform: `translateX(-50%) translateY(${interpolate(entrance, [0, 1], [30, 0])}px) scale(${entrance})`,
        opacity: interpolate(entrance, [0, 1], [0, 1]),
        zIndex: 60,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 28px",
          borderRadius: 20,
          background: "rgba(255, 255, 255, 0.96)",
          border: "1.5px solid #CBD5E1",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.12), 0 0 20px rgba(16, 185, 129, 0.2)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#F1F5F9",
          }}
        >
          {icons[icon]}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>{label}</span>
            <span style={{ color: "#059669", fontSize: 15, fontWeight: 900 }}>{highlight}</span>
          </div>
          <span style={{ color: "#1E293B", fontSize: 12.5, fontWeight: 600 }}>{sublabel}</span>
        </div>
      </div>
    </div>
  );
};
