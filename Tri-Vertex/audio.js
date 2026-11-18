/**
 * TRI-VERTEX // AUDIO ENGINE
 * High-performance Web Audio API procedural sound synthesizer.
 * Provides sound effects for melee swings, ranged blasters, impacts,
 * explosions, UI interactions, and an ambient sci-fi combat drone.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.isInitialized = false;

    // Subtle background music state (Stars Come Alive)
    this.bgm = null;
    this.bgmTargetVolume = 0.14;
    this.bgmCurrentVolume = 0;
    this.bgmFadeTimer = null;
    this._pausedForBackground = false;
    this._resumeMusicOnVisible = false;
    this._bindVisibilityLifecycle();
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
    this._resumeMusicOnVisible = !this.isMuted && !!(this.bgm && !this.bgm.paused);
    if (this.bgmFadeTimer) {
      clearInterval(this.bgmFadeTimer);
      this.bgmFadeTimer = null;
    }
    if (this.bgm) {
      this.bgm.pause();
    }
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
    if (this._resumeMusicOnVisible && !this.isMuted) {
      this._resumeMusicOnVisible = false;
      this.startAmbientBeat();
    }
  }

  init() {
    if (!this.bgm && typeof Audio !== 'undefined') {
      try {
        this.bgm = new Audio('audio/stars-come-alive.m4a');
        this.bgm.loop = true;
        this.bgm.preload = 'auto';
        this.bgm.volume = 0;
        this.bgm.muted = this.isMuted;
        // Fallback loop listener in case a mobile WebView ignores .loop on .m4a
        this.bgm.addEventListener('ended', () => {
          if (!this.bgm) return;
          this.bgm.currentTime = 0;
          if (!this.isMuted) {
            const p = this.bgm.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          }
        });
      } catch (e) {
        this.bgm = null;
      }
    }

    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.isInitialized = true;
      this.startAmbientBeat();
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.startAmbientBeat();
  }

  toggle() {
    return !this.toggleMute();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    if (this.bgm) {
      this.bgm.muted = this.isMuted;
      if (this.isMuted) {
        this.bgm.volume = 0;
      } else {
        this.startAmbientBeat();
      }
    }
    return this.isMuted;
  }

  setMusicState(mode = 'playing') {
    // Keep background track subtle so combat lasers & SFX stay front and center
    this.bgmTargetVolume = mode === 'playing' ? 0.20 : 0.11;
    if (this.bgm && !this.isMuted && !this.bgm.paused) {
      this._fadeBgmTo(this.bgmTargetVolume);
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
      const goal = this.isMuted ? 0 : targetVol;
      const diff = goal - this.bgmCurrentVolume;
      if (Math.abs(diff) <= 0.01) {
        this.bgmCurrentVolume = goal;
        this.bgm.volume = Math.max(0, Math.min(1, goal));
        clearInterval(this.bgmFadeTimer);
        this.bgmFadeTimer = null;
      } else {
        this.bgmCurrentVolume += diff * 0.18;
        this.bgm.volume = Math.max(0, Math.min(1, this.bgmCurrentVolume));
      }
    }, 60);
  }

  // Helper to create synthetic white noise buffer
  createNoiseBuffer(duration = 0.2) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /* ------------------------------------------------------------------
     MELEE SOUND EFFECTS
     ------------------------------------------------------------------ */

  // Plasma Blade / Katana Slash
  playSwordSlash() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Fast pitch sweep (whoosh)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);

    // Filtered noise swoosh for blade air resistance
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.12);
    const nGain = this.ctx.createGain();
    const nFilter = this.ctx.createBiquadFilter();
    nFilter.type = 'highpass';
    nFilter.frequency.setValueAtTime(1800, now);
    nGain.gain.setValueAtTime(0.25, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  // Hyper Lance Thrust
  playSpearThrust() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.09);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Titan Hammer Shockwave Slam
  playHammerSmash() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Heavy low sub drop
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(180, now);
    sub.frequency.exponentialRampToValueAtTime(35, now + 0.35);

    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + 0.4);

    // Distortion crunch
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.25);
    const nGain = this.ctx.createGain();
    const nFilter = this.ctx.createBiquadFilter();
    nFilter.type = 'lowpass';
    nFilter.frequency.setValueAtTime(700, now);
    nFilter.frequency.linearRampToValueAtTime(150, now + 0.25);

    nGain.gain.setValueAtTime(0.6, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  // Orbiting Blade Whir
  playGlaiveSpin() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.linearRampToValueAtTime(650, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /* ------------------------------------------------------------------
     FAR-RANGE GUN SOUND EFFECTS
     ------------------------------------------------------------------ */

  // Pulse Laser Repeater
  playLaserShot() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Pulse Railgun (Charge + Hyper Piercing Crack)
  playRailgunFire() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // High electrical crack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);

    // Deep thunder shock
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(220, now);
    sub.frequency.exponentialRampToValueAtTime(40, now + 0.3);

    subGain.gain.setValueAtTime(0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + 0.35);
  }

  // Micro Missiles Launch
  playMissileLaunch() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Scatter Flak Burst
  playFlakShot() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.15);
    const nGain = this.ctx.createGain();
    const nFilter = this.ctx.createBiquadFilter();

    nFilter.type = 'lowpass';
    nFilter.frequency.setValueAtTime(1400, now);
    nFilter.frequency.exponentialRampToValueAtTime(300, now + 0.14);

    nGain.gain.setValueAtTime(0.5, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  // Void Vortex Orb
  playVoidShot() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.18);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /* ------------------------------------------------------------------
     IMPACT, COMBAT & UI SOUNDS
     ------------------------------------------------------------------ */

  // Blade deflection / kinetic parry
  playDeflection() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Electric Arc / Lightning Zap
  playElectricZap() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950 + Math.random() * 350, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.07);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Enemy Hit / Flesh/Geometric Crunch
  playEnemyHit() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Geometric Enemy Shatter / Explosion
  playExplosion(isBoss = false) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const dur = isBoss ? 0.7 : 0.25;

    // Sub boom
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(isBoss ? 140 : 180, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + dur);

    subGain.gain.setValueAtTime(isBoss ? 0.9 : 0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + dur + 0.05);

    // Noise rumble
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(dur);
    const nGain = this.ctx.createGain();
    const nFilter = this.ctx.createBiquadFilter();

    nFilter.type = 'lowpass';
    nFilter.frequency.setValueAtTime(600, now);
    nFilter.frequency.linearRampToValueAtTime(100, now + dur);

    nGain.gain.setValueAtTime(isBoss ? 0.7 : 0.4, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  // Phase Dash
  playDash() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Ultimate Super Nova
  playUltimateBlast() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
    osc1.frequency.exponentialRampToValueAtTime(80, now + 0.8);

    osc2.frequency.setValueAtTime(110, now);
    osc2.frequency.linearRampToValueAtTime(40, now + 0.8);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.9);
    osc2.stop(now + 0.9);
  }

  // XP / Scrap Gem Pickup
  playGemPickup() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const pitch = notes[Math.floor(Math.random() * notes.length)];
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Level Up Jingle
  playLevelUp() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880]; // A major

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  }

  // Shield Broken Warning
  playShieldBreak() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  /* ------------------------------------------------------------------
     SUBTLE AMBIENT BACKGROUND MUSIC ("Stars Come Alive")
     ------------------------------------------------------------------ */
  startAmbientBeat() {
    if (!this.bgm || this.isMuted) return;
    if (this.bgm.paused) {
      const p = this.bgm.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    }
    this._fadeBgmTo(this.bgmTargetVolume);
  }
}

window.soundEngine = new SoundEngine();