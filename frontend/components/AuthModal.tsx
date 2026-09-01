"use client";

import React, { useState } from "react";
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  KeyRound,
  Zap
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { usePreferences } from "./PreferencesContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess
}: AuthModalProps) {
  const { login, register, savedTestAccounts } = useAuth();
  const { theme, language } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await login(email, password);
        if (res.success) {
          setSuccessMsg(isEn ? "Login successful! Entering platform..." : "Login realizado com sucesso! Entrando...");
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 400);
        } else {
          setErrorMsg(res.error || (isEn ? "Authentication failed" : "Falha ao autenticar"));
        }
      } else {
        const res = await register(name, email, password, company, role);
        if (res.success) {
          setSuccessMsg(isEn ? "Account registered and saved locally in SQLite! Entering platform..." : "Conta cadastrada e salva no SQLite local! Entrando...");
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 500);
        } else {
          setErrorMsg(res.error || (isEn ? "Registration failed" : "Falha no cadastro"));
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isEn ? "Unexpected error" : "Erro inesperado"));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (account: typeof savedTestAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await login(account.email, account.password);
      if (res.success) {
        setSuccessMsg(isEn ? `Logged in as ${account.label}!` : `Entrando como ${account.label}!`);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 400);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-gradient-to-tr from-anaplan-coral/20 to-sky-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white dark:bg-[#0c2340] border border-slate-200 dark:border-[#14335a] rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0c2340] via-[#14335a] to-[#0c2340] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-anaplan-coral to-orange-400 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              HyperCube Platform
            </span>
          </div>

          <h3 className="text-xl font-black text-white">
            {mode === "login" 
              ? (isEn ? "Access Enterprise Platform" : "Acessar Plataforma Corporativa")
              : (isEn ? "Create Test Account" : "Criar Conta de Acesso")}
          </h3>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            {mode === "login"
              ? (isEn ? "Sign in to access connected planning, DAG and OLAP cubes." : "Faça login para acessar o planejamento conectado e simulações.")
              : (isEn ? "Register any credentials to test immediately (persisted in SQLite)." : "Permitido qualquer cadastro para teste. Salvo no SQLite local.")}
          </p>

          {/* SQLite Local Database Guarantee Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isEn ? "Local SQLite Persistence (users.db)" : "Banco Local SQLite Ativo (users.db)"}</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-[#14335a] bg-slate-50 dark:bg-[#071526]">
          <button
            onClick={() => { setMode("login"); setErrorMsg(null); }}
            className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === "login"
                ? "border-b-2 border-anaplan-coral text-anaplan-coral bg-white dark:bg-[#0c2340]"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isEn ? "Login (Sign In)" : "Entrar (Login)"}</span>
          </button>
          <button
            onClick={() => { setMode("register"); setErrorMsg(null); }}
            className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === "register"
                ? "border-b-2 border-anaplan-coral text-anaplan-coral bg-white dark:bg-[#0c2340]"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isEn ? "Register (Sign Up)" : "Cadastrar (Novo Usuário)"}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isEn ? "Full Name" : "Nome Completo"}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder={isEn ? "e.g. Maria Silva" : "Ex: Maria Silva"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-anaplan-coral"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {isEn ? "Work Email (Any valid for testing)" : "E-mail de Trabalho (Qualquer para teste)"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder={isEn ? "name@company.com" : "usuario@empresa.com.br"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-anaplan-coral"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {isEn ? "Password" : "Senha"}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-anaplan-coral"
              />
            </div>
          </div>

          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isEn ? "Company (Optional)" : "Empresa (Opcional)"}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    placeholder="S.A. / LTDA"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-anaplan-coral"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isEn ? "Role" : "Cargo"}
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    placeholder="FP&A / CFO"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-anaplan-coral"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-anaplan-coral to-orange-500 hover:from-orange-500 hover:to-anaplan-coral text-white text-xs font-black transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === "login" 
                    ? (isEn ? "Enter Application" : "Entrar no Aplicativo") 
                    : (isEn ? "Register & Enter" : "Cadastrar e Entrar")}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Test Accounts Section */}
        <div className="px-6 pb-6 pt-2 border-t border-slate-200 dark:border-[#14335a] bg-slate-50/50 dark:bg-[#071526]/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {isEn ? "1-Click Demo Accounts:" : "Acesso Rápido para Teste (1-Clique):"}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{isEn ? "Saved in SQLite" : "Salvos no SQLite"}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {savedTestAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickDemo(acc)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-anaplan-coral text-left transition group shadow-sm"
              >
                <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 truncate group-hover:text-anaplan-coral">
                  {acc.label}
                </p>
                <p className="text-[10px] text-slate-700 dark:text-slate-300 truncate font-medium">
                  {acc.email}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
