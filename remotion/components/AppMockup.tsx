import React from "react";
import {
  interpolate,
  Video,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface AppMockupProps {
  videoSrc?: string;
  zoomScale?: number;
  panX?: number;
  panY?: number;
  rotateY?: number;
  rotateX?: number;
}

export const AppMockup: React.FC<AppMockupProps> = ({
  videoSrc = staticFile("recordings/hypercube-demo.mp4"),
  zoomScale = 1,
  panX = 0,
  panY = 0,
  rotateY = 0,
  rotateX = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 90,
      mass: 0.9,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1400,
        overflow: "hidden",
      }}
    >
      {/* Dynamic Ambient Glow Behind Mockup (Light Modern Hue) */}
      <div
        style={{
          position: "absolute",
          width: "80%",
          height: "70%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(6, 182, 212, 0.12) 40%, rgba(99, 102, 241, 0.08) 70%, transparent 100%)",
          filter: "blur(80px)",
          transform: `scale(${entrance * 1.05})`,
          pointerEvents: "none",
        }}
      />

      {/* Modern Light Browser Window Container */}
      <div
        style={{
          width: 1620,
          height: 920,
          borderRadius: 24,
          background: "#FFFFFF",
          border: "1.5px solid #E2E8F0",
          boxShadow: "0 30px 70px -15px rgba(0, 0, 0, 0.18), 0 0 35px rgba(16, 185, 129, 0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: `scale(${entrance}) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${zoomScale}) translate(${panX}px, ${panY}px)`,
          transformOrigin: "center center",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Browser Top Navigation Bar (Clean Light Style) */}
        <div
          style={{
            height: 48,
            background: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            justifyContent: "space-between",
            userSelect: "none",
          }}
        >
          {/* Traffic Light Window Controls */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#EF4444" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#F59E0B" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10B981" }} />
          </div>

          {/* Browser Address Bar (Light Mode) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 10,
              padding: "4px 24px",
              fontSize: 12,
              fontFamily: "monospace",
              color: "#334155",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ color: "#10B981" }}>🔒</span>
            <span style={{ fontWeight: 600 }}>http://localhost:3000</span>
            <span style={{ color: "#94A3B8" }}>— HyperCube (Connected Planning)</span>
          </div>

          {/* Local / Ollama Status Indicator Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 800,
              color: "#059669",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
            <span>Ollama: 11434 (Local & On-Premise)</span>
          </div>
        </div>

        {/* Video Screen Content */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "#F8FAFC",
            overflow: "hidden",
          }}
        >
          <Video
            src={videoSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </div>
  );
};
