import os
import subprocess
import wave
import struct
import math

def download_and_extract_chorus():
    target_audio = os.path.abspath("remotion/public/audio/tech-energy.wav")
    raw_audio = os.path.abspath("scratch/asfos_raw.wav")
    os.makedirs("scratch", exist_ok=True)
    os.makedirs("remotion/public/audio", exist_ok=True)

    print("[Audio] Buscando e baixando a faixa instrumental original de Coldplay - A Sky Full of Stars...")
    # Search for Coldplay A Sky Full of Stars Instrumental Karaoke HD
    query = "ytsearch1:Coldplay A Sky Full of Stars Official Instrumental No Vocals"
    cmd = [
        "python", "-m", "yt_dlp",
        "--extract-audio",
        "--audio-format", "wav",
        "-o", raw_audio.replace(".wav", ".%(ext)s"),
        query
    ]
    
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        print("[Audio] Download concluido. Processando arquivo...")
    except Exception as e:
        print(f"[Audio] Download fallback: {e}")

    # Find the downloaded file in scratch
    downloaded_file = None
    for f in os.listdir("scratch"):
        if f.startswith("asfos_raw"):
            downloaded_file = os.path.join("scratch", f)
            break

    if downloaded_file and os.path.exists(downloaded_file):
        print(f"[Audio] Arquivo encontrado: {downloaded_file}. Cortando no refrão principal...")
        try:
            # Let's inspect with wave
            with wave.open(downloaded_file, "r") as wf:
                channels = wf.getnchannels()
                sampwidth = wf.getsampwidth()
                framerate = wf.getframerate()
                nframes = wf.getnframes()
                total_sec = nframes / framerate
                print(f"[Audio] Duração total: {total_sec:.1f}s, Taxa: {framerate}Hz")

                # The energetic chorus of A Sky Full of Stars typically starts around 1:15 (75s) to 1:20 (80s)
                # Let's start at ~74.0s for the build-up & chorus drop
                start_sec = 74.0 if total_sec > 120.0 else 20.0
                duration_sec = 45.0
                start_frame = int(start_sec * framerate)
                frames_to_read = int(duration_sec * framerate)

                wf.setpos(min(start_frame, nframes - frames_to_read))
                raw_bytes = wf.readframes(frames_to_read)

            with wave.open(target_audio, "w") as out_wf:
                out_wf.setnchannels(channels)
                out_wf.setsampwidth(sampwidth)
                out_wf.setframerate(framerate)
                out_wf.writeframes(raw_bytes)

            print(f"[Audio] Faixa do refrão original salva com sucesso em: {target_audio}")
            return True
        except Exception as err:
            print(f"[Audio] Erro ao fatiar wave: {err}")

    return False

if __name__ == "__main__":
    download_and_extract_chorus()
