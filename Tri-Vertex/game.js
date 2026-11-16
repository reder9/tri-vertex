/**
 * TRI-VERTEX // MAIN GAME CONTROLLER & ENGINE
 * Orchestrates Canvas Rendering, Game Loop, Waves, Upgrades, Input, and UI.
 */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    // Cosmic Arena & Virtual Camera System
    this.arenaWidth = 3200;
    this.arenaHeight = 2400;
    this.width = this.arenaWidth;
    this.height = this.arenaHeight;
    this.viewportWidth = window.innerWidth || 1920;
    this.viewportHeight = window.innerHeight || 1080;
    this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scale = 1.0;
    this.dpr = 1.0;
    this.autoCombat = true;

    // Game state
    this.state = 'start'; // 'start', 'playing', 'upgrade', 'paused', 'gameover'
    this.wave = 1;
    this.waveTimer = 0;
    this.waveDuration = 20; // seconds per wave before clearing & next wave
    this.enemiesDefeated = 0;
    this.totalScore = 0;
    this.highScore = parseInt(localStorage.getItem('trivertex_highscore') || '0', 10);
    this.bestSector = parseInt(localStorage.getItem('trivertex_bestsector') || '1', 10);

    // Entity lists
    this.player = new Player(this.width / 2, this.height / 2);
    this.enemies = [];
    this.projectiles = [];
    this.gems = [];
    this.particles = [];
    this.floatingTexts = [];
    this.beams = [];
    this.shockwaves = [];
    this.electricTrails = [];

    // Screen shake
    this.shakeMag = 0;
    this.shakeDuration = 0;

    // Time Dilation / Pacing
    this.timeDilation = 1.0;
    this.isLevelingUp = false;

    // Wave spawning state
    this.spawnInterval = 2.2;
    this.spawnTimer = 0;
    this.waveCleared = false;

    // Input state
    this.input = {
      keys: {},
      mouseX: this.width / 2,
      mouseY: this.height / 2,
      leftMouseDown: false,
      rightMouseDown: false,
      dashPressed: false,
      // Mouse hold trackers
      isMouseLeftHeld: false,
      isMouseRightHeld: false,
      // Xbox Gamepad state
      gamepadConnected: false,
      gamepadMoveX: 0,
      gamepadMoveY: 0,
      gamepadMoveMagnitude: 0,
      gamepadAiming: false,
      gamepadAimAngle: 0,
      gamepadLtHeld: false,
      gamepadRtHeld: false,
      gamepadSlashHeld: false,
      gamepadRangedHeld: false,
      // Virtual Cursor for Xbox Controller
      cursorX: (this.viewportWidth || window.innerWidth || 1280) / 2,
      cursorY: (this.viewportHeight || window.innerHeight || 720) / 2,
      virtualCursorSpeed: 1050,
      usingGamepadCursor: false,
      usingMouse: false,
      // Mobile & Tablet Touch Controls
      touchControlsActive: false,
      touchMoveX: 0,
      touchMoveY: 0,
      touchMoveMagnitude: 0,
      touchAiming: false,
      touchDragAiming: false,
      touchAimAngle: 0,
      touchMeleeHeld: false,
      touchRangedHeld: false
    };

    // Controller debouncing and menu navigation state
    this.prevGamepadButtons = {};
    this.controllerCardIndex = 0;
    this.controllerNavCooldown = 0;

    // UI elements cache
    this.ui = {
      shieldBar: document.getElementById('shield-bar'),
      shieldText: document.getElementById('shield-text'),
      healthBar: document.getElementById('health-bar'),
      healthText: document.getElementById('health-text'),
      energyBar: document.getElementById('energy-bar'),
      energyText: document.getElementById('energy-text'),
      dashBar: document.getElementById('dash-bar'),
      dashText: document.getElementById('dash-text'),
      waveNumber: document.getElementById('wave-number'),
      scoreText: document.getElementById('score-text'),
      comboContainer: document.getElementById('combo-container'),
      comboMultiplier: document.getElementById('combo-multiplier'),
      playerLevel: document.getElementById('player-level'),
      xpBar: document.getElementById('xp-bar'),
      xpText: document.getElementById('xp-text'),
      synergyBar: document.getElementById('synergy-bar'),
      synergyStatus: document.getElementById('synergy-status'),
      mobileSynergyBar: document.getElementById('mobile-synergy-bar'),
      meleeSlots: document.getElementById('melee-slots'),
      rangedSlots: document.getElementById('ranged-slots'),
      ultCard: document.getElementById('ultimate-button'),
      ultTag: document.getElementById('ult-ready-tag'),
      audioBtn: document.getElementById('btn-audio'),
      audioIcon: document.getElementById('audio-icon'),
      pauseBtn: document.getElementById('btn-pause'),
      gamepadBadge: document.getElementById('gamepad-badge'),
      virtualCursor: document.getElementById('gamepad-virtual-cursor'),
      // Screens
      screenStart: document.getElementById('screen-start'),
      screenControlsGuide: document.getElementById('screen-controls-guide'),
      screenUpgrade: document.getElementById('screen-upgrade'),
      screenPause: document.getElementById('screen-pause'),
      screenGameOver: document.getElementById('screen-gameover'),
      upgradeContainer: document.getElementById('upgrade-cards-container'),
      // Gameover fields
      finalScore: document.getElementById('final-score'),
      finalWave: document.getElementById('final-wave'),
      finalKills: document.getElementById('final-kills'),
      finalCombo: document.getElementById('final-combo'),
      bestScore: document.getElementById('best-score'),
      // Toast
      toastBanner: document.getElementById('game-toast'),
      toastTitle: document.getElementById('toast-title'),
      toastMessage: document.getElementById('toast-message'),
      toastIconWrap: document.getElementById('toast-icon-wrap'),
      // Touch Controls Elements
      btnRotateToggle: document.getElementById('btn-rotate-toggle'),
      btnModalRotate: document.getElementById('btn-modal-rotate'),
      orientationPrompt: document.getElementById('orientation-prompt'),
      btnOrientationRotate: document.getElementById('btn-orientation-rotate'),
      btnOrientationDismiss: document.getElementById('btn-orientation-dismiss'),
      btnTouchToggle: document.getElementById('btn-touch-toggle'),
      touchControls: document.getElementById('touch-controls'),
      touchZoneLeft: document.getElementById('touch-zone-left'),
      joystickBase: document.getElementById('touch-joystick-base'),
      joystickKnob: document.getElementById('touch-joystick-knob'),
      touchZoneRight: document.getElementById('touch-zone-right'),
      touchBtnSwapMelee: document.getElementById('touch-btn-swap-melee'),
      touchBtnSwapRanged: document.getElementById('touch-btn-swap-ranged'),
      touchBtnNova: document.getElementById('touch-btn-nova'),
      touchBtnDash: document.getElementById('touch-btn-dash'),
      touchBtnMelee: document.getElementById('touch-btn-melee'),
      touchBtnRanged: document.getElementById('touch-btn-ranged'),
      touchMeleeLabel: document.getElementById('touch-melee-label'),
      touchRangedLabel: document.getElementById('touch-ranged-label')
    };

    this.toastTimeout = null;
    this.lastTime = performance.now();
    this.backdropCamX = 0;
    this.backdropCamY = 0;
    this.smoothedWave = 1;

    // Round-specific upgrade progression tracking
    this.playerUpgradeTiers = {};
    this.acquiredUpgradeIds = new Set();

    window.gameInstance = this;
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initGalaxyBackdrop();

    // Bind event listeners
    this.setupInputHandlers();
    this.setupGamepadListeners();
    this.setupTouchControls();
    this.setupOrientationAndTabs();
    this.setupUIButtons();
    this.renderWeaponSlots();

    // Start render requestAnimationFrame loop
    requestAnimationFrame((t) => this.loop(t));
  }

  resize() {
    this.viewportWidth = window.innerWidth || 1920;
    this.viewportHeight = window.innerHeight || 1080;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Physical canvas buffer scaling for high-resolution Retina & OLED displays
    this.canvas.width = Math.round(this.viewportWidth * this.dpr);
    this.canvas.height = Math.round(this.viewportHeight * this.dpr);
    this.canvas.style.width = `${this.viewportWidth}px`;
    this.canvas.style.height = `${this.viewportHeight}px`;

    // World arena boundaries remain expansive (3200 x 2400) & toroidally wrapped
    this.width = this.arenaWidth;
    this.height = this.arenaHeight;
    if (typeof window !== 'undefined') {
      window.ARENA_WIDTH = this.arenaWidth;
      window.ARENA_HEIGHT = this.arenaHeight;
    }

    // Center camera on player immediately with toroidal wrapping
    if (this.player) {
      this.camera.targetX = this.player.x - this.viewportWidth / 2;
      this.camera.targetY = this.player.y - this.viewportHeight / 2;
      this.camera.x = wrapCoord(this.camera.targetX, this.arenaWidth);
      this.camera.y = wrapCoord(this.camera.targetY, this.arenaHeight);
    }
  }

  setupInputHandlers() {
    window.addEventListener('keydown', (e) => {
      this.input.keys[e.code] = true;

      // Start game on Space or Enter from title screen
      if (this.state === 'start' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        window.soundEngine.init();
        window.soundEngine.resume();
        this.startGame();
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        this.input.dashPressed = true;
      }

      // Quick weapon switches
      // 1-4: Melee
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
        const idx = parseInt(e.code.replace('Digit', ''), 10) - 1;
        if (this.player) this.player.setMeleeIndex(idx);
        this.renderWeaponSlots();
      }

      // 5-8 or 9: Ranged
      if (['Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'].includes(e.code)) {
        const idx = parseInt(e.code.replace('Digit', ''), 10) - 5;
        if (this.player) this.player.setRangedIndex(idx);
        this.renderWeaponSlots();
      }

      // Q: Cycle Melee
      if (e.code === 'KeyQ') {
        if (this.player && this.player.meleeWeapons.length > 0) {
          const next = (this.player.activeMeleeIndex + 1) % this.player.meleeWeapons.length;
          this.player.setMeleeIndex(next);
          this.renderWeaponSlots();
        }
      }

      // E: Cycle Ranged
      if (e.code === 'KeyE') {
        if (this.player && this.player.rangedWeapons.length > 0) {
          const next = (this.player.activeRangedIndex + 1) % this.player.rangedWeapons.length;
          this.player.setRangedIndex(next);
          this.renderWeaponSlots();
        }
      }

      // Pause toggle: Escape or KeyP
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.state === 'playing') {
          this.pauseGame();
        } else if (this.state === 'paused') {
          this.resumeGame();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.input.keys[e.code] = false;
      if (e.code === 'Space') {
        this.input.dashPressed = false;
      }
    });

    window.addEventListener('mousemove', (e) => {
      // Ignore micro-vibrations from controller rumble or desk bumps while playing with gamepad
      const moveDelta = Math.hypot(e.movementX || 0, e.movementY || 0);
      if (this.input.gamepadConnected && moveDelta < 3.5) {
        return;
      }
      this.input.usingGamepadCursor = false;
      this.input.usingMouse = true;
      if (this.input.touchControlsActive && moveDelta > 2.5) {
        this.setTouchControlsActive(false);
      }
      const rect = this.canvas.getBoundingClientRect();
      // Translate screen pointer to arena world coordinates via camera offset
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      this.input.cursorX = cx;
      this.input.cursorY = cy;
      this.input.mouseX = cx + this.camera.x;
      this.input.mouseY = cy + this.camera.y;
      if (this.ui.virtualCursor) {
        this.ui.virtualCursor.classList.add('hidden');
      }
    });

    window.addEventListener('mousedown', (e) => {
      this.input.usingGamepadCursor = false;
      this.input.usingMouse = true;
      if (this.input.touchControlsActive) {
        this.setTouchControlsActive(false);
      }
      const rect = this.canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      this.input.cursorX = cx;
      this.input.cursorY = cy;
      this.input.mouseX = cx + this.camera.x;
      this.input.mouseY = cy + this.camera.y;
      if (e.button === 0) {
        this.input.isMouseLeftHeld = true;
        this.input.leftMouseDown = true;
      } else if (e.button === 2) {
        this.input.isMouseRightHeld = true;
        this.input.rightMouseDown = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.input.isMouseLeftHeld = false;
        if (!this.input.gamepadSlashHeld && !this.input.gamepadRtHeld) {
          this.input.leftMouseDown = false;
        }
      } else if (e.button === 2) {
        this.input.isMouseRightHeld = false;
        if (!this.input.gamepadRangedHeld && !this.input.gamepadLtHeld) {
          this.input.rightMouseDown = false;
        }
      }
    });

    // Disable default context menu to enable fluid right-click weapon firing
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  setupUIButtons() {
    // Update Main Menu Personal Record Badge
    const updateMenuBadges = () => {
      const recordText = document.getElementById('menu-record-text');
      if (recordText) {
        const hsFormatted = this.highScore.toLocaleString();
        recordText.innerText = `BEST RECORD: SECTOR ${this.bestSector} • ${hsFormatted} PTS`;
      }

      const hintText = document.getElementById('hero-hint-text');
      if (hintText) {
        const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);
        if (hasTouch) {
          hintText.innerText = 'TOUCH: LEFT THUMB FLIGHT • AUTO-COMBAT ACTIVE';
        } else if (this.input.gamepadConnected) {
          hintText.innerText = 'XBOX CONTROLLER DETECTED • PRESS [A] TO DEPLOY';
        } else {
          hintText.innerText = 'KEYBOARD: WASD FLIGHT • MOUSE AIM • SPACE DASH';
        }
      }
    };
    updateMenuBadges();

    // Start button (Supports both tap and click for zero delay on mobile)
    const btnStart = document.getElementById('btn-start');
    if (btnStart) {
      const handleStart = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        window.soundEngine.init();
        window.soundEngine.resume();
        this.startGame();
      };
      btnStart.addEventListener('click', handleStart);
      btnStart.addEventListener('touchstart', handleStart, { passive: false });
    }

    // How to play guide open/close handlers
    const btnOpenGuide = document.getElementById('btn-open-guide');
    const btnCloseGuide = document.getElementById('btn-close-guide');
    const btnGuideStart = document.getElementById('btn-guide-start');

    if (btnOpenGuide) {
      btnOpenGuide.addEventListener('click', () => {
        if (this.ui.screenControlsGuide) this.ui.screenControlsGuide.classList.remove('hidden');
      });
    }
    if (btnCloseGuide) {
      btnCloseGuide.addEventListener('click', () => {
        if (this.ui.screenControlsGuide) this.ui.screenControlsGuide.classList.add('hidden');
      });
    }
    if (btnGuideStart) {
      btnGuideStart.addEventListener('click', () => {
        if (this.ui.screenControlsGuide) this.ui.screenControlsGuide.classList.add('hidden');
        window.soundEngine.init();
        window.soundEngine.resume();
        this.startGame();
      });
    }

    // Menu Audio Toggle
    const btnMenuAudio = document.getElementById('btn-menu-audio');
    const menuAudioLabel = document.getElementById('menu-audio-label');
    if (btnMenuAudio) {
      btnMenuAudio.addEventListener('click', () => {
        window.soundEngine.init();
        const enabled = window.soundEngine.toggle();
        if (menuAudioLabel) {
          menuAudioLabel.innerText = enabled ? 'SOUND: ON' : 'SOUND: MUTED';
        }
        this.showToast('AUDIO', enabled ? 'Sound FX and Music active' : 'Sound muted', '#ffb700');
      });
    }

    // Menu Fullscreen Toggle
    const btnMenuFullscreen = document.getElementById('btn-menu-fullscreen');
    if (btnMenuFullscreen) {
      btnMenuFullscreen.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }

    // Top HUD Audio toggle button
    this.ui.audioBtn.addEventListener('click', () => {
      window.soundEngine.init();
      window.soundEngine.resume();
      const muted = window.soundEngine.toggleMute();
      this.ui.audioIcon.innerHTML = muted ?
        '<use href="#icon-volume-x"></use>' :
        '<use href="#icon-volume"></use>';
    });

    // Pause button
    this.ui.pauseBtn.addEventListener('click', () => {
      if (this.state === 'playing') this.pauseGame();
      else if (this.state === 'paused') this.resumeGame();
    });

    // Resume button
    document.getElementById('btn-resume').addEventListener('click', () => {
      this.resumeGame();
    });

    // Restart from pause
    document.getElementById('btn-restart-pause').addEventListener('click', () => {
      this.startGame();
    });

    // Return to Game Main Menu from pause
    document.getElementById('btn-main-menu')?.addEventListener('click', () => {
      this.returnToMainMenu();
    });

    // Restart from gameover
    document.getElementById('btn-restart').addEventListener('click', () => {
      this.startGame();
    });

    // Ultimate button click
    this.ui.ultCard.addEventListener('click', () => {
      if (this.player && this.player.ultimateCharge >= this.player.ultimateMax) {
        this.player.triggerUltimate(this);
      }
    });
  }

  setupTouchControls() {
    if (!this.ui.touchControls) return;

    // Only enable touch controls automatically when primary input is coarse touch (phones/tablets/handhelds)
    const hasTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    this.setTouchControlsActive(hasTouch);

    // Audio unlock on user touch interaction anywhere
    const unlockAudio = () => {
      if (window.soundEngine) {
        window.soundEngine.init();
        window.soundEngine.resume();
      }
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('touchend', unlockAudio, { passive: true });

    // Toggle button in top action bar
    if (this.ui.btnTouchToggle) {
      this.ui.btnTouchToggle.addEventListener('click', () => {
        unlockAudio();
        const nextState = !this.input.touchControlsActive;
        this.setTouchControlsActive(nextState);
        this.showToast('TOUCH CONTROLS', nextState ? 'Touch controls active' : 'Touch controls hidden', '#00f0ff');
      });
    }

    // Dynamic Floating Joystick (Anchors under left thumb anywhere on screen)
    let joystickTouchId = null;
    let joystickOriginX = 0;
    let joystickOriginY = 0;

    const getTouchById = (touchList, id) => {
      for (let i = 0; i < touchList.length; i++) {
        if (touchList[i].identifier === id) return touchList[i];
      }
      return null;
    };

    const updateJoystickPosition = (clientX, clientY) => {
      const dx = clientX - joystickOriginX;
      const dy = clientY - joystickOriginY;
      const distance = Math.hypot(dx, dy);
      const baseRect = this.ui.joystickBase ? this.ui.joystickBase.getBoundingClientRect() : null;
      const baseWidth = baseRect ? baseRect.width : 90;
      const dynamicMaxRadius = baseWidth * 0.42;
      const clampedDist = Math.min(distance, dynamicMaxRadius);
      const nx = distance > 0 ? (dx / distance) * clampedDist : 0;
      const ny = distance > 0 ? (dy / distance) * clampedDist : 0;

      if (this.ui.joystickKnob) {
        this.ui.joystickKnob.style.transform = `translate(${nx}px, ${ny}px)`;
      }

      const mag = Math.min(1, distance / dynamicMaxRadius);
      const deadzone = 0.08;
      if (mag > deadzone) {
        const scaledMag = (mag - deadzone) / (1 - deadzone);
        this.input.touchMoveX = dx / (distance || 1);
        this.input.touchMoveY = dy / (distance || 1);
        this.input.touchMoveMagnitude = scaledMag;
      } else {
        this.input.touchMoveX = 0;
        this.input.touchMoveY = 0;
        this.input.touchMoveMagnitude = 0;
      }
    };

    const resetJoystick = () => {
      joystickTouchId = null;
      if (this.ui.joystickKnob) {
        this.ui.joystickKnob.style.transform = 'translate(0px, 0px)';
      }
      if (this.ui.joystickBase) {
        this.ui.joystickBase.classList.remove('active');
        this.ui.joystickBase.style.transform = '';
      }
      this.input.touchMoveX = 0;
      this.input.touchMoveY = 0;
      this.input.touchMoveMagnitude = 0;
    };

    // Full left half of screen supports dynamic floating joystick placement
    const handleTouchStartLeft = (e) => {
      if (joystickTouchId !== null) return;
      const touch = e.changedTouches[0];
      joystickTouchId = touch.identifier;

      joystickOriginX = touch.clientX;
      joystickOriginY = touch.clientY;

      if (this.ui.joystickBase) {
        this.ui.joystickBase.classList.add('active');
        // Center the joystick visual base right under player's thumb
        const rect = this.ui.touchZoneLeft.getBoundingClientRect();
        const relX = touch.clientX - rect.left;
        const relY = touch.clientY - rect.top;
        this.ui.joystickBase.style.left = `${relX}px`;
        this.ui.joystickBase.style.top = `${relY}px`;
      }

      updateJoystickPosition(touch.clientX, touch.clientY);
      e.preventDefault();
    };

    if (this.ui.touchZoneLeft) {
      this.ui.touchZoneLeft.addEventListener('touchstart', handleTouchStartLeft, { passive: false });

      this.ui.touchZoneLeft.addEventListener('touchmove', (e) => {
        if (joystickTouchId === null) return;
        const touch = getTouchById(e.changedTouches, joystickTouchId);
        if (touch) {
          updateJoystickPosition(touch.clientX, touch.clientY);
        }
        e.preventDefault();
      }, { passive: false });

      this.ui.touchZoneLeft.addEventListener('touchend', (e) => {
        if (joystickTouchId === null) return;
        const touch = getTouchById(e.changedTouches, joystickTouchId);
        if (touch) {
          resetJoystick();
        }
        e.preventDefault();
      }, { passive: false });

      this.ui.touchZoneLeft.addEventListener('touchcancel', (e) => {
        resetJoystick();
      }, { passive: false });
    }

    // Right Action Buttons: Melee Slash, Ranged Fire/Aim, Phase Dash, Super Nova, Weapon Swaps
    if (this.ui.touchBtnMelee) {
      this.ui.touchBtnMelee.addEventListener('touchstart', (e) => {
        e.preventDefault();
        unlockAudio();
        this.input.touchMeleeHeld = true;
        this.input.leftMouseDown = true;
        this.input.isMouseLeftHeld = true;
      }, { passive: false });

      const endMelee = (e) => {
        e.preventDefault();
        this.input.touchMeleeHeld = false;
        this.input.isMouseLeftHeld = false;
        if (!this.input.gamepadSlashHeld && !this.input.gamepadRtHeld) {
          this.input.leftMouseDown = false;
        }
      };
      this.ui.touchBtnMelee.addEventListener('touchend', endMelee, { passive: false });
      this.ui.touchBtnMelee.addEventListener('touchcancel', endMelee, { passive: false });
    }

    if (this.ui.touchBtnRanged) {
      let fireTouchId = null;
      let fireStartX = 0;
      let fireStartY = 0;

      this.ui.touchBtnRanged.addEventListener('touchstart', (e) => {
        e.preventDefault();
        unlockAudio();
        const touch = e.changedTouches[0];
        fireTouchId = touch.identifier;
        fireStartX = touch.clientX;
        fireStartY = touch.clientY;
        this.input.touchRangedHeld = true;
        this.input.rightMouseDown = true;
        this.input.isMouseRightHeld = true;
      }, { passive: false });

      this.ui.touchBtnRanged.addEventListener('touchmove', (e) => {
        if (fireTouchId === null) return;
        const touch = getTouchById(e.changedTouches, fireTouchId);
        if (touch) {
          const dx = touch.clientX - fireStartX;
          const dy = touch.clientY - fireStartY;
          if (Math.hypot(dx, dy) > 12) {
            this.input.touchDragAiming = true;
            this.input.touchAimAngle = Math.atan2(dy, dx);
          }
        }
        e.preventDefault();
      }, { passive: false });

      const endRanged = (e) => {
        e.preventDefault();
        fireTouchId = null;
        this.input.touchRangedHeld = false;
        this.input.touchDragAiming = false;
        this.input.isMouseRightHeld = false;
        if (!this.input.gamepadRangedHeld && !this.input.gamepadLtHeld) {
          this.input.rightMouseDown = false;
        }
      };
      this.ui.touchBtnRanged.addEventListener('touchend', endRanged, { passive: false });
      this.ui.touchBtnRanged.addEventListener('touchcancel', endRanged, { passive: false });
    }

    if (this.ui.touchBtnDash) {
      this.ui.touchBtnDash.addEventListener('touchstart', (e) => {
        e.preventDefault();
        unlockAudio();
        this.input.dashPressed = true;
        if (this.player && this.player.dashCooldown <= 0 && !this.player.isDashing) {
          this.player.triggerDash(this.input);
        }
      }, { passive: false });

      this.ui.touchBtnDash.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.input.dashPressed = false;
      }, { passive: false });
      this.ui.touchBtnDash.addEventListener('touchcancel', (e) => {
        this.input.dashPressed = false;
      }, { passive: false });
    }

    if (this.ui.touchBtnNova) {
      this.ui.touchBtnNova.addEventListener('touchstart', (e) => {
        e.preventDefault();
        unlockAudio();
        if (this.player && this.player.ultimateCharge >= this.player.ultimateMax) {
          this.player.triggerUltimate(this);
        }
      }, { passive: false });
    }

    if (this.ui.touchBtnSwapMelee) {
      const handleSwapMelee = (e) => {
        e.preventDefault();
        unlockAudio();
        if (this.player && this.player.meleeWeapons.length > 0) {
          const next = (this.player.activeMeleeIndex + 1) % this.player.meleeWeapons.length;
          this.player.setMeleeIndex(next);
          this.renderWeaponSlots();
          this.updateTouchWeaponLabels();
        }
      };
      this.ui.touchBtnSwapMelee.addEventListener('touchstart', handleSwapMelee, { passive: false });
      this.ui.touchBtnSwapMelee.addEventListener('click', handleSwapMelee);
    }

    if (this.ui.touchBtnSwapRanged) {
      const handleSwapRanged = (e) => {
        e.preventDefault();
        unlockAudio();
        if (this.player && this.player.rangedWeapons.length > 0) {
          const next = (this.player.activeRangedIndex + 1) % this.player.rangedWeapons.length;
          this.player.setRangedIndex(next);
          this.renderWeaponSlots();
          this.updateTouchWeaponLabels();
        }
      };
      this.ui.touchBtnSwapRanged.addEventListener('touchstart', handleSwapRanged, { passive: false });
      this.ui.touchBtnSwapRanged.addEventListener('click', handleSwapRanged);
    }

    this.updateTouchWeaponLabels();
  }

  setupOrientationAndTabs() {
    // 1. Controls Guide Tabs
    const tabBtns = document.querySelectorAll('.ctrl-tab-btn');
    tabBtns.forEach(btn => {
      const switchTab = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.ctrl-tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');
      };
      btn.addEventListener('click', switchTab);
      btn.addEventListener('touchstart', switchTab, { passive: false });
    });

    // Detect device type to activate optimal tab & avoid covering RG556/handheld screens if gamepad active
    const connectedPads = navigator.getGamepads ? Array.from(navigator.getGamepads()).some(g => g && g.connected) : false;
    const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (connectedPads) {
      this.input.gamepadConnected = true;
      this.setTouchControlsActive(false);
      const gpBtn = document.getElementById('tab-btn-gamepad');
      if (gpBtn) gpBtn.click();
    } else if (isCoarsePointer) {
      this.setTouchControlsActive(true);
      const touchBtn = document.getElementById('tab-btn-touch');
      if (touchBtn) touchBtn.click();
    }

    // Touch event listener on canvas/touch zones restores touch controls cleanly if user switches from handheld controls to touch
    window.addEventListener('touchstart', (e) => {
      if (e.target && e.target.closest && e.target.closest('#btn-touch-toggle')) return;
      this.input.usingMouse = false;
      if (!this.input.touchControlsActive && !this.input.gamepadConnected) {
        this.setTouchControlsActive(true);
      }
    }, { passive: true });

    // Fullscreen / Landscape toggle handlers
    const handleFullscreenToggle = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.toggleFullscreen();
    };

    if (this.ui.btnRotateToggle) {
      this.ui.btnRotateToggle.addEventListener('click', handleFullscreenToggle);
    }
    if (this.ui.btnModalRotate) {
      this.ui.btnModalRotate.addEventListener('click', handleFullscreenToggle);
      this.ui.btnModalRotate.addEventListener('touchstart', handleFullscreenToggle, { passive: false });
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const el = document.documentElement;
      const requestFS = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (requestFS) {
        requestFS.call(el).then(() => {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
          }
        }).catch(() => {});
      }
      this.showToast('FULLSCREEN', 'Widescreen arcade arena active', '#00f0ff');
    } else {
      const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (exitFS) {
        exitFS.call(document).catch(() => {});
      }
      this.showToast('WINDOWED', 'Standard view restored', '#00f0ff');
    }
    setTimeout(() => this.resize(), 150);
  }

  setTouchControlsActive(active) {
    this.input.touchControlsActive = !!active;
    if (this.ui.touchControls) {
      if (this.input.touchControlsActive) {
        this.ui.touchControls.classList.remove('hidden');
        document.body.classList.add('touch-controls-active');
      } else {
        this.ui.touchControls.classList.add('hidden');
        document.body.classList.remove('touch-controls-active');
      }
    }
    if (this.ui.btnTouchToggle) {
      if (this.input.touchControlsActive) {
        this.ui.btnTouchToggle.classList.add('active');
      } else {
        this.ui.btnTouchToggle.classList.remove('active');
      }
    }
  }

  updateTouchWeaponLabels() {
    if (!this.player) return;
    if (this.ui.touchMeleeLabel) {
      this.ui.touchMeleeLabel.innerText = this.player.equippedMelee
        ? this.player.equippedMelee.name.split(' ')[0].toUpperCase()
        : 'LOCKED';
    }
    if (this.ui.touchBtnSwapMelee) {
      this.ui.touchBtnSwapMelee.classList.toggle('disabled', !this.player.equippedMelee);
    }
    if (this.ui.touchRangedLabel) {
      this.ui.touchRangedLabel.innerText = this.player.equippedRanged
        ? this.player.equippedRanged.name.split(' ')[0].toUpperCase()
        : 'NONE';
    }
  }

  setupGamepadListeners() {
    window.focus();
    window.addEventListener('gamepadconnected', (e) => {
      window.focus();
      this.input.gamepadConnected = true;
      this.input.usingGamepadCursor = true;
      this.setTouchControlsActive(false);
      if (this.ui.virtualCursor) {
        this.ui.virtualCursor.classList.remove('hidden');
      }
      const gpName = (e.gamepad.id || 'Xbox Controller').split('(')[0].trim();
      this.updateGamepadBadge(true, gpName);
      this.showToast('XBOX CONTROLLER DETECTED', `${gpName} // Virtual Cursor Ready`, '#00f0ff');
      this.rumble(160, 0.45, 0.35);
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.input.gamepadConnected = false;
      this.input.usingGamepadCursor = false;
      if (this.ui.virtualCursor) {
        this.ui.virtualCursor.classList.add('hidden');
      }
      this.updateGamepadBadge(false);
      this.showToast('CONTROLLER DISCONNECTED', 'Switched to Keyboard & Mouse controls', '#ffaa00');
    });
  }

  updateGamepadBadge(connected, id = '') {
    if (!this.ui.gamepadBadge) return;
    if (connected) {
      this.ui.gamepadBadge.classList.remove('hidden');
      if (id) {
        this.ui.gamepadBadge.title = `Active Gamepad: ${id}`;
      }
    } else {
      this.ui.gamepadBadge.classList.add('hidden');
    }
  }

  rumble(duration = 100, weak = 0.3, strong = 0.5) {
    if (!navigator.getGamepads) return;
    try {
      const gamepads = navigator.getGamepads();
      if (!gamepads) return;
      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp && gp.connected && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
          gp.vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: Math.max(20, duration),
            weakMagnitude: Math.min(1, Math.max(0, weak)),
            strongMagnitude: Math.min(1, Math.max(0, strong))
          }).catch(() => {});
        }
      }
    } catch (_) {}
  }

  pollGamepad(dt) {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    const pads = Array.from(gamepads).filter((p) => p && p.connected);

    if (pads.length === 0) {
      if (this.input.gamepadConnected) {
        this.input.gamepadConnected = false;
        this.updateGamepadBadge(false);
      }
      return;
    }

    const gp = pads[0];
    if (!this.input.gamepadConnected) {
      this.input.gamepadConnected = true;
      const gpName = (gp.id || 'Xbox Controller').split('(')[0].trim();
      this.updateGamepadBadge(true, gpName);
    }

    const isButtonDown = (btnIndex, threshold = 0.18) => {
      return pads.some((p) => p.buttons[btnIndex] && (p.buttons[btnIndex].pressed || p.buttons[btnIndex].value > threshold));
    };

    // Helper for debounced button press
    const isJustPressed = (btnIndex) => {
      const isDown = isButtonDown(btnIndex, 0.5);
      const wasDown = !!this.prevGamepadButtons[btnIndex];
      return isDown && !wasDown;
    };

    const applyDeadzone = (val, deadzone = 0.15) => {
      if (Math.abs(val) < deadzone) return 0;
      return (val - Math.sign(val) * deadzone) / (1 - deadzone);
    };

    // 1. Left Analog Stick (Axes 0, 1) & D-Pad (Buttons 12-15, Axes 6-7, POV Hat Axis 9) merged across all pads
    let rawLx = 0;
    let rawLy = 0;
    let rawRx = 0;
    let rawRy = 0;

    for (const p of pads) {
      const ax0 = p.axes[0] || 0;
      const ax1 = p.axes[1] || 0;
      if (Math.hypot(ax0, ax1) > Math.hypot(rawLx, rawLy)) {
        rawLx = ax0;
        rawLy = ax1;
      }

      const ax2 = p.axes[2] || 0;
      const ax3 = p.axes[3] || 0;
      if (Math.hypot(ax2, ax3) > Math.hypot(rawRx, rawRy)) {
        rawRx = ax2;
        rawRy = ax3;
      }

      // Standard D-Pad buttons: 12=Up, 13=Down, 14=Left, 15=Right
      if (p.buttons[12] && p.buttons[12].pressed) rawLy = -1;
      if (p.buttons[13] && p.buttons[13].pressed) rawLy = 1;
      if (p.buttons[14] && p.buttons[14].pressed) rawLx = -1;
      if (p.buttons[15] && p.buttons[15].pressed) rawLx = 1;

      // Android/Linux D-Pad axes (Axes 6, 7)
      if (p.axes.length > 7) {
        if (Math.abs(p.axes[6]) > 0.5) rawLx = Math.sign(p.axes[6]);
        if (Math.abs(p.axes[7]) > 0.5) rawLy = Math.sign(p.axes[7]);
      }

      // DirectInput POV Hat (Axis 9)
      if (p.axes.length > 9 && p.axes[9] >= -1 && p.axes[9] <= 1.05) {
        const hat = p.axes[9];
        if (hat < -0.9) rawLy = -1; // Up
        else if (Math.abs(hat - (-0.714)) < 0.15) { rawLx = 1; rawLy = -1; } // Up-Right
        else if (Math.abs(hat - (-0.428)) < 0.15) rawLx = 1; // Right
        else if (Math.abs(hat - (-0.142)) < 0.15) { rawLx = 1; rawLy = 1; } // Down-Right
        else if (Math.abs(hat - 0.142) < 0.15) rawLy = 1; // Down
        else if (Math.abs(hat - 0.428) < 0.15) { rawLx = -1; rawLy = 1; } // Down-Left
        else if (Math.abs(hat - 0.714) < 0.15) rawLx = -1; // Left
        else if (Math.abs(hat - 1.0) < 0.08) { rawLx = -1; rawLy = -1; } // Up-Left
      }
    }

    const rawLMag = Math.hypot(rawLx, rawLy);
    const L_DEADZONE = 0.16;
    let lx = 0;
    let ly = 0;
    let lMag = 0;
    if (rawLMag > L_DEADZONE) {
      lMag = Math.min(1.0, (rawLMag - L_DEADZONE) / (0.94 - L_DEADZONE));
      lx = (rawLx / rawLMag) * lMag;
      ly = (rawLy / rawLMag) * lMag;
      this.input.gamepadMoveX = lx;
      this.input.gamepadMoveY = ly;
      this.input.gamepadMoveMagnitude = lMag;
    } else {
      this.input.gamepadMoveX = 0;
      this.input.gamepadMoveY = 0;
      this.input.gamepadMoveMagnitude = 0;
    }

    // 2. Right Analog Stick (Axes 2, 3) (Pure Radial Deadzone - Zero Cardinal Snapping)
    const rawRMag = Math.hypot(rawRx, rawRy);
    const R_DEADZONE = 0.16;
    let rMag = 0;
    let rx = 0;
    let ry = 0;
    let stickAimAngle = null;

    if (rawRMag > R_DEADZONE) {
      rMag = Math.min(1.0, (rawRMag - R_DEADZONE) / (0.94 - R_DEADZONE));
      // Continuous raw trigonometric arc: never clamps to 0 or snaps at 0, 90, 180, 270 deg
      stickAimAngle = Math.atan2(rawRy, rawRx);
      rx = (rawRx / rawRMag) * rMag;
      ry = (rawRy / rawRMag) * rMag;
    }

    if (this.state === 'playing') {
      const vWidth = this.viewportWidth || window.innerWidth || 1280;
      const vHeight = this.viewportHeight || window.innerHeight || 720;
      const playerX = this.player ? this.player.x : this.width / 2;
      const playerY = this.player ? this.player.y : this.height / 2;

      // Aim Hysteresis: prevents flickering between right-stick aim and left-stick movement
      if (this.rightStickTimer === undefined) this.rightStickTimer = 0;
      if (this.lastGamepadAimAngle === undefined) this.lastGamepadAimAngle = this.player ? this.player.angle : 0;

      if (stickAimAngle !== null) {
        // Actively aiming with right stick (absolute priority)
        this.rightStickTimer = 0.22; // 220ms persistence prevents deadzone jitter
        this.lastGamepadAimAngle = stickAimAngle;
        this.input.usingGamepadCursor = true;
        this.input.gamepadAiming = true;
        this.input.gamepadAimAngle = stickAimAngle;
      } else if (this.rightStickTimer > 0) {
        // Holding orientation during quick spin/flick or thumb shift
        this.rightStickTimer -= dt;
        this.input.usingGamepadCursor = true;
        this.input.gamepadAiming = true;
        this.input.gamepadAimAngle = this.lastGamepadAimAngle;
      } else if (this.input.gamepadMoveMagnitude > 0.15) {
        // Flight steering: only active when right stick has been completely released
        const moveAngle = Math.atan2(ly, lx);
        this.input.usingGamepadCursor = true;
        this.input.gamepadAiming = false;
        this.input.gamepadAimAngle = moveAngle;
        this.lastGamepadAimAngle = moveAngle;
      } else {
        // Idle
        this.input.gamepadAiming = false;
      }

      // Position crosshair and aim coordinates smoothly along active vector
      const currentAim = this.input.gamepadAimAngle !== undefined ? this.input.gamepadAimAngle : (this.player ? this.player.angle : 0);
      const aimDist = 260 + (rMag > 0 ? rMag * 80 : 0);
      this.input.mouseX = playerX + Math.cos(currentAim) * aimDist;
      this.input.mouseY = playerY + Math.sin(currentAim) * aimDist;
      this.input.cursorX = Math.max(14, Math.min(vWidth - 14, this.input.mouseX - this.camera.x));
      this.input.cursorY = Math.max(14, Math.min(vHeight - 14, this.input.mouseY - this.camera.y));
    } else {
      // In menus (start, upgrade, pause, gameover): Sticks / D-Pad navigate the virtual cursor pointer
      const vWidth = this.viewportWidth || window.innerWidth || 1280;
      const vHeight = this.viewportHeight || window.innerHeight || 720;
      const mx = rMag > 0.1 ? rx : lx;
      const my = rMag > 0.1 ? ry : ly;
      const mMag = Math.hypot(mx, my);
      if (mMag > 0.12) {
        this.input.usingGamepadCursor = true;
        const speed = this.input.virtualCursorSpeed * Math.pow(mMag, 1.45);
        this.input.cursorX += (mx / mMag) * speed * dt;
        this.input.cursorY += (my / mMag) * speed * dt;
      }
      this.input.cursorX = Math.max(14, Math.min(vWidth - 14, this.input.cursorX));
      this.input.cursorY = Math.max(14, Math.min(vHeight - 14, this.input.cursorY));
      this.input.mouseX = this.input.cursorX;
      this.input.mouseY = this.input.cursorY;
    }

    // Update Virtual Cursor DOM element position and hover interaction
    if (this.ui.virtualCursor) {
      if (this.input.gamepadConnected && this.input.usingGamepadCursor) {
        this.ui.virtualCursor.classList.remove('hidden');
        this.ui.virtualCursor.style.transform = `translate3d(${this.input.cursorX}px, ${this.input.cursorY}px, 0)`;

        if (this.state !== 'playing') {
          const hoveredElem = document.elementFromPoint(this.input.cursorX, this.input.cursorY);
          const clickable = hoveredElem ? hoveredElem.closest('button, .up-card, .action-btn, #btn-start, #btn-restart, #btn-resume') : null;
          if (clickable) {
            this.ui.virtualCursor.classList.add('hovering');
            if (isJustPressed(0) || isJustPressed(7)) {
              clickable.click();
              this.rumble(50, 0.2, 0.15);
            }
          } else {
            this.ui.virtualCursor.classList.remove('hovering');
          }
        } else {
          this.ui.virtualCursor.classList.remove('hovering');
          const ring = this.ui.virtualCursor.querySelector('.g-cursor-ring');
          if (ring && this.player && this.player.equippedRanged) {
            const col = this.player.lockedEnemy ? '#ff3366' : (this.player.equippedRanged.color || '#00f0ff');
            ring.style.borderColor = col;
            ring.style.boxShadow = `0 0 14px ${col}, inset 0 0 6px ${col}`;
          }
        }
      } else {
        this.ui.virtualCursor.classList.add('hidden');
      }
    }

    // 3. State-dependent Gamepad Actions
    if (this.state === 'start') {
      // Button A (0) or Start (9) initiates combat sequence
      if (isJustPressed(0) || isJustPressed(9)) {
        window.soundEngine.init();
        window.soundEngine.resume();
        this.startGame();
      }
    } else if (this.state === 'upgrade') {
      // Upgrade selection cards navigation via D-Pad or Left Stick
      if (this.controllerNavCooldown > 0) {
        this.controllerNavCooldown -= dt;
      }

      if (this.controllerNavCooldown <= 0) {
        if (isJustPressed(14) || lx < -0.45) { // Left
          this.controllerCardIndex = (this.controllerCardIndex - 1 + 3) % 3;
          this.updateCardFocus();
          this.controllerNavCooldown = 0.22;
          if (window.soundEngine.playDeflection) window.soundEngine.playDeflection();
          this.rumble(40, 0.15, 0.1);
        } else if (isJustPressed(15) || lx > 0.45) { // Right
          this.controllerCardIndex = (this.controllerCardIndex + 1) % 3;
          this.updateCardFocus();
          this.controllerNavCooldown = 0.22;
          if (window.soundEngine.playDeflection) window.soundEngine.playDeflection();
          this.rumble(40, 0.15, 0.1);
        }
      }

      // Button A (0) confirms and equips selected card
      if (isJustPressed(0)) {
        const cards = this.ui.upgradeContainer.querySelectorAll('.up-card');
        if (cards[this.controllerCardIndex]) {
          cards[this.controllerCardIndex].click();
        }
      }
    } else if (this.state === 'paused') {
      // Button A (0) or Start (9) resumes
      if (isJustPressed(0) || isJustPressed(9)) {
        this.resumeGame();
      } else if (isJustPressed(2) || isJustPressed(3)) { // X or Y restarts
        this.startGame();
      }
    } else if (this.state === 'gameover') {
      // Button A (0) or Start (9) reboots combat protocol
      if (isJustPressed(0) || isJustPressed(9)) {
        this.startGame();
      }
    } else if (this.state === 'playing') {
      // RT / R2 (7) or Button X (2): Primary MELEE Slash (Katana, Lance, Hammer, Glaives)
      const slashPressed = isButtonDown(7, 0.15) || isButtonDown(2);
      this.input.gamepadSlashHeld = slashPressed;
      this.input.gamepadRtHeld = slashPressed;
      if (slashPressed) {
        this.input.leftMouseDown = true;
      } else if (!this.input.isMouseLeftHeld) {
        this.input.leftMouseDown = false;
      }

      // LT / L2 (6): Far-Range BEAM Fire (Pulse Beam, Seekers, Repeater, Flak, Void)
      const beamPressed = isButtonDown(6, 0.15);
      this.input.gamepadRangedHeld = beamPressed;
      this.input.gamepadLtHeld = beamPressed;
      if (beamPressed) {
        this.input.rightMouseDown = true;
      } else if (!this.input.isMouseRightHeld) {
        this.input.rightMouseDown = false;
      }

      // Button A (0) or LB (4): Phase Dash
      const dashButton = isButtonDown(0) || isButtonDown(4);
      if (dashButton) {
        this.input.dashPressed = true;
      } else if (!this.input.keys['Space']) {
        this.input.dashPressed = false;
      }

      // Button Y (3): Super Nova Ultimate
      if (isJustPressed(3)) {
        if (this.player && this.player.ultimateCharge >= this.player.ultimateMax) {
          this.player.triggerUltimate(this);
        }
      }

      // RB (5): Cycle Melee Weapon forward
      if (isJustPressed(5)) {
        if (this.player && this.player.meleeWeapons.length > 0) {
          const next = (this.player.activeMeleeIndex + 1) % this.player.meleeWeapons.length;
          this.player.setMeleeIndex(next);
          this.renderWeaponSlots();
          if (window.soundEngine.playDeflection) window.soundEngine.playDeflection();
          this.rumble(60, 0.2, 0.2);
        }
      }

      // Button B (1): Cycle Ranged Weapon forward
      if (isJustPressed(1)) {
        if (this.player && this.player.rangedWeapons.length > 0) {
          const next = (this.player.activeRangedIndex + 1) % this.player.rangedWeapons.length;
          this.player.setRangedIndex(next);
          this.renderWeaponSlots();
          if (window.soundEngine.playDeflection) window.soundEngine.playDeflection();
          this.rumble(60, 0.2, 0.2);
        }
      }

      // Start / Menu (9): Pause game
      if (isJustPressed(9)) {
        this.pauseGame();
      }

      // Back / View (8): Toggle Audio Mute
      if (isJustPressed(8)) {
        window.soundEngine.init();
        window.soundEngine.resume();
        const muted = window.soundEngine.toggleMute();
        this.ui.audioIcon.innerHTML = muted ?
          '<use href="#icon-volume-x"></use>' :
          '<use href="#icon-volume"></use>';
        this.showToast('AUDIO SYSTEM', muted ? 'Audio Muted' : 'Audio Enabled', '#00f0ff');
      }
    }

    // Record previous button states for debounce edge detection
    for (let i = 0; i < 17; i++) {
      this.prevGamepadButtons[i] = isButtonDown(i, 0.5);
    }
  }

  updateCardFocus() {
    const cards = this.ui.upgradeContainer.querySelectorAll('.up-card');
    cards.forEach((card, idx) => {
      if (idx === this.controllerCardIndex) {
        card.classList.add('controller-focused');
      } else {
        card.classList.remove('controller-focused');
      }
    });
  }

  startGame() {
    this.state = 'playing';
    this.wave = 1;
    this.smoothedWave = 1;
    this.waveTimer = 0;
    if (this.ui.orientationPrompt) {
      this.ui.orientationPrompt.classList.add('hidden');
    }
    this.enemiesDefeated = 0;
    this.totalScore = 0;

    // Reset entities & upgrade progression for fresh round
    this.player = new Player(this.width / 2, this.height / 2);
    this.playerUpgradeTiers = {};
    this.acquiredUpgradeIds = new Set();
    this.enemies = [];
    this.projectiles = [];
    this.gems = [];
    this.particles = [];
    this.floatingTexts = [];
    this.beams = [];
    this.shockwaves = [];
    this.electricTrails = [];

    // Hide overlays
    this.ui.screenStart.classList.add('hidden');
    this.ui.screenPause.classList.add('hidden');
    this.ui.screenGameOver.classList.add('hidden');
    this.ui.screenUpgrade.classList.add('hidden');

    this.renderWeaponSlots();
    this.spawnShockwave(this.player.x, this.player.y, 90, '#00f0ff');
    this.spawnSparks(this.player.x, this.player.y, '#00f0ff', 24);
    this.spawnFloatingText(this.player.x, this.player.y - 35, 'COMBAT TRIANGLE ONLINE', '#00f0ff');
    this.showToast('SECTOR 01 INITIALIZED', 'Hostile geometric signatures incoming!', '#00f0ff');
    if (window.soundEngine && window.soundEngine.setMusicState) {
      window.soundEngine.setMusicState('playing');
    }
  }

  pauseGame() {
    this.state = 'paused';
    document.getElementById('pause-wave').innerText = this.wave;
    document.getElementById('pause-kills').innerText = this.enemiesDefeated;
    document.getElementById('pause-score').innerText = this.player.score;
    this.ui.screenPause.classList.remove('hidden');
    if (window.soundEngine && window.soundEngine.setMusicState) {
      window.soundEngine.setMusicState('paused');
    }
  }

  resumeGame() {
    this.state = 'playing';
    this.ui.screenPause.classList.add('hidden');
    this.lastTime = performance.now();
    if (window.soundEngine && window.soundEngine.setMusicState) {
      window.soundEngine.setMusicState('playing');
    }
  }

  returnToMainMenu() {
    this.state = 'start';
    if (window.soundEngine && window.soundEngine.setMusicState) {
      window.soundEngine.setMusicState('menu');
    }
    this.enemies = [];
    this.projectiles = [];
    this.gems = [];
    this.particles = [];
    this.floatingTexts = [];
    this.beams = [];
    this.shockwaves = [];
    this.electricTrails = [];
    this.input.leftMouseDown = false;
    this.input.rightMouseDown = false;
    this.ui.screenPause.classList.add('hidden');
    this.ui.screenGameOver.classList.add('hidden');
    this.ui.screenUpgrade.classList.add('hidden');
    this.ui.screenStart.classList.remove('hidden');
    const recordText = document.getElementById('menu-record-text');
    if (recordText) {
      recordText.innerText = `BEST RECORD: SECTOR ${this.bestSector} • ${this.highScore.toLocaleString()} PTS`;
    }
  }

  gameOver() {
    this.state = 'gameover';

    const finalScore = this.player.score;
    if (finalScore > this.highScore) {
      this.highScore = finalScore;
      localStorage.setItem('trivertex_highscore', this.highScore.toString());
    }
    if (this.wave > this.bestSector) {
      this.bestSector = this.wave;
      localStorage.setItem('trivertex_bestsector', this.bestSector.toString());
    }

    this.ui.finalScore.innerText = finalScore.toLocaleString();
    this.ui.finalWave.innerText = `WAVE ${this.wave}`;
    this.ui.finalKills.innerText = this.enemiesDefeated;
    this.ui.finalCombo.innerText = `${this.player.highestCombo}x`;
    this.ui.bestScore.innerText = this.highScore.toLocaleString();

    this.ui.screenGameOver.classList.remove('hidden');
  }

  triggerLevelUp() {
    if (this.isLevelingUp) return;
    this.isLevelingUp = true;
    window.soundEngine.playLevelUp();

    if (this.player) {
      this.spawnFloatingText(this.player.x, this.player.y - 40, `LEVEL UP! REACHED LEVEL ${this.player.level}`, '#00f0ff', 28);
      this.spawnShockwave(this.player.x, this.player.y, 220, '#00f0ff');
    }

    // Cinematic slow-motion transition so the level up feels paced and dramatic
    this.timeDilation = 0.2;

    setTimeout(() => {
      this.timeDilation = 1.0;
      this.isLevelingUp = false;
      this.state = 'upgrade';
      const titleEl = document.getElementById('upgrade-modal-title');
      if (titleEl && this.player) {
        titleEl.innerText = `LEVEL UP! // REACHED LEVEL ${this.player.level}`;
      }
      this.generateUpgradeCards();
      this.ui.screenUpgrade.classList.remove('hidden');
    }, 600);
  }

  formatUpgradeCardMeta(up) {
    const CONCISE_STATS = {
      magnet_t1: ['360px gem vacuum pulse', '+45px Magnet Radius', '+15% Pull Speed'],
      magnet_t2: ['500px magnetic gem wave', '+70px Magnet Radius', '+25% Pull Speed'],
      magnet_t3: ['680px quantum gem sweep', '+100px Magnet Radius', '+40% Pull Speed'],
      magnet_t4: ['850px pulse · +130px Radius · +60% Speed', 'Gems restore +0.75 Energy & +0.4 Shield'],
      magnet_t5: ['Full-arena pulse · +170px Radius · +85% Speed', 'Gems deal 12 DMG & restore +1.5E / +0.8 Shield'],
      dash_t1: ['-18% Phase Dash Cooldown', '+20% Dash Speed & Distance'],
      dash_t2: ['-25% Phase Dash Cooldown', 'Leaves Decoy that draws fire & explodes'],
      dash_t3: ['-32% Phase Dash Cooldown', 'Drops scorching Ion Plasma Trail'],
      dash_t4: ['-45% Phase Dash Cooldown', 'Lightning arcs shock, slow & deal 140 DPS'],
      reach_t1: ['+20% Melee Reach & Arc'],
      reach_t2: ['+25% Melee Reach & Arc', '+18% Melee Damage'],
      reach_t3: ['Slashes fire a Vorpal Wave', 'Deals 50% Damage downrange'],
      reach_t4: ['Infinite Pierce on Vorpal waves', 'Melee kills trigger 60 DMG Kinetic Nova'],
      parry_t1: ['+35% Deflected Bolt Speed', '+60% Deflection Damage'],
      parry_t2: ['Melee kills restore +8 Hull HP & +15 Shield'],
      parry_t3: ['Parries trigger an EMP Shockwave', 'Clears nearby enemy fire'],
      parry_t4: ['Deflected shots deal 350% Crit Damage', 'Explode on impact'],
      ranged_fp_t1: ['+1 Pierce on all Ranged shots'],
      ranged_fp_t2: ['+25% Ranged Bolt Speed', '+18% Ranged Damage'],
      ranged_fp_t3: ['+1 Projectile per Ranged shot'],
      ranged_fp_t4: ['Seekers & Orbs burst into Homing Shards', '+1 Pierce on all projectiles'],
      ranged_energy_t1: ['Ranged hits apply +3.5s Vulnerability', '+60% Melee combo damage taken'],
      ranged_energy_t2: ['-25% Ranged Energy Cost', 'Wider Beam Impact'],
      ranged_energy_t3: ['Railgun & lasers leave scorching Plasma Trail'],
      shield_t1: ['+40 Max Shield', '-15% Shield Recharge Delay'],
      shield_t2: ['+45 Max Shield & +30 Max Hull HP', '+25% Shield Recharge Speed'],
      shield_t3: ['+60 Max Shield', 'Shield break triggers Knockback Shockwave'],
      shield_t4: ['+80 Max Shield', 'Shields regen in combat at 50% rate'],
      reactor_t1: ['+25 Energy Capacity', '+25% Energy Recharge'],
      reactor_t2: ['+35 Energy Capacity', '+50% Energy Recharge'],
      reactor_t3: ['+50 Energy Capacity · +75% Recharge', '-20% All Weapon Energy Cost'],
      agility_t1: ['+20% Flight Speed', 'Sharper Handling Agility'],
      agility_t2: ['+25% Flight Speed', 'Continuous flight charges Slipstream boost'],
      agility_t3: ['Alternating Melee/Ranged grants +75% DMG', 'Triggers Speed Burst'],
      w_pulse_t1: ['+20% Pulse Laser Damage', '+15% Fire Rate'],
      w_pulse_t2: ['+1 Target Pierce', '+20% Pulse Laser Damage'],
      w_pulse_t3: ['+1 Parallel Bolt per shot', '+18% Fire Rate'],
      w_tri_laser_t1: ['[Ranged] Wide 3-bolt crowd spread', '0.95s Fire Rate · 8E Cost'],
      w_tri_laser_t2: ['+25% Bolt Damage', '-15% Cooldown'],
      w_tri_laser_t3: ['+2 Spread Bolts · +2 Pierce', '-2 Energy Cost per volley'],
      w_katana_t1: ['+30% Slash Damage', '+18% Swing Speed'],
      w_katana_t2: ['+25% Slash Reach', '+30% Slice Damage'],
      w_katana_t3: ['+35% Damage · +20% Strike Speed', '+30% Knockback'],
      w_lance_t1: ['[Melee] Forward kinetic lunge', '2.2x Critical Damage at tip'],
      w_lance_t2: ['+28% Thrust Damage', '+20% Spear Reach'],
      w_lance_t3: ['+22% Faster Recovery', '+35% Impale Damage'],
      w_hammer_t1: ['[Melee] 360° seismic shockwave', 'Heavy Knockback cleave'],
      w_hammer_t2: ['+30% Shockwave Radius', '+30% Smash Damage'],
      w_hammer_t3: ['+25% Swing Speed', '+40% Seismic Damage'],
      w_glaives_t1: ['[Melee] 3 Orbiting razor blades', 'Shreds foes & Parries enemy fire'],
      w_glaives_t2: ['+2 Blades (5 total)', '+25% Glaive Damage'],
      w_glaives_t3: ['+2 Blades (7 total) · +35% Spin Speed', '+30% Glaive Damage'],
      w_railgun_t1: ['[Ranged] Piercing hyper-velocity beam', '1.85s Cooldown · 22E Cost'],
      w_railgun_t2: ['+30% Beam Width', '+30% Piercing Damage'],
      w_railgun_t3: ['+35% Beam Damage · +20% Recharge', '-6 Energy Cost'],
      w_seekers_t1: ['[Ranged] 3 Homing micro-missiles', '1.45s Cooldown · 16E Cost'],
      w_seekers_t2: ['+2 Missiles per salvo', '+20% Warhead Damage'],
      w_seekers_t3: ['+3 Missiles · -20% Cooldown', '-4 Energy Cost'],
      w_flak_t1: ['[Ranged] Close-range shotgun blast', 'Heavy Knockback · 1.35s CD · 15E'],
      w_flak_t2: ['+4 Shrapnel Pellets', '+25% Pellet Damage'],
      w_flak_t3: ['+25% Fire Rate · +30% Damage', '-4 Energy Cost'],
      w_void_t1: ['[Ranged] Gravity orb pulls & detonates', '2.5s Cooldown · 26E Cost'],
      w_void_t2: ['+35% Pull Radius', '+30% Implosion Damage'],
      w_void_t3: ['-28% Cooldown · -6 Energy Cost', '+40% Detonation Damage'],
      fallback_repair: ['Restore +50 Hull HP immediately', 'Full Shield Recharge'],
      fallback_overcharge: ['+10% All Weapon Damage', '+1,000 Bonus Score']
    };

    const rawTitle = up.title || '';
    let isUnlock = false;
    let eyebrow = '';
    let title = rawTitle;

    if (rawTitle.startsWith('Unlock: ')) {
      isUnlock = true;
      title = rawTitle.slice(8).trim();
    } else if (rawTitle.includes(': ')) {
      const colonIdx = rawTitle.indexOf(': ');
      eyebrow = rawTitle.slice(0, colonIdx).trim();
      title = rawTitle.slice(colonIdx + 2).trim();
    }

    const baseKey = up.id && up.id.startsWith('fallback_repair')
      ? 'fallback_repair'
      : (up.id && up.id.startsWith('fallback_overcharge') ? 'fallback_overcharge' : up.id);
    const lines = CONCISE_STATS[baseKey] || (up.desc || '').split(/\.\s+/).map(s => s.replace(/\.$/, '').trim()).filter(Boolean);

    return { isUnlock, eyebrow, title, lines };
  }

  escapeUpgradeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  renderUpgradeStatLineHtml(line) {
    const escaped = this.escapeUpgradeHtml(line);
    const tokenRegex = /(\[(?:Ranged|Melee)\])|([+-]?\d[\d.,]*(?:\s*(?:Energy|Hull HP|Shield|Blades?|total|DPS|DMG|CD|px|%|s(?!\w)|x(?!\w)|°|E(?!\w)))?|\b(?:Critical|Crit|EMP|Shockwave|Vulnerability|Homing|Infinite Pierce|Plasma Trail|Lightning|Decoy|Full Shield|Slipstream)\b)/gi;

    return escaped.replace(tokenRegex, (match, slotTag, metric) => {
      if (slotTag) {
        const isRanged = /ranged/i.test(slotTag);
        return `<span class="up-slot-pill ${isRanged ? 'is-ranged' : 'is-melee'}">${isRanged ? 'RANGED' : 'MELEE'}</span>`;
      }
      const isSpecCost = /^\d[\d.,]*\s*(?:s|E|CD)$/i.test(metric.trim());
      const isPositiveBuff = metric.startsWith('+') || /Shield|Hull HP|Full Shield/i.test(metric);
      const cls = isSpecCost ? 'up-hl up-hl-warn' : (isPositiveBuff ? 'up-hl up-hl-good' : 'up-hl');
      return `<strong class="${cls}">${metric}</strong>`;
    });
  }

  generateUpgradeCards() {
    this.ui.upgradeContainer.innerHTML = '';
    this.controllerCardIndex = 0;

    // Safety checks for round tracking
    if (!this.playerUpgradeTiers) this.playerUpgradeTiers = {};
    if (!this.acquiredUpgradeIds) this.acquiredUpgradeIds = new Set();

    // 1. Gather all eligible next tiers across all power-up trees
    // Only the NEXT unacquired tier in each tree can ever be offered!
    const eligibleUpgrades = [];
    const hasMeleeWeapon = this.player && this.player.meleeWeapons.length > 0;
    if (typeof UPGRADE_TREES !== 'undefined') {
      for (const treeKey in UPGRADE_TREES) {
        const tree = UPGRADE_TREES[treeKey];
        // Skip generic melee stat trees until player unlocks at least one melee weapon
        if (!hasMeleeWeapon && (tree.id === 'melee_reach' || tree.id === 'melee_defense')) {
          continue;
        }
        const currentTier = this.playerUpgradeTiers[tree.id] || 0;
        const nextTierIndex = currentTier; // 0-indexed: tier 1 is index 0

        // If tree is not yet maxed out
        if (nextTierIndex < tree.tiers.length) {
          const candidate = tree.tiers[nextTierIndex];
          // Ensure this exact tier hasn't been acquired in this round
          if (!this.acquiredUpgradeIds.has(candidate.id)) {
            eligibleUpgrades.push(candidate);
          }
        }
      }
    } else {
      // Fallback if UPGRADE_TREES is not defined
      eligibleUpgrades.push(...UPGRADE_POOL.filter(u => !this.acquiredUpgradeIds.has(u.id)));
    }

    // 2. Shuffle eligible candidates
    let shuffled = [...eligibleUpgrades].sort(() => 0.5 - Math.random());

    // 3. Ensure early players see Weapon Unlock / Weapon Power-Up cards regularly!
    const totalUnlockedWeapons = this.player
      ? (this.player.meleeWeapons.length + this.player.rangedWeapons.length)
      : 1;
    const weaponUnlockCard = shuffled.find(u => u.isWeaponUnlock);
    if (totalUnlockedWeapons < 4 && weaponUnlockCard) {
      shuffled = [weaponUnlockCard, ...shuffled.filter(u => u.id !== weaponUnlockCard.id)];
    }

    // 4. Early Magnet Progression: If player has 0 magnet tiers, guarantee Tier 1 Magnet is offered!
    const magnetTier = this.playerUpgradeTiers['magnet'] || 0;
    if (magnetTier === 0) {
      const magnetT1 = shuffled.find(u => u.treeId === 'magnet' && u.tier === 1);
      if (magnetT1) {
        shuffled = [magnetT1, ...shuffled.filter(u => u.id !== magnetT1.id)];
      }
    }

    // 5. Select top 3 distinct upgrades (resorting order so guaranteed card isn't always slot 1)
    let choices = shuffled.slice(0, 3);

    // 5. Late-Game Fallback: If fewer than 3 available, fill with repeatable emergency repair / catalyst cards
    if (choices.length < 3) {
      const fallbacks = [
        {
          id: 'fallback_repair_' + Math.random(),
          title: 'Nanite Hull Repair',
          category: 'defense',
          treeId: 'fallback',
          tier: 1,
          maxTier: 1,
          rarity: 'common',
          iconSvg: '#icon-heart',
          desc: 'Emergency repair nanites immediately restore +50 Hull HP and fully charge your Shield.',
          apply: (player) => {
            player.health = Math.min(player.maxHealth, player.health + 50);
            player.shield = player.maxShield;
          }
        },
        {
          id: 'fallback_overcharge_' + Math.random(),
          title: 'Catalyst Overcharge',
          category: 'utility',
          treeId: 'fallback',
          tier: 1,
          maxTier: 1,
          rarity: 'rare',
          iconSvg: '#icon-flame',
          desc: 'Overclocks all weapon damage output by +10% and awards +1,000 bonus score.',
          apply: (player) => {
            player.meleeDamageMult = (player.meleeDamageMult || 1) * 1.10;
            player.rangedDamageMult = (player.rangedDamageMult || 1) * 1.10;
            player.score += 1000;
          }
        }
      ];
      while (choices.length < 3 && fallbacks.length > 0) {
        choices.push(fallbacks.shift());
      }
    }

    choices.forEach((up, idx) => {
      const card = document.createElement('div');
      card.className = `up-card rarity-${up.rarity}`;

      const iconSvg = up.iconSvg || (
        up.category === 'melee' ? '#icon-sword' :
        (up.category === 'ranged' ? '#icon-crosshair' :
        (up.category === 'mobility' ? '#icon-zap' :
        (up.category === 'magnet' ? '#icon-magnet' : '#icon-sparkles')))
      );

      const tierBadge = (up.tier && up.maxTier && up.treeId !== 'fallback')
        ? `<span class="up-tier-tag">TIER ${up.tier}/${up.maxTier}</span>`
        : '';

      const meta = this.formatUpgradeCardMeta(up);
      const unlockBadge = meta.isUnlock ? '<span class="up-unlock-tag">UNLOCK</span>' : '';
      const eyebrowHtml = meta.eyebrow ? `<span class="up-eyebrow">${this.escapeUpgradeHtml(meta.eyebrow)}</span>` : '';
      const catClass = `cat-${up.category || 'utility'}`;
      const statsHtml = meta.lines
        .map(line => `<div class="up-stat-line">${this.renderUpgradeStatLineHtml(line)}</div>`)
        .join('');

      card.innerHTML = `
        <div class="up-tags-row">
          <span class="up-rarity-tag tag-${up.rarity}">${up.rarity}</span>
          ${tierBadge}
          ${unlockBadge}
        </div>
        <div class="up-header">
          ${eyebrowHtml}
          <h4 class="up-title">${this.escapeUpgradeHtml(meta.title)}</h4>
        </div>
        <div class="up-icon-stage">
          <div class="up-icon-box ${catClass}">
            <svg class="ui-icon" viewBox="0 0 24 24"><use href="${iconSvg}"></use></svg>
          </div>
        </div>
        <div class="up-desc">${statsHtml}</div>
        <div class="up-choose-btn">
          <span>EQUIP</span>
          <svg class="ui-icon" viewBox="0 0 24 24"><use href="#icon-chevron-right"></use></svg>
        </div>
      `;

      card.addEventListener('mouseenter', () => {
        this.controllerCardIndex = idx;
        this.updateCardFocus();
      });

      card.addEventListener('click', () => {
        // Record as acquired in this round - will NEVER be shown again in this round!
        this.acquiredUpgradeIds.add(up.id);
        if (up.treeId && up.treeId !== 'fallback') {
          this.playerUpgradeTiers[up.treeId] = up.tier;
        }

        up.apply(this.player, this);
        this.renderWeaponSlots();
        const tierText = (up.tier && up.maxTier && up.treeId !== 'fallback') ? ` [TIER ${up.tier}/${up.maxTier}]` : '';
        this.showToast('AUGMENT EQUIPPED', `${up.title}${tierText}`, '#00ff88');
        this.ui.screenUpgrade.classList.add('hidden');
        this.state = 'playing';
        this.lastTime = performance.now();
      });

      this.ui.upgradeContainer.appendChild(card);
    });

    this.updateCardFocus();
  }

  renderWeaponSlots() {
    if (!this.player) return;

    // Melee Slots
    this.ui.meleeSlots.innerHTML = '';
    if (this.player.meleeWeapons.length === 0) {
      const lockedSlot = document.createElement('div');
      lockedSlot.className = 'w-slot w-slot-locked';
      lockedSlot.title = 'Unlock melee weapons via Level-Up Power-Ups';
      lockedSlot.innerHTML = `
        <svg class="ui-icon w-slot-icon" style="color: #64748b"><use href="#icon-sword"></use></svg>
        <span class="w-slot-name">LOCKED</span>
      `;
      this.ui.meleeSlots.appendChild(lockedSlot);
    } else {
      this.player.meleeWeapons.forEach((wKey, idx) => {
        const w = WEAPONS[wKey];
        const mods = this.player.getWeaponMods(wKey);
        const modLevel = mods && mods.level ? mods.level : 0;
        const isActive = idx === this.player.activeMeleeIndex;
        const slot = document.createElement('div');
        slot.className = `w-slot ${isActive ? 'active-melee' : ''}`;
        slot.innerHTML = `
          <span class="w-slot-key">${idx + 1}</span>
          ${modLevel > 0 ? `<span class="w-slot-level">+${modLevel}</span>` : ''}
          <svg class="ui-icon w-slot-icon" style="color: ${w.color}"><use href="#${w.icon}"></use></svg>
          <span class="w-slot-name">${w.name.split(' ')[0]}</span>
          <div class="w-cooldown" id="cd-melee-${idx}"></div>
        `;
        slot.addEventListener('click', () => {
          this.player.setMeleeIndex(idx);
          this.renderWeaponSlots();
        });
        this.ui.meleeSlots.appendChild(slot);
      });
    }

    // Ranged Slots
    this.ui.rangedSlots.innerHTML = '';
    this.player.rangedWeapons.forEach((wKey, idx) => {
      const w = WEAPONS[wKey];
      const mods = this.player.getWeaponMods(wKey);
      const modLevel = mods && mods.level ? mods.level : 0;
      const effectiveCost = Math.max(0, (w.energyCost || 0) - (mods && mods.energyDiscount ? mods.energyDiscount : 0));
      const isActive = idx === this.player.activeRangedIndex;
      const slot = document.createElement('div');
      slot.className = `w-slot ${isActive ? 'active-ranged' : ''}`;
      slot.innerHTML = `
        <span class="w-slot-key">${idx + 5}</span>
        ${modLevel > 0 ? `<span class="w-slot-level">+${modLevel}</span>` : ''}
        <svg class="ui-icon w-slot-icon" style="color: ${w.color}"><use href="#${w.icon}"></use></svg>
        <span class="w-slot-name">${w.name.split(' ')[0]}</span>
        ${effectiveCost > 0 ? `<span class="w-slot-cost">${effectiveCost}E</span>` : ''}
        <div class="w-cooldown" id="cd-ranged-${idx}"></div>
      `;
      slot.addEventListener('click', () => {
        this.player.setRangedIndex(idx);
        this.renderWeaponSlots();
      });
      this.ui.rangedSlots.appendChild(slot);
    });

    this.updateTouchWeaponLabels();
  }

  showToast(title, message, color = '#00f0ff') {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.ui.toastTitle.innerText = title;
    this.ui.toastTitle.style.color = color;
    this.ui.toastMessage.innerText = message;
    this.ui.toastBanner.classList.remove('hidden');

    this.toastTimeout = setTimeout(() => {
      this.ui.toastBanner.classList.add('hidden');
    }, 2800);
  }

  screenShake(magnitude, duration) {
    this.shakeMag = magnitude;
    this.shakeDuration = duration;
  }

  spawnSparks(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 220 + 60;
      this.particles.push(new Particle({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: color,
        size: Math.random() * 3 + 1.5,
        life: Math.random() * 0.35 + 0.15
      }));
    }
  }

  spawnParticle(x, y, type, opts) {
    opts.x = x;
    opts.y = y;
    opts.type = type;
    this.particles.push(new Particle(opts));
  }

  spawnFloatingText(x, y, text, color, fontSize = 16) {
    this.floatingTexts.push(new FloatingText(x, y, text, color, fontSize));
  }

  spawnShockwave(x, y, maxRadius, color, damage = 0) {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: maxRadius,
      color: color,
      damage: damage,
      alpha: 1.0,
      hitEnemies: new Set()
    });
  }

  spawnElectricTrail(x, y, dps = 140, duration = 2.4, radius = 28) {
    this.electricTrails.push({
      x: x,
      y: y,
      dps: dps,
      life: duration,
      maxLife: duration,
      radius: radius,
      zapTimer: 0,
      sparkTimer: 0
    });

    if (Math.random() < 0.45) {
      this.spawnParticle(x, y, 'thruster', {
        vx: (Math.random() - 0.5) * 110,
        vy: (Math.random() - 0.5) * 110,
        color: Math.random() < 0.5 ? '#00f0ff' : '#aa33ff',
        size: Math.random() * 3 + 1.5,
        life: 0.25
      });
    }
  }

  // Wave enemy spawner
  updateWaveSpawning(dt) {
    this.waveTimer += dt;
    this.spawnTimer -= dt;

    // Check boss spawn on wave 5 and 10
    if (this.wave === 5 && !this.bossSpawned) {
      this.bossSpawned = true;
      this.spawnBoss('boss_colossus');
      this.showToast('WARNING // APEX THREAT', 'THE COLOSSUS OCTAGON APPROACHES', '#ff3366');
    } else if (this.wave === 10 && !this.bossSpawned) {
      this.bossSpawned = true;
      this.spawnBoss('boss_omega');
      this.showToast('EXTREME HAZARD', 'THE DREAD OMEGA TRIANGLE HAS ARRIVED', '#aa33ff');
    }

    // Check if an apex boss is currently active
    const hasBossActive = this.enemies.some(e => e.isBoss && e.health > 0);

    // Maximum simultaneous enemies on screen:
    // Sector 1: Max 3 foes | Sector 2: Max 4 foes | Boss Fights (Sector 5 & 10): Max 3 foes total (Boss + max 2 minions)
    const maxActiveEnemies = hasBossActive ? 3 : (this.wave === 1 ? 3 : (this.wave === 2 ? 4 : 4 + this.wave * 2));

    if (this.spawnTimer <= 0) {
      // Spawn interval pacing:
      if (hasBossActive) {
        this.spawnInterval = 4.0; // Paced minion cadence (4.0s) for a touch more active boss arena
      } else if (this.wave === 1) {
        this.spawnInterval = 3.2;
      } else if (this.wave === 2) {
        this.spawnInterval = 3.0;
      } else {
        this.spawnInterval = Math.max(0.85, 2.5 - (this.wave * 0.15));
      }
      this.spawnTimer = this.spawnInterval;

      // Pack size:
      // Strictly 1 enemy per spawn during boss fights and early sectors
      let packSize = 1;
      if (!hasBossActive && this.wave >= 3) {
        packSize = Math.min(4, 1 + Math.floor((this.wave - 2) * 0.4));
      }

      for (let i = 0; i < packSize; i++) {
        if (this.enemies.length < maxActiveEnemies) {
          this.spawnRandomEnemy();
        }
      }
    }

    // Advance wave (ensure boss is neutralized first before advancing sector)
    // Shorter, fast-paced stage duration: 15s for Sector 1, 16s for Sector 2, 18s for Sector 3, 20s thereafter
    const currentWaveDuration = this.wave === 1 ? 15 : (this.wave === 2 ? 16 : (this.wave === 3 ? 18 : 20));
    if (!hasBossActive && this.waveTimer >= currentWaveDuration) {
      this.wave++;
      this.waveTimer = 0;
      this.bossSpawned = false;
      this.showToast(`SECTOR ${this.wave} REACHED`, 'Enemy combat density increasing!', '#00f0ff');
    }
  }

  spawnBoss(type) {
    // Spawn boss ahead/above player wrapped cleanly in the toroidal arena
    const x = wrapCoord(this.player ? this.player.x : this.arenaWidth / 2, this.arenaWidth);
    const y = wrapCoord((this.player ? this.player.y : this.arenaHeight / 2) - 320, this.arenaHeight);
    this.enemies.push(new Enemy(x, y, type, this.wave));
  }

  spawnRandomEnemy() {
    // Spawn hostiles just outside the active camera viewport, wrapped seamlessly around torus
    const camLeft = this.camera.x;
    const camRight = this.camera.x + this.viewportWidth;
    const camTop = this.camera.y;
    const camBottom = this.camera.y + this.viewportHeight;

    const pad = 65;
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    if (edge === 0) { // Top of screen
      x = camLeft + Math.random() * this.viewportWidth;
      y = camTop - pad;
    } else if (edge === 1) { // Right of screen
      x = camRight + pad;
      y = camTop + Math.random() * this.viewportHeight;
    } else if (edge === 2) { // Bottom of screen
      x = camLeft + Math.random() * this.viewportWidth;
      y = camBottom + pad;
    } else { // Left of screen
      x = camLeft - pad;
      y = camTop + Math.random() * this.viewportHeight;
    }

    x = wrapCoord(x, this.arenaWidth);
    y = wrapCoord(y, this.arenaHeight);

    // Determine type by wave unlocked (Splitter enters at Wave 2+)
    let pool = ['scout'];
    if (this.wave === 2) {
      pool = ['scout', 'scout', 'splitter', 'cube'];
    } else if (this.wave === 3) {
      pool = ['scout', 'splitter', 'cube', 'pentagon'];
    } else if (this.wave >= 4 && this.wave < 6) {
      pool = ['scout', 'splitter', 'cube', 'pentagon', 'sniper'];
    } else if (this.wave >= 6) {
      pool = ['scout', 'splitter', 'cube', 'pentagon', 'sniper', 'rhombus'];
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    this.enemies.push(new Enemy(x, y, chosen, this.wave));
  }

  // Main Loop
  loop(currentTime) {
    requestAnimationFrame((t) => this.loop(t));

    let dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // Poll Xbox Gamepad on every frame across all states
    this.pollGamepad(dt);

    if (this.timeDilation !== 1.0) {
      dt *= this.timeDilation;
    }

    if (this.state === 'playing') {
      this.update(dt);
    }

    // Smooth Toroidal Camera Follow: Tracks Player Ship seamlessly across wrap boundaries
    if (this.player) {
      this.camera.targetX = wrapCoord(this.player.x - this.viewportWidth / 2, this.arenaWidth);
      this.camera.targetY = wrapCoord(this.player.y - this.viewportHeight / 2, this.arenaHeight);
      const camLerp = Math.min(1.0, dt * 8.5);
      const stepX = wrapDelta(this.camera.targetX - this.camera.x, this.arenaWidth) * camLerp;
      const stepY = wrapDelta(this.camera.targetY - this.camera.y, this.arenaHeight) * camLerp;
      this.camera.x = wrapCoord(this.camera.x + stepX, this.arenaWidth);
      this.camera.y = wrapCoord(this.camera.y + stepY, this.arenaHeight);
      this.backdropCamX = (this.backdropCamX || 0) + stepX;
      this.backdropCamY = (this.backdropCamY || 0) + stepY;
    }
    this.smoothedWave = (this.smoothedWave || 1) + ((this.wave || 1) - (this.smoothedWave || 1)) * Math.min(1, dt * 0.35);

    this.draw();
  }

  update(dt) {
    // Screen shake decay
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
    } else {
      this.shakeMag = 0;
    }

    // Keep world mouse aim synchronized with screen cursor as the camera scrolls
    if (!this.input.gamepadConnected && !this.input.touchControlsActive && this.input.usingMouse) {
      this.input.mouseX = this.input.cursorX + this.camera.x;
      this.input.mouseY = this.input.cursorY + this.camera.y;
    }

    // Update Player
    if (this.player) {
      this.player.update(dt, this.input, this.width, this.height, this);
    }

    // Update Wave Spawner
    this.updateWaveSpawning(dt);

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, this.player, this);
      if (e.health <= 0) {
        this.enemies.splice(i, 1);
        this.enemiesDefeated++;
      }
    }

    // Inter-enemy separation (toroidal-aware so enemies don't stack/glitch across seams)
    for (let i = 0; i < this.enemies.length; i++) {
      for (let j = i + 1; j < this.enemies.length; j++) {
        const e1 = this.enemies[i];
        const e2 = this.enemies[j];
        const edDelta = toroidalDelta(e2.x, e2.y, e1.x, e1.y);
        const ed = Math.hypot(edDelta.dx, edDelta.dy);
        const minEDist = e1.radius + e2.radius + 6;
        if (ed < minEDist && ed > 0.01) {
          const push = (minEDist - ed) * 0.5;
          const nx = edDelta.dx / ed;
          const ny = edDelta.dy / ed;
          e1.x = wrapCoord(e1.x + nx * push, this.arenaWidth);
          e1.y = wrapCoord(e1.y + ny * push, this.arenaHeight);
          e2.x = wrapCoord(e2.x - nx * push, this.arenaWidth);
          e2.y = wrapCoord(e2.y - ny * push, this.arenaHeight);
        }
      }
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt, this);

      // Collisions
      if (!p.dead) {
        if (p.owner === 'player') {
          for (let j = 0; j < this.enemies.length; j++) {
            const enemy = this.enemies[j];
            if (dist(p.x, p.y, enemy.x, enemy.y) < p.radius + enemy.radius) {
              enemy.takeDamage(p.damage, this, 'ranged');
              enemy.applyVulnerability(3.5); // Melee synergy vulnerability
              this.spawnSparks(p.x, p.y, p.color, 6);

              if (p.knockback) {
                const kd = toroidalDelta(p.x, p.y, enemy.x, enemy.y);
                const ang = Math.atan2(kd.dy, kd.dx);
                enemy.vx += Math.cos(ang) * p.knockback;
                enemy.vy += Math.sin(ang) * p.knockback;
              }

              if (p.pierce > 0) {
                p.pierce--;
              } else {
                p.destroy(this);
                break;
              }
            }
          }
        } else if (p.owner === 'enemy') {
          // Check against player
          if (dist(p.x, p.y, this.player.x, this.player.y) < p.radius + this.player.radius) {
            this.player.takeDamage(p.damage, this);
            p.dead = true;
            this.spawnSparks(p.x, p.y, p.color, 8);
            // Kinetic bounce away from impact point so player is not stuck or pinned down
            const hd = toroidalDelta(p.x, p.y, this.player.x, this.player.y);
            const hitAng = Math.atan2(hd.dy, hd.dx);
            this.player.vx += Math.cos(hitAng) * 90;
            this.player.vy += Math.sin(hitAng) * 90;
          }
        }
      }

      if (p.dead) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update Gems
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i];
      g.update(dt, this.player);
      if (g.dead) {
        this.gems.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.update(dt);
      if (pt.dead) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.update(dt);
      if (ft.dead) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update Beams
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.alpha -= dt * b.decay;
      if (b.alpha <= 0) {
        this.beams.splice(i, 1);
      }
    }

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += dt * 650;
      sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));

      // Damage enemies caught in shockwave
      if (sw.damage > 0) {
        this.enemies.forEach(e => {
          if (!sw.hitEnemies.has(e)) {
            const d = dist(sw.x, sw.y, e.x, e.y);
            if (Math.abs(d - sw.radius) < 30) {
              e.takeDamage(sw.damage, this, 'melee');
              sw.hitEnemies.add(e);
            }
          }
        });
      }

      if (sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update Electric Lightning Trails
    for (let i = this.electricTrails.length - 1; i >= 0; i--) {
      const node = this.electricTrails[i];
      node.life -= dt;
      node.zapTimer -= dt;
      node.sparkTimer -= dt;

      // Ambient electric spark
      if (node.sparkTimer <= 0) {
        node.sparkTimer = 0.12 + Math.random() * 0.1;
        if (Math.random() < 0.35) {
          this.spawnParticle(node.x, node.y, 'thruster', {
            vx: (Math.random() - 0.5) * 60,
            vy: (Math.random() - 0.5) * 60,
            color: '#00f0ff',
            size: 2,
            life: 0.18
          });
        }
      }

      // Continuous shock damage and slow on enemies touching the trail
      for (let j = 0; j < this.enemies.length; j++) {
        const e = this.enemies[j];
        const ed = dist(node.x, node.y, e.x, e.y);
        if (ed < node.radius + e.radius) {
          e.takeDamage(node.dps * dt, this, 'lightning');
          e.applyVulnerability(2.5); // Melee synergy vulnerability
          // Strong electrocution slow
          e.vx *= 0.72;
          e.vy *= 0.72;

          if (node.zapTimer <= 0) {
            node.zapTimer = 0.14;
            this.spawnSparks(e.x, e.y, '#00f0ff', 4);
            if (window.soundEngine && window.soundEngine.playElectricZap) {
              window.soundEngine.playElectricZap();
            }
          }
        }
      }

      if (node.life <= 0) {
        this.electricTrails.splice(i, 1);
      }
    }

    // Update HUD
    this.updateHUD();
  }

  updateHUD() {
    if (!this.player) return;

    // Vitals
    const sPct = Math.max(0, (this.player.shield / this.player.maxShield) * 100);
    this.ui.shieldBar.style.width = `${sPct}%`;
    this.ui.shieldText.innerText = `${Math.ceil(this.player.shield)}/${this.player.maxShield}`;

    const hPct = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
    this.ui.healthBar.style.width = `${hPct}%`;
    this.ui.healthText.innerText = `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;

    // Energy
    const ePct = Math.max(0, (this.player.energy / this.player.maxEnergy) * 100);
    this.ui.energyBar.style.width = `${ePct}%`;
    this.ui.energyText.innerText = `${Math.ceil(this.player.energy)}/${this.player.maxEnergy}`;

    // Dash
    const dPct = this.player.dashCooldown <= 0 ? 100 : Math.max(0, 100 - (this.player.dashCooldown / this.player.dashCooldownMax) * 100);
    this.ui.dashBar.style.width = `${dPct}%`;
    this.ui.dashText.innerText = this.player.dashCooldown <= 0 ? 'READY' : `${this.player.dashCooldown.toFixed(1)}s`;

    // Wave & Score
    this.ui.waveNumber.innerText = this.wave < 10 ? `0${this.wave}` : this.wave;
    this.ui.scoreText.innerText = this.player.score.toString().padStart(6, '0');

    // Combo
    if (this.player.combo > 1.2) {
      this.ui.comboContainer.classList.remove('hidden');
      this.ui.comboMultiplier.innerText = `x${this.player.combo.toFixed(1)} COMBO`;
    } else {
      this.ui.comboContainer.classList.add('hidden');
    }

    // Level & XP
    this.ui.playerLevel.innerText = this.player.level;
    const xpPct = Math.min(100, (this.player.xp / this.player.xpToNext) * 100);
    this.ui.xpBar.style.width = `${xpPct}%`;
    this.ui.xpText.innerText = `${this.player.xp} / ${this.player.xpToNext}`;

    // Synergy
    this.ui.synergyBar.style.width = `${this.player.synergyMeter}%`;
    if (this.ui.mobileSynergyBar) {
      this.ui.mobileSynergyBar.style.width = `${this.player.synergyMeter}%`;
    }
    if (this.player.synergyMeter >= 100) {
      this.ui.synergyStatus.innerText = '200% RANGED CRIT READY!';
      this.ui.synergyStatus.style.color = '#ffb700';
    } else {
      this.ui.synergyStatus.innerText = 'MELEE CHARGES LASER';
      this.ui.synergyStatus.style.color = '#8b9bb4';
    }

    // Ultimate button & Nova status: +4% per defeated enemy
    const ultPct = Math.min(100, Math.floor((this.player.ultimateCharge / this.player.ultimateMax) * 100));
    this.ui.ultTag.innerText = ultPct >= 100 ? 'READY' : `${ultPct}%`;
    if (ultPct >= 100) {
      this.ui.ultCard.classList.add('ready');
      if (this.ui.touchBtnNova) {
        this.ui.touchBtnNova.classList.remove('disabled');
        this.ui.touchBtnNova.classList.add('ready');
      }
    } else {
      this.ui.ultCard.classList.remove('ready');
      if (this.ui.touchBtnNova) {
        this.ui.touchBtnNova.classList.add('disabled');
        this.ui.touchBtnNova.classList.remove('ready');
      }
    }

    // Cooldown sweeps on weapon slots
    const mSlotCd = document.getElementById(`cd-melee-${this.player.activeMeleeIndex}`);
    if (mSlotCd && this.player.equippedMelee) {
      const mMax = this.player.getEffectiveWeaponCooldown(this.player.equippedMelee);
      const cdPct = (this.player.meleeCooldown / mMax) * 100;
      mSlotCd.style.height = `${Math.max(0, cdPct)}%`;
    }

    const rSlotCd = document.getElementById(`cd-ranged-${this.player.activeRangedIndex}`);
    if (rSlotCd && this.player.equippedRanged) {
      const rMax = this.player.getEffectiveWeaponCooldown(this.player.equippedRanged);
      const cdPct = (this.player.rangedCooldown / rMax) * 100;
      rSlotCd.style.height = `${Math.max(0, cdPct)}%`;
    }
  }

  draw() {
    this.ctx.save();

    // High-DPI DPR Canvas Transform
    const dpr = this.dpr || 1;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Screen shake transform (screen space)
    const sx = this.shakeMag > 0 ? (Math.random() - 0.5) * this.shakeMag : 0;
    const sy = this.shakeMag > 0 ? (Math.random() - 0.5) * this.shakeMag : 0;

    // Clear visible viewport background & render living swirling galaxy backdrop
    this.ctx.fillStyle = '#060810';
    this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
    this.drawGalaxyBackdrop();

    // World Camera Translation Transform
    this.ctx.save();
    this.ctx.translate(-Math.round(this.camera.x) + sx, -Math.round(this.camera.y) + sy);
    const camCenterX = this.camera.x + this.viewportWidth / 2;
    const camCenterY = this.camera.y + this.viewportHeight / 2;
    const withWrappedPos = (entity, drawFn) => {
      const ox = entity.x;
      const oy = entity.y;
      entity.x = camCenterX + wrapDelta(ox - camCenterX, this.arenaWidth);
      entity.y = camCenterY + wrapDelta(oy - camCenterY, this.arenaHeight);
      drawFn();
      entity.x = ox;
      entity.y = oy;
    };

    // Infinite Repeating Cosmic Grid
    this.drawGrid();

    // Draw Beams (Railgun tracer beams, wrapped to nearest viewport instance)
    this.beams.forEach(b => {
      const rx1 = camCenterX + wrapDelta(b.x1 - camCenterX, this.arenaWidth);
      const ry1 = camCenterY + wrapDelta(b.y1 - camCenterY, this.arenaHeight);
      const rx2 = rx1 + (b.x2 - b.x1);
      const ry2 = ry1 + (b.y2 - b.y1);
      this.ctx.save();
      this.ctx.globalAlpha = b.alpha;
      this.ctx.strokeStyle = b.color;
      this.ctx.lineWidth = b.width;
      this.ctx.shadowColor = b.color;
      this.ctx.shadowBlur = 18;
      this.ctx.beginPath();
      this.ctx.moveTo(rx1, ry1);
      this.ctx.lineTo(rx2, ry2);
      this.ctx.stroke();

      // White inner core
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = b.width * 0.35;
      this.ctx.beginPath();
      this.ctx.moveTo(rx1, ry1);
      this.ctx.lineTo(rx2, ry2);
      this.ctx.stroke();
      this.ctx.restore();
    });

    // Draw Shockwaves
    this.shockwaves.forEach(sw => {
      withWrappedPos(sw, () => {
        this.ctx.save();
        this.ctx.globalAlpha = sw.alpha;
        this.ctx.strokeStyle = sw.color;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = sw.color;
        this.ctx.shadowBlur = 14;
        this.ctx.beginPath();
        this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      });
    });

    // Draw Electric Lightning Trails
    if (this.electricTrails.length > 0) {
      this.ctx.save();
      for (let i = 0; i < this.electricTrails.length; i++) {
        const node = this.electricTrails[i];
        const alpha = Math.min(1, node.life / 0.4);
        const nx = camCenterX + wrapDelta(node.x - camCenterX, this.arenaWidth);
        const ny = camCenterY + wrapDelta(node.y - camCenterY, this.arenaHeight);

        this.ctx.globalAlpha = alpha * 0.35;
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 16;
        this.ctx.beginPath();
        this.ctx.arc(nx, ny, node.radius * 0.65, 0, Math.PI * 2);
        this.ctx.fill();

        if (i > 0) {
          const prev = this.electricTrails[i - 1];
          const segDist = dist(node.x, node.y, prev.x, prev.y);
          if (segDist < 85) {
            const px = camCenterX + wrapDelta(prev.x - camCenterX, this.arenaWidth);
            const py = camCenterY + wrapDelta(prev.y - camCenterY, this.arenaHeight);
            this.ctx.globalAlpha = alpha * 0.9;
            this.ctx.strokeStyle = '#00f0ff';
            this.ctx.lineWidth = 3.5;
            this.ctx.shadowColor = '#00f0ff';
            this.ctx.shadowBlur = 18;

            const jitterX = Math.sin(Date.now() * 0.04 + i) * 10;
            const jitterY = Math.cos(Date.now() * 0.04 + i) * 10;
            const midX = (nx + px) / 2 + jitterX;
            const midY = (ny + py) / 2 + jitterY;

            this.ctx.beginPath();
            this.ctx.moveTo(px, py);
            this.ctx.lineTo(midX, midY);
            this.ctx.lineTo(nx, ny);
            this.ctx.stroke();

            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(px, py);
            this.ctx.lineTo(midX, midY);
            this.ctx.lineTo(nx, ny);
            this.ctx.stroke();
          }
        }
      }
      this.ctx.restore();
    }

    // Draw Gems, Enemies, Projectiles, Player, Particles, Floating Texts (wrapped cleanly across seams)
    this.gems.forEach(g => withWrappedPos(g, () => g.draw(this.ctx)));
    this.enemies.forEach(e => withWrappedPos(e, () => e.draw(this.ctx)));
    this.projectiles.forEach(p => withWrappedPos(p, () => p.draw(this.ctx)));
    if (this.player) {
      withWrappedPos(this.player, () => this.player.draw(this.ctx, this));
    }
    this.particles.forEach(pt => withWrappedPos(pt, () => pt.draw(this.ctx)));
    this.floatingTexts.forEach(ft => withWrappedPos(ft, () => ft.draw(this.ctx)));

    // Restore World Camera Transform
    this.ctx.restore();

    // Draw Screen-Space Offscreen Threat Radar Indicators & Tactical Minimap
    this.drawThreatRadar();
    this.drawMinimap();

    this.ctx.restore();
  }

  drawThreatRadar() {
    if (!this.player || !this.enemies || this.state !== 'playing') return;

    const pad = 24;
    const minX = pad;
    const maxX = this.viewportWidth - pad;
    const minY = 50; // Under top HUD
    const maxY = this.viewportHeight - pad;
    const camCenterX = this.camera.x + this.viewportWidth / 2;
    const camCenterY = this.camera.y + this.viewportHeight / 2;

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (!e || e.health <= 0 || e.isDying) continue;
      const isBoss = e.isBoss;
      const isDangerous = isBoss || e.type === 'sniper' || e.type === 'rhombus' || e.type === 'splitter';

      const wx = camCenterX + wrapDelta(e.x - camCenterX, this.arenaWidth);
      const wy = camCenterY + wrapDelta(e.y - camCenterY, this.arenaHeight);
      const sx = wx - this.camera.x;
      const sy = wy - this.camera.y;

      const isOffscreen = sx < 0 || sx > this.viewportWidth || sy < 0 || sy > this.viewportHeight;
      if (isOffscreen && isDangerous) {
        const dVec = toroidalDelta(this.player.x, this.player.y, e.x, e.y);
        const angle = Math.atan2(dVec.dy, dVec.dx);

        const edgeX = Math.max(minX, Math.min(maxX, this.viewportWidth / 2 + Math.cos(angle) * (this.viewportWidth / 2 - 35)));
        const edgeY = Math.max(minY, Math.min(maxY, this.viewportHeight / 2 + Math.sin(angle) * (this.viewportHeight / 2 - 35)));

        this.ctx.save();
        this.ctx.translate(edgeX, edgeY);
        this.ctx.rotate(angle);

        const color = isBoss ? '#ff007b' : (e.type === 'splitter' ? '#e879f9' : '#ffb700');
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;

        this.ctx.beginPath();
        this.ctx.moveTo(10, 0);
        this.ctx.lineTo(-7, -7);
        this.ctx.lineTo(-3, 0);
        this.ctx.lineTo(-7, 7);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
      }
    }
  }

  drawMinimap() {
    if (!this.player || this.state !== 'playing') return;
    const isCompact = this.viewportWidth <= 820 || this.viewportHeight <= 560;
    const mapW = isCompact ? 88 : 118;
    const mapH = isCompact ? 66 : 88;
    const x0 = 12;
    const y0 = isCompact ? 76 : 98; // Tucked directly below compact top-left Vitals panel
    const cx = x0 + mapW / 2;
    const cy = y0 + mapH / 2;
    const scaleX = mapW / this.arenaWidth;
    const scaleY = mapH / this.arenaHeight;

    const ctx = this.ctx;
    ctx.save();

    // Rounded neon radar panel
    ctx.fillStyle = 'rgba(8, 13, 24, 0.72)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x0, y0, mapW, mapH, 7);
    } else {
      ctx.rect(x0, y0, mapW, mapH);
    }
    ctx.fill();
    ctx.stroke();

    // Subtle radar crosshairs & range ring
    ctx.strokeStyle = 'rgba(70, 95, 140, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0 + 4, cy);
    ctx.lineTo(x0 + mapW - 4, cy);
    ctx.moveTo(cx, y0 + 4);
    ctx.lineTo(cx, y0 + mapH - 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(mapW, mapH) * 0.28, 0, Math.PI * 2);
    ctx.stroke();

    // Active viewport box around center player
    const vw = this.viewportWidth * scaleX;
    const vh = this.viewportHeight * scaleY;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.strokeRect(cx - vw / 2, cy - vh / 2, vw, vh);

    // Plot XP gems relative to player (toroidal shortest wrap)
    ctx.fillStyle = 'rgba(0, 255, 136, 0.75)';
    for (let i = 0; i < this.gems.length; i++) {
      const g = this.gems[i];
      const d = toroidalDelta(this.player.x, this.player.y, g.x, g.y);
      ctx.fillRect(cx + d.dx * scaleX - 0.8, cy + d.dy * scaleY - 0.8, 1.8, 1.8);
    }

    // Plot Enemies & Splitters & Bosses
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (!e || e.health <= 0 || e.isDying) continue;
      const d = toroidalDelta(this.player.x, this.player.y, e.x, e.y);
      const mx = cx + d.dx * scaleX;
      const my = cy + d.dy * scaleY;
      ctx.fillStyle = e.isBoss ? '#ffb700' : (e.type === 'splitter' || e.type === 'mini_splitter' ? '#f472b6' : '#ff3366');
      ctx.beginPath();
      ctx.arc(mx, my, e.isBoss ? 3.8 : (e.type === 'mini_splitter' ? 1.5 : 2.2), 0, Math.PI * 2);
      ctx.fill();
    }

    // Player chevron in radar center
    ctx.translate(cx, cy);
    ctx.rotate(this.player.angle);
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(4.2, 0);
    ctx.lineTo(-3, -2.8);
    ctx.lineTo(-3, 2.8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawGrid() {
    const camLeft = this.camera.x;
    const camRight = this.camera.x + this.viewportWidth;
    const camTop = this.camera.y;
    const camBottom = this.camera.y + this.viewportHeight;

    const gridSize = 80;
    const startX = Math.floor(camLeft / gridSize) * gridSize;
    const endX = camRight + gridSize;
    const startY = Math.floor(camTop / gridSize) * gridSize;
    const endY = camBottom + gridSize;

    // Seamless infinite cosmic grid (toroidal arena has no wall boundaries)
    this.ctx.strokeStyle = 'rgba(70, 95, 140, 0.14)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      this.ctx.moveTo(x, camTop);
      this.ctx.lineTo(x, camBottom);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      this.ctx.moveTo(camLeft, y);
      this.ctx.lineTo(camRight, y);
    }
    this.ctx.stroke();

    // Subtle sector loop guide markers at origin multiples (0,0) wrapped into view
    const ox = (Math.round(camLeft / this.arenaWidth) * this.arenaWidth);
    const oy = (Math.round(camTop / this.arenaHeight) * this.arenaHeight);
    if (ox >= camLeft - 40 && ox <= camRight + 40 && oy >= camTop - 40 && oy <= camBottom + 40) {
      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
      this.ctx.beginPath();
      this.ctx.arc(ox, oy, 18, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  initGalaxyBackdrop() {
    // 1. Subtle distant starfield (2 parallax layers like classic space shooters)
    const starColors = ['#e2e8f0', '#bfdbfe', '#ddd6fe', '#a7f3d0', '#fecdd3'];
    this.galaxyStars = [];
    for (let i = 0; i < 110; i++) {
      const far = i % 3 !== 0;
      this.galaxyStars.push({
        nx: Math.random(),
        ny: Math.random(),
        size: far ? 1.1 : 1.7,
        parallax: far ? 0.06 : 0.14,
        driftY: far ? 4 : 9,
        color: starColors[i % starColors.length],
        baseAlpha: far ? 0.26 : 0.48,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 2. Non-grid organic 2D fBm nebula cloud texture (256x256 baked once at startup)
    this.nebulaAlphaCanvas = null;
    this.nebulaTintCanvas = null;
    if (typeof document !== 'undefined') {
      const size = 256;
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = size;
      maskCanvas.height = size;
      const mCtx = maskCanvas.getContext && maskCanvas.getContext('2d');
      if (mCtx && typeof mCtx.createImageData === 'function') {
        const seedOffset = Math.random() * 1000;
        const hash2 = (ix, iy, period) => {
          const wx = ((ix % period) + period) % period;
          const wy = ((iy % period) + period) % period;
          const n = Math.sin(wx * 127.1 + wy * 311.7 + seedOffset) * 43758.5453;
          return n - Math.floor(n);
        };
        const valueNoise = (u, v, period) => {
          const x = u * period;
          const y = v * period;
          const ix = Math.floor(x);
          const iy = Math.floor(y);
          const fx = x - ix;
          const fy = y - iy;
          const sx = fx * fx * (3 - 2 * fx);
          const sy = fy * fy * (3 - 2 * fy);
          const a = hash2(ix, iy, period);
          const b = hash2(ix + 1, iy, period);
          const c = hash2(ix, iy + 1, period);
          const d = hash2(ix + 1, iy + 1, period);
          const top = a + (b - a) * sx;
          const bot = c + (d - c) * sx;
          return top + (bot - top) * sy;
        };

        const img = mCtx.createImageData(size, size);
        const data = img.data;
        for (let y = 0; y < size; y++) {
          const v = y / size;
          for (let x = 0; x < size; x++) {
            const u = x / size;
            // True multi-octave random fBm clouds (zero lattice / stripes)
            const fbm =
              valueNoise(u, v, 3) * 0.52 +
              valueNoise(u + 0.17, v + 0.31, 6) * 0.28 +
              valueNoise(u + 0.53, v + 0.11, 12) * 0.14 +
              valueNoise(u + 0.79, v + 0.67, 24) * 0.06;
            const shaped = Math.max(0, Math.min(1, (fbm - 0.28) / 0.58));
            const cloud = shaped * shaped * (3 - 2 * shaped);
            const idx = (y * size + x) * 4;
            data[idx] = 255;
            data[idx + 1] = 255;
            data[idx + 2] = 255;
            data[idx + 3] = Math.round(cloud * 255);
          }
        }
        mCtx.putImageData(img, 0, 0);
        this.nebulaAlphaCanvas = maskCanvas;

        const tintCanvas = document.createElement('canvas');
        tintCanvas.width = size;
        tintCanvas.height = size;
        this.nebulaTintCanvas = tintCanvas;
      }
    }
  }

  _drawTintedNebulaLayer(destCtx, rgbStr, alpha, panU, panV) {
    if (!this.nebulaAlphaCanvas || !this.nebulaTintCanvas) return;
    const tCtx = this.nebulaTintCanvas.getContext('2d');
    const size = this.nebulaTintCanvas.width;
    if (!tCtx) return;

    tCtx.clearRect(0, 0, size, size);
    tCtx.globalCompositeOperation = 'source-over';
    tCtx.fillStyle = rgbStr;
    tCtx.fillRect(0, 0, size, size);
    tCtx.globalCompositeOperation = 'destination-in';
    tCtx.drawImage(this.nebulaAlphaCanvas, 0, 0);
    tCtx.globalCompositeOperation = 'source-over';

    // Draw as a single continuous screen-spanning cloud wrap (never tiled small squares)
    const w = this.viewportWidth;
    const h = this.viewportHeight;
    const spanW = Math.max(w, 1280);
    const spanH = Math.max(h, 800);
    const ox = -(((panU % 1) + 1) % 1) * spanW;
    const oy = -(((panV % 1) + 1) % 1) * spanH;

    destCtx.save();
    destCtx.imageSmoothingEnabled = true;
    destCtx.globalAlpha = alpha;
    for (let dy = 0; dy <= 1; dy++) {
      const py = Math.floor(oy + dy * spanH);
      const nh = Math.floor(oy + (dy + 1) * spanH) - py;
      for (let dx = 0; dx <= 1; dx++) {
        const px = Math.floor(ox + dx * spanW);
        const nw = Math.floor(ox + (dx + 1) * spanW) - px;
        if (px < w && py < h && px + nw > 0 && py + nh > 0) {
          destCtx.drawImage(this.nebulaTintCanvas, px, py, nw, nh);
        }
      }
    }
    destCtx.restore();
  }

  drawGalaxyBackdrop() {
    if (!this.galaxyStars) return;
    const ctx = this.ctx;
    const w = this.viewportWidth;
    const h = this.viewportHeight;
    const now = performance.now() * 0.001;

    // Continuous smooth palette cycle (~72s full loop + gently eased wave hue shift, zero snaps)
    const palette = [
      [34, 98, 214],   // Cosmic Blue
      [16, 156, 124],  // Nebula Emerald
      [118, 52, 208],  // Deep Violet Purple
      [182, 42, 92]    // Subtle Crimson Rose
    ];
    const smoothWave = (this.smoothedWave !== undefined ? this.smoothedWave : (this.wave || 1)) - 1;
    const progress = (now * 0.014 + smoothWave * 0.16) % palette.length;
    const i0 = Math.floor(progress);
    const i1 = (i0 + 1) % palette.length;
    const i2 = (i0 + 2) % palette.length;
    const t = progress - i0;
    const smoothT = t * t * (3 - 2 * t);

    const mixColor = (a, b, f) => [
      Math.round(a[0] + (b[0] - a[0]) * f),
      Math.round(a[1] + (b[1] - a[1]) * f),
      Math.round(a[2] + (b[2] - a[2]) * f)
    ];
    const primaryRgb = mixColor(palette[i0], palette[i1], smoothT);
    const accentRgb = mixColor(palette[i1], palette[i2], smoothT);

    // Continuous unwrapped camera coordinates guarantee zero seam jumps when wrapping arena edges
    const camX = this.backdropCamX || 0;
    const camY = this.backdropCamY || 0;
    this._drawTintedNebulaLayer(
      ctx,
      `rgb(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]})`,
      0.19,
      camX * 0.00004 + now * 0.004,
      camY * 0.00004 - now * 0.006
    );
    this._drawTintedNebulaLayer(
      ctx,
      `rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]})`,
      0.11,
      camX * 0.00007 - now * 0.005 + 0.37,
      camY * 0.00007 - now * 0.008 + 0.51
    );

    // Subtle parallax stars drifting cleanly across deep space
    ctx.save();
    for (let i = 0; i < this.galaxyStars.length; i++) {
      const s = this.galaxyStars[i];
      const sx = wrapCoord(s.nx * w - camX * s.parallax, w);
      const sy = wrapCoord(s.ny * h - camY * s.parallax + now * s.driftY, h);
      const twinkle = 0.65 + 0.35 * Math.sin(now * 2.0 + s.phase);
      ctx.globalAlpha = s.baseAlpha * twinkle;
      ctx.fillStyle = s.color;
      ctx.fillRect(sx, sy, s.size, s.size);
    }
    ctx.restore();
  }
}

// Instantiate engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new GameEngine();
});