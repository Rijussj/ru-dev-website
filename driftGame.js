// NEON DRIFT - Game Logic

class DriftAudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.osc = null;
    this.gain = null;
  }

  init() {
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      } catch (e) {
        console.warn("AudioContext failed to initialize:", e);
      }
    }
  }

  startEngine() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.stopEngine();

    try {
      this.osc = this.ctx.createOscillator();
      this.gain = this.ctx.createGain();
      this.osc.connect(this.gain);
      this.gain.connect(this.ctx.destination);
      
      this.osc.type = 'sawtooth';
      this.osc.frequency.setValueAtTime(60, this.ctx.currentTime); // Low speed hum
      
      // Lowpass filter to make it sound rumbling and clean
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);
      
      this.osc.disconnect(this.gain);
      this.osc.connect(filter);
      filter.connect(this.gain);

      this.gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      this.osc.start(0);
    } catch (e) {
      console.warn("Engine sound failed to start:", e);
    }
  }

  updateEnginePitch(speedRatio) {
    if (this.muted || !this.ctx || !this.osc) return;
    try {
      // Scale frequency from 50Hz to 130Hz based on speed
      const freq = 50 + speedRatio * 80;
      this.osc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    } catch (e) {}
  }

  stopEngine() {
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch (e) {}
      this.osc = null;
    }
  }

  playCollect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      // Arpeggio chime
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.05); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.1); // D6
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      
      osc.start();
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playCrash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.stopEngine();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.5);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      osc.start(now);
      osc.stop(now + 0.5);

      // Low rumble noise explosion
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, now);
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      
      noise.start();
    } catch (e) {}
  }

  playWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.stopEngine();
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch (e) {}
  }
}

const driftAudio = new DriftAudioManager();

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 600;

// Highway board details
const LANES_COUNT = 4;
const LANE_WIDTH = 100;
const ROAD_WIDTH = LANES_COUNT * LANE_WIDTH;
const ROAD_X = (CANVAS_WIDTH - ROAD_WIDTH) / 2; // centered

// Level configuration presets
const DRIFT_SECTORS = [];
for (let i = 0; i < 20; i++) {
  DRIFT_SECTORS.push({
    targetDistance: 5000 + i * 1500,
    speed: 7.0 + i * 0.6,
    spawnDensity: 0.02 + i * 0.003, // obstacle spawn rate per frame
    obstacleSpeedMin: 3.5 + i * 0.4,
    obstacleSpeedMax: 5.5 + i * 0.5
  });
}

const safeStorage = {
  getItem(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem(key, val) {
    try { localStorage.setItem(key, val); } catch (e) {}
  }
};

class NeonDrift {
  constructor() {
    this.canvas = document.getElementById('driftCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.levelIdx = 0;
    this.score = 0;
    this.distanceTraveled = 0;
    this.gameState = 'menu'; // menu, level_select, playing, complete, failed

    // Player position
    this.player = {
      x: ROAD_X + (ROAD_WIDTH / 2) - 25,
      y: CANVAS_HEIGHT - 120,
      w: 50,
      h: 80,
      targetX: ROAD_X + (ROAD_WIDTH / 2) - 25,
      speed: 12
    };

    this.obstacles = [];
    this.cells = [];
    this.particles = [];
    
    // Scrolling lines
    this.roadScrollY = 0;

    // Progression settings
    let unlocked = parseInt(safeStorage.getItem('drift_unlocked') || '1');
    if (isNaN(unlocked) || unlocked < 1 || unlocked > 20) unlocked = 1;
    this.unlockedLevels = unlocked;

    let completed = [];
    try {
      completed = JSON.parse(safeStorage.getItem('drift_completed') || '[]');
      if (!Array.isArray(completed)) completed = [];
    } catch(e) {
      completed = [];
    }
    this.completedLevels = completed;

    this.animationFrameId = null;
    this.isSteering = false;

    this.registerEvents();
    this.initUI();
    this.render(); // initial draw
  }

  initUI() {
    document.getElementById('drift-btn-play').addEventListener('click', () => {
      driftAudio.init();
      this.levelIdx = this.unlockedLevels - 1;
      if (this.levelIdx >= 20) this.levelIdx = 19;
      this.startLevel(this.levelIdx);
    });

    document.getElementById('drift-btn-levels').addEventListener('click', () => {
      driftAudio.init();
      this.showScreen('drift-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
    });

    document.getElementById('drift-btn-level-back').addEventListener('click', () => {
      this.showScreen('drift-start-screen');
      this.gameState = 'menu';
    });

    document.getElementById('drift-hud-btn-restart').addEventListener('click', () => this.startLevel(this.levelIdx));
    document.getElementById('drift-hud-btn-home').addEventListener('click', () => {
      this.gameState = 'menu';
      this.stopLoop();
      driftAudio.stopEngine();
      this.showScreen('drift-start-screen');
      document.getElementById('drift-hud').classList.add('hidden');
    });

    const muteBtn = document.getElementById('drift-hud-btn-mute');
    muteBtn.addEventListener('click', () => {
      driftAudio.muted = !driftAudio.muted;
      muteBtn.textContent = driftAudio.muted ? '🔇' : '🔊';
      if (driftAudio.muted) {
        driftAudio.stopEngine();
      } else if (this.gameState === 'playing') {
        driftAudio.startEngine();
      }
    });

    const fsBtn = document.getElementById('drift-hud-btn-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        const container = document.getElementById('drift-game-container');
        if (!document.fullscreenElement) {
          if (container.requestFullscreen) container.requestFullscreen();
          else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      });
    }

    document.getElementById('drift-btn-next-level').addEventListener('click', () => {
      if (this.levelIdx + 1 < 20) {
        this.startLevel(this.levelIdx + 1);
      } else {
        this.gameState = 'menu';
        this.showScreen('drift-start-screen');
        document.getElementById('drift-hud').classList.add('hidden');
      }
    });

    document.getElementById('drift-btn-restart-win').addEventListener('click', () => this.startLevel(this.levelIdx));
    document.getElementById('drift-btn-restart-fail').addEventListener('click', () => this.startLevel(this.levelIdx));
    
    document.getElementById('drift-btn-menu-win').addEventListener('click', () => {
      this.showScreen('drift-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
      document.getElementById('drift-hud').classList.add('hidden');
    });
    
    document.getElementById('drift-btn-menu-fail').addEventListener('click', () => {
      this.showScreen('drift-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
      document.getElementById('drift-hud').classList.add('hidden');
    });
  }

  showScreen(screenId) {
    document.querySelectorAll('.drift-overlay').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
  }

  renderLevelGrid() {
    const grid = document.getElementById('drift-level-grid-container');
    grid.innerHTML = '';
    
    for (let i = 0; i < 20; i++) {
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
      const container = document.getElementById('drift-game-container');
      if (container) {
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
      }
    } catch(e) {}
    this.levelIdx = idx;
    this.distanceTraveled = 0;
    this.obstacles = [];
    this.cells = [];
    this.particles = [];
    
    // Position player in the center of lanes
    this.player.x = ROAD_X + (ROAD_WIDTH / 2) - 25;
    this.player.targetX = this.player.x;

    // HUD values
    document.getElementById('drift-hud-level-num').textContent = idx + 1;
    document.getElementById('drift-hud-score').textContent = this.score;
    document.getElementById('drift-hud-progress').textContent = '0%';
    document.getElementById('drift-hud').classList.remove('hidden');

    this.showScreen('dummy-screen'); // hide overlays
    this.gameState = 'playing';

    driftAudio.startEngine();
    this.stopLoop();
    this.gameLoop();
  }

  stopLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  registerEvents() {
    const handleMoveInput = (clientX) => {
      if (this.gameState !== 'playing') return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const mx = (clientX - rect.left) * scaleX;
      
      // Keep player inside the road bounds
      const minX = ROAD_X + 10;
      const maxX = ROAD_X + ROAD_WIDTH - this.player.w - 10;
      this.player.targetX = Math.max(minX, Math.min(maxX, mx - this.player.w / 2));
    };

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (this.gameState !== 'playing') return;
      
      const step = LANE_WIDTH;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.player.targetX = Math.max(ROAD_X + 10, this.player.targetX - step);
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.player.targetX = Math.min(ROAD_X + ROAD_WIDTH - this.player.w - 10, this.player.targetX + step);
      }
    });

    // Touch and Mouse Slide steering
    this.canvas.addEventListener('mousedown', (e) => {
      this.isSteering = true;
      handleMoveInput(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isSteering) {
        handleMoveInput(e.clientX);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isSteering = false;
    });

    this.canvas.addEventListener('touchstart', (e) => {
      this.isSteering = true;
      if (e.touches && e.touches[0]) {
        handleMoveInput(e.touches[0].clientX);
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isSteering && e.touches && e.touches[0]) {
        handleMoveInput(e.touches[0].clientX);
      }
    });

    window.addEventListener('touchend', () => {
      this.isSteering = false;
    });
  }

  // --- ENGINE LOOPS ---
  updatePhysics() {
    const config = DRIFT_SECTORS[this.levelIdx];
    
    // Increment distance
    this.distanceTraveled += config.speed;
    
    // Pitch modulation
    const progressRatio = this.distanceTraveled / config.targetDistance;
    driftAudio.updateEnginePitch(Math.min(1.0, progressRatio));

    // Update HUD Progress
    const pVal = Math.min(100, Math.floor((this.distanceTraveled / config.targetDistance) * 100));
    document.getElementById('drift-hud-progress').textContent = `${pVal}%`;

    if (this.distanceTraveled >= config.targetDistance) {
      this.handleLevelWin();
      return;
    }

    // Scroll lines
    this.roadScrollY = (this.roadScrollY + config.speed) % 80;

    // Smoothly shift player towards targetX coordinate
    const dx = this.player.targetX - this.player.x;
    this.player.x += dx * 0.25;

    // Spawn obstacles randomly
    if (Math.random() < config.spawnDensity) {
      const lane = Math.floor(Math.random() * LANES_COUNT);
      const speed = config.obstacleSpeedMin + Math.random() * (config.obstacleSpeedMax - config.obstacleSpeedMin);
      const color = ['#ef4444', '#3b82f6', '#10b981', '#ec4899', '#a855f7'][Math.floor(Math.random() * 5)];
      
      this.obstacles.push({
        x: ROAD_X + lane * LANE_WIDTH + (LANE_WIDTH - 44)/2,
        y: -100,
        w: 44,
        h: 75,
        speed: speed,
        color: color
      });
    }

    // Spawn energy cells
    if (Math.random() < 0.015) {
      const lane = Math.floor(Math.random() * LANES_COUNT);
      this.cells.push({
        x: ROAD_X + lane * LANE_WIDTH + (LANE_WIDTH - 25)/2,
        y: -50,
        w: 25,
        h: 25
      });
    }

    // Move Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.y += obs.speed; // obstacles scroll down slightly slower than road to simulate passing
      
      // Collision with player car
      if (this.player.x + this.player.w > obs.x && this.player.x < obs.x + obs.w &&
          this.player.y + this.player.h > obs.y && this.player.y < obs.y + obs.h) {
        this.handleGameOver();
        return;
      }

      // Cleanup offscreen
      if (obs.y > CANVAS_HEIGHT + 100) {
        this.obstacles.splice(i, 1);
        this.score += 50;
        document.getElementById('drift-hud-score').textContent = this.score;
      }
    }

    // Move Energy cells
    for (let i = this.cells.length - 1; i >= 0; i--) {
      const cell = this.cells[i];
      cell.y += config.speed - 2; // scroll with road

      // Check pickup
      if (this.player.x + this.player.w > cell.x && this.player.x < cell.x + cell.w &&
          this.player.y + this.player.h > cell.y && this.player.y < cell.y + cell.h) {
        this.cells.splice(i, 1);
        this.score += 300;
        document.getElementById('drift-hud-score').textContent = this.score;
        driftAudio.playCollect();
        this.spawnCollectSparks(cell.x + cell.w/2, cell.y + cell.h/2);
        continue;
      }

      if (cell.y > CANVAS_HEIGHT + 50) {
        this.cells.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  handleLevelWin() {
    this.stopLoop();
    this.gameState = 'complete';
    driftAudio.playWin();

    // Save progression
    if (!this.completedLevels.includes(this.levelIdx)) {
      this.completedLevels.push(this.levelIdx);
      safeStorage.setItem('drift_completed', JSON.stringify(this.completedLevels));
    }
    if (this.levelIdx + 1 === this.unlockedLevels && this.unlockedLevels < 20) {
      this.unlockedLevels++;
      safeStorage.setItem('drift_unlocked', this.unlockedLevels.toString());
    }

    document.getElementById('drift-complete-desc').textContent = `Sector Score: ${this.score}. Highway connection successfully cleared.`;
    this.showScreen('drift-complete-screen');
  }

  handleGameOver() {
    this.stopLoop();
    this.gameState = 'failed';
    driftAudio.playCrash();
    
    // Spawn car explosion debris
    this.spawnExplosionDebris(this.player.x + this.player.w/2, this.player.y + this.player.h/2);

    const el = document.getElementById('drift-game-container');
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 250);

    this.showScreen('drift-failed-screen');
  }

  spawnCollectSparks(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 2;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: '#facc15',
        life: 1.0
      });
    }
  }

  spawnExplosionDebris(x, y) {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: ['#a78bfa', '#ec4899', '#ef4444', '#ffedd5'][Math.floor(Math.random() * 4)],
        life: 1.0
      });
    }
  }

  // --- RENDER SCREEN ---
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw scrolling background star dust
    this.ctx.fillStyle = 'rgba(255,255,255,0.01)';
    const offset = Math.floor(this.roadScrollY * 0.5) % 40;
    for (let y = -offset; y < CANVAS_HEIGHT; y += 40) {
      for (let x = 0; x < CANVAS_WIDTH; x += 120) {
        this.ctx.fillRect(x + (y % 80), y, 2, 2);
      }
    }

    // Draw Cyber Highway Boundaries
    this.ctx.save();
    this.ctx.strokeStyle = '#a78bfa'; // Glowing Neon Violet road lines
    this.ctx.shadowColor = '#8b5cf6';
    this.ctx.shadowBlur = 10;
    this.ctx.lineWidth = 4;
    
    // Left boundary
    this.ctx.beginPath();
    this.ctx.moveTo(ROAD_X, 0);
    this.ctx.lineTo(ROAD_X, CANVAS_HEIGHT);
    this.ctx.stroke();

    // Right boundary
    this.ctx.beginPath();
    this.ctx.moveTo(ROAD_X + ROAD_WIDTH, 0);
    this.ctx.lineTo(ROAD_X + ROAD_WIDTH, CANVAS_HEIGHT);
    this.ctx.stroke();
    this.ctx.restore();

    // Draw Lane Dividers (Dashed Scrolling Lines)
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([30, 50]);
    this.ctx.lineDashOffset = -this.roadScrollY;

    for (let i = 1; i < LANES_COUNT; i++) {
      const lx = ROAD_X + i * LANE_WIDTH;
      this.ctx.beginPath();
      this.ctx.moveTo(lx, 0);
      this.ctx.lineTo(lx, CANVAS_HEIGHT);
      this.ctx.stroke();
    }
    this.ctx.restore();

    // Draw Energy Cells
    this.cells.forEach(c => {
      this.ctx.save();
      this.ctx.fillStyle = '#facc15'; // Glowing gold power cells
      this.ctx.shadowColor = '#facc15';
      this.ctx.shadowBlur = 12;
      
      const cx = c.x + c.w/2;
      const cy = c.y + c.h/2;
      
      this.ctx.beginPath();
      const radius = c.w / 2;
      // Diamond rotation
      this.ctx.moveTo(cx, cy - radius);
      this.ctx.lineTo(cx + radius, cy);
      this.ctx.lineTo(cx, cy + radius);
      this.ctx.lineTo(cx - radius, cy);
      this.ctx.closePath();
      this.ctx.fill();
      
      this.ctx.restore();
    });

    // Draw Traffic Obstacles
    this.obstacles.forEach(o => {
      this.ctx.save();
      this.ctx.fillStyle = o.color;
      this.ctx.shadowColor = o.color;
      this.ctx.shadowBlur = 8;
      this.ctx.fillRect(o.x, o.y, o.w, o.h);

      // Windshield
      this.ctx.fillStyle = '#060a13';
      this.ctx.fillRect(o.x + 4, o.y + 15, o.w - 8, 12);

      // Tail lights
      this.ctx.fillStyle = '#ef4444';
      this.ctx.fillRect(o.x + 4, o.y + o.h - 8, 8, 4);
      this.ctx.fillRect(o.x + o.w - 12, o.y + o.h - 8, 8, 4);
      this.ctx.restore();
    });

    // Draw Player Futuristic Car
    if (this.gameState === 'playing') {
      this.ctx.save();
      this.ctx.fillStyle = '#8b5cf6'; // Neon purple car frame
      this.ctx.shadowColor = '#a78bfa';
      this.ctx.shadowBlur = 15;
      
      // Car chassis body
      this.ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);

      // Windshield glass glow
      this.ctx.fillStyle = '#67e8f9';
      this.ctx.fillRect(this.player.x + 6, this.player.y + 20, this.player.w - 12, 15);

      // Neon Headlights cyan
      this.ctx.fillStyle = '#67e8f9';
      this.ctx.fillRect(this.player.x + 4, this.player.y + 4, 8, 6);
      this.ctx.fillRect(this.player.x + this.player.w - 12, this.player.y + 4, 8, 6);

      // Glowing wheels
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(this.player.x - 4, this.player.y + 12, 4, 16);
      this.ctx.fillRect(this.player.x + this.player.w, this.player.y + 12, 4, 16);
      this.ctx.fillRect(this.player.x - 4, this.player.y + this.player.h - 28, 4, 16);
      this.ctx.fillRect(this.player.x + this.player.w, this.player.y + this.player.h - 28, 4, 16);

      // Exhaust tail flames
      const flameHeight = Math.random() * 15 + 5;
      const grad = this.ctx.createLinearGradient(this.player.x + this.player.w/2, this.player.y + this.player.h, this.player.x + this.player.w/2, this.player.y + this.player.h + flameHeight);
      grad.addColorStop(0, '#f43f5e');
      grad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(this.player.x + 10, this.player.y + this.player.h, 6, flameHeight);
      this.ctx.fillRect(this.player.x + this.player.w - 16, this.player.y + this.player.h, 6, flameHeight);

      this.ctx.restore();
    }

    // Render particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  // --- GAME LOOP ---
  gameLoop() {
    if (this.gameState === 'playing') {
      this.updatePhysics();
    }
    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new NeonDrift();
});
