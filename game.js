/**
 * TRI-VERTEX // MAIN GAME CONTROLLER & ENGINE
 * Orchestrates Canvas Rendering, Game Loop, Waves, Upgrades, Input, and UI.
 */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth || 1920;
    this.height = window.innerHeight || 1080;

    // Game state
    this.state = 'start'; // 'start', 'playing', 'upgrade', 'paused', 'gameover'
    this.wave = 1;
    this.waveTimer = 0;
    this.waveDuration = 20; // seconds per wave before clearing & next wave
    this.enemiesDefeated = 0;
    this.totalScore = 0;
    this.highScore = parseInt(localStorage.getItem('trivertex_highscore') || '0', 10);

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
      cursorX: this.width / 2,
      cursorY: this.height / 2,
      virtualCursorSpeed: 1050,
      usingGamepadCursor: false,
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

    this.isForceLandscape = false;
    this.orientationDismissed = false;
    this.toastTimeout = null;
    this.lastTime = performance.now();

    // Round-specific upgrade progression tracking
    this.playerUpgradeTiers = {};
    this.acquiredUpgradeIds = new Set();

    window.gameInstance = this;
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

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
    if (this.isForceLandscape) {
      this.width = Math.max(window.innerWidth, window.innerHeight);
      this.height = Math.min(window.innerWidth, window.innerHeight);
    } else {
      this.width = window.innerWidth || 1920;
      this.height = window.innerHeight || 1080;
    }
    this.canvas.width = this.width;
    this.canvas.height = this.height;
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
        if (this.player) {
          const next = (this.player.activeMeleeIndex + 1) % this.player.meleeWeapons.length;
          this.player.setMeleeIndex(next);
          this.renderWeaponSlots();
        }
      }

      // E: Cycle Ranged
      if (e.code === 'KeyE') {
        if (this.player) {
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
      this.input.usingGamepadCursor = false;
      let mx = e.clientX;
      let my = e.clientY;
      if (this.isForceLandscape) {
        mx = e.clientY;
        my = window.innerWidth - e.clientX;
      }
      this.input.mouseX = mx;
      this.input.mouseY = my;
      this.input.cursorX = mx;
      this.input.cursorY = my;
      if (this.ui.virtualCursor) {
        this.ui.virtualCursor.classList.add('hidden');
      }
    });

    window.addEventListener('mousedown', (e) => {
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

    // Audio toggle button
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

    // Detect if device has touch capability or is on mobile/tablet viewport
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0) || (window.innerWidth <= 1024 && window.innerHeight <= 1366);
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

    // Left Zone: Virtual Analog Movement Joystick
    let joystickTouchId = null;
    let joystickOriginX = 0;
    let joystickOriginY = 0;
    const maxStickRadius = 50; // Max knob excursion radius in px

    const getTouchById = (touchList, id) => {
      for (let i = 0; i < touchList.length; i++) {
        if (touchList[i].identifier === id) return touchList[i];
      }
      return null;
    };

    const updateJoystickPosition = (clientX, clientY) => {
      let cx = clientX;
      let cy = clientY;
      let ox = joystickOriginX;
      let oy = joystickOriginY;

      if (this.isForceLandscape) {
        cx = clientY;
        cy = window.innerWidth - clientX;
        ox = joystickOriginY;
        oy = window.innerWidth - joystickOriginX;
      }

      const dx = cx - ox;
      const dy = cy - oy;
      const distance = Math.hypot(dx, dy);
      const baseRect = this.ui.joystickBase ? this.ui.joystickBase.getBoundingClientRect() : null;
      const baseWidth = baseRect ? baseRect.width : 90;
      const dynamicMaxRadius = baseWidth * 0.36; // Scaled to current rendered base size
      const clampedDist = Math.min(distance, dynamicMaxRadius);
      const nx = distance > 0 ? (dx / distance) * clampedDist : 0;
      const ny = distance > 0 ? (dy / distance) * clampedDist : 0;

      if (this.ui.joystickKnob) {
        this.ui.joystickKnob.style.transform = `translate(${nx}px, ${ny}px)`;
      }

      const mag = Math.min(1, distance / maxStickRadius);
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
        this.ui.joystickBase.style.opacity = '';
      }
      this.input.touchMoveX = 0;
      this.input.touchMoveY = 0;
      this.input.touchMoveMagnitude = 0;
    };

    if (this.ui.touchZoneLeft) {
      this.ui.touchZoneLeft.addEventListener('touchstart', (e) => {
        if (joystickTouchId !== null) return;
        const touch = e.changedTouches[0];
        joystickTouchId = touch.identifier;

        if (this.ui.joystickBase) {
          this.ui.joystickBase.style.opacity = '1';
          const rect = this.ui.joystickBase.getBoundingClientRect();
          const dFromBase = Math.hypot(touch.clientX - (rect.left + rect.width / 2), touch.clientY - (rect.top + rect.height / 2));
          if (dFromBase < rect.width * 1.5) {
            joystickOriginX = rect.left + rect.width / 2;
            joystickOriginY = rect.top + rect.height / 2;
          } else {
            joystickOriginX = touch.clientX;
            joystickOriginY = touch.clientY;
          }
        } else {
          joystickOriginX = touch.clientX;
          joystickOriginY = touch.clientY;
        }

        updateJoystickPosition(touch.clientX, touch.clientY);
        e.preventDefault();
      }, { passive: false });

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
          let cx = touch.clientX;
          let cy = touch.clientY;
          let sx = fireStartX;
          let sy = fireStartY;
          if (this.isForceLandscape) {
            cx = touch.clientY;
            cy = window.innerWidth - touch.clientX;
            sx = fireStartY;
            sy = window.innerWidth - fireStartX;
          }
          const dx = cx - sx;
          const dy = cy - sy;
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
        if (this.player) {
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
        if (this.player) {
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

    // Detect device type to activate optimal tab by default
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);
    if (hasTouch) {
      const touchBtn = document.getElementById('tab-btn-touch');
      if (touchBtn) touchBtn.click();
    } else if (this.input.gamepadConnected) {
      const gpBtn = document.getElementById('tab-btn-gamepad');
      if (gpBtn) gpBtn.click();
    }

    // 2. Orientation Monitoring
    const checkOrientation = () => {
      const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 900);
      const isPortrait = window.innerHeight > window.innerWidth;
      if (this.ui.orientationPrompt) {
        if (isMobile && isPortrait && !this.orientationDismissed && !this.isForceLandscape && this.state === 'start') {
          this.ui.orientationPrompt.classList.remove('hidden');
        } else {
          this.ui.orientationPrompt.classList.add('hidden');
        }
      }
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    setTimeout(checkOrientation, 150);

    // 3. Orientation buttons
    if (this.ui.btnOrientationRotate) {
      const handleOrientRotate = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.orientationDismissed = true;
        if (this.ui.orientationPrompt) this.ui.orientationPrompt.classList.add('hidden');
        this.toggleForceLandscape(true);
      };
      this.ui.btnOrientationRotate.addEventListener('click', handleOrientRotate);
      this.ui.btnOrientationRotate.addEventListener('touchstart', handleOrientRotate, { passive: false });
    }

    if (this.ui.btnOrientationDismiss) {
      const handleDismiss = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.orientationDismissed = true;
        if (this.ui.orientationPrompt) this.ui.orientationPrompt.classList.add('hidden');
      };
      this.ui.btnOrientationDismiss.addEventListener('click', handleDismiss);
      this.ui.btnOrientationDismiss.addEventListener('touchstart', handleDismiss, { passive: false });
    }

    if (this.ui.btnRotateToggle) {
      this.ui.btnRotateToggle.addEventListener('click', () => {
        this.toggleForceLandscape();
      });
    }

    if (this.ui.btnModalRotate) {
      const handleModalRotate = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.toggleForceLandscape();
      };
      this.ui.btnModalRotate.addEventListener('click', handleModalRotate);
      this.ui.btnModalRotate.addEventListener('touchstart', handleModalRotate, { passive: false });
    }
  }

  toggleForceLandscape(forceState) {
    this.isForceLandscape = (forceState !== undefined) ? !!forceState : !this.isForceLandscape;
    document.body.classList.toggle('force-landscape', this.isForceLandscape);

    // Attempt browser fullscreen and orientation lock
    if (this.isForceLandscape) {
      const el = document.documentElement;
      const requestFS = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (requestFS && !document.fullscreenElement) {
        requestFS.call(el).then(() => {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
          }
        }).catch(() => {});
      }
    }

    if (this.ui.btnRotateToggle) {
      this.ui.btnRotateToggle.classList.toggle('active', this.isForceLandscape);
    }
    if (this.ui.orientationPrompt) {
      this.ui.orientationPrompt.classList.add('hidden');
    }

    this.resize();
    this.showToast('SIDEWAYS ARENA', this.isForceLandscape ? 'Sideways widescreen mode active' : 'Standard view restored', '#00f0ff');
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
    if (this.ui.touchMeleeLabel && this.player.equippedMelee) {
      this.ui.touchMeleeLabel.innerText = this.player.equippedMelee.name.split(' ')[0].toUpperCase();
    }
    if (this.ui.touchRangedLabel && this.player.equippedRanged) {
      this.ui.touchRangedLabel.innerText = this.player.equippedRanged.name.split(' ')[0].toUpperCase();
    }
  }

  setupGamepadListeners() {
    window.addEventListener('gamepadconnected', (e) => {
      this.input.gamepadConnected = true;
      this.input.usingGamepadCursor = true;
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

    let gp = null;
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) {
        gp = gamepads[i];
        break;
      }
    }

    if (!gp) {
      if (this.input.gamepadConnected) {
        this.input.gamepadConnected = false;
        this.updateGamepadBadge(false);
      }
      return;
    }

    if (!this.input.gamepadConnected) {
      this.input.gamepadConnected = true;
      const gpName = (gp.id || 'Xbox Controller').split('(')[0].trim();
      this.updateGamepadBadge(true, gpName);
    }

    // Helper for debounced button press
    const isJustPressed = (btnIndex) => {
      const isDown = gp.buttons[btnIndex] && (gp.buttons[btnIndex].pressed || gp.buttons[btnIndex].value > 0.5);
      const wasDown = !!this.prevGamepadButtons[btnIndex];
      return isDown && !wasDown;
    };

    const isButtonDown = (btnIndex, threshold = 0.18) => {
      if (!gp.buttons[btnIndex]) return false;
      return gp.buttons[btnIndex].pressed || gp.buttons[btnIndex].value > threshold;
    };

    const applyDeadzone = (val, deadzone = 0.15) => {
      if (Math.abs(val) < deadzone) return 0;
      return (val - Math.sign(val) * deadzone) / (1 - deadzone);
    };

    // 1. Left Analog Stick (Axes 0, 1) & D-Pad (Flight & Nav)
    let lx = gp.axes[0] || 0;
    let ly = gp.axes[1] || 0;
    // D-Pad buttons: 12=Up, 13=Down, 14=Left, 15=Right
    if (gp.buttons[12] && gp.buttons[12].pressed) ly = -1;
    if (gp.buttons[13] && gp.buttons[13].pressed) ly = 1;
    if (gp.buttons[14] && gp.buttons[14].pressed) lx = -1;
    if (gp.buttons[15] && gp.buttons[15].pressed) lx = 1;

    const lMag = Math.hypot(lx, ly);
    if (lMag > 0.15) {
      this.input.gamepadMoveX = lx;
      this.input.gamepadMoveY = ly;
      this.input.gamepadMoveMagnitude = Math.min(1, lMag);
    } else {
      this.input.gamepadMoveX = 0;
      this.input.gamepadMoveY = 0;
      this.input.gamepadMoveMagnitude = 0;
    }

    // 2. Right Analog Stick (Axes 2, 3) (Xbox Virtual Cursor & Precision Aiming)
    const rx = applyDeadzone(gp.axes[2]);
    const ry = applyDeadzone(gp.axes[3]);
    const rMag = Math.hypot(rx, ry);

    if (rMag > 0.12) {
      this.input.usingGamepadCursor = true;
      this.input.gamepadAiming = true;
      const speed = this.input.virtualCursorSpeed * Math.pow(rMag, 1.45);
      this.input.cursorX += (rx / rMag) * speed * dt;
      this.input.cursorY += (ry / rMag) * speed * dt;
    } else {
      this.input.gamepadAiming = false;
    }

    // In gameplay: carry cursor along with player flight velocity so aim relative to ship is preserved
    if (this.state === 'playing' && this.player && (Math.abs(this.player.vx) > 2 || Math.abs(this.player.vy) > 2)) {
      this.input.cursorX += this.player.vx * dt;
      this.input.cursorY += this.player.vy * dt;
    }

    // In menus (start, upgrade, pause, gameover): Left Stick or D-Pad also navigates the virtual cursor
    if (this.state !== 'playing') {
      const mx = Math.abs(rx) > 0.12 ? rx : lx;
      const my = Math.abs(ry) > 0.12 ? ry : ly;
      const mMag = Math.hypot(mx, my);
      if (mMag > 0.12) {
        this.input.usingGamepadCursor = true;
        const speed = this.input.virtualCursorSpeed * Math.pow(mMag, 1.45);
        this.input.cursorX += (mx / mMag) * speed * dt;
        this.input.cursorY += (my / mMag) * speed * dt;
      }
    }

    // Clamp virtual cursor coordinates within window viewport
    this.input.cursorX = Math.max(14, Math.min(this.width - 14, this.input.cursorX));
    this.input.cursorY = Math.max(14, Math.min(this.height - 14, this.input.cursorY));

    // When playing with controller, sync mouseX / mouseY to cursor coordinates
    if (this.input.gamepadConnected && this.input.usingGamepadCursor) {
      this.input.mouseX = this.input.cursorX;
      this.input.mouseY = this.input.cursorY;
      const playerX = this.player ? this.player.x : this.width / 2;
      const playerY = this.player ? this.player.y : this.height / 2;
      this.input.gamepadAimAngle = Math.atan2(this.input.cursorY - playerY, this.input.cursorX - playerX);
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
        if (this.player) {
          const next = (this.player.activeMeleeIndex + 1) % this.player.meleeWeapons.length;
          this.player.setMeleeIndex(next);
          this.renderWeaponSlots();
          if (window.soundEngine.playDeflection) window.soundEngine.playDeflection();
          this.rumble(60, 0.2, 0.2);
        }
      }

      // Button B (1): Cycle Ranged Weapon forward
      if (isJustPressed(1)) {
        if (this.player) {
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
      this.prevGamepadButtons[i] = gp.buttons[i] ? (gp.buttons[i].pressed || gp.buttons[i].value > 0.5) : false;
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
  }

  pauseGame() {
    this.state = 'paused';
    document.getElementById('pause-wave').innerText = this.wave;
    document.getElementById('pause-kills').innerText = this.enemiesDefeated;
    document.getElementById('pause-score').innerText = this.player.score;
    this.ui.screenPause.classList.remove('hidden');
  }

  resumeGame() {
    this.state = 'playing';
    this.ui.screenPause.classList.add('hidden');
    this.lastTime = performance.now();
  }

  gameOver() {
    this.state = 'gameover';

    const finalScore = this.player.score;
    if (finalScore > this.highScore) {
      this.highScore = finalScore;
      localStorage.setItem('trivertex_highscore', this.highScore.toString());
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

  generateUpgradeCards() {
    this.ui.upgradeContainer.innerHTML = '';
    this.controllerCardIndex = 0;

    // Safety checks for round tracking
    if (!this.playerUpgradeTiers) this.playerUpgradeTiers = {};
    if (!this.acquiredUpgradeIds) this.acquiredUpgradeIds = new Set();

    // 1. Gather all eligible next tiers across all power-up trees
    // Only the NEXT unacquired tier in each tree can ever be offered!
    const eligibleUpgrades = [];
    if (typeof UPGRADE_TREES !== 'undefined') {
      for (const treeKey in UPGRADE_TREES) {
        const tree = UPGRADE_TREES[treeKey];
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

    // 3. Early Magnet Progression: If player has 0 magnet tiers, guarantee Tier 1 Magnet is offered!
    const magnetTier = this.playerUpgradeTiers['magnet'] || 0;
    if (magnetTier === 0) {
      const magnetT1 = shuffled.find(u => u.treeId === 'magnet' && u.tier === 1);
      if (magnetT1) {
        shuffled = [magnetT1, ...shuffled.filter(u => u.id !== magnetT1.id)];
      }
    }

    // 4. Select top 3 distinct upgrades
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

      card.innerHTML = `
        <div class="up-tags-row">
          <span class="up-rarity-tag tag-${up.rarity}">${up.rarity}</span>
          ${tierBadge}
        </div>
        <div class="up-icon-box">
          <svg class="ui-icon"><use href="${iconSvg}"></use></svg>
        </div>
        <h4 class="up-title">${up.title}</h4>
        <p class="up-desc">${up.desc}</p>
        <div class="up-choose-btn">
          <span>EQUIP AUGMENT</span>
          <svg class="ui-icon"><use href="#icon-chevron-right"></use></svg>
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
    this.player.meleeWeapons.forEach((wKey, idx) => {
      const w = WEAPONS[wKey];
      const isActive = idx === this.player.activeMeleeIndex;
      const slot = document.createElement('div');
      slot.className = `w-slot ${isActive ? 'active-melee' : ''}`;
      slot.innerHTML = `
        <span class="w-slot-key">${idx + 1}</span>
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

    // Ranged Slots
    this.ui.rangedSlots.innerHTML = '';
    this.player.rangedWeapons.forEach((wKey, idx) => {
      const w = WEAPONS[wKey];
      const isActive = idx === this.player.activeRangedIndex;
      const slot = document.createElement('div');
      slot.className = `w-slot ${isActive ? 'active-ranged' : ''}`;
      slot.innerHTML = `
        <span class="w-slot-key">${idx + 5}</span>
        <svg class="ui-icon w-slot-icon" style="color: ${w.color}"><use href="#${w.icon}"></use></svg>
        <span class="w-slot-name">${w.name.split(' ')[0]}</span>
        ${w.energyCost ? `<span class="w-slot-cost">${w.energyCost}E</span>` : ''}
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
    const x = this.width / 2;
    const y = -100;
    this.enemies.push(new Enemy(x, y, type, this.wave));
  }

  spawnRandomEnemy() {
    // Choose spawn location outside canvas edge
    let x, y;
    const edge = Math.floor(Math.random() * 4);
    const pad = 40;
    if (edge === 0) { // Top
      x = Math.random() * this.width;
      y = -pad;
    } else if (edge === 1) { // Right
      x = this.width + pad;
      y = Math.random() * this.height;
    } else if (edge === 2) { // Bottom
      x = Math.random() * this.width;
      y = this.height + pad;
    } else { // Left
      x = -pad;
      y = Math.random() * this.height;
    }

    // Determine type by wave unlocked with smooth weighting:
    // Sector 1: 100% Scouts
    // Sector 2: 80% Scouts, 20% Armored Cube (rare mini-tank instead of flooding the sector)
    let pool = ['scout'];
    if (this.wave === 2) {
      pool = ['scout', 'scout', 'scout', 'scout', 'cube'];
    } else if (this.wave === 3) {
      pool = ['scout', 'scout', 'cube', 'pentagon'];
    } else if (this.wave >= 4 && this.wave < 6) {
      pool = ['scout', 'cube', 'pentagon', 'sniper'];
    } else if (this.wave >= 6) {
      pool = ['scout', 'cube', 'pentagon', 'sniper', 'rhombus'];
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    this.enemies.push(new Enemy(x, y, chosen, this.wave));
  }

  // Main Loop
  loop(currentTime) {
    requestAnimationFrame((t) => this.loop(t));

    let dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // Poll Xbox Gamepad on every frame across all states (Start, Playing, Upgrade, Pause, GameOver)
    this.pollGamepad(dt);

    if (this.timeDilation !== 1.0) {
      dt *= this.timeDilation;
    }

    if (this.state === 'playing') {
      this.update(dt);
    }

    this.draw();
  }

  update(dt) {
    // Screen shake decay
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
    } else {
      this.shakeMag = 0;
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

    // Inter-enemy separation so enemies don't stack/glitch on top of each other
    for (let i = 0; i < this.enemies.length; i++) {
      for (let j = i + 1; j < this.enemies.length; j++) {
        const e1 = this.enemies[i];
        const e2 = this.enemies[j];
        const ed = dist(e1.x, e1.y, e2.x, e2.y);
        const minEDist = e1.radius + e2.radius + 6;
        if (ed < minEDist && ed > 0.01) {
          const push = (minEDist - ed) * 0.5;
          const nx = (e1.x - e2.x) / ed;
          const ny = (e1.y - e2.y) / ed;
          e1.x += nx * push;
          e1.y += ny * push;
          e2.x -= nx * push;
          e2.y -= ny * push;
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
                const ang = Math.atan2(enemy.y - p.y, enemy.x - p.x);
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
            const hitAng = Math.atan2(this.player.y - p.y, this.player.x - p.x);
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
      this.ui.synergyStatus.innerText = 'OVERCHARGED // NEXT RANGED STRIKE DEALS 200% DAMAGE & EXPLODES';
      this.ui.synergyStatus.style.color = '#ffb700';
    } else {
      this.ui.synergyStatus.innerText = 'MELEE HITS BUILD RANGED OVERCHARGE // RANGED HITS WEAKEN ARMOR';
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
    if (mSlotCd) {
      const cdPct = (this.player.meleeCooldown / this.player.equippedMelee.cooldown) * 100;
      mSlotCd.style.height = `${Math.max(0, cdPct)}%`;
    }

    const rSlotCd = document.getElementById(`cd-ranged-${this.player.activeRangedIndex}`);
    if (rSlotCd) {
      const cdPct = (this.player.rangedCooldown / this.player.equippedRanged.cooldown) * 100;
      rSlotCd.style.height = `${Math.max(0, cdPct)}%`;
    }
  }

  draw() {
    this.ctx.save();

    // Screen shake transform
    if (this.shakeMag > 0) {
      const sx = (Math.random() - 0.5) * this.shakeMag;
      const sy = (Math.random() - 0.5) * this.shakeMag;
      this.ctx.translate(sx, sy);
    }

    // Clear background
    this.ctx.fillStyle = '#07090e';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Subtle Cyber Grid & Stars
    this.drawGrid();

    // Draw Beams (Railgun tracer beams)
    this.beams.forEach(b => {
      this.ctx.save();
      this.ctx.globalAlpha = b.alpha;
      this.ctx.strokeStyle = b.color;
      this.ctx.lineWidth = b.width;
      this.ctx.shadowColor = b.color;
      this.ctx.shadowBlur = 18;
      this.ctx.beginPath();
      this.ctx.moveTo(b.x1, b.y1);
      this.ctx.lineTo(b.x2, b.y2);
      this.ctx.stroke();

      // White inner core
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = b.width * 0.35;
      this.ctx.beginPath();
      this.ctx.moveTo(b.x1, b.y1);
      this.ctx.lineTo(b.x2, b.y2);
      this.ctx.stroke();
      this.ctx.restore();
    });

    // Draw Shockwaves
    this.shockwaves.forEach(sw => {
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

    // Draw Electric Lightning Trails
    if (this.electricTrails.length > 0) {
      this.ctx.save();
      for (let i = 0; i < this.electricTrails.length; i++) {
        const node = this.electricTrails[i];
        const alpha = Math.min(1, node.life / 0.4);

        // Ground plasma glow
        this.ctx.globalAlpha = alpha * 0.35;
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 16;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius * 0.65, 0, Math.PI * 2);
        this.ctx.fill();

        // Connect adjacent nodes with zig-zag crackling lightning arcs
        if (i > 0) {
          const prev = this.electricTrails[i - 1];
          const segDist = dist(node.x, node.y, prev.x, prev.y);
          if (segDist < 85) {
            this.ctx.globalAlpha = alpha * 0.9;
            this.ctx.strokeStyle = '#00f0ff';
            this.ctx.lineWidth = 3.5;
            this.ctx.shadowColor = '#00f0ff';
            this.ctx.shadowBlur = 18;

            const jitterX = Math.sin(Date.now() * 0.04 + i) * 10;
            const jitterY = Math.cos(Date.now() * 0.04 + i) * 10;
            const midX = (node.x + prev.x) / 2 + jitterX;
            const midY = (node.y + prev.y) / 2 + jitterY;

            this.ctx.beginPath();
            this.ctx.moveTo(prev.x, prev.y);
            this.ctx.lineTo(midX, midY);
            this.ctx.lineTo(node.x, node.y);
            this.ctx.stroke();

            // Inner hot-white discharge core
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(prev.x, prev.y);
            this.ctx.lineTo(midX, midY);
            this.ctx.lineTo(node.x, node.y);
            this.ctx.stroke();
          }
        }
      }
      this.ctx.restore();
    }

    // Draw Gems
    this.gems.forEach(g => g.draw(this.ctx));

    // Draw Enemies
    this.enemies.forEach(e => e.draw(this.ctx));

    // Draw Projectiles
    this.projectiles.forEach(p => p.draw(this.ctx));

    // Draw Player
    if (this.player) {
      this.player.draw(this.ctx, this);
    }

    // Draw Particles
    this.particles.forEach(pt => pt.draw(this.ctx));

    // Draw Floating Texts
    this.floatingTexts.forEach(ft => ft.draw(this.ctx));

    this.ctx.restore();
  }

  drawGrid() {
    this.ctx.strokeStyle = 'rgba(70, 95, 140, 0.08)';
    this.ctx.lineWidth = 1;
    const gridSize = 60;

    this.ctx.beginPath();
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();
  }
}

// Instantiate engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new GameEngine();
});