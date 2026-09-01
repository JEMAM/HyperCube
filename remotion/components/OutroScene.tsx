import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Box, Sparkles, ArrowRight, ShieldCheck, Cpu, Database, CheckCircle2 } from "lucide-react";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 95, mass: 0.9 },
  });

  const ctaSpring = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 12, stiffness: 110 },
  });

  const pulse = Math.sin(frame / 10) * 0.05 + 0.98;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, #F8FAFC 60%, #E2E8F0 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.15) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Main Logo & Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          transform: `scale(${entrance}) translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
            border: "2px solid #FFFFFF",
          }}
        >
          <Box size={45} color="#FFFFFF" />
        </div>

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
      </div>

      {/* Primary Value Proposition */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 950,
          transform: `scale(${entrance})`,
          opacity: interpolate(entrance, [0, 1], [0, 1]),
        }}
      >
        <h2
          style={{
            fontSize: 40,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            margin: "0 0 12px 0",
            color: "#0F172A",
          }}
        >
          Execute IA com Total Controle, Segurança e Privacidade
        </h2>
        <p
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#475569",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Seus dados contábeis, DRE e fluxo de caixa 100% seguros na sua infraestrutura local via Ollama.
        </p>
      </div>

      {/* Feature Badges List */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 30,
          transform: `scale(${entrance})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#059669", fontSize: 16, fontWeight: 800 }}>
          <CheckCircle2 size={22} color="#10B981" />
          <span>Ollama 100% Local</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#0284C7", fontSize: 16, fontWeight: 800 }}>
          <CheckCircle2 size={22} color="#06B6D4" />
          <span>Grafos Reativos Rustworkx</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#EA580C", fontSize: 16, fontWeight: 800 }}>
          <CheckCircle2 size={22} color="#F97316" />
          <span>Simulações What-If Instantâneas</span>
        </div>
      </div>

      {/* High-Converting CTA Button */}
      <div
        style={{
          marginTop: 40,
          transform: `scale(${ctaSpring * pulse}) translateY(${interpolate(ctaSpring, [0, 1], [25, 0])}px)`,
          opacity: interpolate(ctaSpring, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 44px",
            borderRadius: 22,
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "0.02em",
            boxShadow: "0 15px 35px rgba(16, 185, 129, 0.45)",
            border: "2px solid #FFFFFF",
          }}
        >
          <span>Instale e Execute On-Premise</span>
          <ArrowRight size={24} />
        </div>
      </div>
    </div>
  );
};
