import os
import wave
import struct
import math
import random

def generate_coldplay_asfos_inspired_track(output_path: str, duration_sec: float = 60.0, sample_rate: int = 44100):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    num_samples = int(duration_sec * sample_rate)
    bpm = 125.0
    beat_sec = 60.0 / bpm
    bar_sec = beat_sec * 4.0

    print(f"[Audio] Gerando trilha instrumental inspirada em Coldplay - A Sky Full of Stars ({duration_sec}s @ {bpm} BPM)...")

    # Iconic Uplifting Progression: Ebm - B - Gb - Db (or transposed to accessible warm key: F#m - D - A - E)
    # F#m (F#3, A3, C#4, F#4) -> D (D3, F#3, A3, D4) -> A (A2, E3, A3, C#4, E4) -> E (E2, B2, E3, G#3, B3)
    chords_data = [
        {"root": 92.50, "piano": [185.00, 220.00, 277.18, 369.99], "guitar": [185.00, 220.00, 277.18, 369.99, 440.00, 554.37]},
        {"root": 73.42, "piano": [146.83, 185.00, 220.00, 293.66], "guitar": [146.83, 220.00, 293.66, 369.99, 440.00, 587.33]},
        {"root": 110.00, "piano": [220.00, 277.18, 330.00, 440.00], "guitar": [110.00, 164.81, 220.00, 277.18, 330.00, 440.00]},
        {"root": 82.41, "piano": [164.81, 207.65, 246.94, 330.00], "guitar": [82.41, 123.47, 164.81, 207.65, 246.94, 330.00]},
    ]

    # Melodic Coldplay piano top hooks (soaring emotional melody)
    melody_notes = [
        [554.37, 554.37, 554.37, 440.00, 369.99, 440.00, 554.37, 739.99],
        [587.33, 587.33, 587.33, 440.00, 369.99, 440.00, 587.33, 739.99],
        [440.00, 440.00, 554.37, 660.00, 554.37, 440.00, 660.00, 739.99],
        [660.00, 554.37, 440.00, 369.99, 440.00, 554.37, 660.00, 739.99]
    ]

    # Pre-render acoustic guitar strum plucks (Karplus-Strong with body resonance)
    def render_guitar_string(freq, duration=2.5):
        n_smpls = int(duration * sample_rate)
        period = int(sample_rate / freq)
        if period < 2:
            period = 2
        buf = [(random.random() * 2.0 - 1.0) for _ in range(period)]
        out = []
        feedforward = 0.993
        last_val = 0.0
        for s in range(n_smpls):
            idx = s % period
            avg = 0.5 * (buf[idx] + last_val) * feedforward
            body_res = math.sin(s * 0.015) * 0.02
            val = avg + body_res
            last_val = avg
            buf[idx] = avg
            out.append(val)
        return out

    guitar_cache = {}
    for chord in chords_data:
        for n in chord["guitar"]:
            if n not in guitar_cache:
                guitar_cache[n] = render_guitar_string(n, 2.5)
    for row in melody_notes:
        for n in row:
            if n not in guitar_cache:
                guitar_cache[n] = render_guitar_string(n, 2.0)

    # Piano physical model (Acoustic Grand Piano harmonic decay like Coldplay ASFOS)
    def piano_riff_sample(freq, t_note):
        if t_note < 0 or t_note > 2.0:
            return 0.0
        hammer = math.exp(-t_note * 55.0) * (random.random() * 0.12)
        harmonics = [
            (1.0, 1.0, 3.0),
            (2.0, 0.70, 4.2),
            (3.0, 0.45, 5.8),
            (4.0, 0.28, 7.5),
            (5.0, 0.16, 10.0)
        ]
        tone = 0.0
        for mult, amp, decay in harmonics:
            f = freq * mult
            env = math.exp(-t_note * decay)
            tone += math.sin(2.0 * math.pi * f * t_note) * amp * env
        return (tone * 0.26 + hammer)

    # Acoustic / Electric Bass sample
    def bass_sample(freq, t_note):
        if t_note < 0 or t_note > 2.0:
            return 0.0
        pluck = math.exp(-t_note * 45.0) * 0.25
        env = math.exp(-t_note * 3.8)
        tone = (
            math.sin(2.0 * math.pi * freq * t_note) * 0.75 +
            math.sin(2.0 * math.pi * freq * 2.0 * t_note) * 0.28 +
            math.sin(2.0 * math.pi * freq * 3.0 * t_note) * 0.10
        ) * env
        return tone + pluck

    with wave.open(output_path, "w") as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        frames = bytearray()

        for i in range(num_samples):
            t = i / sample_rate
            bar_idx = int(t / bar_sec) % len(chords_data)
            t_in_bar = t % bar_sec
            t_in_beat = t % beat_sec
            beat_idx = int((t % bar_sec) / beat_sec)

            # Master Volume Envelope (Fade-in 1.5s, Fade-out 3s)
            master_vol = 1.0
            if t < 1.5:
                master_vol = t / 1.5
            elif t > duration_sec - 3.0:
                master_vol = (duration_sec - t) / 3.0
            master_vol = max(0.0, min(1.0, master_vol))

            # 1. DRUMS (Uplifting Coldplay 4-on-the-floor kick, crisp acoustic wood snare, bright tambourine & cymbals)
            drum_l, drum_r = 0.0, 0.0

            # 4-on-the-floor kick
            kick_t = t_in_beat
            kick_env = math.exp(-kick_t * 15.0)
            kick_pitch = 110.0 * math.exp(-kick_t * 22.0) + 45.0
            kick_snap = (random.random() * 2.0 - 1.0) * math.exp(-kick_t * 70.0) * 0.16
            kick_val = (math.sin(2.0 * math.pi * kick_pitch * kick_t) * kick_env * 0.44) + kick_snap
            drum_l += kick_val * 0.95
            drum_r += kick_val * 0.95

            # Snare on 2 & 4
            if beat_idx in (1, 3):
                snare_t = t_in_beat
                snare_env = math.exp(-snare_t * 12.0)
                snare_shell = math.sin(2.0 * math.pi * 190.0 * snare_t) * snare_env * 0.26
                snare_wires = (random.random() * 2.0 - 1.0) * snare_env * 0.30
                snare_val = snare_shell + snare_wires
                drum_l += snare_val * 0.94
                drum_r += snare_val * 1.06

            # Upbeat Tambourine / Open Hi-Hats on 1/8th offbeats
            t_in_eighth = t % (beat_sec / 2.0)
            tamb_env = math.exp(-t_in_eighth * 32.0)
            tamb_val = (random.random() * 2.0 - 1.0) * tamb_env * 0.15
            drum_l += tamb_val * 0.7
            drum_r += tamb_val * 1.2

            # 2. CHRIS MARTIN SIGNATURE PIANO RIFF (Rhythmic eighth-note staccato chords)
            cur_chord = chords_data[bar_idx]
            piano_l, piano_r = 0.0, 0.0
            t_piano_eighth = t_in_bar % (beat_sec / 2.0)
            for p_idx, p_freq in enumerate(cur_chord["piano"]):
                p_val = piano_riff_sample(p_freq, t_piano_eighth) * 0.19
                pan_p = (p_idx / len(cur_chord["piano"])) * 0.5 + 0.25
                piano_l += p_val * (1.0 - pan_p)
                piano_r += p_val * pan_p

            # 3. ACOUSTIC RHYTHM GUITAR (Uplifting strumming alongside piano)
            guitar_l, guitar_r = 0.0, 0.0
            strum_sub = (beat_sec / 2.0)
            t_strum = t_in_bar % strum_sub
            for str_idx, note_freq in enumerate(cur_chord["guitar"]):
                str_del = str_idx * 0.010
                t_str = t_strum - str_del
                if t_str >= 0:
                    s_idx = int(t_str * sample_rate)
                    p_buf = guitar_cache.get(note_freq, [])
                    if s_idx < len(p_buf):
                        val = p_buf[s_idx] * 0.14
                        pan_pos = (str_idx / len(cur_chord["guitar"])) * 0.6 + 0.2
                        guitar_l += val * (1.0 - pan_pos)
                        guitar_r += val * pan_pos

            # 4. PUMPING ANTHEMIC BASSLINE
            bass_root = cur_chord["root"]
            cur_bass_freq = bass_root if beat_idx in (0, 2) else (bass_root * 1.5)
            # Sidechain ducking on kick hit
            duck = 1.0 - math.exp(-t_in_beat * 10.0) * 0.7
            bass_val = bass_sample(cur_bass_freq, t_in_beat) * 0.44 * duck

            # 5. SOARING MELODIC HOOK (Inspiring top piano octave & acoustic lead)
            lead_l, lead_r = 0.0, 0.0
            cur_mel_row = melody_notes[bar_idx]
            mel_idx = int((t % (beat_sec * 2.0)) / (beat_sec / 2.0)) % 8
            mel_freq = cur_mel_row[mel_idx]
            t_mel = t % (beat_sec / 2.0)
            p_mel = piano_riff_sample(mel_freq, t_mel) * 0.22
            lead_l += p_mel * 0.75
            lead_r += p_mel * 0.35

            # 6. MASTER MIX & WARM TAPE SATURATION
            mix_l = (drum_l * 0.95 + piano_l * 1.1 + guitar_l * 0.95 + bass_val * 0.95 + lead_l * 0.9) * master_vol
            mix_r = (drum_r * 0.95 + piano_r * 1.1 + guitar_r * 0.95 + bass_val * 0.95 + lead_r * 0.9) * master_vol

            mix_l = math.tanh(mix_l * 1.25) * 0.94
            mix_r = math.tanh(mix_r * 1.25) * 0.94

            int_l = int(mix_l * 32767.0)
            int_r = int(mix_r * 32767.0)

            frames.extend(struct.pack("<hh", int_l, int_r))

        wav_file.writeframes(frames)

    print(f"[Audio] Trilha inspirada em Coldplay salva com sucesso em: {output_path}")

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(__file__), "../remotion/public/audio/tech-energy.wav")
    generate_coldplay_asfos_inspired_track(out_file, duration_sec=60.0)
