/**
 * PIXEL MINI MART - AUDIO ENGINE
 * Web Audio API procedural sound synthesizer and retro low-fi soundtrack
 */
const MINI_MART_PLAYLIST = [
  'audio/asian-market.m4a',
  'audio/plucky-field.m4a',
  'audio/tasty-cheese.m4a',
  'audio/bard.m4a',
  'audio/grayman-castle-market.m4a',
  'audio/wanderer.m4a',
  'audio/project-saunderlust.m4a'
];

class MiniMartAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicEnabled = true;
    this.isMusicPlaying = false;
    this.musicTimer = null;
    this.currentNote = 0;

    // Subtle looping market & countryside soundtrack
    this.trackIndex = 0;
    this.bgm = null;
    this.bgmActiveSrc = '';
    this.bgmTargetVolume = 0.15;
    this.bgmCurrentVolume = 0;
    this.bgmFadeTimer = null;
    this.useProceduralFallback = false;
    this._pausedForBackground = false;
    this._resumeMusicOnVisible = false;
    this._bindVisibilityLifecycle();

    // Cozy low-fi chiptune fallback progression (C major / A minor pentatonic)
    this.melody = [
      261.63, 329.63, 392.00, 523.25,
      392.00, 329.63, 440.00, 392.00,
      329.63, 293.66, 329.63, 392.00,
      523.25, 440.00, 392.00, 329.63
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    this._ensureBgmElement();
  }

  _ensureBgmElement() {
    if (this.bgm || this.useProceduralFallback || typeof Audio === 'undefined') return;
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 0;
      audio.muted = this.isMuted;

      audio.addEventListener('ended', () => {
        if (!this.bgm || this.isMuted || !this.musicEnabled || !this.isMusicPlaying) return;
        this.trackIndex = (this.trackIndex + 1) % MINI_MART_PLAYLIST.length;
        this._playCurrentTrack();
      });

      audio.addEventListener('error', () => {
        if (MINI_MART_PLAYLIST.length > 1) {
          this.trackIndex = (this.trackIndex + 1) % MINI_MART_PLAYLIST.length;
          this._playCurrentTrack();
        }
      });

      this.bgm = audio;
    } catch (_) {
      this.useProceduralFallback = true;
    }
  }

  _bindVisibilityLifecycle() {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const onHide = () => this.pauseForBackground();
    const onShow = () => {
      if (!document.hidden) this.resumeFromBackground();
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) onHide();
      else onShow();
    });
    window.addEventListener('pagehide', onHide);
    window.addEventListener('pageshow', onShow);
  }

  pauseForBackground() {
    if (this._pausedForBackground) return;
    this._pausedForBackground = true;
    this._resumeMusicOnVisible = !this.isMuted && this.musicEnabled && (this.isMusicPlaying || !!(this.bgm && !this.bgm.paused));
    this.stopMusic();
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  resumeFromBackground() {
    if (!this._pausedForBackground) return;
    this._pausedForBackground = false;
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this._resumeMusicOnVisible && !this.isMuted && this.musicEnabled) {
      this._resumeMusicOnVisible = false;
      this.startMusic();
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.musicEnabled && !this.isMuted && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else if (this.musicEnabled) {
      this.startMusic();
    }
    return this.isMuted;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled && !this.isMuted) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.bgmFadeTimer) {
      clearInterval(this.bgmFadeTimer);
      this.bgmFadeTimer = null;
    }
    if (this.bgm) {
      this.bgm.muted = true;
      this.bgm.volume = 0;
      this.bgmCurrentVolume = 0;
      this.bgm.pause();
    }
  }

  _fadeBgmTo(targetVol) {
    if (!this.bgm) return;
    if (this.bgmFadeTimer) clearInterval(this.bgmFadeTimer);
    this.bgmFadeTimer = setInterval(() => {
      if (!this.bgm) {
        clearInterval(this.bgmFadeTimer);
        this.bgmFadeTimer = null;
        return;
      }
      const goal = (this.isMuted || !this.musicEnabled) ? 0 : targetVol;
      const diff = goal - this.bgmCurrentVolume;
      if (Math.abs(diff) <= 0.01) {
        this.bgmCurrentVolume = goal;
        this.bgm.volume = Math.max(0, Math.min(1, goal));
        clearInterval(this.bgmFadeTimer);
        this.bgmFadeTimer = null;
      } else {
        this.bgmCurrentVolume += diff * 0.22;
        this.bgm.volume = Math.max(0, Math.min(1, this.bgmCurrentVolume));
      }
    }, 55);
  }

  _playCurrentTrack() {
    if (!this.bgm || this.isMuted || !this.musicEnabled) return;
    const targetSrc = MINI_MART_PLAYLIST[this.trackIndex % MINI_MART_PLAYLIST.length];
    this.bgm.loop = false;
    this.bgm.muted = false;
    if (this.bgmActiveSrc !== targetSrc) {
      this.bgmActiveSrc = targetSrc;
      this.bgm.src = targetSrc;
      this.bgm.currentTime = 0;
    }
    const playPromise = this.bgm.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => {
        this._fadeBgmTo(this.bgmTargetVolume);
      }).catch(() => {
        this.isMusicPlaying = false;
      });
    } else {
      this._fadeBgmTo(this.bgmTargetVolume);
    }
  }

  startMusic() {
    if (this.isMuted || !this.musicEnabled) return;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.bgm && !this.useProceduralFallback) {
      if (this.isMusicPlaying && !this.bgm.paused) return;
      this.isMusicPlaying = true;
      this._playCurrentTrack();
      return;
    }

    if (this.musicTimer) clearInterval(this.musicTimer);
    this.isMusicPlaying = true;
    this.musicTimer = setInterval(() => {
      if (this.isMuted || !this.musicEnabled || !this.ctx) return;
      const freq = this.melody[this.currentNote % this.melody.length];
      this.currentNote++;
      this.playNote(freq, 0.18, 'sine', 0.04);
      // Soft bass note on every 4th beat
      if (this.currentNote % 4 === 0) {
        this.playNote(freq * 0.5, 0.35, 'triangle', 0.05);
      }
    }, 280);
  }

  playNote(freq, duration, type = 'sine', volume = 0.05) {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  // Sound Effect: Plucking / Harvesting fresh produce
  playHarvest() {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.1);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (_) {}
  }

  // Sound Effect: Stack snap on player's back
  playStack() {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (_) {}
  }

  // Sound Effect: Shelf restock pop
  playRestock() {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.08);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  }

  // Sound Effect: Cash Register Scan (*beep!*)
  playScan() {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(1250, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (_) {}
  }

  // Sound Effect: Cash collected (*kaching! / coins chime*)
  playCash() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      [880, 1174, 1318].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.04);

        gain.gain.setValueAtTime(0.1, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.16);
      });
    } catch (_) {}
  }

  // Sound Effect: Expansion / Construction unlock fanfare
  playUnlock() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.50];
      chords.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.07);

        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.3);
      });
    } catch (_) {}
  }

  // Sound Effect: Turbo dash
  playDash() {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.15);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (_) {}
  }

  // Sound Effect: Milestone / Quest Complete retro fanfare
  playQuestComplete() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);

        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.34);
      });
    } catch (_) {}
  }

  // Sound Effect: UI Blip
  playBlip() {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (_) {}
  }

  // Sound Effect: Travel Express Bus / Transition horn & chime
  playTravel() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [349.23, 440.00, 523.25, 698.46, 880.00];
      notes.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } catch (_) {}
  }

  // Sound Effect: New Pickup Order notification ding
  playOrderBell() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      [784.0, 1046.5].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.09);
        gain.gain.setValueAtTime(0.11, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.24);
      });
    } catch (_) {}
  }

  // Sound Effect: Delivery Van dispatch beep-beep & whoosh
  playDeliveryHorn() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      [0, 0.13].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now + offset);
        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.11);
      });
    } catch (_) {}
  }
}

// Global audio engine singleton
window.miniMartAudio = new MiniMartAudio();
