// Synthesized Cartoon Web Audio Engine for Sunny Squeeze: Lemonade Tycoon
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch (e) {
      // AudioContext unavailable
    }
  }

  resume() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type, duration, vol = 0.15, slideTo = null, delay = 0) {
    if (this.muted) return;
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  pop() {
    this.playTone(520, 'sine', 0.07, 0.12, 760);
  }

  nav() {
    this.playTone(380, 'triangle', 0.05, 0.08, 440);
  }

  buy() {
    this.playTone(440, 'triangle', 0.08, 0.12, 660);
    this.playTone(660, 'sine', 0.1, 0.1, 880, 0.05);
  }

  error() {
    this.playTone(220, 'sawtooth', 0.12, 0.09, 150);
    this.playTone(170, 'sawtooth', 0.14, 0.09, 120, 0.08);
  }

  coin() {
    // Classic bright cha-ching!
    this.playTone(987.77, 'sine', 0.08, 0.13); // B5
    this.playTone(1318.51, 'sine', 0.22, 0.15, null, 0.07); // E6
  }

  iceClink() {
    this.playTone(1850, 'sine', 0.05, 0.06, 2200);
    this.playTone(2400, 'sine', 0.04, 0.05, 1900, 0.04);
  }

  openBell() {
    this.playTone(659.25, 'triangle', 0.12, 0.14);
    this.playTone(880, 'triangle', 0.12, 0.14, null, 0.1);
    this.playTone(1046.5, 'sine', 0.28, 0.16, null, 0.2);
  }

  dayEnd(profitPositive) {
    if (profitPositive) {
      this.playTone(523.25, 'triangle', 0.12, 0.14);
      this.playTone(659.25, 'triangle', 0.12, 0.14, null, 0.1);
      this.playTone(783.99, 'triangle', 0.12, 0.14, null, 0.2);
      this.playTone(1046.5, 'sine', 0.35, 0.18, null, 0.3);
    } else {
      this.playTone(392, 'triangle', 0.18, 0.12);
      this.playTone(349.23, 'triangle', 0.18, 0.12, null, 0.16);
      this.playTone(311.13, 'sine', 0.32, 0.14, null, 0.32);
    }
  }
}

window.soundFX = new SoundEngine();
