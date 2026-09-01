import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "HyperCube — Connected Planning & AI Financial Engine",
  description: "Motor de cálculo multidimensional reativo e planejamento conectado para DRE, DFC e Balanço Patrimonial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

