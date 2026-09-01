import os
import wave
import struct
import math
import random

def generate_acoustic_track(output_path: str, duration_sec: float = 60.0, sample_rate: int = 44100):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    num_samples = int(duration_sec * sample_rate)
    bpm = 128.0
    beat_sec = 60.0 / bpm
    bar_sec = beat_sec * 4.0

    print(f"[Audio] Gerando trilha instrumental acustica organica ({duration_sec}s @ {bpm} BPM)...")

    # Chords (G major - D major - Em - C major / energetic upbeat indie-folk/acoustic-rock progression)
    # Frequencies in Hz for guitar & piano
    chords_data = [
        # G Major (G3, B3, D4, G4, B4, D5)
        {"root": 98.0, "notes": [196.00, 246.94, 293.66, 392.00, 493.88, 587.33], "piano": [196.00, 246.94, 293.66, 392.00, 493.88]},
        # D Major (D3, A3, D4, F#4, A4)
        {"root": 146.83, "notes": [146.83, 220.00, 293.66, 369.99, 440.00, 587.33], "piano": [146.83, 220.00, 293.66, 369.99, 440.00]},
        # E Minor (E3, G3, B3, E4, G4, B4)
        {"root": 82.41, "notes": [164.81, 196.00, 246.94, 329.63, 392.00, 493.88], "piano": [164.81, 196.00, 246.94, 329.63, 392.00]},
        # C Major (C3, G3, C4, E4, G4, C5)
        {"root": 130.81, "notes": [130.81, 196.00, 261.63, 329.63, 392.00, 523.25], "piano": [130.81, 196.00, 261.63, 329.63, 523.25]},
    ]

    # Melodic acoustic guitar / piano top hooks
    melody_notes = [
        [392.00, 493.88, 587.33, 493.88, 392.00, 293.66, 392.00, 493.88],
        [440.00, 587.33, 739.99, 587.33, 440.00, 369.99, 440.00, 587.33],
        [329.63, 392.00, 493.88, 392.00, 329.63, 246.94, 329.63, 392.00],
        [523.25, 659.25, 783.99, 659.25, 523.25, 392.00, 523.25, 659.25]
    ]

    # Pre-render Karplus-Strong acoustic guitar pluck buffers for all needed notes
    def render_guitar_pluck(freq, pluck_duration=2.2):
        n_smpls = int(pluck_duration * sample_rate)
        period = int(sample_rate / freq)
        if period < 2:
            period = 2
        # Initial noise burst (pick strike)
        buf = [(random.random() * 2.0 - 1.0) for _ in range(period)]
        out = []
        feedforward = 0.992
        last_val = 0.0
        for s in range(n_smpls):
            idx = s % period
            # Karplus-Strong string filter with pick damping and body resonance
            avg = 0.5 * (buf[idx] + last_val) * feedforward
            # Wooden body formant filter
            body_res = math.sin(s * 0.02) * 0.03
            val = avg + body_res
            last_val = avg
            buf[idx] = avg
            out.append(val)
        return out

    # Guitar pluck cache
    print("[Audio] Modelando cordas acusticas de violao (Karplus-Strong)...")
    guitar_cache = {}
    for chord in chords_data:
        for n in chord["notes"]:
            if n not in guitar_cache:
                guitar_cache[n] = render_guitar_pluck(n, 2.5)
    for row in melody_notes:
        for n in row:
            if n not in guitar_cache:
                guitar_cache[n] = render_guitar_pluck(n, 2.0)

    # Piano tone generator (Acoustic Grand Piano harmonic decay model)
    def piano_sample(freq, t_note):
        if t_note < 0 or t_note > 3.0:
            return 0.0
        # Hammer click
        hammer = math.exp(-t_note * 60.0) * (random.random() * 0.15)
        # Multiple acoustic harmonics with natural wooden decay
        tone = 0.0
        harmonics = [
            (1.0, 1.0, 3.2),    # Fundamental
            (2.0, 0.65, 4.5),   # 2nd
            (3.0, 0.40, 6.0),   # 3rd
            (4.0, 0.25, 8.0),   # 4th
            (5.0, 0.15, 11.0),  # 5th
            (6.0, 0.08, 14.0)   # 6th
        ]
        for mult, amp, decay in harmonics:
            f = freq * mult
            env = math.exp(-t_note * decay)
            tone += math.sin(2.0 * math.pi * f * t_note) * amp * env
        return (tone * 0.25 + hammer)

    # Acoustic Bass physical tone
    def bass_sample(freq, t_note):
        if t_note < 0 or t_note > 2.0:
            return 0.0
        pluck = math.exp(-t_note * 40.0) * 0.3
        env = math.exp(-t_note * 4.2)
        # Deep round warm acoustic wood tone
        tone = (
            math.sin(2.0 * math.pi * freq * t_note) * 0.7 +
            math.sin(2.0 * math.pi * freq * 2.0 * t_note) * 0.25 +
            math.sin(2.0 * math.pi * freq * 3.0 * t_note) * 0.08
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
            beat_idx = int((t % bar_sec) / beat_sec) # 0, 1, 2, 3

            # Master Volume Envelope (Fade-in 2s, Fade-out 3s)
            master_vol = 1.0
            if t < 2.0:
                master_vol = t / 2.0
            elif t > duration_sec - 3.0:
                master_vol = (duration_sec - t) / 3.0
            master_vol = max(0.0, min(1.0, master_vol))

            # 1. ACOUSTIC DRUMS (Organic punchy wooden kick, acoustic wood snare, real brass tambourine & shaker)
            drum_l, drum_r = 0.0, 0.0

            # Real acoustic kick drum (warm thud + beater snap on beats 0 and 2.5)
            # Four on the floor + syncopated kick
            is_kick_beat = (t_in_beat < 0.12) or ((beat_idx == 2) and (abs(t_in_beat - (beat_sec * 0.5)) < 0.08))
            kick_t = t_in_beat if (t_in_beat < beat_sec * 0.5) else (t_in_beat - beat_sec * 0.5)
            kick_env = math.exp(-kick_t * 16.0)
            kick_pitch = 95.0 * math.exp(-kick_t * 26.0) + 48.0
            kick_snap = (random.random() * 2.0 - 1.0) * math.exp(-kick_t * 80.0) * 0.18
            kick_val = (math.sin(2.0 * math.pi * kick_pitch * kick_t) * kick_env * 0.45) + kick_snap
            drum_l += kick_val * 0.95
            drum_r += kick_val * 0.95

            # Real acoustic snare drum on beats 1 and 3 (wood shell resonance + brass wires buzz)
            if beat_idx in (1, 3):
                snare_t = t_in_beat
                snare_env = math.exp(-snare_t * 12.0)
                snare_shell = math.sin(2.0 * math.pi * 185.0 * snare_t) * snare_env * 0.28
                snare_wires = (random.random() * 2.0 - 1.0) * snare_env * 0.32
                snare_val = snare_shell + snare_wires
                drum_l += snare_val * 0.92
                drum_r += snare_val * 1.08

            # Acoustic Tambourine / Shaker on eighth-note offbeats (organic jingle)
            t_in_eighth = t % (beat_sec / 2.0)
            tamb_env = math.exp(-t_in_eighth * 35.0)
            tamb_val = (random.random() * 2.0 - 1.0) * tamb_env * 0.16
            drum_l += tamb_val * 0.65
            drum_r += tamb_val * 1.25

            # 2. ACOUSTIC RHYTHM GUITAR (Vibrant strumming with natural pick attack)
            guitar_l, guitar_r = 0.0, 0.0
            cur_chord = chords_data[bar_idx]
            # Strum patterns on 1/8ths (Down-Down-Up-Down-Up)
            strum_subdivision = (beat_sec / 2.0)
            strum_num = int(t_in_bar / strum_subdivision)
            t_strum = t_in_bar % strum_subdivision

            # Strum individual strings with micro-delay for realistic acoustic sweeping
            strum_strings = cur_chord["notes"]
            for str_idx, note_freq in enumerate(strum_strings):
                string_delay = str_idx * 0.012  # 12ms stagger per string
                t_string = t_strum - string_delay
                if t_string >= 0:
                    sample_idx = int(t_string * sample_rate)
                    pluck_buf = guitar_cache.get(note_freq, [])
                    if sample_idx < len(pluck_buf):
                        val = pluck_buf[sample_idx] * 0.15
                        # Stereo acoustic body panning
                        pan_pos = (str_idx / len(strum_strings)) * 0.6 + 0.2
                        guitar_l += val * (1.0 - pan_pos)
                        guitar_r += val * pan_pos

            # 3. ACOUSTIC GRAND PIANO (Lively rhythmic chords on beats)
            piano_l, piano_r = 0.0, 0.0
            t_piano = t_in_beat
            for p_idx, p_freq in enumerate(cur_chord["piano"]):
                p_val = piano_sample(p_freq, t_piano) * 0.18
                pan_p = (p_idx / len(cur_chord["piano"])) * 0.5 + 0.25
                piano_l += p_val * (1.0 - pan_p)
                piano_r += p_val * pan_p

            # 4. ACOUSTIC BASS GROOVE (Warm energetic walking bassline)
            bass_root = cur_chord["root"]
            # Dynamic bass notes (Root on 0, Octave on 1.5, 5th on 2, Passing on 3.5)
            if beat_idx == 0:
                cur_bass_freq = bass_root
            elif beat_idx == 1:
                cur_bass_freq = bass_root * 1.5
            elif beat_idx == 2:
                cur_bass_freq = bass_root
            else:
                cur_bass_freq = bass_root * 1.334
            
            t_bass = t_in_beat
            bass_val = bass_sample(cur_bass_freq, t_bass) * 0.42

            # 5. ACOUSTIC LEAD MELODY / GUITAR HOOK (Inspiring bright acoustic line)
            lead_l, lead_r = 0.0, 0.0
            cur_melody_row = melody_notes[bar_idx]
            mel_idx = int((t % (beat_sec * 2.0)) / (beat_sec / 2.0)) % 8
            mel_freq = cur_melody_row[mel_idx]
            t_mel = t % (beat_sec / 2.0)
            mel_sample_idx = int(t_mel * sample_rate)
            mel_buf = guitar_cache.get(mel_freq, [])
            if mel_sample_idx < len(mel_buf):
                m_val = mel_buf[mel_sample_idx] * 0.20
                lead_l += m_val * 0.75
                lead_r += m_val * 0.25

            # 6. MASTER ACOUSTIC BUS MIX & DYNAMIC ANALOG SATURATION
            mix_l = (drum_l * 0.95 + guitar_l * 1.1 + piano_l * 0.9 + bass_val * 0.95 + lead_l * 0.8) * master_vol
            mix_r = (drum_r * 0.95 + guitar_r * 1.1 + piano_r * 0.9 + bass_val * 0.95 + lead_r * 0.8) * master_vol

            # Warm tube-style tape saturation (natural compression, avoids harsh clipping)
            mix_l = math.tanh(mix_l * 1.25) * 0.94
            mix_r = math.tanh(mix_r * 1.25) * 0.94

            int_l = int(mix_l * 32767.0)
            int_r = int(mix_r * 32767.0)

            frames.extend(struct.pack("<hh", int_l, int_r))

        wav_file.writeframes(frames)

    print(f"[Audio] Trilha acustica salva com sucesso em: {output_path}")

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(__file__), "../remotion/public/audio/tech-energy.wav")
    generate_acoustic_track(out_file, duration_sec=60.0)
