import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1500, height: 950 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 30000 });

  // Dismiss any modal
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const closeBtn = page.locator("button:has(svg.lucide-x), button:has-text('Salvar'), button:has-text('Fechar')").first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // Click on Valuation navigation button
  console.log("Navigating to Valuation tab...");
  const valuationNav = page.locator("button:has-text('Valuation Corporativo'), button:has-text('Corporate Valuation')").first();
  await valuationNav.waitFor({ state: "visible", timeout: 15000 });
  await valuationNav.click();

  await page.waitForTimeout(3000);
  await page.keyboard.press("Escape");

  // Ensure Tab 1 "1. Visão Geral & Football Field" is selected
  const tab1 = page.locator("button:has-text('1. Visão Geral & Football Field'), button:has-text('1. Valuation Overview')").first();
  if (await tab1.isVisible()) {
    await tab1.click({ force: true });
    await page.waitForTimeout(1500);
  }

  // Scroll down to show Football Field and FCFF chart clearly
  console.log("Scrolling to FCFF chart...");
  const fcffSection = page.locator("section:has-text('Fluxo de Caixa Livre da Firma Projetado (FCFF)')").first();
  await fcffSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  console.log("Capturing FCFF chart adjusted screenshot...");
  await page.screenshot({
    path: "C:/Users/edumo/.gemini/antigravity-ide/brain/f21c8acf-2df1-4c72-9811-28fbc55dc8bf/.tempmediaStorage/valuation_fcff_chart_adjusted.png",
    fullPage: false
  });

  await browser.close();
  console.log("FCFF verification screenshot captured successfully!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
