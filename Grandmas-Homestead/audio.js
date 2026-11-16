// Procedural Cozy Sound & Music System using Web Audio API
// Fully offline, no external assets needed!

const TOWN_LOCATIONS = new Set([
  'city',
  'interior_store',
  'interior_church',
  'interior_library',
  'interior_bakery',
  'interior_blacksmith',
  'interior_townhall'
]);

const ZONE_PLAYLISTS = {
  town: [
    'audio/asian-market.m4a',
    'audio/project-saunderlust.m4a',
    'audio/grayman-castle-market.m4a'
  ],
  pastoral: [
    'audio/bard.m4a',
    'audio/plucky-field.m4a',
    'audio/wanderer.m4a',
    'audio/tasty-cheese.m4a'
  ]
};

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicPlaying = false;
    this.musicTimer = null;
    this.ambientTimer = null;
    this.currentTrackStep = 0;

    // Area-aware subtle background music player
    this.currentZone = 'pastoral'; // 'town' | 'pastoral'
    this.zoneTrackIndex = { town: 0, pastoral: 0 };
    this.bgm = null;
    this.bgmActiveSrc = '';
    this.bgmTargetVolume = 0.16;
    this.bgmCurrentVolume = 0;
    this.bgmFadeTimer = null;
    this.bgmTransitioning = false;
    this.useProceduralFallback = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this._ensureBgmElement();
  }

  _advanceZoneTrack() {
    const playlist = ZONE_PLAYLISTS[this.currentZone] || ZONE_PLAYLISTS.pastoral;
    this.zoneTrackIndex[this.currentZone] = ((this.zoneTrackIndex[this.currentZone] || 0) + 1) % playlist.length;
  }

  _ensureBgmElement() {
    if (this.bgm || this.useProceduralFallback || typeof Audio === 'undefined') return;
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 0;
      audio.muted = this.isMuted;

      audio.addEventListener('ended', () => {
        if (!this.bgm || this.isMuted || !this.isMusicPlaying) return;
        this._advanceZoneTrack();
        this._playZoneTrack(false);
      });

      audio.addEventListener('error', () => {
        const playlist = ZONE_PLAYLISTS[this.currentZone] || ZONE_PLAYLISTS.pastoral;
        if (playlist.length > 1) {
          this._advanceZoneTrack();
          this._playZoneTrack(false);
        }
      });

      this.bgm = audio;
    } catch (e) {
      this.useProceduralFallback = true;
    }
  }

  setLocation(loc) {
    const nextZone = TOWN_LOCATIONS.has(loc) ? 'town' : 'pastoral';
    if (nextZone === this.currentZone) return;
    this.currentZone = nextZone;
    if (this.isMusicPlaying && !this.isMuted) {
      this._playZoneTrack(true);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  // --- Sound Effects ---

  // Tilling ground (soft thud and dirt scrape)
  playHoe() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    // Thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);

    // Dirt crunch noise
    this.playNoise(0.1, 800, 0.15);
  }

  // Watering splash
  playWater() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const count = 3;
    for (let i = 0; i < count; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = i * 0.04;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + Math.random() * 300, now + delay);
      osc.frequency.exponentialRampToValueAtTime(300, now + delay + 0.08);

      gain.gain.setValueAtTime(0.12, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.09);
    }
  }

  // Planting seed
  playPlant() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Harvest pluck (rewarding chime + pop)
  playHarvest() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.05;
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  }

  // Chop / Pickaxe impact
  playHit() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
    this.playNoise(0.08, 1200, 0.2);
  }

  // Footstep grass rustle
  playFootstep() {
    if (this.isMuted) return;
    this.init();
    this.playNoise(0.04, 600, 0.05);
  }

  // Coin / Purchase jingle
  playCoin() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.09);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.3);
  }

  // Grandma's dialogue chime
  playDialogue() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440 + Math.random() * 80, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Rooster / morning call
  playMorning() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    // Cheerful morning chime progression (G4 -> C5 -> E5 -> G5)
    const notes = [392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.12;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  // Noise generator helper (for footsteps, scythe swoosh, dirt)
  playNoise(duration, filterFreq = 1000, volume = 0.1) {
    if (this.isMuted || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // --- Background Subtle Music Loop ---
  startMusic() {
    if (this.isMuted) return;
    this.init();

    if (this.bgm && !this.useProceduralFallback) {
      if (this.isMusicPlaying && !this.bgm.paused) return;
      this.isMusicPlaying = true;
      this._playZoneTrack(false);
      return;
    }

    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.scheduleNextChord();
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.bgmFadeTimer) {
      clearInterval(this.bgmFadeTimer);
      this.bgmFadeTimer = null;
    }
    this.bgmTransitioning = false;
    if (this.bgm) {
      this.bgm.muted = true;
      this.bgm.volume = 0;
      this.bgmCurrentVolume = 0;
      this.bgm.pause();
    }
  }

  _getDesiredTrack() {
    const playlist = ZONE_PLAYLISTS[this.currentZone] || ZONE_PLAYLISTS.pastoral;
    const idx = this.zoneTrackIndex[this.currentZone] || 0;
    return playlist[idx % playlist.length];
  }

  _fadeBgmTo(targetVol, onComplete) {
    if (!this.bgm) {
      if (onComplete) onComplete();
      return;
    }
    if (this.bgmFadeTimer) clearInterval(this.bgmFadeTimer);
    this.bgmFadeTimer = setInterval(() => {
      if (!this.bgm) {
        clearInterval(this.bgmFadeTimer);
        this.bgmFadeTimer = null;
        if (onComplete) onComplete();
        return;
      }
      const goal = this.isMuted ? 0 : targetVol;
      const diff = goal - this.bgmCurrentVolume;
      if (Math.abs(diff) <= 0.01) {
        this.bgmCurrentVolume = goal;
        this.bgm.volume = Math.max(0, Math.min(1, goal));
        clearInterval(this.bgmFadeTimer);
        this.bgmFadeTimer = null;
        if (onComplete) onComplete();
      } else {
        this.bgmCurrentVolume += diff * 0.22;
        this.bgm.volume = Math.max(0, Math.min(1, this.bgmCurrentVolume));
      }
    }, 55);
  }

  _playZoneTrack(fadeOutFirst = false) {
    if (!this.bgm || this.isMuted) return;
    const desiredSrc = this._getDesiredTrack();

    const startTrack = () => {
      if (!this.bgm || this.isMuted || !this.isMusicPlaying) return;
      const targetSrc = this._getDesiredTrack();
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
          // Browser blocked autoplay before user gesture; allow next gesture to retry
          this.isMusicPlaying = false;
        });
      } else {
        this._fadeBgmTo(this.bgmTargetVolume);
      }
    };

    if (fadeOutFirst && !this.bgm.paused && this.bgmCurrentVolume > 0.02 && this.bgmActiveSrc !== desiredSrc) {
      this.bgmTransitioning = true;
      this._fadeBgmTo(0, () => {
        this.bgmTransitioning = false;
        if (!this.isMuted && this.isMusicPlaying) {
          startTrack();
        }
      });
    } else {
      this.bgm.loop = false;
      startTrack();
    }
  }

  scheduleNextChord() {
    if (!this.isMusicPlaying || this.isMuted) return;

    // Stardew Valley inspired peaceful acoustic guitar chord progression:
    // Cmaj7 -> Am7 -> Fmaj7 -> G7
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // C, E, G, B
      [220.00, 261.63, 329.63, 392.00], // A, C, E, G
      [174.61, 261.63, 329.63, 349.23], // F, C, E, F
      [196.00, 246.94, 293.66, 392.00]  // G, B, D, G
    ];

    const chord = chords[this.currentTrackStep % chords.length];
    this.currentTrackStep++;

    const now = this.ctx.currentTime;
    
    // Arpeggiate the chord softly like an acoustic fingerpicking
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + (idx * 0.18) + (Math.random() * 0.02);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.045, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 1.3);
    });

    // Schedule next chord in 2.2 seconds
    this.musicTimer = setTimeout(() => {
      this.scheduleNextChord();
    }, 2200);
  }

  // Fishing cast swoosh & plop
  playCast() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    this.playNoise(0.14, 1500, 0.14);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.28);
    gain.gain.setValueAtTime(0.16, now + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now + 0.14);
    osc.stop(now + 0.31);
  }

  // Fish bite exclamation chime + water splash
  playBite() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    this.playNoise(0.1, 1100, 0.18);
    [740, 987.77].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.15);
    });
  }

  // Catch success fanfare
  playCatch() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.06;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  // Cozy kitchen cooking sizzle + ding
  playCook() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    this.playNoise(0.22, 2200, 0.12);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, now + 0.18);
    gain.gain.setValueAtTime(0.16, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now + 0.18);
    osc.stop(now + 0.46);
  }
}

window.soundSystem = new SoundSystem();
