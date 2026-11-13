/**
 * SLING HERO - MAIN GAME ENGINE
 * Full Slingshot Physics, Trajectory Arc, Bouncy Ricochets,
 * Anchor Pegs, Pinball Bumpers, Destructible Blocks, Xbox Controller, and Audio.
 */

// Math helpers
const distSq = (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2;
const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

class SlingHeroGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // World & Viewport
    this.worldWidth = 1000;
    this.worldHeight = 600;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    // Game Mode & Level State
    this.mode = 'adventure'; // 'adventure' or 'endless'
    this.currentLevelIdx = 0;
    this.shotsTaken = 0;
    this.levelStars = [false, false, false];
    this.totalScore = 0;
    this.state = 'aiming'; // 'aiming', 'flying', 'anchored', 'portal', 'level_clear', 'game_over', 'paused'

    // Physics Settings
    this.gravity = 540;
    this.airResistance = 0.994;
    this.maxDragDistance = 110;
    this.powerMultiplier = 7.8;

    // Player Hero
    this.player = {
      x: 140,
      y: 440,
      vx: 0,
      vy: 0,
      radius: 18,
      anchorX: 140,
      anchorY: 440,
      isDragging: false,
      dragX: 0,
      dragY: 0,
      power: 0,
      angle: 0,
      squashX: 1,
      squashY: 1,
      rotation: 0,
      trail: [],
      currentPeg: null,
      facingAngle: 0,
      blinkTimer: 0
    };

    // Active Level Entities
    this.portal = { x: 860, y: 440, radius: 28, active: true, pulse: 0 };
    this.stars = [];
    this.pegs = [];
    this.bumpers = [];
    this.blocks = [];
    this.hazards = [];
    this.boostRings = [];
    this.switches = [];
    this.gates = [];
    this.targets = [];
    this.particles = [];
    this.floatingTexts = [];

    // Endless Mode tracking
    this.endlessHeight = 0;
    this.maxEndlessHeight = 0;
    this.endlessFloorsGenerated = 0;

    // Input state
    this.input = {
      isPointerDown: false,
      pointerX: 0,
      pointerY: 0,
      keys: {},
      gamepadConnected: false,
      gpAimX: 0,
      gpAimY: 0,
      gpAimMag: 0,
      gpCharging: false
    };
    this.prevGamepadButtons = {};

    // Save Data
    this.saveData = {
      unlockedLevel: 1,
      starsPerLevel: {},
      highScore: 0,
      endlessBest: 0
    };

    // UI Cache
    this.ui = {
      lblLevel: document.getElementById('hud-level'),
      lblShots: document.getElementById('hud-shots'),
      lblPar: document.getElementById('hud-par'),
      lblScore: document.getElementById('hud-score'),
      lblHint: document.getElementById('hud-hint'),
      starIcons: [
        document.getElementById('star-0'),
        document.getElementById('star-1'),
        document.getElementById('star-2')
      ],
      btnLevels: document.getElementById('btn-levels'),
      btnRestart: document.getElementById('btn-restart'),
      btnSound: document.getElementById('btn-sound'),
      btnMusic: document.getElementById('btn-music'),
      btnPause: document.getElementById('btn-pause'),
      // Modals
      levelModal: document.getElementById('level-modal'),
      levelsGrid: document.getElementById('levels-grid'),
      btnCloseLevels: document.getElementById('btn-close-levels'),
      winModal: document.getElementById('win-modal'),
      winTitle: document.getElementById('win-title'),
      winStarsRow: document.getElementById('win-stars-row'),
      winStats: document.getElementById('win-stats'),
      btnNextLevel: document.getElementById('btn-next-level'),
      btnReplayLevel: document.getElementById('btn-replay-level'),
      overModal: document.getElementById('over-modal'),
      btnRetryOver: document.getElementById('btn-retry-over'),
      pauseModal: document.getElementById('pause-modal'),
      btnResume: document.getElementById('btn-resume')
    };

    this.loadSave();
    this.setupResize();
    this.setupInputs();
    this.loadLevel(this.currentLevelIdx);

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  loadLevel(levelIndex) {
    if (levelIndex < 0 || levelIndex >= SLING_LEVELS.length) {
      levelIndex = 0;
    }
    this.currentLevelIdx = levelIndex;
    const def = SLING_LEVELS[levelIndex];

    this.shotsTaken = 0;
    this.levelStars = [false, false, false];
    this.state = 'aiming';

    // Player position
    this.player.x = def.playerStart.x;
    this.player.y = def.playerStart.y;
    this.player.anchorX = def.playerStart.x;
    this.player.anchorY = def.playerStart.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isDragging = false;
    this.player.trail = [];
    this.player.currentPeg = null;
    this.player.squashX = 1;
    this.player.squashY = 1;

    // Portal
    this.portal = {
      x: def.portal.x,
      y: def.portal.y,
      radius: 28,
      active: !def.portal.lockedUntilTargets,
      lockedUntilTargets: !!def.portal.lockedUntilTargets,
      pulse: 0
    };

    // Deep clone level entities
    this.stars = JSON.parse(JSON.stringify(def.stars || []));
    this.pegs = JSON.parse(JSON.stringify(def.pegs || []));
    this.bumpers = JSON.parse(JSON.stringify(def.bumpers || []));
    this.blocks = JSON.parse(JSON.stringify(def.blocks || []));
    this.hazards = JSON.parse(JSON.stringify(def.hazards || []));
    this.boostRings = JSON.parse(JSON.stringify(def.boostRings || []));
    this.switches = JSON.parse(JSON.stringify(def.switches || []));
    this.gates = JSON.parse(JSON.stringify(def.gates || []));
    this.targets = JSON.parse(JSON.stringify(def.targets || []));

    this.particles = [];
    this.floatingTexts = [];

    this.updateHUD();
    this.closeModals();
  }

  updateHUD() {
    const def = SLING_LEVELS[this.currentLevelIdx];
    if (this.ui.lblLevel) this.ui.lblLevel.innerText = `LEVEL ${this.currentLevelIdx + 1}: ${def.name.toUpperCase()}`;
    if (this.ui.lblShots) this.ui.lblShots.innerText = `${this.shotsTaken}`;
    if (this.ui.lblPar) this.ui.lblPar.innerText = `PAR: ${def.parShots}`;
    if (this.ui.lblScore) this.ui.lblScore.innerText = `${this.totalScore}`;
    if (this.ui.lblHint) this.ui.lblHint.innerText = def.hint || 'Aim with trajectory and release to sling!';

    for (let i = 0; i < 3; i++) {
      if (this.ui.starIcons[i]) {
        this.ui.starIcons[i].style.opacity = this.levelStars[i] ? '1.0' : '0.25';
        this.ui.starIcons[i].style.transform = this.levelStars[i] ? 'scale(1.2)' : 'scale(1.0)';
      }
    }
  }

  setupResize() {
    this.canvas.width = this.worldWidth;
    this.canvas.height = this.worldHeight;
  }

  // Convert screen coords to world coords (1000x600)
  screenToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    return {
      x: Math.max(0, Math.min(this.worldWidth, nx * this.worldWidth)),
      y: Math.max(0, Math.min(this.worldHeight, ny * this.worldHeight))
    };
  }

  setupInputs() {
    this.activeTouchId = null;
    this.mobileRelativeDrag = false;
    this.mobileDragStartX = 0;
    this.mobileDragStartY = 0;

    // --- Mouse & Touch Events ---
    const onPointerDown = (e) => {
      if (this.state === 'paused' || this.state === 'level_clear' || this.state === 'game_over') return;
      if (e.target.closest('button, a, .modal-dialog, .arcade-navbar, .bottom-bar')) return;

      if (window.slingAudio) {
        window.slingAudio.init();
        window.slingAudio.resume();
      }

      let clientX, clientY;
      const isTouch = !!e.changedTouches;

      if (isTouch) {
        if (this.activeTouchId !== null) return;
        const t = e.changedTouches[0];
        this.activeTouchId = t.identifier;
        clientX = t.clientX;
        clientY = t.clientY;
        if (e.cancelable) e.preventDefault();
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const wPos = this.screenToWorld(clientX, clientY);
      this.input.isPointerDown = true;
      this.input.pointerX = wPos.x;
      this.input.pointerY = wPos.y;

      // Allow dragging if near player, or anywhere on screen on touch devices
      if (this.state === 'aiming' || this.state === 'anchored') {
        const d = dist(wPos.x, wPos.y, this.player.x, this.player.y);
        if (d < (isTouch ? 180 : 130)) {
          this.mobileRelativeDrag = false;
          this.player.isDragging = true;
          this.updateDragVector(wPos.x, wPos.y);
        } else if (isTouch) {
          this.mobileRelativeDrag = true;
          this.mobileDragStartX = wPos.x;
          this.mobileDragStartY = wPos.y;
          this.player.isDragging = true;
          this.updateDragVector(this.player.anchorX, this.player.anchorY);
        }
      }
    };

    const onPointerMove = (e) => {
      if (!this.input.isPointerDown) return;
      let clientX, clientY;

      if (e.changedTouches) {
        let t = null;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.activeTouchId) {
            t = e.changedTouches[i];
            break;
          }
        }
        if (!t) return;
        clientX = t.clientX;
        clientY = t.clientY;
        if (e.cancelable) e.preventDefault();
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const wPos = this.screenToWorld(clientX, clientY);
      this.input.pointerX = wPos.x;
      this.input.pointerY = wPos.y;

      if (this.player.isDragging) {
        if (this.mobileRelativeDrag) {
          const dx = wPos.x - this.mobileDragStartX;
          const dy = wPos.y - this.mobileDragStartY;
          this.updateDragVector(this.player.anchorX + dx, this.player.anchorY + dy);
        } else {
          this.updateDragVector(wPos.x, wPos.y);
        }
      }
    };

    const onPointerUp = (e) => {
      if (e && e.changedTouches) {
        let matches = false;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.activeTouchId) {
            matches = true;
            break;
          }
        }
        if (!matches) return;
        this.activeTouchId = null;
        if (e.cancelable) e.preventDefault();
      }

      this.input.isPointerDown = false;
      this.mobileRelativeDrag = false;
      if (this.player.isDragging) {
        this.player.isDragging = false;
        this.releaseSling();
      }
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp, { passive: false });
    window.addEventListener('touchcancel', onPointerUp, { passive: false });

    // --- Keyboard Events ---
    window.addEventListener('keydown', (e) => {
      this.input.keys[e.code] = true;
      if (window.slingAudio) window.slingAudio.init();

      if (e.code === 'KeyR') {
        this.loadLevel(this.currentLevelIdx);
      } else if (e.code === 'KeyL') {
        this.toggleLevelModal();
      } else if (e.code === 'Escape') {
        if (!this.ui.levelModal.classList.contains('hidden')) {
          this.closeModals();
        } else if (!this.ui.winModal.classList.contains('hidden')) {
          this.nextLevel();
        } else {
          this.togglePause();
        }
      } else if (e.code === 'KeyP') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.input.keys[e.code] = false;
    });

    // --- UI Buttons ---
    if (this.ui.btnRestart) this.ui.btnRestart.addEventListener('click', () => this.loadLevel(this.currentLevelIdx));
    if (this.ui.btnLevels) this.ui.btnLevels.addEventListener('click', () => this.toggleLevelModal());
    if (this.ui.btnCloseLevels) this.ui.btnCloseLevels.addEventListener('click', () => this.closeModals());
    if (this.ui.btnPause) this.ui.btnPause.addEventListener('click', () => this.togglePause());
    if (this.ui.btnResume) this.ui.btnResume.addEventListener('click', () => this.togglePause());
    if (this.ui.btnNextLevel) this.ui.btnNextLevel.addEventListener('click', () => this.nextLevel());
    if (this.ui.btnReplayLevel) this.ui.btnReplayLevel.addEventListener('click', () => this.loadLevel(this.currentLevelIdx));
    if (this.ui.btnRetryOver) this.ui.btnRetryOver.addEventListener('click', () => this.loadLevel(this.currentLevelIdx));

    if (this.ui.btnSound) {
      this.ui.btnSound.addEventListener('click', () => {
        if (window.slingAudio) {
          const muted = window.slingAudio.toggleMute();
          this.ui.btnSound.style.opacity = muted ? '0.5' : '1.0';
        }
      });
    }

    if (this.ui.btnMusic) {
      this.ui.btnMusic.addEventListener('click', () => {
        if (window.slingAudio) {
          const on = window.slingAudio.toggleMusic();
          this.ui.btnMusic.style.opacity = on ? '1.0' : '0.5';
        }
      });
    }
  }

  updateDragVector(worldX, worldY) {
    const originX = this.player.anchorX;
    const originY = this.player.anchorY;
    let dx = worldX - originX;
    let dy = worldY - originY;
    const distance = Math.hypot(dx, dy);

    if (distance > 0) {
      const clampedDist = Math.min(distance, this.maxDragDistance);
      const ratio = clampedDist / this.maxDragDistance;
      this.player.dragX = (dx / distance) * clampedDist;
      this.player.dragY = (dy / distance) * clampedDist;
      this.player.power = ratio;
      this.player.angle = Math.atan2(dy, dx);
      this.player.facingAngle = this.player.angle + Math.PI;

      // Stretch character slightly towards pull
      this.player.squashX = 1 + ratio * 0.25;
      this.player.squashY = 1 - ratio * 0.22;

      // Audio stretch feedback
      if (Math.random() < 0.15 && window.slingAudio) {
        window.slingAudio.playStretch(ratio);
      }
    }
  }

  releaseSling() {
    if (this.player.power > 0.08) {
      // Launch in the opposite direction of the drag!
      const launchSpeed = this.player.power * this.maxDragDistance * this.powerMultiplier;
      const launchAngle = this.player.angle + Math.PI;

      this.player.vx = Math.cos(launchAngle) * launchSpeed;
      this.player.vy = Math.sin(launchAngle) * launchSpeed;
      this.player.isDragging = false;
      this.player.currentPeg = null;
      this.state = 'flying';
      this.shotsTaken++;

      if (window.slingAudio) window.slingAudio.playLaunch();
      this.rumble(70, 0.25, 0.35);

      // Launch burst particles
      this.spawnLaunchPuffs(this.player.anchorX, this.player.anchorY, launchAngle);
      this.updateHUD();
    } else {
      // Canceled drag
      this.player.dragX = 0;
      this.player.dragY = 0;
      this.player.power = 0;
      this.player.squashX = 1;
      this.player.squashY = 1;
    }
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
      this.input.gamepadConnected = false;
      return;
    }

    this.input.gamepadConnected = true;

    const isJustPressed = (idx) => {
      const down = gp.buttons[idx] && (gp.buttons[idx].pressed || gp.buttons[idx].value > 0.5);
      const was = !!this.prevGamepadButtons[idx];
      return down && !was;
    };

    const lx = gp.axes[0] || 0;
    const ly = gp.axes[1] || 0;

    // Check if an overlay modal (Levels, Win, Game Over, Pause) is open
    const openModal = [this.ui.winModal, this.ui.overModal, this.ui.levelModal, this.ui.pauseModal]
      .find(m => m && !m.classList.contains('hidden'));

    if (openModal) {
      let navX = lx;
      let navY = ly;
      if (gp.buttons[12]?.pressed) navY = -1;
      if (gp.buttons[13]?.pressed) navY = 1;
      if (gp.buttons[14]?.pressed) navX = -1;
      if (gp.buttons[15]?.pressed) navX = 1;

      const items = Array.from(openModal.querySelectorAll('button:not([disabled]):not(.modal-close), .level-cell:not(.locked)'))
        .filter(el => el.offsetParent !== null);
      this.modalNavCooldown = Math.max(0, (this.modalNavCooldown || 0) - dt);
      if (this.modalFocusIdx === undefined) this.modalFocusIdx = 0;

      if (items.length > 0 && this.modalNavCooldown <= 0) {
        let dir = 0;
        if (navX > 0.45 || navY > 0.45 || isJustPressed(15) || isJustPressed(13)) dir = 1;
        else if (navX < -0.45 || navY < -0.45 || isJustPressed(14) || isJustPressed(12)) dir = -1;
        if (dir !== 0) {
          this.modalFocusIdx = (this.modalFocusIdx + dir + items.length) % items.length;
          this.modalNavCooldown = 0.18;
          this.rumble(20, 0.15, 0.08);
        }
      }
      items.forEach((el, i) => {
        if (i === (this.modalFocusIdx % Math.max(1, items.length))) {
          el.classList.add('gp-focus');
          if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } else {
          el.classList.remove('gp-focus');
        }
      });

      if (isJustPressed(0) && items.length > 0) {
        const target = items[this.modalFocusIdx % items.length];
        if (target) {
          target.click();
          this.rumble(35, 0.25, 0.2);
        }
      }
      if (isJustPressed(1)) {
        this.closeModals();
      }
      for (let i = 0; i < 17; i++) {
        this.prevGamepadButtons[i] = gp.buttons[i] ? (gp.buttons[i].pressed || gp.buttons[i].value > 0.5) : false;
      }
      return;
    }

    // Slingshot Aiming with Left Analog Stick or D-Pad
    let aimX = lx;
    let aimY = ly;
    if (gp.buttons[12]?.pressed) aimY = -0.85;
    if (gp.buttons[13]?.pressed) aimY = 0.85;
    if (gp.buttons[14]?.pressed) aimX = -0.85;
    if (gp.buttons[15]?.pressed) aimX = 0.85;
    const mag = Math.hypot(aimX, aimY);
    const DEADZONE = 0.2;

    if (this.state === 'aiming' || this.state === 'anchored') {
      if (mag > DEADZONE) {
        const norm = (mag - DEADZONE) / (1.0 - DEADZONE);
        const clampedNorm = Math.min(1.0, norm);
        this.player.isDragging = true;
        this.player.dragX = (aimX / mag) * clampedNorm * this.maxDragDistance;
        this.player.dragY = (aimY / mag) * clampedNorm * this.maxDragDistance;
        this.player.power = clampedNorm;
        this.player.angle = Math.atan2(aimY, aimX);
        this.player.facingAngle = this.player.angle + Math.PI;
      } else if (this.player.isDragging && !this.input.isPointerDown) {
        // Stick released -> Sling shot!
        this.releaseSling();
      }
    }

    // Button A or Right Trigger (7) to launch if holding stick
    if ((isJustPressed(0) || isJustPressed(7)) && (this.state === 'aiming' || this.state === 'anchored')) {
      if (this.player.power > 0.1) {
        this.releaseSling();
      }
    }

    // Button B to cancel aim
    if (isJustPressed(1)) {
      if (!this.ui.levelModal.classList.contains('hidden') || !this.ui.pauseModal.classList.contains('hidden')) {
        this.closeModals();
      } else if (this.player.isDragging) {
        this.player.isDragging = false;
        this.player.power = 0;
      }
    }

    // Button Y to restart level
    if (isJustPressed(3)) {
      this.loadLevel(this.currentLevelIdx);
    }

    // Button X to open level select
    if (isJustPressed(2)) {
      this.toggleLevelModal();
    }

    // Start to pause
    if (isJustPressed(9)) {
      this.togglePause();
    }

    for (let i = 0; i < 17; i++) {
      this.prevGamepadButtons[i] = gp.buttons[i] ? (gp.buttons[i].pressed || gp.buttons[i].value > 0.5) : false;
    }
  }

  rumble(duration = 50, weak = 0.2, strong = 0.3) {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.vibrationActuator && gp.vibrationActuator.playEffect) {
        gp.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: duration,
          weakMagnitude: weak,
          strongMagnitude: strong
        }).catch(() => {});
      }
    }
  }

  // --- MAIN LOOP ---
  gameLoop(currentTime) {
    let dt = Math.min(0.06, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    this.pollGamepad(dt);

    if (this.state !== 'paused') {
      this.update(dt);
    }

    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // Portal rotation & pulse
    this.portal.pulse += dt * 3.5;

    // Update Hero blinking
    this.player.blinkTimer += dt;
    if (this.player.blinkTimer > 4.5) {
      this.player.blinkTimer = 0;
    }

    // 1. UPDATE FLYING PHYSICS
    if (this.state === 'flying') {
      // Apply gravity & air drag
      this.player.vy += this.gravity * dt;
      this.player.vx *= this.airResistance;
      this.player.vy *= this.airResistance;

      this.player.x += this.player.vx * dt;
      this.player.y += this.player.vy * dt;

      // Rotation & elongation along velocity
      const currentSpeed = Math.hypot(this.player.vx, this.player.vy);
      if (currentSpeed > 10) {
        this.player.rotation = Math.atan2(this.player.vy, this.player.vx);
        this.player.facingAngle = this.player.rotation;
        const stretch = Math.min(1.4, 1 + currentSpeed * 0.0004);
        this.player.squashX = stretch;
        this.player.squashY = 1 / stretch;

        // Sparkle / motion trail
        this.player.trail.push({ x: this.player.x, y: this.player.y, alpha: 0.8, size: this.player.radius * 0.7 });
        if (this.player.trail.length > 14) this.player.trail.shift();
      }

      // Check World Boundaries
      this.handleWorldBounds();

      // Check Collision with Walls & Blocks
      this.handleBlockCollisions();

      // Check Collision with Pinball Bumpers
      this.handleBumperCollisions();

      // Check Collision with Cannon Boost Rings
      this.handleBoostRings();

      // Check Collision with Switches
      this.handleSwitches();

      // Check Collision with Target Slimes
      this.handleTargets();

      // Check Collision with Anchor Pegs
      this.handlePegAnchors();

      // Check Collision with Stars
      this.handleStarPickups();

      // Check Collision with Goal Portal
      this.handlePortal();

      // Check Spikes / Hazard Damage
      this.handleHazards();

      // Check if came to rest
      if (currentSpeed < 18 && this.player.y >= 540) {
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.anchorX = this.player.x;
        this.player.anchorY = this.player.y;
        this.player.squashX = 1;
        this.player.squashY = 1;
        this.state = 'aiming';
      }
    } else {
      // Fade trail when stationary
      for (let i = this.player.trail.length - 1; i >= 0; i--) {
        this.player.trail[i].alpha -= dt * 4;
        if (this.player.trail[i].alpha <= 0) {
          this.player.trail.splice(i, 1);
        }
      }
    }

    // 2. UPDATE PARTICLES & TEXTS
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.gravity) p.vy += 320 * dt;
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      } else {
        ft.y -= 30 * dt;
      }
    }
  }

  handleWorldBounds() {
    const r = this.player.radius;
    // Left & Right
    if (this.player.x - r < 0) {
      this.player.x = r;
      this.player.vx = -this.player.vx * 0.78;
      this.onWallHit();
    } else if (this.player.x + r > this.worldWidth) {
      this.player.x = this.worldWidth - r;
      this.player.vx = -this.player.vx * 0.78;
      this.onWallHit();
    }

    // Ceiling & Floor
    if (this.player.y - r < 0) {
      this.player.y = r;
      this.player.vy = -this.player.vy * 0.78;
      this.onWallHit();
    } else if (this.player.y + r > this.worldHeight) {
      this.player.y = this.worldHeight - r;
      this.player.vy = -this.player.vy * 0.65;
      this.player.vx *= 0.88;
      this.onWallHit();
    }
  }

  onWallHit() {
    if (window.slingAudio) window.slingAudio.playBounce(0.8);
    this.rumble(30, 0.1, 0.15);
  }

  handleBlockCollisions() {
    const r = this.player.radius;

    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const b = this.blocks[i];
      // Circle vs AABB Collision
      const closestX = clamp(this.player.x, b.x, b.x + b.width);
      const closestY = clamp(this.player.y, b.y, b.y + b.height);
      const dX = this.player.x - closestX;
      const dY = this.player.y - closestY;
      const d = Math.hypot(dX, dY);

      if (d < r) {
        // Collision response: push outside along penetration normal
        const overlap = r - (d || 0.1);
        const normX = d ? (dX / d) : 0;
        const normY = d ? (dY / d) : -1;

        this.player.x += normX * overlap;
        this.player.y += normY * overlap;

        // Reflect velocity
        const dot = this.player.vx * normX + this.player.vy * normY;
        this.player.vx -= 1.75 * dot * normX;
        this.player.vy -= 1.75 * dot * normY;

        this.onWallHit();

        // Destructible block check
        if (b.type === 'wood' || b.type === 'glass' || b.type === 'stone' || b.type === 'tnt') {
          const impactSpeed = Math.hypot(this.player.vx, this.player.vy);
          b.hp = (b.hp || 1) - 1;

          if (b.hp <= 0) {
            this.destroyBlock(b, i);
          } else {
            this.spawnSmashDebris(closestX, closestY, b.type === 'wood' ? '#b45309' : '#94a3b8', 6);
          }
        }
      }
    }
  }

  destroyBlock(b, index) {
    this.blocks.splice(index, 1);
    this.totalScore += 100;
    this.updateHUD();

    if (b.type === 'tnt') {
      // Explosive TNT barrel
      if (window.slingAudio) window.slingAudio.playSmash();
      this.rumble(150, 0.4, 0.6);
      this.spawnExplosion(b.x + b.width / 2, b.y + b.height / 2);

      // Launch player outwards
      const cX = b.x + b.width / 2;
      const cY = b.y + b.height / 2;
      const d = dist(this.player.x, this.player.y, cX, cY);
      if (d < 180) {
        const nx = (this.player.x - cX) / (d || 1);
        const ny = (this.player.y - cY) / (d || 1);
        this.player.vx += nx * 580;
        this.player.vy += ny * 580;
      }

      // Chain destroy adjacent destructibles
      for (let j = this.blocks.length - 1; j >= 0; j--) {
        const other = this.blocks[j];
        if (other.type !== 'wall') {
          const od = dist(other.x + other.width / 2, other.y + other.height / 2, cX, cY);
          if (od < 140) {
            this.destroyBlock(other, j);
          }
        }
      }
    } else {
      if (window.slingAudio) window.slingAudio.playSmash();
      const color = b.type === 'glass' ? '#38bdf8' : (b.type === 'wood' ? '#d97706' : '#64748b');
      this.spawnSmashDebris(b.x + b.width / 2, b.y + b.height / 2, color, 14);
      this.spawnFloatingText(b.x + b.width / 2, b.y, '+100', '#facc15', 18);
    }
  }

  handleBumperCollisions() {
    this.bumpers.forEach(bumper => {
      const d = dist(this.player.x, this.player.y, bumper.x, bumper.y);
      if (d < this.player.radius + bumper.radius) {
        // High velocity rebound away from bumper center!
        const nx = (this.player.x - bumper.x) / (d || 1);
        const ny = (this.player.y - bumper.y) / (d || 1);
        const power = bumper.power || 2.0;

        const baseLaunch = 580 * power;
        this.player.vx = nx * baseLaunch;
        this.player.vy = ny * baseLaunch;

        if (window.slingAudio) window.slingAudio.playBumper();
        this.rumble(80, 0.3, 0.5);

        this.totalScore += 150;
        this.spawnFloatingText(bumper.x, bumper.y - 20, '+150 BUMPER!', '#38bdf8', 18);
        this.spawnShockwave(bumper.x, bumper.y, '#00f0ff');
        this.updateHUD();
      }
    });
  }

  handleBoostRings() {
    this.boostRings.forEach(ring => {
      const d = dist(this.player.x, this.player.y, ring.x, ring.y);
      if (d < this.player.radius + ring.radius) {
        // Boost velocity vector
        this.player.vx = ring.boostX;
        this.player.vy = ring.boostY;
        if (window.slingAudio) window.slingAudio.playLaunch();
        this.rumble(90, 0.3, 0.5);
        this.spawnShockwave(ring.x, ring.y, '#f59e0b');
        this.spawnFloatingText(ring.x, ring.y - 20, 'TURBO BOOST!', '#f59e0b', 18);
      }
    });
  }

  handleSwitches() {
    this.switches.forEach(sw => {
      if (sw.triggered) return;
      const d = dist(this.player.x, this.player.y, sw.x, sw.y);
      if (d < this.player.radius + sw.radius) {
        sw.triggered = true;
        if (window.slingAudio) window.slingAudio.playStar();
        this.rumble(70, 0.2, 0.3);

        // Deactivate target gate
        const gIdx = this.gates.findIndex(g => g.id === sw.gateId);
        if (gIdx !== -1) {
          const g = this.gates[gIdx];
          this.spawnShockwave(g.x + g.width / 2, g.y + g.height / 2, '#22c55e');
          this.gates.splice(gIdx, 1);
        }
        this.spawnFloatingText(sw.x, sw.y - 24, 'GATE OPENED!', '#22c55e', 18);
      }
    });
  }

  handleTargets() {
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      const d = dist(this.player.x, this.player.y, t.x, t.y);
      if (d < this.player.radius + t.radius) {
        // Defeat target
        this.targets.splice(i, 1);
        this.totalScore += 250;
        if (window.slingAudio) window.slingAudio.playSmash();
        this.rumble(90, 0.3, 0.5);

        this.spawnSmashDebris(t.x, t.y, '#ef4444', 16);
        this.spawnFloatingText(t.x, t.y - 20, '+250 SMASHED!', '#ef4444', 18);
        this.updateHUD();

        // Unlock portal if all targets defeated
        if (this.targets.length === 0 && this.portal.lockedUntilTargets) {
          this.portal.active = true;
          this.spawnShockwave(this.portal.x, this.portal.y, '#a855f7');
          this.spawnFloatingText(this.portal.x, this.portal.y - 30, 'PORTAL UNLOCKED!', '#a855f7', 22);
        }
      }
    }
  }

  handlePegAnchors() {
    if (this.player.currentPeg) return; // Already on a peg

    for (let i = 0; i < this.pegs.length; i++) {
      const peg = this.pegs[i];
      const d = dist(this.player.x, this.player.y, peg.x, peg.y);
      // Latch radius
      if (d < this.player.radius + peg.radius + 12) {
        // Snap to peg!
        this.player.x = peg.x;
        this.player.y = peg.y;
        this.player.anchorX = peg.x;
        this.player.anchorY = peg.y;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.currentPeg = peg;
        this.player.squashX = 1;
        this.player.squashY = 1;
        this.state = 'anchored';

        if (window.slingAudio) window.slingAudio.playPegAnchor();
        this.rumble(50, 0.2, 0.3);

        this.spawnShockwave(peg.x, peg.y, '#facc15');
        this.spawnFloatingText(peg.x, peg.y - 30, 'ANCHORED! AIM TO RE-SLING', '#facc15', 16);
        break;
      }
    }
  }

  handleStarPickups() {
    this.stars.forEach((star, idx) => {
      if (this.levelStars[idx]) return;
      const d = dist(this.player.x, this.player.y, star.x, star.y);
      if (d < this.player.radius + 16) {
        this.levelStars[idx] = true;
        this.totalScore += 200;
        if (window.slingAudio) window.slingAudio.playStar(idx);
        this.rumble(40, 0.15, 0.2);

        this.spawnStarBurst(star.x, star.y);
        this.spawnFloatingText(star.x, star.y - 20, '+200 STAR!', '#facc15', 18);
        this.updateHUD();
      }
    });
  }

  handlePortal() {
    if (!this.portal.active) return;
    const d = dist(this.player.x, this.player.y, this.portal.x, this.portal.y);
    if (d < this.player.radius + this.portal.radius - 4) {
      this.triggerLevelClear();
    }
  }

  handleHazards() {
    this.hazards.forEach(h => {
      // Circle vs AABB
      const closestX = clamp(this.player.x, h.x, h.x + h.width);
      const closestY = clamp(this.player.y, h.y, h.y + h.height);
      const d = dist(this.player.x, this.player.y, closestX, closestY);
      if (d < this.player.radius) {
        // Spike hit -> comical defeat and retry shot!
        if (window.slingAudio) window.slingAudio.playDefeat();
        this.rumble(150, 0.4, 0.6);
        this.spawnSmashDebris(this.player.x, this.player.y, '#ef4444', 16);
        this.spawnFloatingText(this.player.x, this.player.y - 20, 'OUCH! RETRY SHOT', '#ef4444', 18);

        // Reset to last anchor point
        this.player.x = this.player.anchorX;
        this.player.y = this.player.anchorY;
        this.player.vx = 0;
        this.player.vy = 0;
        this.state = 'aiming';
      }
    });
  }

  triggerLevelClear() {
    this.state = 'level_clear';
    this.player.vx = 0;
    this.player.vy = 0;

    if (window.slingAudio) window.slingAudio.playWin();
    this.rumble(200, 0.4, 0.6);

    this.spawnConfetti(this.portal.x, this.portal.y);

    // Calculate rating based on stars collected & par shots
    const starsEarned = this.levelStars.filter(Boolean).length;
    const def = SLING_LEVELS[this.currentLevelIdx];
    const underPar = this.shotsTaken <= def.parShots;
    const finalStars = Math.max(1, Math.min(3, starsEarned + (underPar ? 1 : 0)));

    // Save progression
    if (this.currentLevelIdx + 1 >= this.saveData.unlockedLevel) {
      this.saveData.unlockedLevel = Math.min(SLING_LEVELS.length, this.currentLevelIdx + 2);
    }
    const prevBest = this.saveData.starsPerLevel[this.currentLevelIdx] || 0;
    this.saveData.starsPerLevel[this.currentLevelIdx] = Math.max(prevBest, finalStars);
    this.saveGame();

    setTimeout(() => {
      this.openWinModal(finalStars, def.parShots);
    }, 600);
  }

  openWinModal(stars, parShots) {
    if (this.ui.winModal) {
      this.ui.winModal.classList.remove('hidden');

      if (this.ui.winTitle) {
        this.ui.winTitle.innerText = stars === 3 ? 'PERFECT 3-STAR CLEAR!' : 'LEVEL COMPLETED!';
      }

      // Render gold star icons
      let starsHtml = '';
      for (let i = 0; i < 3; i++) {
        const isGold = i < stars;
        starsHtml += `
          <svg width="42" height="42" viewBox="0 0 24 24" fill="${isGold ? '#facc15' : 'none'}" stroke="${isGold ? '#b45309' : '#64748b'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 3px 0 rgba(0,0,0,0.3));">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        `;
      }
      if (this.ui.winStarsRow) this.ui.winStarsRow.innerHTML = starsHtml;

      if (this.ui.winStats) {
        this.ui.winStats.innerHTML = `
          <div>SHOTS TAKEN: <strong>${this.shotsTaken}</strong> (PAR: ${parShots})</div>
          <div>LEVEL SCORE: <strong>+${this.totalScore}</strong></div>
        `;
      }
    }
  }

  nextLevel() {
    this.closeModals();
    if (this.currentLevelIdx + 1 < SLING_LEVELS.length) {
      this.loadLevel(this.currentLevelIdx + 1);
    } else {
      // Reached end of adventure -> open level select
      this.toggleLevelModal();
    }
  }

  toggleLevelModal() {
    if (!this.ui.levelModal) return;
    if (this.ui.levelModal.classList.contains('hidden')) {
      if (window.slingAudio) window.slingAudio.playBlip();
      this.ui.levelModal.classList.remove('hidden');
      this.renderLevelsGrid();
    } else {
      this.closeModals();
    }
  }

  renderLevelsGrid() {
    if (!this.ui.levelsGrid) return;
    let html = '';

    SLING_LEVELS.forEach((lvl, idx) => {
      const isUnlocked = idx < this.saveData.unlockedLevel;
      const isCurrent = idx === this.currentLevelIdx;
      const stars = this.saveData.starsPerLevel[idx] || 0;

      let cardClass = isCurrent ? 'current' : (isUnlocked ? 'unlocked' : 'locked');

      let starIconsHtml = '';
      for (let s = 0; s < 3; s++) {
        const gold = s < stars;
        starIconsHtml += `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${gold ? '#facc15' : 'none'}" stroke="${gold ? '#d97706' : '#94a3b8'}" stroke-width="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        `;
      }

      html += `
        <button class="level-cell ${cardClass}" ${isUnlocked ? `onclick="window.slingGameInstance.loadLevel(${idx})"` : 'disabled'}>
          <div class="level-num">${idx + 1}</div>
          <div class="level-name">${lvl.name}</div>
          <div class="level-stars">${starIconsHtml}</div>
        </button>
      `;
    });

    this.ui.levelsGrid.innerHTML = html;
  }

  closeModals() {
    if (this.ui.levelModal) this.ui.levelModal.classList.add('hidden');
    if (this.ui.winModal) this.ui.winModal.classList.add('hidden');
    if (this.ui.overModal) this.ui.overModal.classList.add('hidden');
    if (this.ui.pauseModal) this.ui.pauseModal.classList.add('hidden');
  }

  togglePause() {
    this.state = this.state === 'paused' ? 'aiming' : 'paused';
    if (this.ui.pauseModal) {
      if (this.state === 'paused') {
        this.ui.pauseModal.classList.remove('hidden');
      } else {
        this.ui.pauseModal.classList.add('hidden');
      }
    }
    this.lastTime = performance.now();
  }

  // --- FX SPAWNERS ---
  spawnLaunchPuffs(x, y, angle) {
    for (let i = 0; i < 8; i++) {
      const spread = (Math.random() - 0.5) * 0.8;
      const speed = Math.random() * 90 + 40;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle + spread + Math.PI) * speed,
        vy: Math.sin(angle + spread + Math.PI) * speed,
        color: '#ffffff',
        size: Math.random() * 5 + 3,
        life: 0.35,
        maxLife: 0.35,
        gravity: false
      });
    }
  }

  spawnShockwave(x, y, color) {
    this.particles.push({
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      color: color,
      radius: 6,
      maxRadius: 48,
      life: 0.35,
      maxLife: 0.35,
      isRing: true
    });
  }

  spawnSmashDebris(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 220,
        vy: -Math.random() * 180 - 40,
        color: color,
        size: Math.random() * 5 + 3,
        life: 0.55,
        maxLife: 0.55,
        gravity: true
      });
    }
  }

  spawnExplosion(x, y) {
    this.spawnShockwave(x, y, '#f97316');
    for (let i = 0; i < 24; i++) {
      const colors = ['#f97316', '#facc15', '#ef4444', '#ffffff'];
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 360,
        vy: (Math.random() - 0.5) * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
        life: 0.65,
        maxLife: 0.65,
        gravity: true
      });
    }
  }

  spawnStarBurst(x, y) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 160,
        vy: -Math.random() * 140 - 30,
        color: '#facc15',
        size: Math.random() * 4 + 2,
        life: 0.45,
        maxLife: 0.45,
        gravity: true
      });
    }
  }

  spawnConfetti(x, y) {
    const colors = ['#38bdf8', '#4ade80', '#facc15', '#ec4899', '#a855f7'];
    for (let i = 0; i < 36; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 380,
        vy: -Math.random() * 320 - 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
        life: 1.2,
        maxLife: 1.2,
        gravity: true
      });
    }
  }

  spawnFloatingText(x, y, text, color, fontSize = 18) {
    this.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color,
      fontSize: fontSize,
      life: 0.85,
      maxLife: 0.85
    });
  }

  // --- RENDERING ---
  render() {
    this.ctx.clearRect(0, 0, this.worldWidth, this.worldHeight);

    this.ctx.save();

    // 1. Background Grid & Chamber Atmosphere
    this.drawBackground();

    // 2. Draw Walls & Destructible Blocks
    this.drawBlocks();

    // 3. Draw Hazards & Gates
    this.drawHazards();
    this.drawGates();

    // 4. Draw Boost Rings & Switches
    this.drawBoostRings();
    this.drawSwitches();

    // 5. Draw Anchor Pegs & Pinball Bumpers
    this.drawPegs();
    this.drawBumpers();

    // 6. Draw Target Enemies
    this.drawTargets();

    // 7. Draw Stars
    this.drawStars();

    // 8. Draw Goal Portal
    this.drawPortal();

    // 9. Draw Slingshot Bands & Trajectory Prediction Arc
    if (this.player.isDragging) {
      this.drawSlingshotCords();
      this.drawTrajectoryArc();
    }

    // 10. Draw Hero Motion Trail
    this.drawTrail();

    // 11. Draw Hero Character
    this.drawHero();

    // 12. Draw Particles & FX
    this.drawParticles();

    // 13. Draw Floating Score Typography
    this.drawFloatingTexts();

    this.ctx.restore();
  }

  drawBackground() {
    const ctx = this.ctx;
    // Deep starry arcade grid
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // Grid lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
    ctx.lineWidth = 1;
    const gridStep = 40;
    for (let x = 0; x < this.worldWidth; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, this.worldHeight);
      ctx.stroke();
    }
    for (let y = 0; y < this.worldHeight; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(this.worldWidth, y);
      ctx.stroke();
    }

    // Outer border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, this.worldWidth - 4, this.worldHeight - 4);
  }

  drawBlocks() {
    const ctx = this.ctx;

    this.blocks.forEach(b => {
      ctx.save();
      if (b.type === 'wall') {
        // Solid Indestructible Wall
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 6);
        ctx.fill();
        ctx.stroke();

        // Neon bevel strip
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(b.x + 3, b.y + 3, b.width - 6, 4);

      } else if (b.type === 'wood') {
        // Breakable Wooden Crate
        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 6);
        ctx.fill();
        ctx.stroke();

        // Crate cross-brace
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x + 4, b.y + 4); ctx.lineTo(b.x + b.width - 4, b.y + b.height - 4);
        ctx.moveTo(b.x + b.width - 4, b.y + 4); ctx.lineTo(b.x + 4, b.y + b.height - 4);
        ctx.stroke();

      } else if (b.type === 'glass') {
        // Breakable Shimmering Glass
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 4);
        ctx.fill();
        ctx.stroke();

        // Diagonal glass glare line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x + 4, b.y + b.height - 8); ctx.lineTo(b.x + b.width - 4, b.y + 8);
        ctx.stroke();

      } else if (b.type === 'tnt') {
        // Explosive Red TNT Barrel
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 13px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TNT', b.x + b.width / 2, b.y + b.height / 2);

      } else if (b.type === 'stone') {
        // Heavy Granite Brick
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.fillRect(b.x + 6, b.y + 6, b.width - 12, 6);
      }
      ctx.restore();
    });
  }

  drawHazards() {
    const ctx = this.ctx;
    this.hazards.forEach(h => {
      // Spike row
      const count = Math.floor(h.width / 16);
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      for (let i = 0; i < count; i++) {
        const sx = h.x + i * 16;
        ctx.beginPath();
        ctx.moveTo(sx, h.y + h.height);
        ctx.lineTo(sx + 8, h.y);
        ctx.lineTo(sx + 16, h.y + h.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
  }

  drawGates() {
    const ctx = this.ctx;
    this.gates.forEach(g => {
      // Glowing Energy Forcefield
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(g.x, g.y, g.width, g.height, 6);
      ctx.fill();
      ctx.stroke();

      // Energy pulses
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      for (let y = g.y + 12; y < g.y + g.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(g.x + 3, y); ctx.lineTo(g.x + g.width - 3, y);
        ctx.stroke();
      }
    });
  }

  drawBoostRings() {
    const ctx = this.ctx;
    this.boostRings.forEach(r => {
      ctx.save();
      ctx.translate(r.x, r.y);
      const angle = Math.atan2(r.boostY, r.boostX);
      ctx.rotate(angle);

      // Glowing golden accelerator chevron
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, r.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Forward arrow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-10, -12); ctx.lineTo(12, 0); ctx.lineTo(-10, 12);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }

  drawSwitches() {
    const ctx = this.ctx;
    this.switches.forEach(sw => {
      ctx.save();
      ctx.translate(sw.x, sw.y);
      ctx.fillStyle = sw.triggered ? '#22c55e' : '#ef4444';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, sw.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawPegs() {
    const ctx = this.ctx;
    this.pegs.forEach(peg => {
      ctx.save();
      ctx.translate(peg.x, peg.y);

      // Gold Anchor Base Ring
      ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, peg.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Core anchor eyelet
      ctx.fillStyle = '#ca8a04';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, peg.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, peg.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  drawBumpers() {
    const ctx = this.ctx;
    this.bumpers.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);

      // Neon Electric Outer Ring
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Core electric disc
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, b.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // White shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-b.radius * 0.3, -b.radius * 0.3, 4, 2, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  drawTargets() {
    const ctx = this.ctx;
    this.targets.forEach(t => {
      ctx.save();
      ctx.translate(t.x, t.y);

      // Slime Body
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 2, t.radius, t.radius * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Angry cartoon eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-6, -2, 5, 0, Math.PI * 2);
      ctx.arc(6, -2, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-5, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(5, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  drawStars() {
    const ctx = this.ctx;
    this.stars.forEach((star, idx) => {
      if (this.levelStars[idx]) return;

      ctx.save();
      ctx.translate(star.x, star.y);
      const bob = Math.sin(this.portal.pulse * 1.5 + idx * 1.5) * 4;
      ctx.translate(0, bob);

      // Gold 5-point Star
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const spikes = 5;
      const outerR = 14;
      const innerR = 7;
      let rot = Math.PI / 2 * 3;
      const step = Math.PI / spikes;

      ctx.moveTo(0, -outerR);
      for (let i = 0; i < spikes; i++) {
        let x = Math.cos(rot) * outerR;
        let y = Math.sin(rot) * outerR;
        ctx.lineTo(x, y);
        rot += step;
        x = Math.cos(rot) * innerR;
        y = Math.sin(rot) * innerR;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(0, -outerR);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Core shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-3, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  drawPortal() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.portal.x, this.portal.y);

    if (this.portal.active) {
      // Swirling Vortex
      ctx.rotate(this.portal.pulse);

      ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, this.portal.radius + 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#a855f7';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.portal.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Swirl petals
      ctx.strokeStyle = '#f3e8ff';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(12, 12, 0, this.portal.radius - 4);
        ctx.stroke();
      }
    } else {
      // Inactive / Locked Portal
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.portal.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 10px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LOCKED', 0, 0);
    }

    ctx.restore();
  }

  drawSlingshotCords() {
    const ctx = this.ctx;
    const ax = this.player.anchorX;
    const ay = this.player.anchorY;
    const hx = this.player.x;
    const hy = this.player.y;

    // Slingshot Fork Posts (Left & Right of Anchor)
    const forkW = 20;
    const leftForkX = ax - forkW;
    const rightForkX = ax + forkW;

    // Red/Orange Elastic Rubber Bands
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(leftForkX, ay - 6);
    ctx.lineTo(hx - 8, hy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightForkX, ay - 6);
    ctx.lineTo(hx + 8, hy);
    ctx.stroke();

    // Anchor Base Fork Pad
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(ax - 6, ay - 14, 12, 28, 4);
    ctx.fill();
    ctx.stroke();
  }

  drawTrajectoryArc() {
    const ctx = this.ctx;
    const launchSpeed = this.player.power * this.maxDragDistance * this.powerMultiplier;
    const launchAngle = this.player.angle + Math.PI;

    let simX = this.player.x;
    let simY = this.player.y;
    let simVx = Math.cos(launchAngle) * launchSpeed;
    let simVy = Math.sin(launchAngle) * launchSpeed;
    const simDt = 0.038;

    // Draw up to 18 trajectory prediction dots
    for (let step = 0; step < 18; step++) {
      simVy += this.gravity * simDt;
      simVx *= this.airResistance;
      simVy *= this.airResistance;
      simX += simVx * simDt;
      simY += simVy * simDt;

      // Bounce check against world bounds in prediction
      if (simX < 18 || simX > this.worldWidth - 18) simVx = -simVx * 0.78;
      if (simY < 18 || simY > this.worldHeight - 18) simVy = -simVy * 0.65;

      const alpha = Math.max(0.2, 1.0 - (step / 18));
      const radius = Math.max(2, 6 - (step * 0.22));

      ctx.fillStyle = `rgba(250, 204, 21, ${alpha})`;
      ctx.beginPath();
      ctx.arc(simX, simY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawTrail() {
    const ctx = this.ctx;
    this.player.trail.forEach(t => {
      ctx.fillStyle = `rgba(56, 189, 248, ${t.alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawHero() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.player.x, this.player.y);

    // Apply rotation and squash & stretch!
    if (this.state === 'flying') {
      ctx.rotate(this.player.rotation);
    }
    ctx.scale(this.player.squashX, this.player.squashY);

    // Ground/Drop Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hero Body: Vibrant Coral-Orange Bouncy Slime/Knight
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, 0, this.player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top Glossy Highlight
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(-4, -6, 7, 3.5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Expressive Cartoon Eyes
    const isBlinking = this.player.blinkTimer > 4.3;
    const eyeOffsetX = Math.cos(this.player.facingAngle) * 4;
    const eyeOffsetY = Math.sin(this.player.facingAngle) * 3;

    if (!isBlinking) {
      // Big white sclera
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-5 + eyeOffsetX * 0.4, -2 + eyeOffsetY * 0.4, 5, 0, Math.PI * 2);
      ctx.arc(5 + eyeOffsetX * 0.4, -2 + eyeOffsetY * 0.4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Dark pupils looking towards flight/drag direction!
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-5 + eyeOffsetX, -2 + eyeOffsetY, 2.5, 0, Math.PI * 2);
      ctx.arc(5 + eyeOffsetX, -2 + eyeOffsetY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Shiny eye dots
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-6 + eyeOffsetX, -3 + eyeOffsetY, 1, 0, Math.PI * 2);
      ctx.arc(4 + eyeOffsetX, -3 + eyeOffsetY, 1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Happy closed eye arcs
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(-5, -2, 4, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(5, -2, 4, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }

    // Rosy Cheeks
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(-10, 4, 3, 0, Math.PI * 2);
    ctx.arc(10, 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawParticles() {
    const ctx = this.ctx;
    this.particles.forEach(p => {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.isRing) {
        // Shockwave Ring
        const currentR = p.radius + (p.maxRadius - p.radius) * (1 - alpha);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Sparkle / Debris
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  drawFloatingTexts() {
    const ctx = this.ctx;
    this.floatingTexts.forEach(ft => {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `800 ${ft.fontSize}px "Fredoka", sans-serif`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  saveGame() {
    try {
      localStorage.setItem('sling_hero_save', JSON.stringify(this.saveData));
    } catch (_) {}
  }

  loadSave() {
    try {
      const raw = localStorage.getItem('sling_hero_save');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.unlockedLevel) this.saveData.unlockedLevel = data.unlockedLevel;
        if (data.starsPerLevel) this.saveData.starsPerLevel = data.starsPerLevel;
        if (data.highScore) this.saveData.highScore = data.highScore;
        if (data.endlessBest) this.saveData.endlessBest = data.endlessBest;
      }
    } catch (_) {}
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.slingGameInstance = new SlingHeroGame();
});
