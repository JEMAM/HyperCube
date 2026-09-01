import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { IntroScene } from "./components/IntroScene";
import { OutroScene } from "./components/OutroScene";
import { AppMockup } from "./components/AppMockup";
import { OllamaBadge } from "./components/OllamaBadge";
import { FeatureCallout } from "./components/FeatureCallout";

export const MainComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline (Total 45s = 2700 frames @ 60fps)
  // 0 - 210 (0s - 3.5s): Intro
  // 210 - 750 (3.5s - 12.5s): Multi-Model Setup & Ollama 100% Local Highlights
  // 750 - 2350 (12.5s - 39s): Full 10-Page Walkthrough, What-If Simulation & DAG
  // 2350 - 2700 (39s - 45s): Outro CTA

  // Camera animations for Scene 2 (Model Selector & Ollama Showcase)
  const scene2Frame = frame - 210;
  const zoomScene2 = interpolate(scene2Frame, [0, 80, 420, 540], [1.02, 1.15, 1.15, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panXScene2 = interpolate(scene2Frame, [0, 80, 420, 540], [0, -110, -110, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panYScene2 = interpolate(scene2Frame, [0, 80, 420, 540], [0, 70, 70, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Camera animations for Scene 3 (Full 10-Page Walkthrough)
  const scene3Frame = frame - 750;
  const zoomScene3 = interpolate(scene3Frame, [0, 100, 1400, 1600], [1.03, 1.07, 1.07, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Transitions
  const introOpacity = interpolate(frame, [190, 215], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outroOpacity = interpolate(frame, [2330, 2360], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#F8FAFC", overflow: "hidden" }}>
      {/* Official Instrumental Soundtrack (Coldplay - A Sky Full of Stars Chorus Drop) */}
      <Audio
        src={staticFile("audio/asfos.webm")}
        startFrom={4320}
        volume={(f) =>
          interpolate(f, [0, 50, 2600, 2700], [0, 0.95, 0.95, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {/* SCENE 1: Intro (0s - 3.5s) */}
      <Sequence from={0} durationInFrames={220}>
        <div style={{ opacity: introOpacity, width: "100%", height: "100%" }}>
          <IntroScene />
        </div>
      </Sequence>

      {/* SCENE 2: Multi-Model Support & Ollama Local On-Premise (3.5s - 12.5s) */}
      <Sequence from={205} durationInFrames={555}>
        <AbsoluteFill>
          <AppMockup
            zoomScale={zoomScene2}
            panX={panXScene2}
            panY={panYScene2}
            rotateY={2}
            rotateX={1}
          />

          <OllamaBadge
            title="100% On-Premise / Local"
            subtitle="Ollama (DeepSeek-R1, Qwen, Gemma) em localhost:11434"
            icon="server"
            color="emerald"
            delay={25}
            position="top-right"
          />

          <OllamaBadge
            title="Suporte Multi-Modelos"
            subtitle="Conectividade com Ollama, Claude, GPT, Groq e Gemini"
            icon="cpu"
            color="cyan"
            delay={140}
            position="bottom-left"
          />

          <OllamaBadge
            title="Privacidade Total & Zero Token Custo"
            subtitle="Seus dados nunca saem da sua rede ou servidor"
            icon="shield"
            color="amber"
            delay={260}
            position="bottom-right"
          />

          <Sequence from={30} durationInFrames={480}>
            <FeatureCallout
              label="Arquitetura de IA:"
              highlight="Ollama On-Premise + Frontier Cloud Models"
              sublabel="Flexibilidade máxima: execute 100% offline localmente ou conecte modelos de fronteira"
              icon="cpu"
            />
          </Sequence>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 3: Full 10-Page Walkthrough, What-If Simulation & DAG (12.5s - 39s) */}
      <Sequence from={750} durationInFrames={1610}>
        <AbsoluteFill>
          <AppMockup
            zoomScale={zoomScene3}
            panX={0}
            panY={0}
            rotateY={0}
            rotateX={0.5}
          />

          <OllamaBadge
            title="Motor Reativo Topológico"
            subtitle="Propagação instantânea por Grafos Rustworkx"
            icon="cpu"
            color="purple"
            delay={30}
            position="top-right"
          />

          <OllamaBadge
            title="Cálculo Multidimensional"
            subtitle="Processamento vetorial em Polars + DuckDB"
            icon="zap"
            color="cyan"
            delay={350}
            position="bottom-left"
          />

          <OllamaBadge
            title="Agente IA Autônomo"
            subtitle="Diagnóstico financeiro executivo em tempo real"
            icon="shield"
            color="emerald"
            delay={700}
            position="bottom-right"
          />

          <Sequence from={40} durationInFrames={1500}>
            <FeatureCallout
              label="Plataforma Completa:"
              highlight="DRE • DFC • Grafos DAG • Cubo OLAP 3D • Macroeconomia"
              sublabel="Visão integrada e simulações What-If com diagnóstico em tempo real"
              icon="sparkles"
            />
          </Sequence>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 4: Outro & Commercial Call To Action (39s - 45s) */}
      <Sequence from={2340} durationInFrames={360}>
        <div style={{ opacity: outroOpacity, width: "100%", height: "100%" }}>
          <OutroScene />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
