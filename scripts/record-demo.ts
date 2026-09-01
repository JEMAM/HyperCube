import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

async function runRecordDemo() {
  console.log("🚀 [Playwright] Iniciando gravação Full HD (1080p) no Tema LIGHT com todas as 10 páginas e demonstração completa de IA...");

  const outputDir = path.resolve(__dirname, "../remotion/public/recordings");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const finalVideoPath = path.join(outputDir, "hypercube-demo.mp4");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=1920,1080",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 },
    },
    colorScheme: "light",
  });

  const page = await context.newPage();

  try {
    console.log("🌐 Conectando à aplicação HyperCube em http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(1200);

    // Enforce Light Theme
    await page.evaluate(() => {
      localStorage.setItem("hypercube_theme", "light");
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    });
    await page.waitForTimeout(800);

    console.log("🤖 [1. IA & Modelos] Demonstrando seleção de modelos (Ollama, Claude, GPT, Groq, Gemini)...");
    
    // Check if Welcome Setup Modal is open
    const modalSubmit = page.locator('button[type="submit"]').first();
    if (await modalSubmit.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Showcase frontier models
      const claudeBtn = page.locator("button:has-text('Claude')").first();
      if (await claudeBtn.isVisible().catch(() => false)) {
        await claudeBtn.click();
        await page.waitForTimeout(600);
      }

      const gptBtn = page.locator("button:has-text('GPT-5')").first();
      if (await gptBtn.isVisible().catch(() => false)) {
        await gptBtn.click();
        await page.waitForTimeout(600);
      }

      // Select Local Ollama Model
      const deepseekBtn = page.locator("button:has-text('DeepSeek-R1')").first();
      if (await deepseekBtn.isVisible().catch(() => false)) {
        await deepseekBtn.click();
        await page.waitForTimeout(800);
      }

      // Highlight the local endpoint http://localhost:11434
      const endpointInput = page.locator('input[type="text"]').first();
      if (await endpointInput.isVisible().catch(() => false)) {
        await endpointInput.hover();
        await page.waitForTimeout(700);
      }

      // Confirm Model and Close Modal
      if (await modalSubmit.isVisible().catch(() => false)) {
        await modalSubmit.click();
        await page.waitForTimeout(1500);
      }
    } else {
      // If modal was already closed, open from header if available
      const settingsBtn = page.locator('button[title*="Configurar"]').first();
      if (await settingsBtn.isVisible().catch(() => false)) {
        await settingsBtn.click();
        await page.waitForTimeout(1000);
        const submitInside = page.locator('button[type="submit"]').first();
        if (await submitInside.isVisible().catch(() => false)) {
          await submitInside.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    console.log("✨ [2. Apresentação da Plataforma] Rolando com fluidez pela Landing Page...");
    await page.evaluate(() => window.scrollBy({ top: 750, behavior: "smooth" }));
    await page.waitForTimeout(1000);
    const cubePillar = page.locator("button:has-text('2. Cubo OLAP 3D'), button:has-text('Cubo OLAP 3D')").first();
    if (await cubePillar.isVisible()) {
      await cubePillar.click();
      await page.waitForTimeout(1500);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await page.waitForTimeout(1000);

    console.log("🏢 [3. Visão Geral & Ingestão] Setup, Ingestores e Seleção Multi-Empresas...");
    const overviewBtn = page.locator("nav button:has-text('Visão Geral & Ingestão'), button:has-text('Visão Geral')").first();
    if (await overviewBtn.isVisible()) {
      await overviewBtn.click();
      await page.waitForTimeout(1800);
      await page.evaluate(() => window.scrollBy({ top: 380, behavior: "smooth" }));
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      await page.waitForTimeout(800);
    }

    console.log("📈 [4. Macroeconomia & BCB] Indicadores do Banco Central, Copom e Projeções...");
    const ecoBtn = page.locator("nav button:has-text('Macroeconomia & BCB'), button:has-text('Macroeconomia')").first();
    if (await ecoBtn.isVisible()) {
      await ecoBtn.click();
      await page.waitForTimeout(1800);
      await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      await page.waitForTimeout(800);
    }

    console.log("📊 [5. Planejamento Conectado N-D] Grade Multidimensional OLAP...");
    const planningBtn = page.locator("nav button:has-text('Planejamento Conectado (N-D)'), button:has-text('Planejamento')").first();
    if (await planningBtn.isVisible()) {
      await planningBtn.click();
      await page.waitForTimeout(1800);
      await page.evaluate(() => window.scrollBy({ top: 320, behavior: "smooth" }));
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      await page.waitForTimeout(800);
    }

    console.log("📑 [6. Demonstração DRE] Simulação 'What-If' Reativa e Diagnóstico pelo Agente IA Local...");
    const dreBtn = page.locator("nav button:has-text('Demonstração DRE')").first();
    if (await dreBtn.isVisible()) {
      await dreBtn.click();
      await page.waitForTimeout(1800);

      // Execute simulation
      const simBtn = page.locator("button:has-text('Executar Simulação'), button:has-text('Simular')").first();
      if (await simBtn.isVisible()) {
        await simBtn.hover();
        await page.waitForTimeout(600);
        await simBtn.click();
        await page.waitForTimeout(2500);
      }

      await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
      await page.waitForTimeout(1800);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      await page.waitForTimeout(800);
    }

    console.log("💧 [7. Fluxo de Caixa DFC] Demonstração de Liquidez e Variação de Caixa...");
    const dfcBtn = page.locator("nav button:has-text('Fluxo de Caixa (DFC)'), button:has-text('Fluxo de Caixa')").first();
    if (await dfcBtn.isVisible()) {
      await dfcBtn.click();
      await page.waitForTimeout(1800);
      await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      await page.waitForTimeout(800);
    }

    console.log("🕸️ [8. Grafo DAG de Dependências] Navegação no Grafo Topológico Reativo...");
    const dagBtn = page.locator("nav button:has-text('Grafo DAG de Dependências'), button:has-text('Grafo DAG')").first();
    if (await dagBtn.isVisible()) {
      await dagBtn.click();
      await page.waitForTimeout(2200);
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      await page.waitForTimeout(800);
    }

    console.log("🧊 [9. Cubo 3D OLAP Interativo] Visualização Multidimensional WebGL...");
    const cubeBtn = page.locator("nav button:has-text('Cubo 3D OLAP Interativo'), button:has-text('Cubo 3D')").first();
    if (await cubeBtn.isVisible()) {
      await cubeBtn.click();
      await page.waitForTimeout(2500);
    }

    console.log("📖 [10. Guia do Usuário & Manual] Documentação Completa e Manual...");
    const guideBtn = page.locator("nav button:has-text('Guia do Usuário & Manual'), button:has-text('Guia')").first();
    if (await guideBtn.isVisible()) {
      await guideBtn.click();
      await page.waitForTimeout(1800);
      await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      await page.waitForTimeout(1000);
    }

    console.log("🎉 Gravação Full HD (1080p) finalizada com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante gravação:", error);
  } finally {
    const videoObj = page.video();
    await page.close();
    await context.close();
    await browser.close();

    if (videoObj) {
      const tempVideoPath = await videoObj.path();
      if (fs.existsSync(tempVideoPath)) {
        fs.copyFileSync(tempVideoPath, finalVideoPath);
        console.log(`✨ Vídeo gravado com sucesso em: ${finalVideoPath}`);
      }
    }
  }
}

runRecordDemo().catch(console.error);
