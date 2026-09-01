import os
import wave
import struct
import math
import random

def generate_upbeat_tech_track(output_path: str, duration_sec: float = 55.0, sample_rate: int = 44100):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    num_samples = int(duration_sec * sample_rate)
    bpm = 126.0
    beat_sec = 60.0 / bpm
    bar_sec = beat_sec * 4.0

    # Chords (Am - F - C - G / Dm - Em - F - G) in Hz
    # Upbeat energetic modern corporate tech progression
    chord_progression = [
        [220.00, 261.63, 329.63, 440.00],  # A minor (A3, C4, E4, A4)
        [174.61, 220.00, 261.63, 349.23],  # F major (F3, A3, C4, F4)
        [261.63, 329.63, 392.00, 523.25],  # C major (C4, E4, G4, C5)
        [196.00, 246.94, 293.66, 392.00],  # G major (G3, B3, D4, G4)
        [220.00, 261.63, 329.63, 440.00],  # A minor
        [174.61, 220.00, 261.63, 349.23],  # F major
        [261.63, 329.63, 392.00, 523.25],  # C major
        [246.94, 293.66, 369.99, 493.88],  # B/Em
    ]

    bass_notes = [110.00, 87.31, 130.81, 98.00, 110.00, 87.31, 130.81, 123.47] # A2, F2, C3, G2

    # Precalculate arpeggio scale notes for melody
    arp_scales = [
        [440.0, 523.25, 659.25, 880.0, 659.25, 523.25, 783.99, 659.25],
        [349.23, 440.0, 523.25, 698.46, 523.25, 440.0, 659.25, 523.25],
        [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 880.0, 659.25],
        [392.00, 493.88, 587.33, 783.99, 587.33, 493.88, 659.25, 493.88]
    ]

    print(f"[Audio] Gerando trilha instrumental empolgante ({duration_sec}s @ {bpm} BPM)...")

    with wave.open(output_path, "w") as wav_file:
        wav_file.setnchannels(2) # Stereo
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(sample_rate)

        frames = bytearray()
        
        for i in range(num_samples):
            t = i / sample_rate
            cur_bar_idx = int(t / bar_sec) % len(chord_progression)
            t_in_bar = t % bar_sec
            t_in_beat = t % beat_sec
            beat_num = int((t % bar_sec) / beat_sec) # 0, 1, 2, 3

            # Volume envelope (fade in 2s, fade out 3s)
            master_vol = 1.0
            if t < 2.0:
                master_vol = t / 2.0
            elif t > duration_sec - 3.0:
                master_vol = (duration_sec - t) / 3.0
            master_vol = max(0.0, min(1.0, master_vol))

            # 1. DRUMS (Punchy Kick on 4-on-the-floor, Crisp Snare on 2 & 4, Hi-Hats on 1/8ths)
            drum_l, drum_r = 0.0, 0.0

            # Kick drum (each beat)
            kick_env = math.exp(-t_in_beat * 18.0)
            kick_freq = 130.0 * math.exp(-t_in_beat * 24.0) + 42.0
            kick_val = math.sin(2.0 * math.pi * kick_freq * t_in_beat) * kick_env * 0.48
            drum_l += kick_val
            drum_r += kick_val

            # Snare on beats 2 and 4 (indices 1 and 3)
            if beat_num in (1, 3):
                snare_t = t_in_beat
                snare_env = math.exp(-snare_t * 14.0)
                snare_tone = math.sin(2.0 * math.pi * 210.0 * snare_t) * snare_env * 0.22
                snare_noise = (random.random() * 2.0 - 1.0) * snare_env * 0.28
                snare_val = snare_tone + snare_noise
                drum_l += snare_val * 0.95
                drum_r += snare_val * 1.05

            # Hi-Hat on every 1/8th note (every beat_sec / 2)
            t_in_eighth = t % (beat_sec / 2.0)
            hihat_env = math.exp(-t_in_eighth * 45.0)
            hihat_val = (random.random() * 2.0 - 1.0) * hihat_env * 0.14
            drum_l += hihat_val * 0.7
            drum_r += hihat_val * 1.1

            # 2. BASSLINE (Pumping sidechain bass on 1/16th offbeats)
            bass_root = bass_notes[cur_bar_idx]
            t_in_sixteenth = t % (beat_sec / 4.0)
            bass_env = math.exp(-t_in_sixteenth * 10.0)
            # Sidechain ducking on main kicks
            ducking = 1.0 - math.exp(-t_in_beat * 9.0) * 0.75
            bass_val = (
                math.sin(2.0 * math.pi * bass_root * t) * 0.6 +
                math.sin(2.0 * math.pi * bass_root * 2.0 * t) * 0.25 +
                math.sin(2.0 * math.pi * bass_root * 3.0 * t) * 0.1
            ) * bass_env * ducking * 0.32
            
            # 3. SYNTH CHORD PAD (Rich warm saw/sine chords with stereo chorus)
            chords = chord_progression[cur_bar_idx]
            pad_l, pad_r = 0.0, 0.0
            for idx, freq in enumerate(chords):
                detune1 = 1.002
                detune2 = 0.998
                phase_shift = idx * 0.3
                v1 = math.sin(2.0 * math.pi * (freq * detune1) * t + phase_shift)
                v2 = math.sin(2.0 * math.pi * (freq * detune2) * t - phase_shift)
                pad_l += (v1 * 0.06)
                pad_r += (v2 * 0.06)

            # 4. ENERGETIC TECH ARPEGGIO (Fast driving 1/16th melody)
            arp_idx = int((t % (beat_sec * 2.0)) / (beat_sec / 4.0)) % 8
            cur_scale = arp_scales[cur_bar_idx % len(arp_scales)]
            arp_freq = cur_scale[arp_idx]
            t_arp = t % (beat_sec / 4.0)
            arp_env = math.exp(-t_arp * 16.0)
            # Plucky square-ish synth with filter
            arp_tone = (
                math.sin(2.0 * math.pi * arp_freq * t) * 0.7 +
                math.sin(2.0 * math.pi * arp_freq * 2.0 * t) * 0.3 +
                math.sin(2.0 * math.pi * arp_freq * 3.0 * t) * 0.15
            ) * arp_env * 0.18
            
            # Stereo panning of arpeggio
            pan = math.sin(t * 3.0) * 0.35 + 0.5
            arp_l = arp_tone * (1.0 - pan)
            arp_r = arp_tone * pan

            # 5. MASTER MIX & STEREO LIMITER
            left_mix = (drum_l + bass_val * 0.9 + pad_l + arp_l) * master_vol
            right_mix = (drum_r + bass_val * 0.9 + pad_r + arp_r) * master_vol

            # Soft saturation limiter to prevent clipping
            left_mix = math.tanh(left_mix * 1.3) * 0.92
            right_mix = math.tanh(right_mix * 1.3) * 0.92

            left_int = int(left_mix * 32767.0)
            right_int = int(right_mix * 32767.0)

            frames.extend(struct.pack("<hh", left_int, right_int))

        wav_file.writeframes(frames)
    
    print(f"[Audio] Trilha de audio salva em: {output_path}")

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(__file__), "../remotion/public/audio/tech-energy.wav")
    generate_upbeat_tech_track(out_file, duration_sec=55.0)
