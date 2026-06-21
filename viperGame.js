// NEON VIPER - Game Logic

class ViperAudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTick() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playCollect() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.start();
    osc.stop(now + 0.15);
  }

  playCrash() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.3);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.start();
    osc.stop(now + 0.3);
    
    // Noise crunch
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    noiseNode.start();
  }

  playPortal() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.start();
    osc.stop(now + 0.25);
  }

  playWin() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.06, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  playFail() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [293.66, 261.63, 220, 196];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0.08, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.25);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.25);
    });
  }
}

const viperAudio = new ViperAudioManager();

// Grid Layout: 32 columns wide, 20 rows high (each cell is 30px)
const GRID_COLS = 32;
const GRID_ROWS = 20;
const CELL_SIZE = 30;

// Levels wall maps (array of strings, where '#' represents walls, 'P' represents portal 1, 'Q' represents portal 2, 'E' represents exit portal)
const VIPER_LEVELS = [
  // 1: Empty
  [],
  // 2: Center horizontal bar
  [{ x: 8, y: 10, w: 16, h: 1 }],
  // 3: Four corners
  [
    { x: 4, y: 4, w: 6, h: 1 },
    { x: 4, y: 5, w: 1, h: 4 },
    { x: 22, y: 4, w: 6, h: 1 },
    { x: 27, y: 5, w: 1, h: 4 },
    { x: 4, y: 15, w: 6, h: 1 },
    { x: 4, y: 11, w: 1, h: 4 },
    { x: 22, y: 15, w: 6, h: 1 },
    { x: 27, y: 11, w: 1, h: 4 }
  ],
  // 4: The Cross
  [
    { x: 15, y: 4, w: 2, h: 5 },
    { x: 15, y: 11, w: 2, h: 5 },
    { x: 6, y: 9, w: 8, h: 2 },
    { x: 18, y: 9, w: 8, h: 2 }
  ],
  // 5: Outer box openings
  [
    { x: 2, y: 2, w: 28, h: 1 },
    { x: 2, y: 17, w: 28, h: 1 },
    { x: 2, y: 3, w: 1, h: 5 },
    { x: 2, y: 12, w: 1, h: 5 },
    { x: 29, y: 3, w: 1, h: 5 },
    { x: 29, y: 12, w: 1, h: 5 }
  ],
  // 6: Zig Zag horizontal
  [
    { x: 0, y: 5, w: 24, h: 1 },
    { x: 8, y: 10, w: 24, h: 1 },
    { x: 0, y: 14, w: 24, h: 1 }
  ],
  // 7: Pillars
  [
    { x: 6, y: 3, w: 2, h: 6 },
    { x: 14, y: 11, w: 2, h: 6 },
    { x: 22, y: 3, w: 2, h: 6 }
  ],
  // 8: Portals intro
  [
    { x: 10, y: 4, w: 1, h: 12, type: 'wall' },
    { x: 21, y: 4, w: 1, h: 12, type: 'wall' },
    { x: 4, y: 10, w: 1, h: 1, type: 'portal', target: { x: 27, y: 10 } },
    { x: 27, y: 10, w: 1, h: 1, type: 'portal', target: { x: 4, y: 10 } }
  ],
  // 9: Grid corridors
  [
    { x: 8, y: 0, w: 1, h: 8 },
    { x: 16, y: 12, w: 1, h: 8 },
    { x: 24, y: 0, w: 1, h: 8 }
  ],
  // 10: Spiral Maze
  [
    { x: 4, y: 2, w: 24, h: 1 },
    { x: 4, y: 3, w: 1, h: 14 },
    { x: 5, y: 17, w: 23, h: 1 },
    { x: 27, y: 5, w: 1, h: 12 },
    { x: 8, y: 5, w: 19, h: 1 }
  ],
  // 11: The Gates
  [
    { x: 10, y: 0, w: 2, h: 8 },
    { x: 10, y: 12, w: 2, h: 8 },
    { x: 20, y: 0, w: 2, h: 8 },
    { x: 20, y: 12, w: 2, h: 8 }
  ],
  // 12: Dual Portal Loop
  [
    { x: 15, y: 2, w: 2, h: 16, type: 'wall' },
    { x: 6, y: 3, w: 1, h: 1, type: 'portal', target: { x: 25, y: 16 } },
    { x: 25, y: 16, w: 1, h: 1, type: 'portal', target: { x: 6, y: 3 } },
    { x: 6, y: 16, w: 1, h: 1, type: 'portal', target: { x: 25, y: 3 } },
    { x: 25, y: 3, w: 1, h: 1, type: 'portal', target: { x: 6, y: 16 } }
  ],
  // 13: Hourglass
  [
    { x: 4, y: 3, w: 24, h: 1 },
    { x: 4, y: 16, w: 24, h: 1 },
    { x: 10, y: 4, w: 4, h: 4 },
    { x: 18, y: 12, w: 4, h: 4 }
  ],
  // 14: Center Room
  [
    { x: 10, y: 6, w: 12, h: 1 },
    { x: 10, y: 14, w: 12, h: 1 },
    { x: 10, y: 7, w: 1, h: 2 },
    { x: 10, y: 11, w: 1, h: 3 },
    { x: 21, y: 7, w: 1, h: 3 },
    { x: 21, y: 12, w: 1, h: 2 }
  ],
  // 15: Checker Blocks
  [
    { x: 6, y: 4, w: 3, h: 3 },
    { x: 22, y: 4, w: 3, h: 3 },
    { x: 6, y: 13, w: 3, h: 3 },
    { x: 22, y: 13, w: 3, h: 3 },
    { x: 14, y: 8, w: 4, h: 4 }
  ],
  // 16: Ring of Portals
  [
    { x: 4, y: 4, w: 1, h: 1, type: 'portal', target: { x: 27, y: 15 } },
    { x: 27, y: 15, w: 1, h: 1, type: 'portal', target: { x: 4, y: 4 } },
    { x: 27, y: 4, w: 1, h: 1, type: 'portal', target: { x: 4, y: 15 } },
    { x: 4, y: 15, w: 1, h: 1, type: 'portal', target: { x: 27, y: 4 } }
  ],
  // 17: Split Arena
  [
    { x: 0, y: 9, w: 13, h: 2 },
    { x: 19, y: 9, w: 13, h: 2 }
  ],
  // 18: Labyrinth Lite
  [
    { x: 4, y: 2, w: 1, h: 16 },
    { x: 12, y: 0, w: 1, h: 15 },
    { x: 20, y: 5, w: 1, h: 15 },
    { x: 28, y: 2, w: 1, h: 16 }
  ],
  // 19: Double Wall cross
  [
    { x: 6, y: 6, w: 20, h: 1 },
    { x: 6, y: 13, w: 20, h: 1 },
    { x: 6, y: 7, w: 1, h: 6 },
    { x: 25, y: 7, w: 1, h: 6 }
  ],
  // 20: The Cage
  [
    { x: 2, y: 2, w: 28, h: 1 },
    { x: 2, y: 17, w: 28, h: 1 },
    { x: 2, y: 3, w: 1, h: 14 },
    { x: 29, y: 3, w: 1, h: 14 },
    { x: 10, y: 10, w: 1, h: 1, type: 'portal', target: { x: 21, y: 10 } },
    { x: 21, y: 10, w: 1, h: 1, type: 'portal', target: { x: 10, y: 10 } }
  ]
];

class ViperGame {
  constructor() {
    this.canvas = document.getElementById('viperCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.stageIdx = 0;
    this.score = 0;
    this.gameState = 'menu'; // menu, level_select, playing, complete, failed
    
    // Snake model
    this.snake = [];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    
    // Core Gem targets
    this.gem = { x: 0, y: 0 };
    this.gemsEaten = 0;
    this.gemsRequired = 5;
    
    // Exit portal
    this.exitPortal = null;
    this.exitUnlocked = false;
    
    // Game Loop interval
    this.gameInterval = null;
    this.baseSpeed = 160; // ms per tick
    
    // Level progress
    this.unlockedLevels = parseInt(localStorage.getItem('viper_unlocked') || '1');
    this.completedLevels = JSON.parse(localStorage.getItem('viper_completed') || '[]');

    this.registerEvents();
    this.initUI();
    this.render(); // initial blank render
  }

  initUI() {
    document.getElementById('viper-btn-play').addEventListener('click', () => {
      viperAudio.init();
      this.stageIdx = this.unlockedLevels - 1;
      if (this.stageIdx >= VIPER_LEVELS.length) this.stageIdx = VIPER_LEVELS.length - 1;
      this.startLevel(this.stageIdx);
    });

    document.getElementById('viper-btn-levels').addEventListener('click', () => {
      viperAudio.init();
      this.showScreen('viper-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
    });

    document.getElementById('viper-btn-level-back').addEventListener('click', () => {
      this.showScreen('viper-start-screen');
      this.gameState = 'menu';
    });

    document.getElementById('viper-hud-btn-restart').addEventListener('click', () => this.startLevel(this.stageIdx));
    document.getElementById('viper-hud-btn-home').addEventListener('click', () => {
      this.gameState = 'menu';
      this.stopLoop();
      this.showScreen('viper-start-screen');
      document.getElementById('viper-hud').classList.add('hidden');
    });

    const muteBtn = document.getElementById('viper-hud-btn-mute');
    muteBtn.addEventListener('click', () => {
      viperAudio.muted = !viperAudio.muted;
      muteBtn.textContent = viperAudio.muted ? '🔇' : '🔊';
    });

    document.getElementById('viper-btn-next-level').addEventListener('click', () => {
      if (this.stageIdx + 1 < VIPER_LEVELS.length) {
        this.startLevel(this.stageIdx + 1);
      } else {
        this.gameState = 'menu';
        this.showScreen('viper-start-screen');
        document.getElementById('viper-hud').classList.add('hidden');
      }
    });

    document.getElementById('viper-btn-restart-win').addEventListener('click', () => this.startLevel(this.stageIdx));
    document.getElementById('viper-btn-restart-fail').addEventListener('click', () => this.startLevel(this.stageIdx));
    
    document.getElementById('viper-btn-menu-win').addEventListener('click', () => {
      this.showScreen('viper-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
      document.getElementById('viper-hud').classList.add('hidden');
    });
    
    document.getElementById('viper-btn-menu-fail').addEventListener('click', () => {
      this.showScreen('viper-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
      document.getElementById('viper-hud').classList.add('hidden');
    });
  }

  showScreen(screenId) {
    document.querySelectorAll('.viper-overlay').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
  }

  renderLevelGrid() {
    const grid = document.getElementById('viper-level-grid-container');
    grid.innerHTML = '';
    
    for (let i = 0; i < VIPER_LEVELS.length; i++) {
      const card = document.createElement('div');
      card.className = 'level-card';
      card.textContent = i + 1;
      
      const isUnlocked = i < this.unlockedLevels;
      const isCompleted = this.completedLevels.includes(i);
      
      if (!isUnlocked) {
        card.classList.add('locked');
      } else {
        if (isCompleted) card.classList.add('completed');
        card.addEventListener('click', () => {
          this.startLevel(i);
        });
      }
      grid.appendChild(card);
    }
  }

  startLevel(idx) {
    try {
      const container = document.getElementById('viper-game-container');
      if (container) {
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
      }
    } catch(e) {}
    this.stageIdx = idx;
    this.gemsEaten = 0;
    this.exitUnlocked = false;
    this.exitPortal = null;
    
    // Spawn snake centered
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    
    // Spawn initial gem
    this.spawnGem();
    
    // Update HUD
    document.getElementById('viper-hud-level-num').textContent = idx + 1;
    document.getElementById('viper-hud-score').textContent = this.score;
    document.getElementById('viper-hud-gems').textContent = `${this.gemsEaten}/${this.gemsRequired}`;
    document.getElementById('viper-hud').classList.remove('hidden');

    this.showScreen('dummy-screen'); // hide overlays
    this.gameState = 'playing';

    // Speed up slightly on later levels
    const currentSpeed = Math.max(80, this.baseSpeed - idx * 4);
    
    this.stopLoop();
    this.gameInterval = setInterval(() => this.tick(), currentSpeed);
  }

  stopLoop() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  spawnGem() {
    let valid = false;
    let rx, ry;
    
    while (!valid) {
      rx = Math.floor(Math.random() * GRID_COLS);
      ry = Math.floor(Math.random() * GRID_ROWS);
      
      // Ensure gem doesn't land on snake body
      const hitsBody = this.snake.some(s => s.x === rx && s.y === ry);
      
      // Ensure gem doesn't land on walls
      const walls = VIPER_LEVELS[this.stageIdx];
      const hitsWall = walls.some(w => rx >= w.x && rx < w.x + w.w && ry >= w.y && ry < w.y + w.h);
      
      if (!hitsBody && !hitsWall) {
        valid = true;
      }
    }
    
    this.gem = { x: rx, y: ry };
  }

  spawnExitPortal() {
    let valid = false;
    let rx, ry;
    
    while (!valid) {
      rx = Math.floor(Math.random() * (GRID_COLS - 4)) + 2;
      ry = Math.floor(Math.random() * (GRID_ROWS - 4)) + 2;
      
      const hitsBody = this.snake.some(s => s.x === rx && s.y === ry);
      const walls = VIPER_LEVELS[this.stageIdx];
      const hitsWall = walls.some(w => rx >= w.x && rx < w.x + w.w && ry >= w.y && ry < w.y + w.h);
      
      if (!hitsBody && !hitsWall) {
        valid = true;
      }
    }
    
    this.exitPortal = { x: rx, y: ry };
  }

  registerEvents() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      if (this.gameState !== 'playing') return;
      
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && this.dir.y === 0) {
        this.nextDir = { x: 0, y: -1 };
        e.preventDefault();
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && this.dir.y === 0) {
        this.nextDir = { x: 0, y: 1 };
        e.preventDefault();
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && this.dir.x === 0) {
        this.nextDir = { x: -1, y: 0 };
        e.preventDefault();
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && this.dir.x === 0) {
        this.nextDir = { x: 1, y: 0 };
        e.preventDefault();
      }
    });

    // Touch gesture swipes
    let touchStartX = 0;
    let touchStartY = 0;
    
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        viperAudio.init();
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0 && this.gameState === 'playing') {
        e.preventDefault();
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      if (this.gameState !== 'playing' || e.changedTouches.length === 0) return;
      
      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 50 && this.dir.x === 0) {
          this.nextDir = { x: 1, y: 0 };
        } else if (diffX < -50 && this.dir.x === 0) {
          this.nextDir = { x: -1, y: 0 };
        }
      } else {
        // Vertical swipe
        if (diffY > 50 && this.dir.y === 0) {
          this.nextDir = { x: 0, y: 1 };
        } else if (diffY < -50 && this.dir.y === 0) {
          this.nextDir = { x: 0, y: -1 };
        }
      }
    });
  }

  // --- GAME LOOP TICK ---
  tick() {
    if (this.gameState !== 'playing') return;
    
    this.dir = this.nextDir;
    viperAudio.playTick();

    // Calculate new head position
    const head = this.snake[0];
    let nextHead = {
      x: head.x + this.dir.x,
      y: head.y + this.dir.y
    };

    // Border wrap-around (toroidal grid)
    if (nextHead.x < 0) nextHead.x = GRID_COLS - 1;
    if (nextHead.x >= GRID_COLS) nextHead.x = 0;
    if (nextHead.y < 0) nextHead.y = GRID_ROWS - 1;
    if (nextHead.y >= GRID_ROWS) nextHead.y = 0;

    // Check Wall Collisions & Wall Portals
    const walls = VIPER_LEVELS[this.stageIdx];
    let collision = false;
    
    for (let w of walls) {
      if (nextHead.x >= w.x && nextHead.x < w.x + w.w && nextHead.y >= w.y && nextHead.y < w.y + w.h) {
        if (w.type === 'portal') {
          // Teleport head to portal target
          nextHead = { x: w.target.x, y: w.target.y };
          viperAudio.playPortal();
          break;
        } else {
          // Standard solid wall
          collision = true;
          break;
        }
      }
    }

    if (collision) {
      this.handleGameOver();
      return;
    }

    // Check body/tail collisions
    // If next head matches any body parts, game over (excluding the tip of the tail since it will move out, unless eating)
    const hitsTail = this.snake.slice(0, -1).some(s => s.x === nextHead.x && s.y === nextHead.y);
    if (hitsTail) {
      this.handleGameOver();
      return;
    }

    // Prepend head
    this.snake.unshift(nextHead);

    // Check eat gem
    if (nextHead.x === this.gem.x && nextHead.y === this.gem.y) {
      this.gemsEaten++;
      this.score += 150 + this.gemsEaten * 50;
      document.getElementById('viper-hud-score').textContent = this.score;
      document.getElementById('viper-hud-gems').textContent = `${this.gemsEaten}/${this.gemsRequired}`;
      viperAudio.playCollect();

      if (this.gemsEaten >= this.gemsRequired && !this.exitUnlocked) {
        this.exitUnlocked = true;
        this.spawnExitPortal();
      } else {
        this.spawnGem();
      }
    } else {
      // Pop tail to move forward
      this.snake.pop();
    }

    // Check reached exit portal
    if (this.exitUnlocked && this.exitPortal && nextHead.x === this.exitPortal.x && nextHead.y === this.exitPortal.y) {
      this.handleLevelWin();
      return;
    }

    this.render();
  }

  handleLevelWin() {
    this.stopLoop();
    this.gameState = 'complete';
    viperAudio.playWin();

    // Save completion
    if (!this.completedLevels.includes(this.stageIdx)) {
      this.completedLevels.push(this.stageIdx);
      localStorage.setItem('viper_completed', JSON.stringify(this.completedLevels));
    }
    
    // Unlock next sector
    if (this.stageIdx + 1 === this.unlockedLevels && this.unlockedLevels < VIPER_LEVELS.length) {
      this.unlockedLevels++;
      localStorage.setItem('viper_unlocked', this.unlockedLevels.toString());
    }

    document.getElementById('viper-complete-desc').textContent = `Sector Score: ${this.score}. Extraction complete.`;
    this.showScreen('viper-complete-screen');
  }

  handleGameOver() {
    this.stopLoop();
    this.gameState = 'failed';
    viperAudio.playCrash();
    
    // Screen Shake
    const el = document.getElementById('viper-game-container');
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 250);

    this.showScreen('viper-failed-screen');
  }

  // --- RENDER GRID ---
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Cyber Blueprint Grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    this.ctx.lineWidth = 1;
    for (let c = 0; c <= GRID_COLS; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * CELL_SIZE, 0);
      this.ctx.lineTo(c * CELL_SIZE, this.canvas.height);
      this.ctx.stroke();
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * CELL_SIZE);
      this.ctx.lineTo(this.canvas.width, r * CELL_SIZE);
      this.ctx.stroke();
    }

    // Draw Maze Walls
    const walls = VIPER_LEVELS[this.stageIdx];
    if (walls) {
      walls.forEach(w => {
        this.ctx.save();
        if (w.type === 'portal') {
          // Orange Portal block
          const grad = this.ctx.createRadialGradient(
            (w.x + 0.5) * CELL_SIZE, (w.y + 0.5) * CELL_SIZE, 2,
            (w.x + 0.5) * CELL_SIZE, (w.y + 0.5) * CELL_SIZE, CELL_SIZE * 0.5
          );
          grad.addColorStop(0, '#f97316');
          grad.addColorStop(1, 'rgba(249, 115, 22, 0.1)');
          this.ctx.fillStyle = grad;
          this.ctx.fillRect(w.x * CELL_SIZE, w.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          
          this.ctx.strokeStyle = '#f97316';
          this.ctx.lineWidth = 1.5;
          this.ctx.strokeRect(w.x * CELL_SIZE + 2, w.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        } else {
          // Solid Neon Blue barrier
          const grad = this.ctx.createLinearGradient(
            w.x * CELL_SIZE, w.y * CELL_SIZE,
            w.x * CELL_SIZE, (w.y + w.h) * CELL_SIZE
          );
          grad.addColorStop(0, '#1e40af');
          grad.addColorStop(1, '#1e3a8a');
          this.ctx.fillStyle = grad;
          
          this.ctx.shadowColor = '#3b82f6';
          this.ctx.shadowBlur = 10;
          this.ctx.fillRect(w.x * CELL_SIZE, w.y * CELL_SIZE, w.w * CELL_SIZE, w.h * CELL_SIZE);
          
          this.ctx.strokeStyle = '#3b82f6';
          this.ctx.lineWidth = 1.5;
          this.ctx.strokeRect(w.x * CELL_SIZE, w.y * CELL_SIZE, w.w * CELL_SIZE, w.h * CELL_SIZE);
        }
        this.ctx.restore();
      });
    }

    // Draw exit portal if unlocked
    if (this.exitUnlocked && this.exitPortal) {
      this.ctx.save();
      this.ctx.shadowColor = '#10b981';
      this.ctx.shadowBlur = 15;
      
      const grad = this.ctx.createRadialGradient(
        (this.exitPortal.x + 0.5) * CELL_SIZE, (this.exitPortal.y + 0.5) * CELL_SIZE, 2,
        (this.exitPortal.x + 0.5) * CELL_SIZE, (this.exitPortal.y + 0.5) * CELL_SIZE, CELL_SIZE
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#10b981');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      this.ctx.fillStyle = grad;
      
      this.ctx.beginPath();
      this.ctx.arc((this.exitPortal.x + 0.5) * CELL_SIZE, (this.exitPortal.y + 0.5) * CELL_SIZE, CELL_SIZE * 0.75, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Draw Target Gem Core if active
    if (!this.exitUnlocked) {
      this.ctx.save();
      this.ctx.shadowColor = '#f43f5e';
      this.ctx.shadowBlur = 12;
      this.ctx.fillStyle = '#f43f5e';
      
      const cx = (this.gem.x + 0.5) * CELL_SIZE;
      const cy = (this.gem.y + 0.5) * CELL_SIZE;
      
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, CELL_SIZE * 0.35 + Math.sin(Date.now() * 0.01) * 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(cx - 2, cy - 2, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Draw Glowing Snake body
    this.snake.forEach((s, idx) => {
      this.ctx.save();
      
      const isHead = (idx === 0);
      
      if (isHead) {
        this.ctx.fillStyle = '#4ade80'; // Bright neon green head
        this.ctx.shadowColor = '#22c55e';
        this.ctx.shadowBlur = 15;
      } else {
        // Glowing cyan-green gradient decay along tail
        const colorRatio = 1 - (idx / this.snake.length) * 0.6;
        this.ctx.fillStyle = `rgba(16, 185, 129, ${colorRatio})`;
        this.ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
        this.ctx.shadowBlur = 8;
      }
      
      const pad = 2.5;
      const sx = s.x * CELL_SIZE + pad;
      const sy = s.y * CELL_SIZE + pad;
      const sz = CELL_SIZE - pad * 2;
      
      this.ctx.fillRect(sx, sy, sz, sz);
      
      // Eye indicators on head
      if (isHead) {
        this.ctx.fillStyle = '#ffffff';
        const ex = s.x * CELL_SIZE;
        const ey = s.y * CELL_SIZE;
        
        // draw two eyes depending on direction
        if (this.dir.x !== 0) {
          this.ctx.fillRect(ex + CELL_SIZE * 0.6, ey + CELL_SIZE * 0.2, 3, 3);
          this.ctx.fillRect(ex + CELL_SIZE * 0.6, ey + CELL_SIZE * 0.7, 3, 3);
        } else {
          this.ctx.fillRect(ex + CELL_SIZE * 0.2, ey + CELL_SIZE * 0.6, 3, 3);
          this.ctx.fillRect(ex + CELL_SIZE * 0.7, ey + CELL_SIZE * 0.6, 3, 3);
        }
      }
      
      this.ctx.restore();
    });
  }
}

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
  new ViperGame();
});
