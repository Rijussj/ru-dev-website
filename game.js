// VASE - Game Logic

// --- AUDIO SYNTHESIZER (Web Audio API) ---
class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playLaunch() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playShatter(type = 'ceramic') {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    // High-pitched chime/break sounds using multiple sine waves
    const frequencies = type === 'gold' ? [1200, 1500, 1800, 2200] : [800, 1000, 1300, 1700];
    const duration = type === 'gold' ? 0.6 : 0.4;
    
    frequencies.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      // Add slight detune/frequency modulation to simulate breaking glass
      osc.frequency.setValueAtTime(freq, now + index * 0.02);
      osc.frequency.linearRampToValueAtTime(freq * 0.4, now + duration);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration - index * 0.05);
      
      osc.start(now);
      osc.stop(now + duration);
    });

    // Add noise for crunchiness
    this.playNoise(0.15, 0.1, 800);
  }

  playWoodHit() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playStoneHit() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playExplosion() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    // Deep rumbling bass oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(20, now + 0.6);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.start(now);
    osc.stop(now + 0.6);
    
    // Rumbling noise
    this.playNoise(0.5, 0.25, 200);
  }

  playNoise(duration, volume, filterFreq) {
    if (this.muted) return;
    this.init();
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noiseNode.start();
  }

  playWin() {
    if (this.muted) return;
    this.init();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }

  playFail() {
    if (this.muted) return;
    this.init();
    const notes = [220, 207.65, 196, 174.61]; // Sad descending line
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0.12, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.25);
      
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.25);
    });
  }
}

const audio = new AudioManager();

// --- GAME CONFIG & LEVELS ---
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 600;

// Level Definitions: coordinates scaled for 960x600 canvas
// Entities are:
// - Vases: { x, y, width, height, type: 'standard'|'gold'|'explosive'|'armored', hp }
// - Obstacles: { x, y, width, height, type: 'wood'|'stone'|'bouncer'|'portal', portalId: 1|2, targetPortalId: 2|1, angle: degrees, hp }
const LEVELS = [
  // Level 1: Warm Up
  {
    vases: [{ x: 650, y: 480, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [{ x: 620, y: 550, width: 110, height: 10, type: 'stone' }],
    balls: 3
  },
  // Level 2: First Barriers
  {
    vases: [{ x: 700, y: 480, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 550, y: 380, width: 20, height: 180, type: 'wood', hp: 2 },
      { x: 670, y: 550, width: 110, height: 10, type: 'stone' }
    ],
    balls: 3
  },
  // Level 3: The Tower
  {
    vases: [{ x: 700, y: 310, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 680, y: 510, width: 90, height: 40, type: 'wood', hp: 1 },
      { x: 690, y: 380, width: 70, height: 130, type: 'wood', hp: 1 }
    ],
    balls: 3
  },
  // Level 4: Introduction to TNT
  {
    vases: [
      { x: 700, y: 480, width: 50, height: 70, type: 'standard', hp: 1 },
      { x: 800, y: 480, width: 50, height: 70, type: 'standard', hp: 1 }
    ],
    obstacles: [
      { x: 600, y: 490, width: 60, height: 60, type: 'tnt' }
    ],
    balls: 3
  },
  // Level 5: Stone Henge
  {
    vases: [{ x: 750, y: 480, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 600, y: 350, width: 30, height: 200, type: 'stone' },
      { x: 600, y: 320, width: 120, height: 30, type: 'stone' }
    ],
    balls: 4
  },
  // Level 6: The Trampoline
  {
    vases: [{ x: 800, y: 150, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 500, y: 500, width: 120, height: 25, type: 'bouncer', angle: -25 },
      { x: 760, y: 220, width: 130, height: 15, type: 'stone' },
      { x: 650, y: 300, width: 20, height: 300, type: 'stone' }
    ],
    balls: 4
  },
  // Level 7: Double Portal
  {
    vases: [{ x: 750, y: 130, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 450, y: 470, width: 60, height: 60, type: 'portal', portalId: 1, targetPortalId: 2 },
      { x: 750, y: 350, width: 60, height: 60, type: 'portal', portalId: 2, targetPortalId: 1 },
      { x: 720, y: 200, width: 110, height: 15, type: 'stone' },
      { x: 300, y: 300, width: 660, height: 20, type: 'stone' }
    ],
    balls: 4
  },
  // Level 8: TNT Cascade
  {
    vases: [
      { x: 650, y: 480, width: 50, height: 70, type: 'standard', hp: 1 },
      { x: 800, y: 480, width: 50, height: 70, type: 'standard', hp: 1 }
    ],
    obstacles: [
      { x: 550, y: 490, width: 60, height: 60, type: 'tnt' },
      { x: 720, y: 490, width: 60, height: 60, type: 'tnt' },
      { x: 600, y: 380, width: 200, height: 20, type: 'wood', hp: 2 }
    ],
    balls: 4
  },
  // Level 9: Vase Vault
  {
    vases: [{ x: 750, y: 480, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 650, y: 380, width: 20, height: 180, type: 'stone' },
      { x: 650, y: 360, width: 220, height: 20, type: 'wood', hp: 3 },
      { x: 850, y: 380, width: 20, height: 180, type: 'stone' }
    ],
    balls: 3
  },
  // Level 10: Seesaw Swing
  {
    vases: [{ x: 800, y: 390, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 700, y: 460, width: 250, height: 20, type: 'wood', angle: 10, hp: 2 },
      { x: 810, y: 480, width: 30, height: 80, type: 'stone' },
      { x: 620, y: 400, width: 60, height: 60, type: 'tnt' }
    ],
    balls: 3
  },
  // Level 11: The Funnel
  {
    vases: [{ x: 850, y: 480, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 450, y: 150, width: 30, height: 350, type: 'stone', angle: 30 },
      { x: 450, y: 420, width: 30, height: 250, type: 'stone', angle: -30 },
      { x: 620, y: 520, width: 100, height: 30, type: 'bouncer' }
    ],
    balls: 4
  },
  // Level 12: Portal Jump
  {
    vases: [{ x: 150, y: 130, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 800, y: 450, width: 60, height: 60, type: 'portal', portalId: 1, targetPortalId: 2 },
      { x: 150, y: 300, width: 60, height: 60, type: 'portal', portalId: 2, targetPortalId: 1 },
      { x: 100, y: 200, width: 150, height: 15, type: 'stone' }
    ],
    balls: 3
  },
  // Level 13: Clay vs Gold
  {
    vases: [
      { x: 600, y: 480, width: 50, height: 70, type: 'standard', hp: 1 },
      { x: 750, y: 480, width: 50, height: 70, type: 'gold', hp: 1 },
      { x: 850, y: 480, width: 50, height: 70, type: 'standard', hp: 1 }
    ],
    obstacles: [
      { x: 700, y: 400, width: 20, height: 160, type: 'stone' },
      { x: 800, y: 400, width: 20, height: 160, type: 'stone' }
    ],
    balls: 4
  },
  // Level 14: Armored Defense
  {
    vases: [{ x: 750, y: 460, width: 55, height: 75, type: 'armored', hp: 2 }],
    obstacles: [
      { x: 650, y: 420, width: 20, height: 140, type: 'wood', hp: 2 },
      { x: 830, y: 420, width: 20, height: 140, type: 'wood', hp: 2 }
    ],
    balls: 5
  },
  // Level 15: TNT Seesaw
  {
    vases: [{ x: 800, y: 150, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 720, y: 220, width: 200, height: 20, type: 'wood', hp: 1 },
      { x: 820, y: 240, width: 20, height: 320, type: 'stone' },
      { x: 500, y: 490, width: 60, height: 60, type: 'tnt' }
    ],
    balls: 4
  },
  // Level 16: Bounce Vault
  {
    vases: [{ x: 850, y: 180, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 450, y: 500, width: 120, height: 20, type: 'bouncer', angle: -20 },
      { x: 680, y: 350, width: 120, height: 20, type: 'bouncer', angle: 25 },
      { x: 800, y: 250, width: 130, height: 15, type: 'stone' }
    ],
    balls: 4
  },
  // Level 17: The Maze
  {
    vases: [{ x: 850, y: 480, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 400, y: 0, width: 30, height: 450, type: 'stone' },
      { x: 600, y: 150, width: 30, height: 450, type: 'stone' },
      { x: 800, y: 0, width: 30, height: 450, type: 'stone' }
    ],
    balls: 5
  },
  // Level 18: Fortress
  {
    vases: [
      { x: 680, y: 480, width: 50, height: 70, type: 'standard', hp: 1 },
      { x: 820, y: 480, width: 50, height: 70, type: 'standard', hp: 1 },
      { x: 750, y: 300, width: 50, height: 70, type: 'gold', hp: 1 }
    ],
    obstacles: [
      { x: 720, y: 490, width: 60, height: 60, type: 'tnt' },
      { x: 640, y: 380, width: 220, height: 20, type: 'wood', hp: 2 },
      { x: 650, y: 200, width: 20, height: 180, type: 'wood', hp: 2 },
      { x: 830, y: 200, width: 20, height: 180, type: 'wood', hp: 2 }
    ],
    balls: 5
  },
  // Level 19: Portal Helix
  {
    vases: [{ x: 500, y: 280, width: 50, height: 70, type: 'standard', hp: 1 }],
    obstacles: [
      { x: 800, y: 450, width: 60, height: 60, type: 'portal', portalId: 1, targetPortalId: 2 },
      { x: 500, y: 100, width: 60, height: 60, type: 'portal', portalId: 2, targetPortalId: 1 },
      { x: 450, y: 350, width: 150, height: 15, type: 'stone' },
      { x: 350, y: 200, width: 20, height: 300, type: 'stone' },
      { x: 630, y: 200, width: 20, height: 300, type: 'stone' }
    ],
    balls: 4
  },
  // Level 20: Grand Finale
  {
    vases: [
      { x: 550, y: 480, width: 50, height: 70, type: 'standard', hp: 1 },
      { x: 650, y: 480, width: 50, height: 70, type: 'armored', hp: 2 },
      { x: 750, y: 480, width: 50, height: 70, type: 'gold', hp: 1 },
      { x: 850, y: 480, width: 50, height: 70, type: 'standard', hp: 1 },
      { x: 700, y: 280, width: 50, height: 70, type: 'explosive', hp: 1 }
    ],
    obstacles: [
      { x: 600, y: 490, width: 60, height: 60, type: 'tnt' },
      { x: 800, y: 490, width: 60, height: 60, type: 'tnt' },
      { x: 520, y: 360, width: 400, height: 20, type: 'wood', hp: 3 }
    ],
    balls: 6
  }
];

// --- CORE GAME CLASS ---
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.currentLevelIdx = 0;
    this.score = 0;
    this.ballsLeft = 0;
    this.gameState = 'menu'; // menu, level_select, playing, level_complete, failed
    
    // Physics and Entities
    this.ball = null;
    this.vases = [];
    this.obstacles = [];
    this.particles = [];
    this.gravity = 0.22;
    
    // Control / Aiming
    this.slingPos = { x: 150, y: 400 };
    this.aiming = false;
    this.mousePos = { x: 0, y: 0 };
    this.maxSlingForce = 150;
    this.lastLaunchTime = 0;
    
    // LocalStorage progress
    this.unlockedLevels = parseInt(localStorage.getItem('vase_unlocked_level') || '1');
    this.completedLevels = JSON.parse(localStorage.getItem('vase_completed_levels') || '[]');

    this.registerEvents();
    this.initUI();
    this.gameLoop();
  }

  initUI() {
    // Buttons
    document.getElementById('btn-play').addEventListener('click', () => {
      audio.init();
      this.currentLevelIdx = this.unlockedLevels - 1;
      if (this.currentLevelIdx >= LEVELS.length) this.currentLevelIdx = LEVELS.length - 1;
      this.startLevel(this.currentLevelIdx);
    });

    document.getElementById('btn-levels').addEventListener('click', () => {
      audio.init();
      this.showScreen('level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
    });

    document.getElementById('btn-level-back').addEventListener('click', () => {
      this.showScreen('start-screen');
      this.gameState = 'menu';
    });

    document.getElementById('hud-btn-restart').addEventListener('click', () => this.startLevel(this.currentLevelIdx));
    document.getElementById('hud-btn-home').addEventListener('click', () => {
      this.showScreen('start-screen');
      this.gameState = 'menu';
      document.getElementById('hud').classList.add('hidden');
    });

    const muteBtn = document.getElementById('hud-btn-mute');
    muteBtn.addEventListener('click', () => {
      audio.muted = !audio.muted;
      muteBtn.textContent = audio.muted ? '🔇' : '🔊';
    });

    document.getElementById('btn-next-level').addEventListener('click', () => {
      if (this.currentLevelIdx + 1 < LEVELS.length) {
        this.currentLevelIdx++;
        this.startLevel(this.currentLevelIdx);
      } else {
        this.showScreen('start-screen');
        this.gameState = 'menu';
        document.getElementById('hud').classList.add('hidden');
      }
    });

    document.getElementById('btn-restart-win').addEventListener('click', () => this.startLevel(this.currentLevelIdx));
    document.getElementById('btn-restart-fail').addEventListener('click', () => this.startLevel(this.currentLevelIdx));
    
    document.getElementById('btn-menu-win').addEventListener('click', () => {
      this.showScreen('level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
      document.getElementById('hud').classList.add('hidden');
    });
    
    document.getElementById('btn-menu-fail').addEventListener('click', () => {
      this.showScreen('level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
      document.getElementById('hud').classList.add('hidden');
    });
  }

  renderLevelGrid() {
    const grid = document.getElementById('level-grid-container');
    grid.innerHTML = '';
    
    for (let i = 0; i < LEVELS.length; i++) {
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
          this.currentLevelIdx = i;
          this.startLevel(i);
        });
      }
      grid.appendChild(card);
    }
  }

  showScreen(screenId) {
    document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
    const el = document.getElementById(screenId);
    if (el) el.classList.remove('hidden');
  }

  startLevel(idx) {
    this.currentLevelIdx = idx;
    const config = LEVELS[idx];
    
    // Set level data
    this.ballsLeft = config.balls;
    this.ball = null;
    this.particles = [];
    
    // Clone vases
    this.vases = config.vases.map(v => ({
      ...v,
      currentHp: v.hp || 1,
      shattered: false
    }));

    // Clone obstacles
    this.obstacles = config.obstacles.map(o => ({
      ...o,
      currentHp: o.hp || 1,
      angle: o.angle || 0,
      destroyed: false
    }));

    // Update HUD
    document.getElementById('hud-level-num').textContent = idx + 1;
    document.getElementById('hud-ball-count').textContent = this.ballsLeft;
    document.getElementById('hud-score').textContent = this.score;
    document.getElementById('hud').classList.remove('hidden');
    
    this.showScreen('dummy-screen'); // hide overlays
    this.gameState = 'playing';
  }

  registerEvents() {
    const getCanvasMousePos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      // Handle scaling ratio
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const handleStart = (pos) => {
      if (this.gameState !== 'playing') return;
      if (this.ball && !this.ball.settled) return; // Wait for active ball to finish
      
      // Check if mouse/touch is near sling position (with a generous radius) or in the launcher zone
      const dist = Math.hypot(pos.x - this.slingPos.x, pos.y - this.slingPos.y);
      if (dist < 100 || (pos.x < 280 && pos.y > 200 && pos.y < 580)) {
        audio.init();
        this.aiming = true;
        this.mousePos = pos;
      }
    };

    const handleMove = (pos) => {
      if (this.aiming) {
        this.mousePos = pos;
      }
    };

    const handleEnd = () => {
      if (this.aiming) {
        this.aiming = false;
        
        // Calculate velocity
        const dx = this.slingPos.x - this.mousePos.x;
        const dy = this.slingPos.y - this.mousePos.y;
        const dist = Math.hypot(dx, dy);
        
        const force = Math.min(dist, this.maxSlingForce);
        const angle = Math.atan2(dy, dx);
        
        // Shoot ball
        const speed = force * 0.12;
        this.ball = {
          x: this.slingPos.x,
          y: this.slingPos.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 12,
          settled: false,
          trail: []
        };
        
        this.ballsLeft--;
        document.getElementById('hud-ball-count').textContent = this.ballsLeft;
        
        audio.playLaunch();
      }
    };

    // Mouse Listeners
    this.canvas.addEventListener('mousedown', (e) => handleStart(getCanvasMousePos(e)));
    this.canvas.addEventListener('mousemove', (e) => handleMove(getCanvasMousePos(e)));
    window.addEventListener('mouseup', handleEnd);

    // Touch Listeners
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) handleStart(getCanvasMousePos(e.touches[0]));
    });
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        handleMove(getCanvasMousePos(e.touches[0]));
      }
    }, { passive: false });
    window.addEventListener('touchend', handleEnd);
  }

  // --- PHYSICS & COLLISIONS ---
  updatePhysics() {
    if (!this.ball) return;
    
    // Save trail
    this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
    if (this.ball.trail.length > 25) this.ball.trail.shift();

    // Apply gravity
    this.ball.vy += this.gravity;
    
    // Update position
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    
    // Apply drag/air resistance
    this.ball.vx *= 0.995;
    this.ball.vy *= 0.995;

    // Boundaries
    if (this.ball.x < this.ball.radius) {
      this.ball.x = this.ball.radius;
      this.ball.vx = -this.ball.vx * 0.6;
      audio.playStoneHit();
    }
    if (this.ball.x > CANVAS_WIDTH - this.ball.radius) {
      this.ball.x = CANVAS_WIDTH - this.ball.radius;
      this.ball.vx = -this.ball.vx * 0.6;
      audio.playStoneHit();
    }
    if (this.ball.y < this.ball.radius) {
      this.ball.y = this.ball.radius;
      this.ball.vy = -this.ball.vy * 0.6;
      audio.playStoneHit();
    }
    
    // Floor collision
    if (this.ball.y > CANVAS_HEIGHT - 50 - this.ball.radius) {
      this.ball.y = CANVAS_HEIGHT - 50 - this.ball.radius;
      this.ball.vy = -this.ball.vy * 0.5;
      this.ball.vx *= 0.95; // Ground friction
      if (Math.abs(this.ball.vy) < 0.2 && Math.abs(this.ball.vx) < 0.2) {
        this.ball.settled = true;
      }
      if (Math.hypot(this.ball.vx, this.ball.vy) > 0.5) {
        audio.playStoneHit();
      }
    }

    // Check collisions with Obstacles
    this.obstacles.forEach(o => {
      if (o.destroyed) return;
      this.checkBallBoxCollision(o);
    });

    // Check collisions with Vases
    this.vases.forEach(v => {
      if (v.shattered) return;
      this.checkBallVaseCollision(v);
    });

    // Check ball settled/out of bounds
    if (this.ball && (this.ball.x < -100 || this.ball.x > CANVAS_WIDTH + 100 || this.ball.settled)) {
      this.ball = null;
      this.checkWinLossState();
    }
  }

  checkBallBoxCollision(box) {
    // If it's a rotated box, we do simplified axis alignment or angle checks.
    // For simplicity, let's treat standard boxes as AABB.
    // If box has angle, we can rotate the ball position back to align.
    let bx = box.x;
    let by = box.y;
    let bw = box.width;
    let bh = box.height;

    let ballLocalX = this.ball.x;
    let ballLocalY = this.ball.y;

    if (box.angle) {
      const rad = -box.angle * Math.PI / 180;
      const cx = bx + bw/2;
      const cy = by + bh/2;
      
      const dx = this.ball.x - cx;
      const dy = this.ball.y - cy;
      
      ballLocalX = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
      ballLocalY = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
    }

    // Closest point on box
    const closestX = Math.max(bx, Math.min(ballLocalX, bx + bw));
    const closestY = Math.max(by, Math.min(ballLocalY, by + bh));

    const dist = Math.hypot(ballLocalX - closestX, ballLocalY - closestY);

    if (dist < this.ball.radius) {
      // Collision detected!
      const overlap = this.ball.radius - dist;
      
      // Normal vector
      let nx = ballLocalX - closestX;
      let ny = ballLocalY - closestY;
      
      if (dist === 0) {
        nx = 0;
        ny = -1;
      } else {
        nx /= dist;
        ny /= dist;
      }

      // Rotate normal back if rotated
      if (box.angle) {
        const rad = box.angle * Math.PI / 180;
        const tempNx = nx * Math.cos(rad) - ny * Math.sin(rad);
        ny = nx * Math.sin(rad) + ny * Math.cos(rad);
        nx = tempNx;
      }

      // Push ball out of collision
      this.ball.x += nx * overlap;
      this.ball.y += ny * overlap;

      // Handle Portals
      if (box.type === 'portal') {
        // Find destination portal
        const dest = this.obstacles.find(o => o.type === 'portal' && o.portalId === box.targetPortalId);
        if (dest) {
          this.ball.x = dest.x + dest.width / 2 + nx * (this.ball.radius + 15);
          this.ball.y = dest.y + dest.height / 2 + ny * (this.ball.radius + 15);
          audio.playLaunch();
          // Add teleport particles
          this.spawnPortalParticles(dest.x + dest.width/2, dest.y + dest.height/2);
        }
        return;
      }

      // Physics Bounce
      let restitution = 0.5;
      if (box.type === 'bouncer') {
        restitution = 1.25;
        this.spawnBounceParticles(closestX, closestY);
      }

      // Calculate relative velocity along normal
      const velAlongNormal = this.ball.vx * nx + this.ball.vy * ny;

      // Only resolve if velocities are separating
      if (velAlongNormal < 0) {
        const impulse = -(1 + restitution) * velAlongNormal;
        this.ball.vx += impulse * nx;
        this.ball.vy += impulse * ny;

        // Damage breakables
        const impactForce = Math.abs(velAlongNormal);
        if (box.type === 'wood') {
          audio.playWoodHit();
          box.currentHp -= impactForce;
          if (box.currentHp <= 0) {
            box.destroyed = true;
            this.score += 50;
            this.spawnDebris(bx + bw/2, by + bh/2, '#854d0e');
          }
        } else if (box.type === 'tnt') {
          this.triggerExplosion(bx + bw/2, by + bh/2);
          box.destroyed = true;
        } else {
          audio.playStoneHit();
        }
      }
    }
  }

  checkBallVaseCollision(vase) {
    const closestX = Math.max(vase.x, Math.min(this.ball.x, vase.x + vase.width));
    const closestY = Math.max(vase.y, Math.min(this.ball.y, vase.y + vase.height));

    const dist = Math.hypot(this.ball.x - closestX, this.ball.y - closestY);

    if (dist < this.ball.radius) {
      const overlap = this.ball.radius - dist;
      const nx = (this.ball.x - closestX) / (dist || 1);
      const ny = (this.ball.y - closestY) / (dist || 1);

      this.ball.x += nx * overlap;
      this.ball.y += ny * overlap;

      const velAlongNormal = this.ball.vx * nx + this.ball.vy * ny;
      if (velAlongNormal < 0) {
        const restitution = 0.3;
        const impulse = -(1 + restitution) * velAlongNormal;
        this.ball.vx += impulse * nx;
        this.ball.vy += impulse * ny;

        const impactForce = Math.abs(velAlongNormal);
        vase.currentHp -= impactForce;

        if (vase.currentHp <= 0) {
          this.shatterVase(vase);
        } else {
          audio.playWoodHit(); // sound of cracking
        }
      }
    }
  }

  shatterVase(vase) {
    vase.shattered = true;
    let color = '#8b5cf6'; // default standard purple
    if (vase.type === 'gold') {
      color = '#eab308';
      this.score += 500;
      audio.playShatter('gold');
    } else if (vase.type === 'explosive') {
      color = '#ef4444';
      this.score += 200;
      this.triggerExplosion(vase.x + vase.width/2, vase.y + vase.height/2);
    } else if (vase.type === 'armored') {
      color = '#64748b';
      this.score += 300;
      audio.playShatter('armored');
    } else {
      this.score += 150;
      audio.playShatter('ceramic');
    }
    
    document.getElementById('hud-score').textContent = this.score;
    this.spawnDebris(vase.x + vase.width/2, vase.y + vase.height/2, color);
    
    // Add screen shake effect
    const container = document.getElementById('game-container');
    container.classList.add('shake');
    setTimeout(() => container.classList.remove('shake'), 250);
  }

  triggerExplosion(ex, ey) {
    audio.playExplosion();
    
    // Particle flash
    this.spawnExplosionParticles(ex, ey);

    const radius = 180;
    
    // Push the ball if nearby
    if (this.ball) {
      const dist = Math.hypot(this.ball.x - ex, this.ball.y - ey);
      if (dist < radius) {
        const force = (1 - dist / radius) * 15;
        const angle = Math.atan2(this.ball.y - ey, this.ball.x - ex);
        this.ball.vx += Math.cos(angle) * force;
        this.ball.vy += Math.sin(angle) * force;
      }
    }

    // Explode nearby vases
    this.vases.forEach(v => {
      if (v.shattered) return;
      const cx = v.x + v.width/2;
      const cy = v.y + v.height/2;
      const dist = Math.hypot(cx - ex, cy - ey);
      if (dist < radius) {
        v.currentHp -= (1 - dist / radius) * 5;
        if (v.currentHp <= 0) this.shatterVase(v);
      }
    });

    // Explode nearby obstacles (wood / tnt)
    this.obstacles.forEach(o => {
      if (o.destroyed) return;
      const cx = o.x + o.width/2;
      const cy = o.y + o.height/2;
      const dist = Math.hypot(cx - ex, cy - ey);
      if (dist < radius) {
        if (o.type === 'wood') {
          o.currentHp -= (1 - dist / radius) * 5;
          if (o.currentHp <= 0) {
            o.destroyed = true;
            this.spawnDebris(cx, cy, '#854d0e');
          }
        } else if (o.type === 'tnt') {
          // Chain explosion with slight delay
          o.destroyed = true;
          setTimeout(() => this.triggerExplosion(cx, cy), 150);
        }
      }
    });
  }

  // --- WIN / LOSS STATES ---
  checkWinLossState() {
    const allVasesBroken = this.vases.every(v => v.shattered);
    
    if (allVasesBroken) {
      this.handleLevelWin();
    } else if (this.ballsLeft === 0 && (!this.ball || this.ball.settled)) {
      // Check again after short delay to make sure everything settled
      setTimeout(() => {
        const stillAllBroken = this.vases.every(v => v.shattered);
        if (stillAllBroken) {
          this.handleLevelWin();
        } else {
          this.handleLevelLoss();
        }
      }, 500);
    }
  }

  handleLevelWin() {
    this.gameState = 'level_complete';
    audio.playWin();
    
    // Save completion state
    if (!this.completedLevels.includes(this.currentLevelIdx)) {
      this.completedLevels.push(this.currentLevelIdx);
      localStorage.setItem('vase_completed_levels', JSON.stringify(this.completedLevels));
    }
    
    // Unlock next level
    if (this.currentLevelIdx + 1 === this.unlockedLevels && this.unlockedLevels < LEVELS.length) {
      this.unlockedLevels++;
      localStorage.setItem('vase_unlocked_level', this.unlockedLevels.toString());
    }

    document.getElementById('complete-desc').textContent = `Level score: ${this.score}. Superb trajectory!`;
    this.showScreen('complete-screen');
  }

  handleLevelLoss() {
    this.gameState = 'failed';
    audio.playFail();
    this.showScreen('failed-screen');
  }

  // --- PARTICLE GENERATION ---
  spawnDebris(x, y, color) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 3, // upward bias
        size: Math.random() * 6 + 3,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.015,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: Math.random() * 0.2 - 0.1
      });
    }
  }

  spawnExplosionParticles(x, y) {
    // Fire particles
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 16 + 8,
        color: Math.random() > 0.5 ? '#ef4444' : '#f97316',
        life: 1.0,
        decay: Math.random() * 0.05 + 0.03,
        blend: true
      });
    }
    // Smoke
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: Math.random() * 25 + 15,
        color: '#475569',
        life: 0.8,
        decay: Math.random() * 0.02 + 0.01
      });
    }
  }

  spawnPortalParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 2,
        color: '#f97316', // orange portal effect
        life: 1.0,
        decay: 0.04
      });
    }
  }

  spawnBounceParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = -Math.random() * Math.PI;
      const speed = Math.random() * 4 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 2,
        color: '#a78bfa',
        life: 1.0,
        decay: 0.05
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      
      // Rotate if applicable
      if (p.rotation !== undefined) {
        p.rotation += p.rotSpeed;
      }
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // --- CANVAS RENDERING ---
  draw() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw background grid lines (subtle blueprint styling)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, CANVAS_HEIGHT);
      this.ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(CANVAS_WIDTH, y);
      this.ctx.stroke();
    }

    // Draw Floor
    const floorY = CANVAS_HEIGHT - 50;
    const floorGradient = this.ctx.createLinearGradient(0, floorY, 0, CANVAS_HEIGHT);
    floorGradient.addColorStop(0, '#1e293b');
    floorGradient.addColorStop(1, '#0f172a');
    this.ctx.fillStyle = floorGradient;
    this.ctx.fillRect(0, floorY, CANVAS_WIDTH, 50);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, floorY);
    this.ctx.lineTo(CANVAS_WIDTH, floorY);
    this.ctx.stroke();

    // Draw Trajectory Dots (Aim Preview)
    if (this.aiming) {
      this.drawTrajectory();
    }

    // Draw Slingshot / Launchpad
    this.drawLauncher();

    // Draw Obstacles
    this.obstacles.forEach(o => {
      if (!o.destroyed) this.drawObstacle(o);
    });

    // Draw Vases
    this.vases.forEach(v => {
      if (!v.shattered) this.drawVase(v);
    });

    // Draw Ball
    if (this.ball) {
      this.drawBall();
    }

    // Draw Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      if (p.blend) {
        this.ctx.globalCompositeOperation = 'screen';
      }
      this.ctx.fillStyle = p.color;
      
      if (p.rotation !== undefined) {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });
  }

  drawBall() {
    // Ball Trail
    this.ctx.strokeStyle = 'rgba(167, 139, 250, 0.2)';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ball.trail.forEach((pos, idx) => {
      if (idx === 0) this.ctx.moveTo(pos.x, pos.y);
      else this.ctx.lineTo(pos.x, pos.y);
    });
    this.ctx.stroke();

    // Shiny metallic sphere
    this.ctx.save();
    const grad = this.ctx.createRadialGradient(
      this.ball.x - this.ball.radius*0.3,
      this.ball.y - this.ball.radius*0.3,
      1,
      this.ball.x,
      this.ball.y,
      this.ball.radius
    );
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.4, '#cbd5e1');
    grad.addColorStop(1, '#475569');
    
    this.ctx.fillStyle = grad;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetY = 4;
    
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawTrajectory() {
    const dx = this.slingPos.x - this.mousePos.x;
    const dy = this.slingPos.y - this.mousePos.y;
    const dist = Math.hypot(dx, dy);
    
    const force = Math.min(dist, this.maxSlingForce);
    const angle = Math.atan2(dy, dx);
    const speed = force * 0.12;

    let tx = this.slingPos.x;
    let ty = this.slingPos.y;
    let tvx = Math.cos(angle) * speed;
    let tvy = Math.sin(angle) * speed;

    this.ctx.fillStyle = 'rgba(167, 139, 250, 0.5)';
    
    // Simulate trajectory with steps
    for (let i = 0; i < 40; i++) {
      tvy += this.gravity;
      tx += tvx;
      ty += tvy;
      tvx *= 0.995;
      tvy *= 0.995;
      
      // Stop rendering trajectory if hitting floor
      if (ty > CANVAS_HEIGHT - 50) break;
      
      // Render beautiful dot
      this.ctx.beginPath();
      this.ctx.arc(tx, ty, 3.5 - (i * 0.06), 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawLauncher() {
    this.ctx.save();
    
    // Launcher base/pedestal
    this.ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.arc(this.slingPos.x, this.slingPos.y, 40, 0, Math.PI, true);
    this.ctx.stroke();

    // Pull elastic band if aiming
    if (this.aiming) {
      this.ctx.strokeStyle = '#f43f5e';
      this.ctx.lineWidth = 6;
      this.ctx.beginPath();
      this.ctx.moveTo(this.slingPos.x - 30, this.slingPos.y);
      this.ctx.lineTo(this.mousePos.x, this.mousePos.y);
      this.ctx.lineTo(this.slingPos.x + 30, this.slingPos.y);
      this.ctx.stroke();

      // Draw active ball inside launcher
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.beginPath();
      this.ctx.arc(this.mousePos.x, this.mousePos.y, 11, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (!this.ball || this.ball.settled) {
      // Resting Ball indicator
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      this.ctx.beginPath();
      this.ctx.arc(this.slingPos.x, this.slingPos.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  drawObstacle(o) {
    this.ctx.save();
    
    // Pivot to center for rotation
    const cx = o.x + o.width/2;
    const cy = o.y + o.height/2;
    this.ctx.translate(cx, cy);
    if (o.angle) {
      this.ctx.rotate(o.angle * Math.PI / 180);
    }
    
    const ox = -o.width/2;
    const oy = -o.height/2;

    if (o.type === 'wood') {
      // Wood gradient and border
      const woodGrad = this.ctx.createLinearGradient(ox, oy, ox, oy + o.height);
      woodGrad.addColorStop(0, '#b45309');
      woodGrad.addColorStop(1, '#78350f');
      this.ctx.fillStyle = woodGrad;
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 1.5;
      this.ctx.fillRect(ox, oy, o.width, o.height);
      this.ctx.strokeRect(ox, oy, o.width, o.height);
      
      // Draw HP crack lines if damaged
      const damageRatio = o.currentHp / (o.hp || 1);
      if (damageRatio < 0.7) {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.moveTo(ox + 5, oy + 5);
        this.ctx.lineTo(ox + o.width - 5, oy + o.height - 5);
        if (damageRatio < 0.4) {
          this.ctx.moveTo(ox + o.width - 5, oy + 5);
          this.ctx.lineTo(ox + 5, oy + o.height - 5);
        }
        this.ctx.stroke();
      }
    } else if (o.type === 'stone') {
      const stoneGrad = this.ctx.createLinearGradient(ox, oy, ox, oy + o.height);
      stoneGrad.addColorStop(0, '#475569');
      stoneGrad.addColorStop(1, '#1e293b');
      this.ctx.fillStyle = stoneGrad;
      this.ctx.strokeStyle = '#64748b';
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(ox, oy, o.width, o.height);
      this.ctx.strokeRect(ox, oy, o.width, o.height);
    } else if (o.type === 'bouncer') {
      // Bouncer pad (neon purple)
      const bGrad = this.ctx.createLinearGradient(ox, oy, ox, oy + o.height);
      bGrad.addColorStop(0, '#c084fc');
      bGrad.addColorStop(1, '#6b21a8');
      this.ctx.fillStyle = bGrad;
      this.ctx.strokeStyle = '#a855f7';
      this.ctx.lineWidth = 3;
      this.ctx.fillRect(ox, oy, o.width, o.height);
      this.ctx.strokeRect(ox, oy, o.width, o.height);
    } else if (o.type === 'tnt') {
      // TNT crate
      const tntGrad = this.ctx.createLinearGradient(ox, oy, ox, oy + o.height);
      tntGrad.addColorStop(0, '#dc2626');
      tntGrad.addColorStop(1, '#7f1d1d');
      this.ctx.fillStyle = tntGrad;
      this.ctx.strokeStyle = '#ef4444';
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(ox, oy, o.width, o.height);
      this.ctx.strokeRect(ox, oy, o.width, o.height);
      
      // Draw yellow text
      this.ctx.fillStyle = '#facc15';
      this.ctx.font = 'bold 15px Outfit';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText("TNT", 0, 0);
    } else if (o.type === 'portal') {
      // Circular glow portals
      const portalGrad = this.ctx.createRadialGradient(0, 0, 5, 0, 0, o.width/2);
      if (o.portalId === 1) {
        portalGrad.addColorStop(0, '#ea580c');
        portalGrad.addColorStop(0.8, '#f97316');
        portalGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      } else {
        portalGrad.addColorStop(0, '#2563eb');
        portalGrad.addColorStop(0.8, '#3b82f6');
        portalGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      }
      this.ctx.fillStyle = portalGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, o.width/2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  drawVase(v) {
    this.ctx.save();
    
    // Choose theme color based on type
    let primaryGrad = this.ctx.createLinearGradient(v.x, v.y, v.x, v.y + v.height);
    let glowColor = 'rgba(167, 139, 250, 0.4)';
    
    if (v.type === 'gold') {
      primaryGrad.addColorStop(0, '#fbbf24');
      primaryGrad.addColorStop(0.5, '#f59e0b');
      primaryGrad.addColorStop(1, '#b45309');
      glowColor = 'rgba(251, 191, 36, 0.5)';
    } else if (v.type === 'explosive') {
      primaryGrad.addColorStop(0, '#f87171');
      primaryGrad.addColorStop(0.5, '#ef4444');
      primaryGrad.addColorStop(1, '#b91c1c');
      glowColor = 'rgba(239, 68, 68, 0.5)';
    } else if (v.type === 'armored') {
      primaryGrad.addColorStop(0, '#94a3b8');
      primaryGrad.addColorStop(0.5, '#475569');
      primaryGrad.addColorStop(1, '#334155');
      glowColor = 'rgba(148, 163, 184, 0.4)';
    } else {
      // standard ceramic / purple glass
      primaryGrad.addColorStop(0, '#c084fc');
      primaryGrad.addColorStop(0.5, '#8b5cf6');
      primaryGrad.addColorStop(1, '#5b21b6');
      glowColor = 'rgba(139, 92, 246, 0.4)';
    }

    // Shadow & glow
    this.ctx.shadowColor = glowColor;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetY = 2;

    this.ctx.fillStyle = primaryGrad;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;

    // Draw the VASE using custom path mapping inside bounding rect
    const vx = v.x;
    const vy = v.y;
    const vw = v.width;
    const vh = v.height;

    this.ctx.beginPath();
    
    // Top Lip
    this.ctx.moveTo(vx + vw * 0.25, vy);
    this.ctx.lineTo(vx + vw * 0.75, vy);
    
    // Neck curve to base body
    this.ctx.bezierCurveTo(
      vx + vw * 0.75, vy + vh * 0.2, // ctrl 1
      vx + vw * 0.60, vy + vh * 0.35, // ctrl 2
      vx + vw * 0.95, vy + vh * 0.55 // anchor
    );
    
    // Body curve to bottom
    this.ctx.bezierCurveTo(
      vx + vw * 1.10, vy + vh * 0.8,
      vx + vw * 0.85, vy + vh * 0.95,
      vx + vw * 0.75, vy + vh
    );

    // Flat bottom line
    this.ctx.lineTo(vx + vw * 0.25, vy + vh);

    // Left body curve up
    this.ctx.bezierCurveTo(
      vx + vw * 0.15, vy + vh * 0.95,
      vx - vw * 0.10, vy + vh * 0.8,
      vx + vw * 0.05, vy + vh * 0.55
    );

    // Left neck curve up
    this.ctx.bezierCurveTo(
      vx + vw * 0.40, vy + vh * 0.35,
      vx + vw * 0.25, vy + vh * 0.2,
      vx + vw * 0.25, vy
    );
    
    this.ctx.fill();
    this.ctx.stroke();

    // Highlight sheen (white reflection curve inside vase)
    this.ctx.shadowColor = 'transparent';
    this.ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(vx + vw * 0.35, vy + vh * 0.4);
    this.ctx.bezierCurveTo(
      vx + vw * 0.25, vy + vh * 0.5,
      vx + vw * 0.15, vy + vh * 0.7,
      vx + vw * 0.3, vy + vh * 0.85
    );
    this.ctx.stroke();

    // Show HP crack overlay for armored vases if hit
    if (v.type === 'armored' && v.currentHp === 1) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(vx + vw*0.4, vy + vh*0.3);
      this.ctx.lineTo(vx + vw*0.6, vy + vh*0.7);
      this.ctx.lineTo(vx + vw*0.5, vy + vh*0.9);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  // --- GAME LOOP ---
  gameLoop() {
    if (this.gameState === 'playing') {
      this.updatePhysics();
      this.updateParticles();
    }
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
