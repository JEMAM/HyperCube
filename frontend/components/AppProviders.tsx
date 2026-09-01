"use client";

import React from "react";
import { PreferencesProvider } from "./PreferencesContext";
import { AgentExecutionProvider } from "./AgentExecutionContext";
import { AuthProvider } from "./AuthContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <AgentExecutionProvider>
          {children}
        </AgentExecutionProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
}
