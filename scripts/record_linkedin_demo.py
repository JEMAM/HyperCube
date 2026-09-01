import os
import sys
import time
import shutil
import cv2
from playwright.sync_api import sync_playwright

def record_perfect_linkedin_demo():
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "media")
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.makedirs(output_dir, exist_ok=True)

    print(f"[Record] Starting Perfect LinkedIn Demo recording in Full HD (1920x1080)...")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-web-security",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--enable-webgl",
                "--use-gl=angle",
                "--use-angle=swiftshader"
            ]
        )
        
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=output_dir,
            record_video_size={"width": 1920, "height": 1080},
            locale="pt-BR"
        )
        
        # Avoid setup modal interrupting flow
        context.add_init_script("""
            sessionStorage.setItem('hypercube_setup_completed', 'true');
            localStorage.setItem('hypercube_theme', 'dark');
        """)
        
        page = context.new_page()
        
        # =====================================================================
        # SCENE 1: Landing Page & Hero Executive Planning View (0:00 - 0:18)
        # =====================================================================
        print("[Scene 1] Apresentação da Plataforma & Executive Planning View...")
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(3000)

        # Toggle between Line Chart and DRE statement table on the Executive Planning Card
        try:
            doc_btn = page.locator("button:has-text('Demonstrativo DRE')").first
            if doc_btn.is_visible():
                doc_btn.click()
                page.wait_for_timeout(2500)
                
            chart_btn = page.locator("button:has-text('Gráfico de Linhas')").first
            if chart_btn.is_visible():
                chart_btn.click()
                page.wait_for_timeout(2500)
        except Exception as e:
            print("Hero toggle:", e)

        # Smooth scroll through the 3 pillars on Landing Page
        for y in [300, 600, 900]:
            page.evaluate(f"window.scrollTo({{ top: {y}, behavior: 'smooth' }})")
            page.wait_for_timeout(1000)

        # Click Tab 2: Cubo OLAP 3D on Landing Page
        try:
            cube_tab = page.locator("button:has-text('2. Cubo OLAP 3D Interativo')").first
            if cube_tab.is_visible():
                cube_tab.click()
                page.wait_for_timeout(3000)
        except Exception as e:
            print("Landing cube tab:", e)

        # Click Tab 3: DRE & What-If on Landing Page
        try:
            dre_tab = page.locator("button:has-text('3. Demonstração DRE & What-If')").first
            if dre_tab.is_visible():
                dre_tab.click()
                page.wait_for_timeout(2500)
        except Exception as e:
            print("Landing DRE tab:", e)

        # =====================================================================
        # SCENE 2: Visão Geral & Ingestão de Balanços (0:18 - 0:32)
        # =====================================================================
        print("[Scene 2] Visão Geral & Ingestão...")
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        page.wait_for_timeout(800)
        page.click("text=Visão Geral & Ingestão")
        page.wait_for_timeout(3500)

        # =====================================================================
        # SCENE 3: Planejamento Conectado N-Dimensional (MultiDimGrid) (0:32 - 0:52)
        # =====================================================================
        print("[Scene 3] Planejamento Conectado (N-D)...")
        page.click("text=Planejamento Conectado (N-D)")
        page.wait_for_timeout(4000)

        # =====================================================================
        # SCENE 4: Demonstração DRE & Gráfico de Linhas Dinâmico (0:52 - 1:15)
        # =====================================================================
        print("[Scene 4] Demonstração DRE & Gráficos Dinâmicos...")
        page.click("text=Demonstração DRE")
        page.wait_for_timeout(3000)

        # Switch to Dynamic Line Charts
        try:
            line_tab = page.locator("button:has-text('Gráficos Dinâmicos de Linhas por Contas DRE')").first
            if line_tab.is_visible():
                line_tab.click()
                page.wait_for_timeout(4000)

            exec_tab = page.locator("button:has-text('Painel Executivo (Planning View)')").first
            if exec_tab.is_visible():
                exec_tab.click()
                page.wait_for_timeout(3000)
        except Exception as e:
            print("DRE tabs:", e)

        # =====================================================================
        # SCENE 5: Cubo 3D OLAP Interativo WebGL (1:15 - 1:35)
        # =====================================================================
        print("[Scene 5] Cubo OLAP 3D em WebGL...")
        page.click("text=Cubo 3D OLAP Interativo")
        page.wait_for_timeout(4500)

        # =====================================================================
        # SCENE 6: Macroeconomia & BCB (Focus Semanal e SGS) (1:35 - 1:55)
        # =====================================================================
        print("[Scene 6] Macroeconomia & BCB...")
        page.click("text=Macroeconomia & BCB")
        page.wait_for_timeout(3500)

        # Interact with Focus Year 2027 and 2026
        try:
            page.locator("button:has-text('2027')").first.click()
            page.wait_for_timeout(2000)
            page.locator("button:has-text('2026')").first.click()
            page.wait_for_timeout(2000)

            # Click AI Question Suggestion Chip
            page.locator("button:has-text('Qual a Meta Selic do Copom?')").first.click()
            page.wait_for_timeout(4500)
        except Exception as e:
            print("Macro Focus:", e)

        # =====================================================================
        # SCENE 7: Fechamento / Retorno à Landing Page (1:55 - 2:05)
        # =====================================================================
        print("[Scene 7] Conclusão da Demonstração...")
        page.click("text=Apresentação da Plataforma")
        page.wait_for_timeout(4000)

        # Save and close video
        page_video = page.video
        context.close()
        browser.close()

        if page_video:
            recorded_file = page_video.path()
            final_webm_root = os.path.join(root_dir, "Demonstracao_HyperCube_LinkedIn.webm")
            final_webm_media = os.path.join(output_dir, "Demonstracao_HyperCube_LinkedIn.webm")
            final_mp4_root = os.path.join(root_dir, "Demonstracao_HyperCube_LinkedIn.mp4")
            final_mp4_media = os.path.join(output_dir, "Demonstracao_HyperCube_LinkedIn.mp4")

            # Copy WebM
            shutil.copy2(recorded_file, final_webm_root)
            shutil.copy2(recorded_file, final_webm_media)
            print(f"[Export WebM] OK: {final_webm_root} ({os.path.getsize(final_webm_root) / (1024*1024):.2f} MB)")

            # Convert to High Quality MP4 using OpenCV
            print("[Export MP4] Converting frames to MP4 Full HD...")
            cap = cv2.VideoCapture(recorded_file)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1920
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 1080
            fps = cap.get(cv2.CAP_PROP_FPS) or 25.0

            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(final_mp4_root, fourcc, fps, (width, height))

            frames = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                out.write(frame)
                frames += 1

            cap.release()
            out.release()
            shutil.copy2(final_mp4_root, final_mp4_media)
            print(f"[Export MP4] OK: {final_mp4_root} ({frames} frames, {os.path.getsize(final_mp4_root) / (1024*1024):.2f} MB)")

if __name__ == "__main__":
    record_perfect_linkedin_demo()
