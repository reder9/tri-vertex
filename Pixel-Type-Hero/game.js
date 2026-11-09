/**
 * PIXEL TYPE HERO - MAIN GAME ENGINE
 * Typing parser, monster spawner, combo calculations, on-screen keyboard guide, shop, and audio integration.
 */

class TypeHeroGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Viewport & Scaling
    this.width = 1200;
    this.height = 700;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;

    // Game State
    this.state = 'playing'; // 'playing', 'paused', 'victory', 'gameover', 'shop'
    this.levelIndex = 0;
    this.currentLevel = TYPING_TIERS[0];
    this.castleHealth = 5;
    this.maxCastleHealth = 5;

    // Economy & Scoring
    this.coins = 60;
    this.gems = 25;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.totalTyped = 0;
    this.correctTyped = 0;
    this.wordsCompletedInLevel = 0;
    this.targetWordsForLevel = 8;
    this.startTime = performance.now();

    // Progression & Unlocks
    this.unlockedLevels = [1];
    this.unlockedPets = ['dragon'];
    this.equippedPet = 'dragon';
    this.unlockedWands = ['apprentice'];
    this.equippedWand = 'apprentice';
    this.unlockedOutfits = ['apprentice'];
    this.equippedOutfit = 'apprentice';

    // Entities
    this.player = new TypeHeroPlayer(150, 480);
    this.pet = new CompanionPet(this.equippedPet);
    this.monsters = [];
    this.projectiles = [];
    this.rewards = [];
    this.floatingTexts = [];
    this.targetMonster = null;

    // Spawner (Gentle, kid-friendly pacing)
    this.spawnTimer = 0;
    this.spawnInterval = 3.2;
    this.maxMonsters = 3;

    // Virtual Gamepad
    this.prevGamepadButtons = {};

    // UI Cache
    this.ui = {
      hudScore: document.getElementById('hud-score'),
      hudStreak: document.getElementById('hud-streak'),
      hudWpm: document.getElementById('hud-wpm'),
      hudAccuracy: document.getElementById('hud-accuracy'),
      hudCoins: document.getElementById('hud-coins'),
      hudGems: document.getElementById('hud-gems'),
      hudLevelName: document.getElementById('hud-level-name'),
      hudProgress: document.getElementById('hud-progress'),
      castleHearts: document.getElementById('castle-hearts'),
      fingerTipText: document.getElementById('finger-tip-text'),
      fingerHintDot: document.getElementById('finger-hint-dot'),
      virtualKeyboard: document.getElementById('virtual-keyboard'),
      // Modals
      shopModal: document.getElementById('shop-modal'),
      levelModal: document.getElementById('level-modal'),
      pauseModal: document.getElementById('pause-modal'),
      victoryModal: document.getElementById('victory-modal'),
      // Buttons
      btnShop: document.getElementById('btn-shop'),
      btnLevels: document.getElementById('btn-levels'),
      btnPause: document.getElementById('btn-pause'),
      btnResume: document.getElementById('btn-resume'),
      btnMusic: document.getElementById('btn-music'),
      btnSfx: document.getElementById('btn-sfx'),
      btnNextLevel: document.getElementById('btn-next-level'),
      btnReplayLevel: document.getElementById('btn-replay-level'),
      btnCloseShop: document.getElementById('btn-close-shop'),
      btnCloseLevels: document.getElementById('btn-close-levels'),
      btnPauseLevels: document.getElementById('btn-pause-levels'),
      btnPauseShop: document.getElementById('btn-pause-shop'),
      mobileInput: document.getElementById('mobile-type-input')
    };

    this.initKeyboardUI();
    this.loadSave();
    this.setupInputs();
    this.setupResize();
    this.startLevel(this.levelIndex);

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  setupResize() {
    const handleResize = () => {
      this.viewportWidth = window.innerWidth;
      this.viewportHeight = window.innerHeight;
      this.canvas.width = this.viewportWidth;
      this.canvas.height = this.viewportHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();
  }

  // Generate Interactive On-Screen Visual Keyboard with Color-Coded Finger Guides
  initKeyboardUI() {
    const container = this.ui.virtualKeyboard;
    if (!container) return;

    const rows = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
      ['space']
    ];

    container.innerHTML = '';
    rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'kb-row';

      row.forEach(key => {
        const keyBtn = document.createElement('button');
        keyBtn.className = 'kb-key';
        keyBtn.dataset.key = key;

        if (key === 'space') {
          keyBtn.classList.add('key-space', 'thumb');
          keyBtn.innerText = 'SPACE';
        } else if (key === 'backspace') {
          keyBtn.classList.add('key-backspace');
          keyBtn.innerText = 'DEL';
        } else {
          const fingerClass = FINGER_MAP[key] || 'index-l';
          keyBtn.classList.add(fingerClass);
          keyBtn.innerText = key.toUpperCase();
        }

        // Tap / Click handling for touchscreens & mouse
        const pressKey = (e) => {
          e.preventDefault();
          if (window.typeHeroAudio) window.typeHeroAudio.init();
          if (key === 'space') {
            this.handleKeystroke(' ');
          } else if (key === 'backspace') {
            this.handleBackspace();
          } else {
            this.handleKeystroke(key);
          }
        };

        keyBtn.addEventListener('mousedown', pressKey);
        keyBtn.addEventListener('touchstart', pressKey, { passive: false });

        rowDiv.appendChild(keyBtn);
      });

      container.appendChild(rowDiv);
    });
  }

  setupInputs() {
    // Physical Keyboard Listener
    window.addEventListener('keydown', (e) => {
      if (window.typeHeroAudio) {
        window.typeHeroAudio.init();
        window.typeHeroAudio.resume();
      }

      // Escape key is the single designated hotkey to pause game or close menus.
      // All letter keys (including L, B, P) are strictly reserved for typing so nothing conflicts!
      if (e.code === 'Escape') {
        e.preventDefault();
        if (this.state === 'paused' || this.state === 'victory' || this.state === 'gameover') {
          this.closeModals();
        } else {
          this.togglePause();
        }
        return;
      }

      if (this.state !== 'playing') return;

      if (e.key === 'Backspace') {
        this.handleBackspace();
      } else if (e.key === ' ' || e.key.length === 1) {
        // Prevent browser scrolling on Space
        if (e.key === ' ') e.preventDefault();
        this.handleKeystroke(e.key.toLowerCase());
      }
    });

    // Mobile Hidden Input Focus Support (Optional native keyboard summoning)
    if (this.ui.mobileInput) {
      this.ui.mobileInput.addEventListener('input', (e) => {
        const val = this.ui.mobileInput.value;
        if (val.length > 0) {
          const lastChar = val[val.length - 1];
          this.handleKeystroke(lastChar.toLowerCase());
          this.ui.mobileInput.value = '';
        }
      });
    }

    // Header Action Buttons
    if (this.ui.btnShop) this.ui.btnShop.addEventListener('click', () => this.openShop());
    if (this.ui.btnLevels) this.ui.btnLevels.addEventListener('click', () => this.openLevels());
    if (this.ui.btnPause) this.ui.btnPause.addEventListener('click', () => this.togglePause());
    if (this.ui.btnResume) this.ui.btnResume.addEventListener('click', () => this.togglePause());
    if (this.ui.btnCloseShop) this.ui.btnCloseShop.addEventListener('click', () => this.closeModals());
    if (this.ui.btnCloseLevels) this.ui.btnCloseLevels.addEventListener('click', () => this.closeModals());
    if (this.ui.btnPauseLevels) {
      this.ui.btnPauseLevels.addEventListener('click', () => {
        this.openLevels();
      });
    }
    if (this.ui.btnPauseShop) {
      this.ui.btnPauseShop.addEventListener('click', () => {
        this.openShop();
      });
    }

    if (this.ui.btnNextLevel) {
      this.ui.btnNextLevel.addEventListener('click', () => {
        this.closeModals();
        this.startLevel((this.levelIndex + 1) % TYPING_TIERS.length);
      });
    }

    if (this.ui.btnReplayLevel) {
      this.ui.btnReplayLevel.addEventListener('click', () => {
        this.closeModals();
        this.startLevel(this.levelIndex);
      });
    }

    // Audio Toggles
    if (this.ui.btnMusic) {
      this.ui.btnMusic.addEventListener('click', () => {
        if (window.typeHeroAudio) {
          const on = window.typeHeroAudio.toggleMusic();
          this.ui.btnMusic.style.opacity = on ? '1.0' : '0.5';
        }
      });
    }

    if (this.ui.btnSfx) {
      this.ui.btnSfx.addEventListener('click', () => {
        if (window.typeHeroAudio) {
          const muted = window.typeHeroAudio.toggleMute();
          this.ui.btnSfx.style.opacity = muted ? '0.5' : '1.0';
        }
      });
    }
  }

  startLevel(index) {
    this.levelIndex = clamp(index, 0, TYPING_TIERS.length - 1);
    this.currentLevel = TYPING_TIERS[this.levelIndex];
    this.castleHealth = this.maxCastleHealth;
    this.wordsCompletedInLevel = 0;
    this.targetWordsForLevel = this.currentLevel.targetWords || 8;
    this.monsters = [];
    this.projectiles = [];
    this.rewards = [];
    this.floatingTexts = [];
    this.targetMonster = null;
    this.streak = 0;
    this.state = 'playing';
    this.spawnTimer = 0.8;
    this.lastTime = performance.now();

    // Update level header
    if (this.ui.hudLevelName) {
      this.ui.hudLevelName.innerText = `LV.${this.currentLevel.id} ${this.currentLevel.name.toUpperCase()}`;
    }

    this.updateHUD();
    this.updateFingerGuide();
  }

  // --- TYPING ENGINE ---
  handleKeystroke(char) {
    this.totalTyped++;

    // 1. If currently locked onto a monster
    if (this.targetMonster && !this.targetMonster.isDead) {
      const match = this.targetMonster.typeChar(char);
      if (match) {
        this.onLetterSuccess(this.targetMonster, char);
      } else {
        this.onLetterMistake(char);
      }
      return;
    }

    // 2. No target locked: search active monsters whose next required char matches
    const candidate = this.monsters.find(m => !m.isDead && m.currentTargetChar.toLowerCase() === char.toLowerCase());
    if (candidate) {
      this.targetMonster = candidate;
      candidate.typeChar(char);
      this.onLetterSuccess(candidate, char);
    } else {
      this.onLetterMistake(char);
    }
  }

  handleBackspace() {
    if (this.targetMonster && this.targetMonster.typed.length > 0) {
      this.targetMonster.typed = this.targetMonster.typed.slice(0, -1);
      this.updateFingerGuide();
    }
  }

  onLetterSuccess(monster, char) {
    this.correctTyped++;
    this.streak++;
    if (this.streak > this.maxStreak) this.maxStreak = this.streak;

    // Score with multiplier
    const multiplier = 1 + Math.floor(this.streak / 5);
    const letterPoints = 10 * multiplier;
    this.score += letterPoints;

    // Audio & Visual Cast
    if (window.typeHeroAudio) {
      window.typeHeroAudio.playKeyHit(true);
      window.typeHeroAudio.playSpellLaunch();
    }
    this.player.triggerCast();

    // Fire Spell Projectile from Hero Wand
    const spell = new SpellProjectile(this.player.x + 12, this.player.y - 24, monster, this.equippedWand);
    this.projectiles.push(spell);

    // Flash key green on virtual keyboard
    this.flashVirtualKey(char, 'correct');

    // Check if Monster Word is fully completed!
    if (monster.isCompleted) {
      this.onWordComplete(monster);
    }

    this.updateHUD();
    this.updateFingerGuide();
  }

  onLetterMistake(char) {
    this.streak = 0;
    if (window.typeHeroAudio) window.typeHeroAudio.playKeyHit(false);

    // Flash key red on virtual keyboard
    this.flashVirtualKey(char, 'mistake');

    // Floating typo text
    this.floatingTexts.push(new FloatingTextFX(this.player.x + 20, this.player.y - 40, 'TRY AGAIN!', '#ef4444', 13));

    this.updateHUD();
    this.updateFingerGuide();
  }

  onWordComplete(monster) {
    monster.isDead = true;
    this.wordsCompletedInLevel++;

    // Audio & Haptics
    if (window.typeHeroAudio) {
      window.typeHeroAudio.playWordComplete();
      window.typeHeroAudio.playMonsterPop();
    }
    this.rumble(60, 0.2, 0.2);

    // Companion Pet cheers!
    if (this.pet) this.pet.cheer();

    // Rewards: Gold Coins & Star Gems
    const coinsEarned = 5 + Math.floor(monster.word.length * 1.5);
    this.coins += coinsEarned;
    this.gems += 2;

    for (let i = 0; i < 4; i++) {
      this.rewards.push(new RewardItem(monster.x, monster.y, 'coin'));
    }
    this.rewards.push(new RewardItem(monster.x, monster.y, 'gem'));

    // Floating celebration text
    const praises = ['SUPER!', 'GREAT!', 'NICE SPELL!', 'AWESOME!', 'WORD MASTER!'];
    const praise = praises[Math.floor(Math.random() * praises.length)];
    this.floatingTexts.push(new FloatingTextFX(monster.x - 20, monster.y - 45, `${praise} +${coinsEarned}`, '#facc15', 15));

    // Clear target lock
    this.targetMonster = null;

    // Check Level Complete condition
    if (this.wordsCompletedInLevel >= this.targetWordsForLevel) {
      this.triggerLevelVictory();
    }

    this.saveGame();
  }

  triggerLevelVictory() {
    this.state = 'victory';
    if (window.typeHeroAudio) window.typeHeroAudio.playVictory();
    this.rumble(250, 0.4, 0.6);

    // Unlock next level
    const nextLvlId = this.currentLevel.id + 1;
    if (nextLvlId <= TYPING_TIERS.length && !this.unlockedLevels.includes(nextLvlId)) {
      this.unlockedLevels.push(nextLvlId);
    }

    // Award completion bonus
    this.coins += 50;
    this.gems += 15;
    this.saveGame();

    // Show Victory Modal
    const modal = this.ui.victoryModal;
    if (modal) {
      const title = document.getElementById('victory-title');
      const stats = document.getElementById('victory-stats');
      if (title) title.innerText = `${this.currentLevel.name.toUpperCase()} COMPLETE!`;
      if (stats) {
        const acc = this.totalTyped > 0 ? Math.round((this.correctTyped / this.totalTyped) * 100) : 100;
        stats.innerHTML = `
          <div>Words Defeated: <strong>${this.wordsCompletedInLevel}</strong></div>
          <div>Accuracy: <strong>${acc}%</strong></div>
          <div>Max Streak: <strong>${this.maxStreak}</strong></div>
          <div style="color: #facc15; margin-top: 6px;">Reward: +$50 Coins, +15 Gems!</div>
        `;
      }
      modal.classList.remove('hidden');
    }
  }

  triggerGameOver() {
    this.state = 'gameover';
    this.rumble(300, 0.5, 0.5);

    const modal = this.ui.victoryModal;
    if (modal) {
      const title = document.getElementById('victory-title');
      const stats = document.getElementById('victory-stats');
      if (title) title.innerText = 'CASTLE GATES DEFENDED!';
      if (stats) {
        stats.innerHTML = `
          <div style="color: #f87171;">The monsters slipped past the shield!</div>
          <div style="margin-top: 6px;">Practice your Home Row and try again!</div>
        `;
      }
      modal.classList.remove('hidden');
    }
  }

  // Visual Keyboard Feedback
  flashVirtualKey(char, type) {
    if (!this.ui.virtualKeyboard) return;
    const btn = this.ui.virtualKeyboard.querySelector(`[data-key="${char.toLowerCase()}"]`);
    if (btn) {
      btn.classList.add(type === 'correct' ? 'flash-correct' : 'flash-mistake');
      setTimeout(() => {
        btn.classList.remove('flash-correct', 'flash-mistake');
      }, 160);
    }
  }

  updateFingerGuide() {
    if (!this.ui.fingerTipText || !this.ui.virtualKeyboard) return;

    // Clear previous active highlights on keyboard
    const prevActive = this.ui.virtualKeyboard.querySelectorAll('.key-active');
    prevActive.forEach(el => el.classList.remove('key-active'));

    // Determine what character is next
    let nextChar = '';
    if (this.targetMonster && !this.targetMonster.isDead) {
      nextChar = this.targetMonster.currentTargetChar;
    } else {
      // Find closest monster
      const closest = this.monsters.find(m => !m.isDead);
      if (closest) {
        nextChar = closest.currentTargetChar;
      }
    }

    if (!nextChar) {
      this.ui.fingerTipText.innerText = 'Ready! Monsters approaching...';
      return;
    }

    const lower = nextChar.toLowerCase();
    const fingerClass = FINGER_MAP[lower] || 'index-l';
    const fingerName = FINGER_NAMES[fingerClass] || 'Index Finger';

    // Highlight key on visual keyboard
    const targetKeyBtn = this.ui.virtualKeyboard.querySelector(`[data-key="${lower === ' ' ? 'space' : lower}"]`);
    if (targetKeyBtn) {
      targetKeyBtn.classList.add('key-active');
    }

    // Set finger hint message
    this.ui.fingerTipText.innerHTML = `Next Letter: <span class="next-char-pill">${nextChar.toUpperCase()}</span> - Use <strong>${fingerName}</strong>`;
  }

  updateHUD() {
    if (this.ui.hudScore) this.ui.hudScore.innerText = this.score;
    if (this.ui.hudStreak) this.ui.hudStreak.innerText = `${this.streak}x`;
    if (this.ui.hudCoins) this.ui.hudCoins.innerText = this.coins;
    if (this.ui.hudGems) this.ui.hudGems.innerText = this.gems;

    // Accuracy
    const acc = this.totalTyped > 0 ? Math.round((this.correctTyped / this.totalTyped) * 100) : 100;
    if (this.ui.hudAccuracy) this.ui.hudAccuracy.innerText = `${acc}%`;

    // Words Per Minute (WPM)
    const elapsedMins = Math.max(0.05, (performance.now() - this.startTime) / 60000);
    const wpm = Math.round((this.correctTyped / 5) / elapsedMins);
    if (this.ui.hudWpm) this.ui.hudWpm.innerText = `${wpm}`;

    // Level Progress
    if (this.ui.hudProgress) {
      this.ui.hudProgress.innerText = `${this.wordsCompletedInLevel}/${this.targetWordsForLevel}`;
    }

    // Castle Hearts
    if (this.ui.castleHearts) {
      let heartsHtml = '';
      for (let i = 0; i < this.maxCastleHealth; i++) {
        const full = i < this.castleHealth;
        heartsHtml += `
          <svg class="ui-icon" style="width: 16px; height: 16px; color: ${full ? '#ef4444' : '#475569'};" viewBox="0 0 24 24" fill="${full ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        `;
      }
      this.ui.castleHearts.innerHTML = heartsHtml;
    }
  }

  // Xbox Gamepad Polling
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
    if (!gp) return;

    const isJustPressed = (idx) => {
      const down = gp.buttons[idx] && (gp.buttons[idx].pressed || gp.buttons[idx].value > 0.5);
      const was = !!this.prevGamepadButtons[idx];
      return down && !was;
    };

    // Button B (1): Close open modals
    if (isJustPressed(1)) {
      this.closeModals();
    }
    // Button X (2): Open Shop
    if (isJustPressed(2)) {
      this.openShop();
    }
    // Button Y (3): Open Level Select
    if (isJustPressed(3)) {
      this.openLevels();
    }
    // Start / Menu (9): Pause toggle
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

  // Modals Management (Always pauses world when opening menus)
  openShop() {
    this.hideAllModals();
    this.state = 'paused';
    if (this.ui.shopModal) {
      if (window.typeHeroAudio) window.typeHeroAudio.playBlip();
      this.renderShop();
      this.ui.shopModal.classList.remove('hidden');
    }
  }

  openLevels() {
    this.hideAllModals();
    this.state = 'paused';
    if (this.ui.levelModal) {
      if (window.typeHeroAudio) window.typeHeroAudio.playBlip();
      this.renderLevelSelect();
      this.ui.levelModal.classList.remove('hidden');
    }
  }

  togglePause() {
    if (this.state === 'paused') {
      this.closeModals();
    } else {
      this.hideAllModals();
      this.state = 'paused';
      if (this.ui.pauseModal) this.ui.pauseModal.classList.remove('hidden');
    }
  }

  hideAllModals() {
    if (this.ui.shopModal) this.ui.shopModal.classList.add('hidden');
    if (this.ui.levelModal) this.ui.levelModal.classList.add('hidden');
    if (this.ui.pauseModal) this.ui.pauseModal.classList.add('hidden');
    if (this.ui.victoryModal) this.ui.victoryModal.classList.add('hidden');
  }

  closeModals() {
    this.hideAllModals();
    this.state = 'playing';
    this.lastTime = performance.now();
  }

  // Shop & Customization Rendering
  renderShop() {
    const list = document.getElementById('shop-items-list');
    if (!list) return;

    const items = [
      // Pets
      { id: 'dragon', cat: 'pet', name: 'Sparky the Dragon', desc: 'Cute baby dragon companion.', cost: 0, unlocked: true },
      { id: 'bunny', cat: 'pet', name: 'Robo-Bunny', desc: 'Cyber bunny with glowing ears.', cost: 80, unlocked: this.unlockedPets.includes('bunny') },
      { id: 'owl', cat: 'pet', name: 'Cosmic Owlet', desc: 'Starry purple owl with big eyes.', cost: 160, unlocked: this.unlockedPets.includes('owl') },
      { id: 'phoenix', cat: 'pet', name: 'Golden Phoenix', desc: 'Radiant bird with trailing flame sparks.', cost: 300, unlocked: this.unlockedPets.includes('phoenix') },
      // Wands
      { id: 'apprentice', cat: 'wand', name: 'Apprentice Wand', desc: 'Classic wooden magic staff.', cost: 0, unlocked: true },
      { id: 'lightning', cat: 'wand', name: 'Lightning Scepter', desc: 'Crackles with electric gold sparks.', cost: 120, unlocked: this.unlockedWands.includes('lightning') },
      { id: 'frost', cat: 'wand', name: 'Glacial Staff', desc: 'Fires chilled ice crystals.', cost: 220, unlocked: this.unlockedWands.includes('frost') },
      // Outfits
      { id: 'apprentice', cat: 'outfit', name: 'Apprentice Robes', desc: 'Comfortable purple wizard robes.', cost: 0, unlocked: true },
      { id: 'cyber_knight', cat: 'outfit', name: 'Cyber Knight Armor', desc: 'Neon visor & high-tech plating.', cost: 200, unlocked: this.unlockedOutfits.includes('cyber_knight') },
      { id: 'champion', cat: 'outfit', name: 'Champion Tunic', desc: 'Golden champion cape & crown.', cost: 350, unlocked: this.unlockedOutfits.includes('champion') }
    ];

    let html = '';
    items.forEach(item => {
      let isEquipped = false;
      if (item.cat === 'pet') isEquipped = this.equippedPet === item.id;
      if (item.cat === 'wand') isEquipped = this.equippedWand === item.id;
      if (item.cat === 'outfit') isEquipped = this.equippedOutfit === item.id;

      html += `
        <div class="shop-card ${isEquipped ? 'equipped' : ''}">
          <div class="shop-card-info">
            <div class="shop-card-title">${item.name}</div>
            <div class="shop-card-desc">${item.desc}</div>
          </div>
          <div class="shop-card-action">
            ${isEquipped 
              ? `<span class="badge-equipped">EQUIPPED</span>` 
              : item.unlocked 
                ? `<button class="shop-btn-equip" onclick="window.typeHeroInstance.equipItem('${item.cat}', '${item.id}')">EQUIP</button>`
                : `<button class="shop-btn-buy" onclick="window.typeHeroInstance.buyItem('${item.cat}', '${item.id}', ${item.cost})">$${item.cost} COINS</button>`
            }
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  }

  buyItem(category, id, cost) {
    if (this.coins >= cost) {
      this.coins -= cost;
      if (category === 'pet') this.unlockedPets.push(id);
      if (category === 'wand') this.unlockedWands.push(id);
      if (category === 'outfit') this.unlockedOutfits.push(id);

      this.equipItem(category, id);
      if (window.typeHeroAudio) window.typeHeroAudio.playCoin();
      this.saveGame();
      this.renderShop();
      this.updateHUD();
    }
  }

  equipItem(category, id) {
    if (category === 'pet') {
      this.equippedPet = id;
      this.pet = new CompanionPet(id);
    } else if (category === 'wand') {
      this.equippedWand = id;
      this.player.wand = id;
    } else if (category === 'outfit') {
      this.equippedOutfit = id;
      this.player.outfit = id;
    }
    if (window.typeHeroAudio) window.typeHeroAudio.playBlip();
    this.saveGame();
    this.renderShop();
  }

  // Level Select Rendering
  renderLevelSelect() {
    const list = document.getElementById('level-select-list');
    if (!list) return;

    let html = '';
    TYPING_TIERS.forEach((lvl, idx) => {
      const isUnlocked = this.unlockedLevels.includes(lvl.id);
      const isCurrent = idx === this.levelIndex;

      html += `
        <div class="level-card ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}" 
             ${isUnlocked ? `onclick="window.typeHeroInstance.selectLevel(${idx})"` : ''}>
          <div class="level-card-left">
            <span class="level-num">LEVEL ${lvl.id}</span>
            <div class="level-title">${lvl.name}</div>
            <div class="level-desc">${lvl.desc}</div>
          </div>
          <div class="level-card-right">
            ${isUnlocked 
              ? `<span class="level-badge ${isCurrent ? 'active' : 'ready'}">${isCurrent ? 'PLAYING' : 'READY'}</span>` 
              : `<span class="level-badge locked">LOCKED</span>`
            }
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  }

  selectLevel(idx) {
    this.closeModals();
    this.startLevel(idx);
    if (window.typeHeroAudio) window.typeHeroAudio.playBlip();
  }

  // Game Loop
  gameLoop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    this.pollGamepad(dt);

    if (this.state === 'playing') {
      this.update(dt);
    }

    this.render();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // 1. Update Player & Pet
    this.player.update(dt);
    if (this.pet) this.pet.update(dt);

    // 2. Monster Spawner
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval && this.monsters.length < this.maxMonsters) {
      this.spawnTimer = 0;
      this.spawnMonster();
    }

    // 3. Update Monsters
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i];
      m.update(dt);

      // Check if monster crossed castle defense line
      if (m.x <= m.targetX && !m.isDead) {
        m.isDead = true;
        this.castleHealth--;
        this.rumble(200, 0.5, 0.5);
        if (window.typeHeroAudio) {
          window.typeHeroAudio.playKeyHit(false);
          window.typeHeroAudio.playMonsterPop();
        }

        this.floatingTexts.push(new FloatingTextFX(m.targetX + 20, m.y - 30, 'SHIELD HIT! -1 HP', '#ef4444', 16));

        if (this.targetMonster === m) {
          this.targetMonster = null;
        }

        if (this.castleHealth <= 0) {
          this.triggerGameOver();
        }
        this.updateHUD();
        this.updateFingerGuide();
      }

      // Remove completed / dead monsters
      if (m.isDead) {
        this.monsters.splice(i, 1);
        this.updateFingerGuide();
      }
    }

    // 4. Update Spell Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const sp = this.projectiles[i];
      sp.update(dt);
      if (sp.isDead) {
        this.projectiles.splice(i, 1);
      }
    }

    // 5. Update Rewards
    for (let i = this.rewards.length - 1; i >= 0; i--) {
      const r = this.rewards[i];
      r.update(dt);
      if (r.life <= 0) {
        this.rewards.splice(i, 1);
      }
    }

    // 6. Update Floating Text FX
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.update(dt);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  spawnMonster() {
    const words = this.currentLevel.words;
    if (!words || words.length === 0) return;

    // Pick random word not currently on screen
    const activeWords = this.monsters.map(m => m.word.toLowerCase());
    const available = words.filter(w => !activeWords.includes(w.toLowerCase()));
    const word = available.length > 0 
      ? available[Math.floor(Math.random() * available.length)] 
      : words[Math.floor(Math.random() * words.length)];

    // Lanes (Y positions)
    const lanes = [220, 310, 400, 490];
    const y = lanes[Math.floor(Math.random() * lanes.length)];

    let monsterType = 'slime';
    if (this.currentLevel.isBoss) {
      monsterType = 'dragon_boss';
    } else if (this.levelIndex >= 5) {
      monsterType = Math.random() < 0.5 ? 'golem' : 'bat';
    } else if (this.levelIndex >= 2) {
      monsterType = Math.random() < 0.5 ? 'bat' : 'slime';
    }

    const baseSpeed = this.currentLevel.baseSpeed || (30 + this.levelIndex * 4);
    const speedVariation = (Math.random() - 0.5) * 4;
    const finalSpeed = Math.round(Math.max(24, baseSpeed + speedVariation));

    const m = new WordMonster({
      word: word,
      type: monsterType,
      x: this.width + 40,
      y: y,
      targetX: 200,
      speed: finalSpeed,
      isBoss: this.currentLevel.isBoss
    });

    this.monsters.push(m);
    this.updateFingerGuide();
  }

  render() {
    this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    // Apply scaling to fill screen while preserving responsive aspect
    this.ctx.save();
    const scale = Math.min(this.viewportWidth / this.width, this.viewportHeight / this.height);
    const offsetX = (this.viewportWidth - this.width * scale) / 2;
    const offsetY = (this.viewportHeight - this.height * scale) / 2;

    this.ctx.translate(offsetX, offsetY);
    this.ctx.scale(scale, scale);

    // 1. Draw Themed Background
    this.drawBackground();

    // 2. Draw Castle Defense Gate
    this.drawCastleShield();

    // 3. Draw Hero & Companion Pet
    this.player.draw(this.ctx);
    if (this.pet) this.pet.draw(this.ctx, this.player.x, this.player.y);

    // 4. Draw Spell Projectiles
    this.projectiles.forEach(sp => sp.draw(this.ctx));

    // 5. Draw Monsters
    this.monsters.forEach(m => {
      const isFocused = m === this.targetMonster || (!this.targetMonster && m === this.monsters[0]);
      m.draw(this.ctx, isFocused);
    });

    // 6. Draw Rewards & Floating Text
    this.rewards.forEach(r => r.draw(this.ctx));
    this.floatingTexts.forEach(ft => ft.draw(this.ctx));

    this.ctx.restore();
  }

  drawBackground() {
    // Sky Gradient
    const sky = this.ctx.createLinearGradient(0, 0, 0, this.height);
    if (this.currentLevel.bgTheme === 'space') {
      sky.addColorStop(0, '#020617');
      sky.addColorStop(1, '#0f172a');
    } else if (this.currentLevel.bgTheme === 'cave') {
      sky.addColorStop(0, '#090d16');
      sky.addColorStop(1, '#1e1b4b');
    } else {
      sky.addColorStop(0, '#1e1b4b');
      sky.addColorStop(0.65, '#312e81');
      sky.addColorStop(1, '#1e293b');
    }
    this.ctx.fillStyle = sky;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Distant Starry Mountains
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 520);
    this.ctx.lineTo(240, 360);
    this.ctx.lineTo(480, 500);
    this.ctx.lineTo(760, 380);
    this.ctx.lineTo(1020, 510);
    this.ctx.lineTo(1200, 420);
    this.ctx.lineTo(1200, this.height);
    this.ctx.lineTo(0, this.height);
    this.ctx.closePath();
    this.ctx.fill();

    // Ground Floor (Cobblestone / Cyber Grid)
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(0, 520, this.width, this.height - 520);

    // Floor lines
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 2;
    for (let x = 0; x < this.width; x += 60) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 520);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
  }

  drawCastleShield() {
    // Castle Turret & Magic Energy Barrier on the Left
    this.ctx.save();
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(10, 160, 80, 400);

    // Stone Battlement Cutouts
    this.ctx.fillStyle = '#475569';
    for (let y = 160; y < 560; y += 40) {
      this.ctx.strokeRect(10, y, 80, 40);
    }

    // Glowing Magic Defense Shield Barrier
    const pulse = 0.5 + Math.sin(performance.now() * 0.005) * 0.3;
    this.ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(195, 140);
    this.ctx.lineTo(195, 560);
    this.ctx.stroke();

    this.ctx.restore();
  }

  saveGame() {
    try {
      const data = {
        coins: this.coins,
        gems: this.gems,
        score: this.score,
        unlockedLevels: this.unlockedLevels,
        unlockedPets: this.unlockedPets,
        equippedPet: this.equippedPet,
        unlockedWands: this.unlockedWands,
        equippedWand: this.equippedWand,
        unlockedOutfits: this.unlockedOutfits,
        equippedOutfit: this.equippedOutfit
      };
      localStorage.setItem('pixel_type_hero_save', JSON.stringify(data));
    } catch (_) {}
  }

  loadSave() {
    try {
      const raw = localStorage.getItem('pixel_type_hero_save');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.coins !== undefined) this.coins = data.coins;
      if (data.gems !== undefined) this.gems = data.gems;
      if (data.score !== undefined) this.score = data.score;
      if (Array.isArray(data.unlockedLevels)) this.unlockedLevels = data.unlockedLevels;
      if (Array.isArray(data.unlockedPets)) this.unlockedPets = data.unlockedPets;
      if (data.equippedPet) {
        this.equippedPet = data.equippedPet;
        this.pet = new CompanionPet(this.equippedPet);
      }
      if (Array.isArray(data.unlockedWands)) this.unlockedWands = data.unlockedWands;
      if (data.equippedWand) {
        this.equippedWand = data.equippedWand;
        this.player.wand = this.equippedWand;
      }
      if (Array.isArray(data.unlockedOutfits)) this.unlockedOutfits = data.unlockedOutfits;
      if (data.equippedOutfit) {
        this.equippedOutfit = data.equippedOutfit;
        this.player.outfit = this.equippedOutfit;
      }
    } catch (_) {}
  }
}

// Global instance initiation
window.addEventListener('DOMContentLoaded', () => {
  window.typeHeroInstance = new TypeHeroGame();
});
