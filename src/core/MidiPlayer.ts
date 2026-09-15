export interface MidiNote {
  time: number;
  duration: number;
  note: number;
  freq: number;
  velocity: number;
}

export interface MidiTrack {
  trackIndex: number;
  name: string;
  notes: MidiNote[];
}

export interface MidiSongData {
  title: string;
  artist: string;
  source: string;
  bpm: number;
  totalDuration: number;
  tracks: MidiTrack[];
}

export class MidiPlayer {
  private ctx: AudioContext;
  private outputNode: GainNode;
  private songData: MidiSongData | null = null;
  private isPlaying: boolean = false;
  private songStartTime: number = 0;
  private pauseTime: number = 0;
  private scheduleInterval: number | null = null;
  private nextNoteIndices: number[] = [];

  // Distortion curve for rock guitar channels
  private distortionCurve: Float32Array;

  constructor(ctx: AudioContext, outputNode: GainNode) {
    this.ctx = ctx;
    this.outputNode = outputNode;
    this.distortionCurve = this.makeDistortionCurve(30);
    this.loadSongData();
  }

  private async loadSongData(): Promise<void> {
    try {
      const resp = await fetch('/assets/detroit_rock_city_full.json');
      if (resp.ok) {
        this.songData = await resp.json();
        if (this.isPlaying) {
          // Restart with full data
          this.play(this.pauseTime);
        }
      }
    } catch (err) {
      console.warn('[MidiPlayer] Could not load detroit_rock_city_full.json, will use fallback', err);
    }
  }

  private makeDistortionCurve(amount = 20): Float32Array {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public play(startOffset = 0): void {
    if (!this.songData) {
      this.isPlaying = true;
      this.pauseTime = startOffset;
      return;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stop();
    this.isPlaying = true;
    this.songStartTime = this.ctx.currentTime - startOffset;

    // Reset indices to start position
    this.nextNoteIndices = new Array(this.songData.tracks.length).fill(0);
    for (let t = 0; t < this.songData.tracks.length; t++) {
      const track = this.songData.tracks[t];
      let idx = 0;
      while (idx < track.notes.length && track.notes[idx].time < startOffset) {
        idx++;
      }
      this.nextNoteIndices[t] = idx;
    }

    const lookAheadMs = 120;
    const scheduleIntervalMs = 40;

    this.scheduleInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.songData) return;

      const currentPlaybackTime = this.ctx.currentTime - this.songStartTime;
      const scheduleUntil = currentPlaybackTime + lookAheadMs / 1000;

      // Loop song when reaching the end
      if (currentPlaybackTime >= this.songData.totalDuration) {
        this.songStartTime = this.ctx.currentTime;
        this.nextNoteIndices.fill(0);
        return;
      }

      for (let t = 0; t < this.songData.tracks.length; t++) {
        const track = this.songData.tracks[t];
        let idx = this.nextNoteIndices[t];

        while (idx < track.notes.length) {
          const note = track.notes[idx];
          if (note.time > scheduleUntil) {
            break;
          }

          if (note.time >= currentPlaybackTime - 0.05) {
            const noteStartAudioTime = this.songStartTime + note.time;
            this.playTrackNote(track.name, note, noteStartAudioTime);
          }
          idx++;
        }
        this.nextNoteIndices[t] = idx;
      }
    }, scheduleIntervalMs);
  }

  private playTrackNote(trackName: string, note: MidiNote, startTime: number): void {
    const dur = Math.max(0.04, note.duration);
    const velFactor = Math.min(1.0, (note.velocity || 80) / 127);

    if (trackName.toLowerCase().includes('drum')) {
      this.playDrumNote(note.note, velFactor, startTime);
      return;
    }

    if (trackName.toLowerCase().includes('bass')) {
      this.playBassNote(note.freq, velFactor, startTime, dur);
      return;
    }

    if (trackName.toLowerCase().includes('rhythm')) {
      const isRight = trackName.includes('2') || note.note % 2 === 0;
      this.playRhythmGuitarNote(note.freq, velFactor, startTime, dur, isRight ? 0.5 : -0.5);
      return;
    }

    if (trackName.toLowerCase().includes('solo')) {
      this.playSoloGuitarNote(note.freq, velFactor, startTime, dur);
      return;
    }

    // Default: Vocals / Lead
    this.playVocalLeadNote(note.freq, velFactor, startTime, dur);
  }

  private playDrumNote(midiNote: number, vel: number, time: number): void {
    // 35, 36 = Bass Drum
    if (midiNote === 35 || midiNote === 36) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

      gain.gain.setValueAtTime(0.42 * vel, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

      osc.connect(gain);
      gain.connect(this.outputNode);
      osc.start(time);
      osc.stop(time + 0.12);
      return;
    }

    // 38, 40 = Snare Drum
    if (midiNote === 38 || midiNote === 40) {
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.15), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.32 * vel, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.14);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.outputNode);
      src.start(time);
      return;
    }

    // 42, 44, 46 = Hi-hat
    if (midiNote === 42 || midiNote === 44 || midiNote === 46) {
      const isClosed = midiNote !== 46;
      const decay = isClosed ? 0.05 : 0.22;
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * decay), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6500, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18 * vel, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + decay);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.outputNode);
      src.start(time);
      return;
    }

    // Cymbals (49, 51, 57)
    if (midiNote === 49 || midiNote === 51 || midiNote === 57) {
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.6), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(5000, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25 * vel, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.outputNode);
      src.start(time);
      return;
    }

    // Toms
    const tomOsc = this.ctx.createOscillator();
    const tomGain = this.ctx.createGain();
    const baseFreq = 90 + (midiNote % 12) * 12;
    tomOsc.type = 'sine';
    tomOsc.frequency.setValueAtTime(baseFreq * 1.5, time);
    tomOsc.frequency.exponentialRampToValueAtTime(baseFreq, time + 0.18);
    tomGain.gain.setValueAtTime(0.28 * vel, time);
    tomGain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
    tomOsc.connect(tomGain);
    tomGain.connect(this.outputNode);
    tomOsc.start(time);
    tomOsc.stop(time + 0.18);
  }

  private playBassNote(freq: number, vel: number, time: number, dur: number): void {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, time);
    filter.Q.setValueAtTime(2.5, time);

    const actualDur = Math.min(dur, 0.8);
    gain.gain.setValueAtTime(0.28 * vel, time);
    gain.gain.setValueAtTime(0.24 * vel, time + actualDur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.01, time + actualDur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.outputNode);

    osc.start(time);
    osc.stop(time + actualDur);
  }

  private playRhythmGuitarNote(freq: number, vel: number, time: number, dur: number, panVal: number): void {
    const osc = this.ctx.createOscillator();
    const shaper = this.ctx.createWaveShaper();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    shaper.curve = this.distortionCurve as any;
    shaper.oversample = '2x';

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, time);

    const actualDur = Math.min(dur, 0.6);
    gain.gain.setValueAtTime(0.14 * vel, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + actualDur);

    osc.connect(shaper);
    shaper.connect(filter);
    filter.connect(gain);

    if (panner) {
      panner.pan.setValueAtTime(panVal, time);
      gain.connect(panner);
      panner.connect(this.outputNode);
    } else {
      gain.connect(this.outputNode);
    }

    osc.start(time);
    osc.stop(time + actualDur);
  }

  private playSoloGuitarNote(freq: number, vel: number, time: number, dur: number): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, time);
    filter.Q.setValueAtTime(2.0, time);

    const actualDur = Math.min(dur, 2.0);
    gain.gain.setValueAtTime(0.24 * vel, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + actualDur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.outputNode);

    osc.start(time);
    osc.stop(time + actualDur);
  }

  private playVocalLeadNote(freq: number, vel: number, time: number, dur: number): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    const actualDur = Math.min(dur, 1.2);
    gain.gain.setValueAtTime(0.18 * vel, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + actualDur);

    osc.connect(gain);
    gain.connect(this.outputNode);

    osc.start(time);
    osc.stop(time + actualDur);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.scheduleInterval !== null) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
