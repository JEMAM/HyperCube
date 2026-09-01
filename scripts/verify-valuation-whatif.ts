import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1500, height: 950 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 30000 });

  // If Config modal is open, close it
  console.log("Checking for config modal...");
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

  // Close any modal again if opened
  await page.keyboard.press("Escape");

  // Take screenshot of Valuation with What-If deck expanded
  console.log("Capturing What-If deck screenshot...");
  await page.screenshot({
    path: "C:/Users/edumo/.gemini/antigravity-ide/brain/f21c8acf-2df1-4c72-9811-28fbc55dc8bf/.tempmediaStorage/valuation_whatif_deck.png",
    fullPage: false
  });

  // Click on "Cenário Otimista (Bull)" to test reactive What-If propagation
  console.log("Clicking Bull Scenario preset...");
  const bullBtn = page.locator("button:has-text('Cenário Otimista (Bull)'), button:has-text('Bull Scenario')").first();
  if (await bullBtn.isVisible()) {
    await bullBtn.click({ force: true });
    await page.waitForTimeout(2500);
    console.log("Capturing Bull Scenario propagation screenshot...");
    await page.screenshot({
      path: "C:/Users/edumo/.gemini/antigravity-ide/brain/f21c8acf-2df1-4c72-9811-28fbc55dc8bf/.tempmediaStorage/valuation_bull_propagation.png",
      fullPage: false
    });
  }

  // Click on Tab 5: "5. Metodologias & Parâmetros dos Indicadores"
  console.log("Clicking Tab 5: Metodologias & Parâmetros dos Indicadores...");
  const tab5 = page.locator("button:has-text('5. Metodologias & Parâmetros dos Indicadores'), button:has-text('Calculation Methodologies')").first();
  await tab5.waitFor({ state: "visible", timeout: 10000 });
  await tab5.click({ force: true });

  await page.waitForTimeout(2500);

  console.log("Capturing Tab 5 Methodologies & Parameters screenshot...");
  await page.screenshot({
    path: "C:/Users/edumo/.gemini/antigravity-ide/brain/f21c8acf-2df1-4c72-9811-28fbc55dc8bf/.tempmediaStorage/valuation_methodologies_tab.png",
    fullPage: false
  });

  await browser.close();
  console.log("Verification completed successfully!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
