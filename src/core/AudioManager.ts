import { MidiPlayer } from './MidiPlayer';
import { SaveManager } from './SaveManager';

export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private midiPlayer: MidiPlayer | null = null;

  public masterVolume: number = 0.8;
  public musicVolume: number = 0.6;
  public sfxVolume: number = 0.9;
  public isMusicMuted: boolean = SaveManager.isMusicMuted();
  public onMusicToggle?: (enabled: boolean) => void;

  private isBgmPlaying: boolean = false;
  private bgmIntervalId: number | null = null;
  private bgmStep: number = 0;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public init(): void {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();

    this.isMusicMuted = SaveManager.isMusicMuted();
    const initialMusicGain = this.isMusicMuted ? 0 : this.musicVolume;

    this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(initialMusicGain, this.ctx.currentTime);

    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.midiPlayer = new MidiPlayer(this.ctx, this.musicGain);
  }

  private ensureContext(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return !!this.ctx;
  }

  public playUISelect(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(660, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playDenied(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(100, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playJump(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playShoot(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playMelee(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.14);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playHit(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playExplosion(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Synthesize noisy boom with buffer
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  public playPickup(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554, 659, 880];

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = now + i * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.1);
    });
  }

  public playRockPowerReady(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // --- DETROIT ROCK CITY BGM ENGINE ---
  private static readonly DRC_NOTE_FREQS: Record<string, number> = {
    '--': 0,
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
    'C6': 1046.50
  };

  // Detroit Rock City: 16th note step sequences (134 BPM)
  // Lead Guitar (Dual Lead & Chorus)
  private static readonly DRC_LEAD: string[] = [
    // --- SECTION 1: Dual Lead Harmony Theme (Intro / Main Hook) ---
    'C5', '--', 'D5', '--', 'E5', '--', 'G5', '--',  'E5', '--', 'D5', '--', 'C5', '--', 'A4', '--',
    'C5', '--', 'D5', '--', 'E5', '--', 'G5', '--',  'A5', '--', 'G5', '--', 'E5', '--', 'D5', '--',
    'C5', '--', 'D5', '--', 'E5', '--', 'G5', '--',  'E5', '--', 'D5', '--', 'C5', '--', 'A4', '--',
    'C5', 'C5', 'D5', 'D5', 'E5', '--', 'D5', '--',  'C5', '--', '--', '--', '--', '--', '--', '--',

    // --- SECTION 2: Verse Driving Groove Riff ---
    'C4', 'C4', '--', 'C4', 'C4', '--', 'C4', 'C4',  'Bb3', 'Bb3', '--', 'F3', 'F3', '--', 'G3', '--',
    'C4', 'C4', '--', 'C4', 'C4', '--', 'C4', 'C4',  'Bb3', 'Bb3', '--', 'F3', 'F3', '--', 'G3', '--',
    'C4', 'C4', '--', 'C4', 'C4', '--', 'C4', 'C4',  'Bb3', 'Bb3', '--', 'F3', 'F3', '--', 'G3', '--',
    'G3', 'G3', 'G3', 'G3', 'A3', 'A3', 'B3', 'B3',  'C4', '--', 'D4', '--', 'E4', '--', 'G4', '--',

    // --- SECTION 3: Chorus ("Get up! Everybody's gonna move their feet...") ---
    'E5', '--', 'E5', '--', 'D5', '--', 'C5', '--',  'A4', '--', 'C5', '--', 'D5', '--', 'E5', '--',
    'E5', '--', 'E5', '--', 'D5', '--', 'C5', '--',  'A4', '--', 'C5', '--', 'D5', '--', 'C5', '--',
    'G5', '--', 'G5', '--', 'E5', '--', 'D5', '--',  'C5', '--', '--', '--', 'A4', '--', 'C5', '--',
    'A5', '--', 'A5', '--', 'G5', '--', 'E5', '--',  'D5', '--', 'C5', '--', '--', '--', '--', '--'
  ];

  // Harmony Guitar (The iconic 3rd harmony layer played by Ace/Paul)
  private static readonly DRC_HARMONY: string[] = [
    // Section 1: Twin Harmony in Thirds
    'E5', '--', 'F5', '--', 'G5', '--', 'B5', '--',  'G5', '--', 'F5', '--', 'E5', '--', 'C5', '--',
    'E5', '--', 'F5', '--', 'G5', '--', 'B5', '--',  'C6', '--', 'B5', '--', 'G5', '--', 'F5', '--',
    'E5', '--', 'F5', '--', 'G5', '--', 'B5', '--',  'G5', '--', 'F5', '--', 'E5', '--', 'C5', '--',
    'E5', 'E5', 'F5', 'F5', 'G5', '--', 'F5', '--',  'E5', '--', '--', '--', '--', '--', '--', '--',

    // Section 2: Rhythm fill
    '--', '--', '--', '--', '--', '--', '--', '--',  '--', '--', '--', '--', '--', '--', '--', '--',
    '--', '--', '--', '--', '--', '--', '--', '--',  '--', '--', '--', '--', '--', '--', '--', '--',
    '--', '--', '--', '--', '--', '--', '--', '--',  '--', '--', '--', '--', '--', '--', '--', '--',
    '--', '--', '--', '--', '--', '--', '--', '--',  'E4', '--', 'F4', '--', 'G4', '--', 'B4', '--',

    // Section 3: Chorus backing harmony
    'G5', '--', 'G5', '--', 'F5', '--', 'E5', '--',  'C5', '--', 'E5', '--', 'F5', '--', 'G5', '--',
    'G5', '--', 'G5', '--', 'F5', '--', 'E5', '--',  'C5', '--', 'E5', '--', 'F5', '--', 'E5', '--',
    'C6', '--', 'C6', '--', 'G5', '--', 'F5', '--',  'E5', '--', '--', '--', 'C5', '--', 'E5', '--',
    'C6', '--', 'C6', '--', 'B5', '--', 'G5', '--',  'F5', '--', 'E5', '--', '--', '--', '--', '--'
  ];

  // Bass Line (Pumping 80s Rock Bass)
  private static readonly DRC_BASS: string[] = [
    // Section 1
    'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3',  'A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2',
    'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3',  'G2', 'G2', 'G2', 'G2', 'G2', 'G2', 'G2', 'G2',
    'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3',  'A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2',
    'F2', 'F2', 'F2', 'F2', 'G2', 'G2', 'G2', 'G2',  'C3', 'C3', 'C3', 'C3', 'C3', '--', '--', '--',

    // Section 2
    'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3',  'Bb2', 'Bb2', 'Bb2', 'Bb2', 'F2', 'F2', 'G2', 'G2',
    'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3',  'Bb2', 'Bb2', 'Bb2', 'Bb2', 'F2', 'F2', 'G2', 'G2',
    'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3',  'Bb2', 'Bb2', 'Bb2', 'Bb2', 'F2', 'F2', 'G2', 'G2',
    'G2', 'G2', 'G2', 'G2', 'G2', 'G2', 'G2', 'G2',  'G2', 'G2', 'G2', 'G2', 'G2', 'G2', 'G2', 'G2',

    // Section 3
    'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3',  'A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2',
    'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3',  'F2', 'F2', 'F2', 'F2', 'G2', 'G2', 'G2', 'G2',
    'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3',  'A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2', 'A2',
    'F2', 'F2', 'F2', 'F2', 'G2', 'G2', 'G2', 'G2',  'C3', 'C3', 'C3', 'C3', 'C3', '--', '--', '--'
  ];

  public startBGM(): void {
    if (this.isMusicMuted) return;
    if (!this.ensureContext()) return;
    if (this.isPlayingBGM()) return;

    this.isBgmPlaying = true;

    if (this.midiPlayer) {
      this.midiPlayer.play(0);
      return;
    }

    this.bgmStep = 0;

    // 134 BPM, 16th notes fallback
    const stepDurationMs = (60 / 134 / 4) * 1000;
    const totalSteps = AudioManager.DRC_LEAD.length;

    this.bgmIntervalId = window.setInterval(() => {
      if (!this.isBgmPlaying || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const stepIdx = this.bgmStep % totalSteps;

      // 1. Play Lead Guitar Note
      const leadNote = AudioManager.DRC_LEAD[stepIdx];
      const leadFreq = AudioManager.DRC_NOTE_FREQS[leadNote] || 0;
      if (leadFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Sawtooth with slight filter for overdrive rock tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(leadFreq, now);

        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 0.16);
      }

      // 2. Play Harmony Guitar Note (Dual Lead)
      const harmNote = AudioManager.DRC_HARMONY[stepIdx];
      const harmFreq = AudioManager.DRC_NOTE_FREQS[harmNote] || 0;
      if (harmFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Slightly detuned square for 16-bit arcade twin-lead texture
        osc.type = 'square';
        osc.frequency.setValueAtTime(harmFreq * 1.002, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 0.16);
      }

      // 3. Play Bass Note
      const bassNote = AudioManager.DRC_BASS[stepIdx];
      const bassFreq = AudioManager.DRC_NOTE_FREQS[bassNote] || 0;
      if (bassFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bassFreq, now);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.02, now + 0.14);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 0.14);
      }

      // 4. Play Arcade Drums (Kick on beats 0, 8, 10; Snare on 4, 12)
      const beatInBar = stepIdx % 16;
      if (beatInBar === 0 || beatInBar === 8 || beatInBar === 10) {
        // Synthesized Kick
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(120, now);
        kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.1);
        kickGain.gain.setValueAtTime(0.4, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.1);
      } else if (beatInBar === 4 || beatInBar === 12) {
        // Synthesized Snare Noise
        const snareBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.12, this.ctx.sampleRate);
        const data = snareBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const snareSource = this.ctx.createBufferSource();
        snareSource.buffer = snareBuffer;

        const snareFilter = this.ctx.createBiquadFilter();
        snareFilter.type = 'bandpass';
        snareFilter.frequency.setValueAtTime(1000, now);

        const snareGain = this.ctx.createGain();
        snareGain.gain.setValueAtTime(0.28, now);
        snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        snareSource.connect(snareFilter);
        snareFilter.connect(snareGain);
        snareGain.connect(this.musicGain);
        snareSource.start(now);
      }

      this.bgmStep++;
    }, stepDurationMs);
  }

  public stopBGM(): void {
    this.isBgmPlaying = false;
    if (this.midiPlayer) {
      this.midiPlayer.stop();
    }
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public startIntroBGM(): void {
    if (this.isMusicMuted) return;
    this.ensureContext();
    if (!this.isPlayingBGM()) {
      this.startBGM();
    }
  }

  public isPlayingBGM(): boolean {
    return this.isBgmPlaying || (this.midiPlayer ? this.midiPlayer.getIsPlaying() : false);
  }

  public toggleMusic(): boolean {
    this.isMusicMuted = !this.isMusicMuted;
    SaveManager.setMusicMuted(this.isMusicMuted);

    if (!this.ctx) {
      this.ensureContext();
    }

    if (this.ctx && this.musicGain) {
      const targetGain = this.isMusicMuted ? 0 : this.musicVolume;
      this.musicGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }

    if (this.isMusicMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }

    if (this.onMusicToggle) {
      this.onMusicToggle(!this.isMusicMuted);
    }

    return !this.isMusicMuted;
  }

  public setMusicEnabled(enabled: boolean): void {
    if (this.isMusicMuted === !enabled) return;
    this.toggleMusic();
  }

  public getIsMusicEnabled(): boolean {
    return !this.isMusicMuted;
  }

  public toggleMute(): boolean {
    if (!this.masterGain || !this.ctx) {
      this.init();
    }
    if (this.masterGain && this.ctx) {
      const current = this.masterGain.gain.value;
      const isMuted = current > 0;
      this.masterGain.gain.setValueAtTime(isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      return !isMuted;
    }
    return true;
  }
}
