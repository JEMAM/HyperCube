"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePreferences } from "./PreferencesContext";
import {
  Box, Layers, Calendar, DollarSign, TrendingUp, ShoppingBag,
  RotateCcw, Info, CheckCircle2, Eye, Compass, MousePointerClick,
  Sparkles, ShieldCheck
} from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

interface CubeData {
  dimensions: {
    tempo: number[];
    dre_contas: string[];
    metricas: string[];
  };
  records: {
    tempo_ano: number;
    tempo_trimestre: string;
    data: string;
    dre_conta: string;
    soma_vendas: number;
    media_lucro: number;
    qtd_vendida: number;
    receita_credito: number;
    custo_funding: number;
    resultado_ebt: number;
    margem_lucro_pct: number;
  }[];
}

const COLOR_AMBER = "#f59e0b";
const COLOR_BLUE = "#3b82f6";
const COLOR_CREAM = "#eab308";

interface SelectedVoxel {
  cellId: string;
  account: string;
  year: number | string;
  quarter: string;
  region: string;
  somaVendas: number;
  mediaLucro: number;
  margemPct: number;
  qtdVendida: number;
}

interface VoxelProps {
  position: [number, number, number];
  color: string;
  isSelected: boolean;
  isHovered: boolean;
  isFiltered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  account: string;
  valFormatted: string;
}

function Voxel({
  position,
  color,
  isSelected,
  isHovered,
  isFiltered,
  onClick,
  onHover,
  account,
  valFormatted,
}: VoxelProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const activeOpacity = isSelected ? 0.72 : isHovered ? 0.60 : isFiltered ? 0.38 : 0.12;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
        }}
        onPointerOut={() => onHover(false)}
        scale={isSelected ? 1.08 : isHovered ? 1.04 : isFiltered ? 0.94 : 0.82}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={isSelected ? "#10b981" : color}
          roughness={0.1}
          metalness={0.1}
          opacity={activeOpacity}
          transparent={true}
          depthWrite={false}
          emissive={isSelected ? "#059669" : isHovered ? color : "#000000"}
          emissiveIntensity={isSelected ? 0.6 : isHovered ? 0.3 : 0}
        />
      </mesh>

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.98, 0.98, 0.98)]} />
        <lineBasicMaterial
          color={isSelected ? "#10b981" : isFiltered ? "#94a3b8" : "#475569"}
          linewidth={isSelected ? 2 : 1}
          transparent={true}
          opacity={isSelected ? 0.9 : isFiltered ? 0.5 : 0.2}
        />
      </lineSegments>

      {/* Selected Voxel Tag displaying BOTH Account AND Monetary Value */}
      {isSelected && (
        <Html position={[0, 0, 0.65]} center pointerEvents="none">
          <div className="bg-emerald-500/90 border border-emerald-300 text-slate-950 font-extrabold text-[11px] px-2.5 py-1.5 rounded-xl shadow-2xl whitespace-nowrap text-center backdrop-blur-md space-y-0.5 z-50">
            <div>{account}</div>
            <div className="text-[10px] bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
              {valFormatted}
            </div>
          </div>
        </Html>
      )}

      {/* Hover Tag displaying BOTH Account AND Monetary Value */}
      {isHovered && !isSelected && (
        <Html distanceFactor={8} position={[0, 0.85, 0]} pointerEvents="none">
          <div className="bg-slate-900/95 border border-sky-400 text-white text-[11px] px-2.5 py-1.5 rounded-xl shadow-2xl whitespace-nowrap z-50 flex flex-col items-center gap-0.5 backdrop-blur-md">
            <span className="font-bold text-sky-300">{account}</span>
            <span className="font-mono text-emerald-400 font-extrabold text-[10px]">{valFormatted}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function ThreeDScene({
  selectedCellId,
  onSelectVoxel,
  records,
  dimensions,
  mode,
  selectedYear,
  selectedAccount,
  formatBRL,
}: {
  selectedCellId: string | null;
  onSelectVoxel: (voxel: SelectedVoxel) => void;
  records: CubeData["records"];
  dimensions: CubeData["dimensions"];
  mode: "DRE" | "DFC";
  selectedYear: number | "all";
  selectedAccount: string | "all";
  formatBRL: (val: number) => string;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  useFrame((_, delta) => {
    if (groupRef.current && !selectedCellId && !hoveredCell) {
      groupRef.current.rotation.y += delta * 0.04;
    }
  });

  const dreAccounts = dimensions?.dre_contas || ["Conta 1", "Conta 2", "Conta 3"];
  const timeYears = dimensions?.tempo || [2023, 2024, 2025];
  const regions = ["Sudeste", "Norte/Nordeste", "Sul/Centro"];

  // Dynamic grid plane mapping for selectedAccount & selectedYear
  let gridAccounts = [dreAccounts[0], dreAccounts[1], dreAccounts[2]];
  if (selectedAccount !== "all") {
    const accIdx = dreAccounts.indexOf(selectedAccount);
    if (accIdx !== -1) {
      gridAccounts = [
        dreAccounts[(accIdx - 1 + dreAccounts.length) % dreAccounts.length],
        selectedAccount,
        dreAccounts[(accIdx + 1) % dreAccounts.length]
      ];
    } else {
      gridAccounts[1] = selectedAccount;
    }
  }

  let gridYears = [
    timeYears[timeYears.length - 3] || timeYears[0],
    timeYears[timeYears.length - 2] || timeYears[1] || timeYears[0],
    timeYears[timeYears.length - 1] || timeYears[2] || timeYears[0],
  ];

  if (selectedYear !== "all") {
    const yrNum = Number(selectedYear);
    const yrIdx = timeYears.indexOf(yrNum);
    if (yrIdx !== -1) {
      if (yrIdx >= 2) {
        gridYears = [
          timeYears[yrIdx - 2],
          timeYears[yrIdx - 1],
          timeYears[yrIdx]
        ];
      } else if (yrIdx === 1) {
        gridYears = [
          timeYears[0],
          timeYears[1],
          timeYears[2] || timeYears[1]
        ];
      } else {
        gridYears = [
          timeYears[0],
          timeYears[1] || timeYears[0],
          timeYears[2] || timeYears[0]
        ];
      }
    } else {
      gridYears = [yrNum - 2, yrNum - 1, yrNum];
    }
  }

  const matrix = [];

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        const cellId = `cell-${x}-${y}-${z}`;
        const isSelected = selectedCellId === cellId;

        let color = COLOR_AMBER;
        if (y === 2) color = COLOR_BLUE;    // Top plane: Regional Segmentation
        if (x === 2) color = COLOR_CREAM;   // Right plane: Time Series
        if (z === 2) color = COLOR_AMBER;   // Front plane: Accounts

        const itemAccount = gridAccounts[x % gridAccounts.length] || dreAccounts[0];
        const itemYear = gridYears[y % gridYears.length] || 2025;
        const itemRegion = regions[z % regions.length];

        // Filter matching records for cell
        const matchingRecord = records.find(
          (r) => r.dre_conta === itemAccount && r.tempo_ano === itemYear
        ) || records[(x * 9 + y * 3 + z) % (records.length || 1)] || {
          soma_vendas: 1200000,
          media_lucro: 180000,
          margem_lucro_pct: 14.5,
          qtd_vendida: 1000
        };

        const matchesYearFilter = selectedYear === "all" || itemYear === Number(selectedYear);
        const matchesAccountFilter = selectedAccount === "all" || itemAccount === selectedAccount;
        const isFiltered = matchesYearFilter && matchesAccountFilter;

        matrix.push({
          id: cellId,
          pos: [x - 1, y - 1, z - 1] as [number, number, number],
          color,
          isSelected,
          isFiltered,
          voxelInfo: {
            cellId,
            account: itemAccount,
            year: itemYear,
            quarter: `Q${(y % 4) + 1}`,
            region: itemRegion,
            somaVendas: matchingRecord.soma_vendas,
            mediaLucro: matchingRecord.media_lucro,
            margemPct: matchingRecord.margem_lucro_pct || 14.5,
            qtdVendida: matchingRecord.qtd_vendida || 1200
          }
        });
      }
    }
  }

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[12, 18, 12]} intensity={1.4} castShadow />
      <directionalLight position={[-8, 8, -8]} intensity={0.4} />

      <group ref={groupRef} position={[0, 0, 0]}>
        {matrix.map((item) => (
          <Voxel
            key={item.id}
            position={item.pos}
            color={item.color}
            isSelected={item.isSelected}
            isHovered={hoveredCell === item.id}
            isFiltered={item.isFiltered}
            account={item.voxelInfo.account}
            valFormatted={formatBRL(item.voxelInfo.somaVendas)}
            onClick={() => onSelectVoxel(item.voxelInfo)}
            onHover={(h) => setHoveredCell(h ? item.id : null)}
          />
        ))}
      </group>

      {/* Static 3D Axis Orientation Indicators */}
      <Html position={[0, 2.2, 0]} center pointerEvents="none">
        <div className="bg-slate-900/90 border border-blue-500/80 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg backdrop-blur-md whitespace-nowrap">
          ▲ Eixo Y (Tempo)
        </div>
      </Html>

      <Html position={[0, -2.1, 1.8]} center pointerEvents="none">
        <div className="bg-slate-900/90 border border-amber-500/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg backdrop-blur-md whitespace-nowrap">
          ▶ Eixo X (Contas)
        </div>
      </Html>

      <Html position={[2.2, 0, 0]} center pointerEvents="none">
        <div className="bg-slate-900/90 border border-yellow-500/80 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg backdrop-blur-md whitespace-nowrap">
          ◆ Eixo Z (Regiões)
        </div>
      </Html>

      <OrbitControls enableZoom={true} autoRotate={false} maxPolarAngle={Math.PI / 2} />
    </>
  );
}

function getFallbackCubeData(mode: "DRE" | "DFC"): CubeData {
  if (mode === "DFC") {
    const dfc_categories = [
      "Recebimento de Vendas", "Pagamento a Fornecedores", "Pagamento de Salários",
      "Pagamento de Impostos", "Despesas Operacionais", "Fluxo Operacional (FCO)",
      "Fluxo Investimento (FCI)", "Fluxo Financiamento (FCF)", "Saldo Final de Caixa"
    ];
    return {
      dimensions: {
        tempo: [2024, 2025, 2026],
        dre_contas: dfc_categories,
        metricas: ["Recebimento Vendas (R$)", "Fluxo Operacional FCO (R$)", "Volume de Operações", "Margem Operacional %"]
      },
      records: Array.from({ length: 24 }).map((_, idx) => ({
        tempo_ano: 2024 + Math.floor(idx / 8),
        tempo_trimestre: `M${(idx % 12) + 1}`,
        data: `2024-01-01`,
        dre_conta: dfc_categories[idx % dfc_categories.length],
        soma_vendas: 550000.0 * (1 + (idx % 5) * 0.12),
        media_lucro: 72000.0,
        qtd_vendida: 650,
        receita_credito: 550000.0,
        custo_funding: 260000.0,
        resultado_ebt: 12000.0,
        margem_lucro_pct: 13.1
      }))
    };
  }

  const dre_categories = [
    "Receita Operacional Líquida", "Custos Operacionais / CMV", "Margem Operacional Bruta",
    "Provisão de Risco / Perdas Estimadas", "Resultado Operacional Ajustado", "Despesas Pessoal e Admin (SG&A)",
    "Resultado Antes da Tributação (EBT)", "Tributos sobre o Lucro", "Lucro Líquido / Resultado do Período"
  ];
  return {
    dimensions: {
      tempo: [2022, 2023, 2024, 2025],
      dre_contas: dre_categories,
      metricas: ["Margem Operacional Bruta (R$)", "Lucro Líquido (R$)", "Volume de Operações", "Margem de Lucro %"]
    },
    records: Array.from({ length: 36 }).map((_, idx) => ({
      tempo_ano: 2022 + Math.floor(idx / 9),
      tempo_trimestre: `Q${(idx % 4) + 1}`,
      data: `2022-03-31`,
      dre_conta: dre_categories[idx % dre_categories.length],
      soma_vendas: 1350000.0 * (1 + (idx % 4) * 0.15),
      media_lucro: 210000.0,
      qtd_vendida: 1400,
      receita_credito: 1650000.0,
      custo_funding: 320000.0,
      resultado_ebt: 240000.0,
      margem_lucro_pct: 15.5
    }))
  };
}

interface OlapCube3DProps {
  isMini?: boolean;
}

export default function OlapCube3D({ isMini = false }: OlapCube3DProps) {
  const { theme, apiBaseUrl } = usePreferences();
  const isDark = theme === "dark";

  const [mode, setMode] = useState<"DRE" | "DFC">("DRE");
  const [cubeData, setCubeData] = useState<CubeData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedAccount, setSelectedAccount] = useState<string | "all">("all");
  const [selectedVoxel, setSelectedVoxel] = useState<SelectedVoxel | null>(null);

  useEffect(() => {
    const endpoint = mode === "DFC"
      ? `${apiBaseUrl}/api/dfc/olap/cube-data`
      : `${apiBaseUrl}/api/olap/cube-data`;

    let isMounted = true;
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && Array.isArray(data.records) && data.dimensions && data.records.length > 0) {
          setCubeData(data);
        } else {
          setCubeData(getFallbackCubeData(mode));
        }
      })
      .catch(() => {
        if (isMounted) setCubeData(getFallbackCubeData(mode));
      });

    return () => { isMounted = false; };
  }, [apiBaseUrl, mode]);

  const activeCubeData = (cubeData && Array.isArray(cubeData.records) && cubeData.dimensions)
    ? cubeData
    : getFallbackCubeData(mode);

  const rawRecords = activeCubeData.records || [];
  const dimensions = activeCubeData.dimensions || { tempo: [], dre_contas: [], metricas: [] };

  const filteredRecords = rawRecords.filter((r) => {
    if (selectedYear !== "all" && r.tempo_ano !== selectedYear) return false;
    if (selectedAccount !== "all" && r.dre_conta !== selectedAccount) return false;
    return true;
  });

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

  return (
    <div className={`${
      isMini
        ? "p-3.5 sm:p-4 rounded-2xl border h-full w-full flex flex-col justify-between overflow-hidden"
        : "p-6 rounded-3xl border space-y-6"
    } transition-all duration-300 ${
      isDark ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-xl"
    }`}>

      {/* Header Bar */}
      <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2.5 border-b border-slate-800/60 ${isMini ? "pb-2.5" : "pb-4"}`}>
        <div>
          <div className={`flex items-center gap-2 text-sky-400 font-extrabold tracking-tight ${isMini ? "text-sm sm:text-base" : "text-xl"}`}>
            <Box className={`${isMini ? "w-5 h-5" : "w-6 h-6"} text-sky-500 flex-shrink-0`} />
            <span>Cubo OLAP 3D Multidimensional — {mode === "DFC" ? "Fluxo de Caixa (DFC)" : "Demonstração DRE"}</span>
          </div>
          {!isMini && (
            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Explore e inspecione interseções de dados em 3D. Clique em qualquer célula para abrir a análise detalhada de conta e valor.
            </p>
          )}
        </div>

        {/* Mode Selector & Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className={`flex border ${isDark ? "bg-slate-950 border-slate-700" : "bg-slate-200 border-slate-300"} p-0.5 rounded-xl font-bold`}>
            <button
              onClick={() => { setMode("DRE"); setSelectedYear("all"); setSelectedAccount("all"); setSelectedVoxel(null); }}
              className={`px-3 py-1 rounded-lg transition text-[11px] ${
                mode === "DRE" ? "bg-emerald-600 text-white shadow-md" : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              DRE 3D
            </button>
            <button
              onClick={() => { setMode("DFC"); setSelectedYear("all"); setSelectedAccount("all"); setSelectedVoxel(null); }}
              className={`px-3 py-1 rounded-lg transition text-[11px] ${
                mode === "DFC" ? "bg-sky-600 text-white shadow-md" : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              DFC 3D
            </button>
          </div>
          <div className={`flex items-center gap-1 border rounded-xl px-2.5 py-1 shadow-sm text-[11px] ${isDark ? "bg-slate-800/80 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}>
            <Calendar className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))}
              className={`bg-transparent font-semibold focus:outline-none cursor-pointer ${isDark ? "text-slate-100" : "text-slate-900"}`}
            >
              <option value="all" className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Ano: Todos ({dimensions.tempo?.length || 0})</option>
              {(dimensions.tempo || []).map((y) => (
                <option key={y} value={y} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Ano: {y}</option>
              ))}
            </select>
          </div>

          <div className={`flex items-center gap-1 border rounded-xl px-2.5 py-1 shadow-sm text-[11px] ${isDark ? "bg-slate-800/80 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"}`}>
            <Layers className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className={`bg-transparent font-semibold focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[190px] truncate ${isDark ? "text-slate-100" : "text-slate-900"}`}
            >
              <option value="all" className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>Contas: Todas</option>
              {(dimensions.dre_contas || []).map((acc) => (
                <option key={acc} value={acc} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{acc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Canvas + Interactive Cell Inspector */}
      <div className={`grid grid-cols-1 ${isMini ? "lg:grid-cols-12 gap-3 flex-1 min-h-0" : "lg:grid-cols-3 gap-6"} items-stretch`}>
        {/* 3D Canvas Column */}
        <div className={`${isMini ? "lg:col-span-7 flex flex-col justify-between" : "lg:col-span-2 space-y-3"}`}>
          {/* Controls Bar above Canvas */}
          <div className="flex justify-between items-center text-[10px] sm:text-xs pb-1">
            <div className="flex items-center gap-1.5">
              <span className={`font-bold flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                <Compass className="w-3 h-3 text-sky-500" /> Legenda:
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-semibold border border-amber-500/40 text-[9.5px]">Contas</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 font-semibold border border-blue-500/40 text-[9.5px]">Tempo</span>
              <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-semibold border border-yellow-500/40 text-[9.5px]">Regiões</span>
            </div>

            <div className={`flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-600"} text-[10px]`}>
              <MousePointerClick className="w-3 h-3 text-emerald-500" />
              <span>Clique no cubo para inspecionar</span>
            </div>
          </div>

          {/* WebGL 3D Canvas */}
          <div className={`relative w-full ${isMini ? "h-[340px] sm:h-[350px]" : "h-[420px]"} rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-2xl`}>
            {/* Fixed Screen Legend Panel over 3D Canvas */}
            <div className={`absolute top-2.5 left-2.5 z-20 bg-slate-900/95 border border-slate-700/80 backdrop-blur-md ${isMini ? "p-2 rounded-xl text-[10px] max-w-[200px]" : "p-3 rounded-2xl text-xs max-w-xs"} shadow-2xl space-y-1 pointer-events-none`}>
              <div className="flex items-center gap-1 text-sky-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-800 pb-1">
                <Box className="w-3 h-3 text-sky-400" /> Visualizador WebGL
              </div>
              <div className="space-y-0.5 text-[10px] text-slate-300 leading-tight">
                <div>• <span className="text-sky-300 font-semibold">Altura (Y):</span> Margem %</div>
                <div>• <span className="text-amber-300 font-semibold">Cor:</span> Vendas / Contas</div>
                <div>• <span className="text-emerald-300 font-semibold">Profundidade:</span> Períodos</div>
              </div>
            </div>

            <Canvas camera={{ position: [5.2, 4.0, 5.2], fov: 38 }}>
              <ThreeDScene
                selectedCellId={selectedVoxel?.cellId || null}
                onSelectVoxel={(voxel) => setSelectedVoxel(voxel)}
                records={filteredRecords}
                dimensions={dimensions}
                mode={mode}
                selectedYear={selectedYear}
                selectedAccount={selectedAccount}
                formatBRL={formatBRL}
              />
            </Canvas>

            <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 border border-slate-700 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-300 font-semibold flex items-center gap-1 shadow-md z-10 pointer-events-none">
              <RotateCcw className="w-3 h-3 text-sky-400" />
              <span>Gire com o mouse</span>
            </div>
          </div>
        </div>

        {/* Interactive Cell Inspector Panel */}
        <div className={`${
          isMini
            ? "lg:col-span-5 p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 h-full overflow-hidden"
            : "p-5 rounded-3xl border space-y-4"
        } transition-all duration-300 ${
          isDark ? "bg-slate-950/80 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200"
        }`}>
          <div className={`flex items-center gap-1.5 font-bold border-b ${isMini ? "pb-1.5" : "pb-3"} ${isDark ? "text-emerald-400 border-slate-800" : "text-emerald-600 border-slate-200"}`}>
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h3 className={`${isMini ? "text-xs" : "text-sm"} font-bold`}>Painel de Inspeção OLAP 3D</h3>
          </div>

          {(() => {
            const sliceTotalVendas = filteredRecords.reduce((sum, r) => sum + (r.soma_vendas || 0), 0);
            const sliceAvgLucro = filteredRecords.length > 0
              ? filteredRecords.reduce((sum, r) => sum + (r.media_lucro || 0), 0) / filteredRecords.length
              : 0;
            const sliceAvgMargem = filteredRecords.length > 0
              ? filteredRecords.reduce((sum, r) => sum + (r.margem_lucro_pct || 0), 0) / filteredRecords.length
              : 0;

            const accountLabel = selectedVoxel
              ? selectedVoxel.account
              : selectedAccount !== "all"
              ? selectedAccount
              : "Todas as Contas (Consolidado)";

            const yearLabel = selectedVoxel
              ? `${selectedVoxel.year} — ${selectedVoxel.quarter}`
              : selectedYear !== "all"
              ? `Ano ${selectedYear}`
              : `Todos os Anos (${dimensions.tempo?.length || 0})`;

            const monetaryVal = selectedVoxel
              ? selectedVoxel.somaVendas
              : sliceTotalVendas;

            const margemVal = selectedVoxel
              ? selectedVoxel.margemPct
              : sliceAvgMargem;

            const resultadoVal = selectedVoxel
              ? selectedVoxel.mediaLucro
              : sliceAvgLucro;

            const regionLabel = selectedVoxel
              ? selectedVoxel.region
              : "Visão Consolidada";

            return (
              <div className={`${isMini ? "space-y-2 flex-1 flex flex-col justify-between" : "space-y-4"} animate-in fade-in duration-200`}>
                <div className={`${isMini ? "p-2 rounded-xl" : "p-3.5 rounded-2xl"} border space-y-0.5 ${isDark ? "bg-emerald-950/40 border-emerald-500/40" : "bg-emerald-50 border-emerald-200"}`}>
                  <div className={`text-[9.5px] font-bold uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>Conta / Item Selecionado</div>
                  <div className={`font-extrabold truncate ${isMini ? "text-xs" : "text-base"} ${isDark ? "text-white" : "text-slate-900"}`}>{accountLabel}</div>
                </div>

                <div className={`${isMini ? "p-2.5 rounded-xl" : "p-4 rounded-2xl"} border space-y-0.5 ${isDark ? "bg-gradient-to-br from-emerald-900/40 to-sky-900/40 border-emerald-500/50" : "bg-emerald-100/60 border-emerald-300"}`}>
                  <div className={`text-[9.5px] font-bold uppercase tracking-wider ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>Valor Consolidado (R$)</div>
                  <div className={`font-black font-mono ${isMini ? "text-lg" : "text-2xl"} ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                    {formatBRL(monetaryVal)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className={`${isMini ? "p-2 rounded-xl" : "p-3 rounded-2xl"} border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <div className={`text-[9px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Período</div>
                    <div className={`text-xs font-bold truncate ${isDark ? "text-sky-400" : "text-sky-700"}`}>{yearLabel}</div>
                  </div>

                  <div className={`${isMini ? "p-2 rounded-xl" : "p-3 rounded-2xl"} border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <div className={`text-[9px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Região</div>
                    <div className={`text-xs font-bold truncate ${isDark ? "text-amber-400" : "text-amber-700"}`}>{regionLabel}</div>
                  </div>
                </div>

                <div className={`${isMini ? "p-2 rounded-xl" : "p-3.5 rounded-2xl"} border space-y-1.5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className={`font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Margem %:</span>
                    <span className={`font-bold ${isDark ? "text-sky-300" : "text-sky-700"}`}>{margemVal.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className={`font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Resultado Médio:</span>
                    <span className={`font-bold ${isDark ? "text-yellow-300" : "text-yellow-700"}`}>{formatBRL(resultadoVal)}</span>
                  </div>
                </div>

                {!isMini && (
                  <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2 ${isDark ? "bg-sky-950/30 border-sky-500/30 text-sky-200" : "bg-sky-50 border-sky-200 text-sky-900"}`}>
                    <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>
                      <b>Fatiamento Reativo OLAP:</b> Interseção ativa para <b>{accountLabel}</b> no período <b>{yearLabel}</b>. Valor Consolidado: <b>{formatBRL(monetaryVal)}</b>.
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Explicative Guide Cards (Rendered only on full page) */}
      {!isMini && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"} space-y-2`}>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>1. Eixo X — Demonstração ({mode})</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Representa as contas contábeis e demonstrativos (ex: Receita Operacional, Custos Operacionais, Lucro Líquido ou FCO).
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"} space-y-2`}>
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <Calendar className="w-4 h-4" />
              <span>2. Eixo Y — Série Temporal</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Representa a linha do tempo para análise de tendência. Selecione o ano no filtro superior para destacar o corte temporal no cubo 3D.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"} space-y-2`}>
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>3. Reatividade Instantânea</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Qualquer simulação realizada no painel principal reavalia automaticamente as fatias tridimensionais do cubo em milissegundos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
