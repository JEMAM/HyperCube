#!/usr/bin/env python3
"""
gerar_video.py — Automação de Vídeo Institucional HyperCube (60s)
=================================================================
Gera narração via Google Cloud Text-to-Speech e monta o vídeo final
com moviepy, legendas estilizadas e transições crossfade.

Requisitos:
    pip install google-cloud-text-to-speech moviepy Pillow numpy

Uso:
    1. Exporte GOOGLE_APPLICATION_CREDENTIALS apontando para seu JSON de credenciais.
    2. (Opcional) Coloque imagens/vídeos das cenas em ./assets/cena_01.png, cena_02.mp4 etc.
    3. Execute:  python gerar_video.py
    4. O vídeo final será gerado em ./output/hypercube_institucional_60s.mp4

Autor: José Eduardo Moraes (FP&A) · HyperCube Connected Planning
"""

import os
import sys
import json
import textwrap
from pathlib import Path
from typing import List, Tuple, Optional

# ---------------------------------------------------------------------------
# Dependências
# ---------------------------------------------------------------------------
try:
    from google.cloud import texttospeech
except ImportError:
    print("❌ Instale: pip install google-cloud-text-to-speech")
    sys.exit(1)

try:
    from moviepy.editor import (
        VideoFileClip, ImageClip, AudioFileClip, CompositeVideoClip,
        TextClip, concatenate_videoclips, ColorClip, CompositeAudioClip
    )
    from moviepy.video.fx.all import crossfadein, crossfadeout, fadein, fadeout
except ImportError:
    print("❌ Instale: pip install moviepy")
    sys.exit(1)

try:
    from PIL import Image, ImageDraw, ImageFont
    import numpy as np
except ImportError:
    print("❌ Instale: pip install Pillow numpy")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Configurações Globais
# ---------------------------------------------------------------------------
WIDTH, HEIGHT = 1920, 1080
FPS = 24
CROSSFADE_DURATION = 0.5  # segundos de crossfade entre cenas

# Cores da marca HyperCube
NAVY = (12, 35, 64)        # #0C2340
CORAL = (255, 79, 48)      # #FF4F30
CYAN = (56, 189, 248)      # #38BDF8
WHITE = (255, 255, 255)
SLATE_900 = (15, 23, 42)   # #0F172A

# Diretórios
ASSETS_DIR = Path("./assets")
OUTPUT_DIR = Path("./output")
AUDIO_DIR = Path("./output/audio")

for d in [ASSETS_DIR, OUTPUT_DIR, AUDIO_DIR]:
    d.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Roteiro: 9 Cenas
# ---------------------------------------------------------------------------
ROTEIRO: List[dict] = [
    {
        "id": 1,
        "titulo": "Abertura & Marca",
        "duracao": 5.0,
        "legenda": "HyperCube — Connected Planning Engine",
        "narracao": (
            "E se toda decisão financeira da sua empresa "
            "pudesse ser simulada em tempo real?"
        ),
        "asset": "cena_01",
    },
    {
        "id": 2,
        "titulo": "Sala de Reunião",
        "duracao": 7.0,
        "legenda": "Reunião trimestral de FP&A — Análise Vale S.A.",
        "narracao": (
            "Imagine sua reunião de éfe-pê-anda trimestral. "
            "O diretor abre o HyperCube e toda a demonstração "
            "financeira da empresa já está carregada."
        ),
        "asset": "cena_02",
    },
    {
        "id": 3,
        "titulo": "DRE & Simulação What-If",
        "duracao": 10.0,
        "legenda": "DRE: O que acontece se cortarmos 5% do SG&A?",
        "narracao": (
            "No painel de DRÊ, ele simula um corte de 5% "
            "nas despesas administrativas. Em milissegundos, "
            "o motor topológico propaga o impacto por 18 nós "
            "do grafo contábil — e o Agente I.A. gera o "
            "diagnóstico: o EBITDA sobe instantaneamente."
        ),
        "asset": "cena_03",
    },
    {
        "id": 4,
        "titulo": "DFC — Fluxo de Caixa",
        "duracao": 8.0,
        "legenda": "DFC: Conciliação direta FCO + FCI + FCF",
        "narracao": (
            "No Fluxo de Caixa, o mesmo princípio: cada conta "
            "é um nó do DAG — o Caixa Final se recalcula em "
            "cascata. O time pode projetar cenários de liquidez "
            "em segundos."
        ),
        "asset": "cena_04",
    },
    {
        "id": 5,
        "titulo": "BP — Balanço Patrimonial",
        "duracao": 8.0,
        "legenda": "BP: Equilíbrio contábil Δ = 0,00 · Fleuriet + Dupont",
        "narracao": (
            "O Balanço Patrimonial aplica automaticamente "
            "a decomposição Dupont do ROE e o modelo Fleuriet "
            "de capital de giro. 29 nós, zero desbalanceamento."
        ),
        "asset": "cena_05",
    },
    {
        "id": 6,
        "titulo": "Grafo DAG Topológico",
        "duracao": 6.0,
        "legenda": "Grafo DAG Topológico: 18 nós DRE · 14 nós DFC · 29 nós BP",
        "narracao": (
            "Por trás de tudo, o Grafo DAG Topológico — construído "
            "em Rustworkx — garante recálculo em menos de dois "
            "milissegundos, sem referências circulares."
        ),
        "asset": "cena_06",
    },
    {
        "id": 7,
        "titulo": "Cubo OLAP 3D",
        "duracao": 6.0,
        "legenda": "Cubo OLAP N-D: Slice & Dice em tempo real",
        "narracao": (
            "O Cubo OLAP êne-dimensional permite fatiamento "
            "tridimensional em tempo real — cada célula é "
            "navegável, cada dimensão é filtrável."
        ),
        "asset": "cena_07",
    },
    {
        "id": 8,
        "titulo": "Economia & Valuation",
        "duracao": 5.0,
        "legenda": "Macroeconomia BCB + Valuation DCF",
        "narracao": (
            "Integrado ao Banco Central do Brasil e modelos "
            "de Valuation DCF — tudo em uma única plataforma."
        ),
        "asset": "cena_08",
    },
    {
        "id": 9,
        "titulo": "Fechamento & CTA",
        "duracao": 5.0,
        "legenda": "HyperCube · A infraestrutura de decisão para a Empresa Agêntica",
        "narracao": (
            "HyperCube — a infraestrutura de decisão para a "
            "empresa agêntica. Agende uma demonstração."
        ),
        "asset": "cena_09",
    },
]


# ---------------------------------------------------------------------------
# 1) NARRAÇÃO — Google Cloud Text-to-Speech
# ---------------------------------------------------------------------------
def gerar_narracoes() -> List[Path]:
    """Gera arquivos MP3 de narração para cada cena via Google Cloud TTS."""
    print("\n🎙️  Gerando narração via Google Cloud Text-to-Speech...\n")

    client = texttospeech.TextToSpeechClient()

    # Voz Neural de alta qualidade em pt-BR
    voice = texttospeech.VoiceSelectionParams(
        language_code="pt-BR",
        name="pt-BR-Neural2-C",  # Voz masculina profissional
        ssml_gender=texttospeech.SsmlVoiceGender.MALE,
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=1.05,  # Ligeiramente acelerado para caber em 60s
        pitch=0.0,           # Tom natural
        volume_gain_db=2.0,  # Ganho leve para clareza
        effects_profile_id=["headphone-class-device"],
    )

    audio_paths: List[Path] = []

    for cena in ROTEIRO:
        output_path = AUDIO_DIR / f"narracao_cena_{cena['id']:02d}.mp3"

        # Usa SSML para controle fino de pausas e ênfase
        ssml_text = f"""
        <speak>
            <prosody rate="105%" pitch="+0st">
                {cena['narracao']}
            </prosody>
        </speak>
        """

        synthesis_input = texttospeech.SynthesisInput(ssml=ssml_text)

        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config,
        )

        with open(output_path, "wb") as f:
            f.write(response.audio_content)

        print(f"  ✅ Cena {cena['id']:02d}: {output_path.name} ({len(response.audio_content):,} bytes)")
        audio_paths.append(output_path)

    print(f"\n🎤 {len(audio_paths)} arquivos de áudio gerados em {AUDIO_DIR}/\n")
    return audio_paths


# ---------------------------------------------------------------------------
# 2) FRAMES PLACEHOLDER — Para cenas sem asset externo
# ---------------------------------------------------------------------------
def criar_frame_placeholder(cena: dict) -> Path:
    """
    Cria um frame estático de placeholder para cenas que não possuem
    vídeo/imagem real capturado. Gera um card dark-mode estilizado.
    """
    img = Image.new("RGB", (WIDTH, HEIGHT), NAVY)
    draw = ImageDraw.Draw(img)

    # Tenta carregar fonte; fallback para default
    try:
        font_title = ImageFont.truetype("arial.ttf", 72)
        font_sub = ImageFont.truetype("arial.ttf", 36)
        font_small = ImageFont.truetype("arial.ttf", 24)
    except (IOError, OSError):
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_small = font_title

    # Retângulo central com borda coral
    margin = 120
    rect = [margin, margin, WIDTH - margin, HEIGHT - margin]
    draw.rounded_rectangle(rect, radius=32, fill=SLATE_900, outline=CORAL, width=3)

    # Título da cena
    title = f"CENA {cena['id']:02d}"
    draw.text(
        (WIDTH // 2, HEIGHT // 2 - 80),
        title,
        fill=CORAL,
        font=font_title,
        anchor="mm",
    )

    # Subtítulo
    draw.text(
        (WIDTH // 2, HEIGHT // 2 + 20),
        cena["titulo"],
        fill=WHITE,
        font=font_sub,
        anchor="mm",
    )

    # Instrução
    instrucao = "Substitua por screenrecording ou frame gerado por IA"
    draw.text(
        (WIDTH // 2, HEIGHT // 2 + 100),
        instrucao,
        fill=CYAN,
        font=font_small,
        anchor="mm",
    )

    # Marca d'água
    draw.text(
        (WIDTH // 2, HEIGHT - 60),
        "HyperCube - Connected Planning Engine",
        fill=(100, 116, 139),  # Slate-500
        font=font_small,
        anchor="mm",
    )

    path = ASSETS_DIR / f"placeholder_cena_{cena['id']:02d}.png"
    img.save(path, quality=95)
    return path


# ---------------------------------------------------------------------------
# 3) LEGENDAS ESTILIZADAS
# ---------------------------------------------------------------------------
def criar_legenda_clip(texto: str, duracao: float) -> CompositeVideoClip:
    """
    Cria um clip de legenda estilizada com fundo semi-transparente,
    posicionado na parte inferior do vídeo.
    """
    # Quebra texto longo em múltiplas linhas
    wrapped = textwrap.fill(texto, width=80)

    try:
        txt_clip = (
            TextClip(
                wrapped,
                fontsize=32,
                color="white",
                font="Arial-Bold",
                method="caption",
                size=(WIDTH - 200, None),
                align="center",
            )
            .set_duration(duracao)
            .set_position(("center", HEIGHT - 120))
        )
    except Exception:
        # Fallback se font não disponível
        txt_clip = (
            TextClip(
                wrapped,
                fontsize=32,
                color="white",
                method="caption",
                size=(WIDTH - 200, None),
                align="center",
            )
            .set_duration(duracao)
            .set_position(("center", HEIGHT - 120))
        )

    # Fundo semi-transparente para legibilidade
    bg_height = 80
    bg_clip = (
        ColorClip(
            size=(WIDTH, bg_height),
            color=(0, 0, 0),
        )
        .set_opacity(0.65)
        .set_duration(duracao)
        .set_position(("center", HEIGHT - 140))
    )

    return CompositeVideoClip(
        [bg_clip, txt_clip],
        size=(WIDTH, HEIGHT),
    ).set_duration(duracao)


# ---------------------------------------------------------------------------
# 4) MONTAGEM FINAL
# ---------------------------------------------------------------------------
def montar_video(audio_paths: List[Path]) -> Path:
    """
    Monta o vídeo final de 60 segundos com:
    - Takes visuais (assets ou placeholders)
    - Áudio narrado por cena
    - Legendas estilizadas
    - Crossfade entre cenas
    """
    print("\n🎬 Montando vídeo final...\n")

    clips_finais: List[VideoFileClip] = []

    for i, cena in enumerate(ROTEIRO):
        duracao = cena["duracao"]
        print(f"  🎞  Processando Cena {cena['id']:02d} — {cena['titulo']} ({duracao}s)")

        # --- Visual ---
        # Procura asset real (imagem ou vídeo)
        asset_path = None
        for ext in [".mp4", ".mov", ".webm", ".png", ".jpg", ".jpeg", ".webp"]:
            candidate = ASSETS_DIR / f"{cena['asset']}{ext}"
            if candidate.exists():
                asset_path = candidate
                break

        if asset_path and asset_path.suffix in [".mp4", ".mov", ".webm"]:
            # Vídeo existente
            visual = (
                VideoFileClip(str(asset_path))
                .resize((WIDTH, HEIGHT))
                .subclip(0, min(duracao, VideoFileClip(str(asset_path)).duration))
            )
            # Se vídeo é mais curto que a duração, faz loop
            if visual.duration < duracao:
                visual = visual.loop(duration=duracao)
        elif asset_path and asset_path.suffix in [".png", ".jpg", ".jpeg", ".webp"]:
            # Imagem estática
            visual = ImageClip(str(asset_path)).set_duration(duracao).resize((WIDTH, HEIGHT))
        else:
            # Gera placeholder
            placeholder_path = criar_frame_placeholder(cena)
            visual = ImageClip(str(placeholder_path)).set_duration(duracao)

        # --- Áudio ---
        audio_path = audio_paths[i]
        audio = AudioFileClip(str(audio_path))

        # Ajusta duração do visual para casar com áudio se necessário
        # (prioriza a duração definida no roteiro)
        visual = visual.set_duration(duracao)

        # Se o áudio é mais longo que a duração, corta; se mais curto, preenche com silêncio
        if audio.duration > duracao:
            audio = audio.subclip(0, duracao)

        # --- Legenda ---
        legenda = criar_legenda_clip(cena["legenda"], duracao)

        # --- Composição ---
        cena_clip = CompositeVideoClip(
            [visual, legenda],
            size=(WIDTH, HEIGHT),
        ).set_audio(audio).set_duration(duracao)

        # Aplica crossfade (exceto primeira e última cena)
        if i > 0:
            cena_clip = cena_clip.crossfadein(CROSSFADE_DURATION)
        if i < len(ROTEIRO) - 1:
            cena_clip = cena_clip.crossfadeout(CROSSFADE_DURATION)

        clips_finais.append(cena_clip)

    # --- Concatenação Final ---
    print(f"\n  🔗 Concatenando {len(clips_finais)} cenas com crossfade...")

    # Usa composição manual com offsets para crossfade suave
    video_final = concatenate_videoclips(
        clips_finais,
        method="compose",
        padding=-CROSSFADE_DURATION,  # Sobreposição para crossfade
    )

    # --- Exportação ---
    output_path = OUTPUT_DIR / "hypercube_institucional_60s.mp4"

    print(f"\n  📦 Exportando para {output_path}...")
    print(f"     Resolução: {WIDTH}x{HEIGHT} · FPS: {FPS} · Codec: H.264\n")

    video_final.write_videofile(
        str(output_path),
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        bitrate="8000k",
        preset="medium",
        threads=4,
        logger="bar",
    )

    # Duração real
    duracao_total = video_final.duration
    print(f"\n✅ Vídeo gerado com sucesso!")
    print(f"   📁 {output_path}")
    print(f"   ⏱  Duração: {duracao_total:.1f}s")
    print(f"   📐 {WIDTH}x{HEIGHT} @ {FPS}fps")
    print(f"   🎙  Narração: Google Cloud TTS (pt-BR-Neural2-C)")

    return output_path


# ---------------------------------------------------------------------------
# 5) GERAÇÃO DE METADADOS (JSON)
# ---------------------------------------------------------------------------
def gerar_metadados(output_path: Path):
    """Gera arquivo JSON com metadados do vídeo para referência."""
    meta = {
        "titulo": "HyperCube — Vídeo Institucional 60s",
        "autor": "José Eduardo Moraes (FP&A)",
        "resolucao": f"{WIDTH}x{HEIGHT}",
        "fps": FPS,
        "duracao_alvo_s": 60,
        "codec_video": "H.264 (libx264)",
        "codec_audio": "AAC",
        "voz_tts": "pt-BR-Neural2-C (Google Cloud)",
        "cenas": [
            {
                "id": c["id"],
                "titulo": c["titulo"],
                "duracao_s": c["duracao"],
                "legenda": c["legenda"],
                "narracao": c["narracao"],
                "asset": c["asset"],
            }
            for c in ROTEIRO
        ],
        "arquivo_saida": str(output_path),
    }

    meta_path = OUTPUT_DIR / "video_metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    print(f"\n📋 Metadados exportados: {meta_path}")


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    print("=" * 70)
    print("  🎬 HyperCube — Gerador de Vídeo Institucional (60s)")
    print("  🏢 Connected Planning Engine · FP&A Edition")
    print("=" * 70)

    # Verificação de credenciais Google Cloud
    creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if not creds or not Path(creds).exists():
        print("\n⚠️  GOOGLE_APPLICATION_CREDENTIALS não configurada ou arquivo não encontrado.")
        print("   Para gerar narração real, configure suas credenciais do Google Cloud.")
        print("   Continuando com geração de placeholders de áudio...\n")

        # Gera áudio placeholder (silêncio) para cada cena
        audio_paths = []
        for cena in ROTEIRO:
            silence_path = AUDIO_DIR / f"narracao_cena_{cena['id']:02d}.mp3"
            if not silence_path.exists():
                # Cria arquivo de silêncio usando moviepy
                from moviepy.audio.AudioClip import AudioClip
                silence = AudioClip(
                    lambda t: [0],
                    duration=cena["duracao"],
                    fps=44100,
                )
                silence.write_audiofile(str(silence_path), fps=44100, logger=None)
            audio_paths.append(silence_path)
            print(f"  ⏸  Cena {cena['id']:02d}: silêncio placeholder ({cena['duracao']}s)")
    else:
        audio_paths = gerar_narracoes()

    # Montagem do vídeo
    output_path = montar_video(audio_paths)

    # Metadados
    gerar_metadados(output_path)

    print("\n" + "=" * 70)
    print("  ✅ Pipeline concluído com sucesso!")
    print(f"  📁 Vídeo final: {output_path}")
    print("  💡 Para usar assets reais, coloque seus arquivos em ./assets/")
    print("     com nomes: cena_01.png, cena_02.mp4, etc.")
    print("=" * 70)


if __name__ == "__main__":
    main()
