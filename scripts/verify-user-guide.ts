import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1500, height: 950 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 30000 });

  // Dismiss any modal if open
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  const closeBtn = page.locator("button:has(svg.lucide-x), button:has-text('Salvar'), button:has-text('Fechar')").first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // Click on "Guia do Usuário & Manual"
  console.log("Clicking User Guide navigation button...");
  const guideNav = page.locator("button:has-text('Guia do Usuário'), button:has-text('User Guide')").first();
  await guideNav.waitFor({ state: "visible", timeout: 15000 });
  await guideNav.click();

  await page.waitForTimeout(2500);
  await page.keyboard.press("Escape");

  console.log("Capturing User Guide top & Quick Start screenshot...");
  await page.screenshot({
    path: "C:/Users/edumo/.gemini/antigravity-ide/brain/f21c8acf-2df1-4c72-9811-28fbc55dc8bf/.tempmediaStorage/user_guide_quickstart.png",
    fullPage: false
  });

  // Scroll to show Balance Sheet (BP) & Fleuriet and Valuation modules
  console.log("Scrolling to BP & Valuation modules...");
  const bpSec = page.locator("#sec-bp").first();
  if (await bpSec.isVisible()) {
    await bpSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
  }

  console.log("Capturing User Guide BP & Valuation screenshot...");
  await page.screenshot({
    path: "C:/Users/edumo/.gemini/antigravity-ide/brain/f21c8acf-2df1-4c72-9811-28fbc55dc8bf/.tempmediaStorage/user_guide_bp_valuation.png",
    fullPage: false
  });

  await browser.close();
  console.log("User Guide verification completed successfully!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
