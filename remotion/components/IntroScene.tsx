import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Box, Sparkles, Cpu, ShieldCheck, Zap, Globe, Lock } from "lucide-react";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 },
  });

  const titleSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const taglineSpring = spring({
    frame: Math.max(0, frame - 24),
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const badgesSpring = spring({
    frame: Math.max(0, frame - 38),
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const rotateCube = interpolate(frame, [0, 180], [0, 360]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 35%, #FFFFFF 0%, #F8FAFC 55%, #E2E8F0 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background Soft Glow */}
      <div
        style={{
          position: "absolute",
          width: 950,
          height: 950,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.16) 35%, rgba(99, 102, 241, 0.08) 60%, transparent 80%)",
          filter: "blur(75px)",
        }}
      />

      {/* Grid Pattern Floor */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "40%",
          backgroundImage: "linear-gradient(rgba(100, 116, 139, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 116, 139, 0.08) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "bottom center",
          opacity: 0.8,
        }}
      />

      {/* Main Animated 3D Logo */}
      <div
        style={{
          transform: `scale(${logoSpring}) translateY(${interpolate(logoSpring, [0, 1], [40, 0])}px)`,
          marginBottom: 20,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 30,
            background: "linear-gradient(135deg, #10B981 0%, #06B6D4 50%, #6366F1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 45px rgba(16, 185, 129, 0.4), 0 8px 18px rgba(6, 182, 212, 0.2)",
            border: "3px solid #FFFFFF",
            position: "relative",
          }}
        >
          <Box
            size={60}
            color="#FFFFFF"
            style={{
              transform: `rotate(${rotateCube * 0.4}deg)`,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              background: "#F97316",
              borderRadius: "50%",
              padding: 6,
              boxShadow: "0 0 16px #F97316",
            }}
          >
            <Sparkles size={16} color="#FFFFFF" />
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div
        style={{
          textAlign: "center",
          transform: `scale(${titleSpring}) translateY(${interpolate(titleSpring, [0, 1], [25, 0])}px)`,
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
        }}
      >
        <h1
          style={{
            fontSize: 68,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            margin: 0,
            color: "#0F172A",
          }}
        >
          <span style={{ color: "#F97316", fontFamily: "monospace", marginRight: 6 }}>/</span>
          HyperCube
        </h1>

        <div
          style={{
            display: "inline-block",
            marginTop: 8,
            padding: "5px 18px",
            borderRadius: 20,
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            fontSize: 15,
            fontWeight: 800,
            color: "#475569",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Connected Planning & Autonomous Financial Engine
        </div>
      </div>

      {/* Commercial Headline (All Models + Local Privacy) */}
      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          transform: `scale(${taglineSpring}) translateY(${interpolate(taglineSpring, [0, 1], [20, 0])}px)`,
          opacity: interpolate(taglineSpring, [0, 1], [0, 1]),
          maxWidth: 1100,
        }}
      >
        <p
          style={{
            fontSize: 32,
            fontWeight: 900,
            margin: "0 0 8px 0",
            background: "linear-gradient(90deg, #059669 0%, #0284C7 50%, #7C3AED 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Conecte Qualquer Modelo de IA ou Execute 100% Local
        </p>
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#475569",
            margin: 0,
          }}
        >
          Flexibilidade total com Claude, GPT e Gemini — e execução local via Ollama para sigilo absoluto dos números.
        </p>
      </div>

      {/* Feature Badges */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 30,
          transform: `scale(${badgesSpring}) translateY(${interpolate(badgesSpring, [0, 1], [15, 0])}px)`,
          opacity: interpolate(badgesSpring, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 20px",
            borderRadius: 14,
            background: "#ECFDF5",
            border: "1.5px solid #A7F3D0",
            color: "#065F46",
            fontWeight: 800,
            fontSize: 14,
            boxShadow: "0 3px 10px rgba(16, 185, 129, 0.1)",
          }}
        >
          <Lock size={16} color="#059669" />
          <span>Ollama Local (Segurança dos Números)</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 20px",
            borderRadius: 14,
            background: "#F0F9FF",
            border: "1.5px solid #BAE6FD",
            color: "#0369A1",
            fontWeight: 800,
            fontSize: 14,
            boxShadow: "0 3px 10px rgba(6, 182, 212, 0.1)",
          }}
        >
          <Globe size={16} color="#0284C7" />
          <span>Todos os Modelos (Claude, GPT, Groq, Gemini)</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 20px",
            borderRadius: 14,
            background: "#FFF7ED",
            border: "1.5px solid #FED7AA",
            color: "#C2410C",
            fontWeight: 800,
            fontSize: 14,
            boxShadow: "0 3px 10px rgba(249, 115, 22, 0.1)",
          }}
        >
          <Zap size={16} color="#EA580C" />
          <span>Zero Custo de API em Modo Local</span>
        </div>
      </div>
    </div>
  );
};
