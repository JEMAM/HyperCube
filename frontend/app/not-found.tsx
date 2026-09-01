import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 space-y-4">
      <h2 className="text-2xl font-bold text-amber-500">404 - Página Não Encontrada</h2>
      <p className="text-xs text-slate-400">O recurso ou rota solicitada não foi encontrada no HyperCube.</p>
      <Link href="/" className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition">
        Voltar ao Início
      </Link>
    </div>
  );
}
