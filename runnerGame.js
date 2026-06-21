// PULSE RUNNER - Game Logic

class RunnerAudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playJump() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playFlip() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(250, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
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
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.setValueAtTime(987.77, now + 0.06); // B5
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    
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
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(30, now + 0.4);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.start(now);
    osc.stop(now + 0.4);

    // Rumble explosion noise
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    noiseNode.start();
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

const safeStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      // fallback silently
    }
  }
};

const runnerAudio = new RunnerAudioManager();

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 600;
const FLOOR_Y = 480;
const CEILING_Y = 120;

// 20 track stages parameters
function generateTrackForLevel(levelIdx) {
  const hazards = [];
  const startX = 600;
  const spacing = 350 - levelIdx * 8;
  const length = 4000 + levelIdx * 800;
  
  // Speed multiplier based on level
  const speed = 5.5 + levelIdx * 0.35;
  
  // Obstacle generation
  for (let x = startX; x < length; x += spacing + Math.random() * 200) {
    const rand = Math.random();
    
    if (rand < 0.35) {
      // Spike on floor
      hazards.push({ x, type: 'spike', y: FLOOR_Y - 25, w: 25, h: 25 });
    } else if (rand < 0.6) {
      // Elevated block structure
      const blockHeight = 45;
      hazards.push({ x, type: 'block', y: FLOOR_Y - blockHeight, w: 60, h: blockHeight });
      // Coin on top
      hazards.push({ x: x + 20, type: 'coin', y: FLOOR_Y - blockHeight - 40, w: 18, h: 18, collected: false });
    } else if (rand < 0.75 && levelIdx > 2) {
      // Floating spikes (hanging from ceiling or mid-air)
      hazards.push({ x, type: 'spike_down', y: CEILING_Y, w: 25, h: 25 });
    } else {
      // Multiple coins trace
      hazards.push({ x: x, type: 'coin', y: FLOOR_Y - 50, w: 18, h: 18, collected: false });
      hazards.push({ x: x + 50, type: 'coin', y: FLOOR_Y - 60, w: 18, h: 18, collected: false });
      hazards.push({ x: x + 100, type: 'coin', y: FLOOR_Y - 50, w: 18, h: 18, collected: false });
    }
    
    // Portal gate triggers gravity flip modes
    if (rand > 0.88 && levelIdx > 4) {
      hazards.push({ x: x - 100, type: 'portal', y: FLOOR_Y - 100, w: 30, h: 80 });
    }
  }

  return { hazards, length, speed };
}

class PulseRunner {
  constructor() {
    this.canvas = document.getElementById('runnerCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.levelIdx = 0;
    this.score = 0;
    this.progress = 0;
    this.gameState = 'menu'; // menu, level_select, playing, complete, failed
    
    // Physics properties
    this.player = {
      x: 150,
      y: FLOOR_Y - 30,
      w: 30,
      h: 30,
      vy: 0,
      gravityDir: 1, // 1 = normal down, -1 = upside down on ceiling
      jumpForce: 11,
      gravitySpeed: 0.55,
      isGrounded: true
    };

    // Tracking
    this.hazards = [];
    this.particles = [];
    this.cameraX = 0;
    this.trackLength = 5000;
    this.runSpeed = 6.0;
    
    // Game Loop
    this.animationFrameId = null;
    
    // Level settings
    let unlocked = parseInt(safeStorage.getItem('runner_unlocked') || '1');
    if (isNaN(unlocked) || unlocked < 1 || unlocked > 20) unlocked = 1;
    this.unlockedLevels = unlocked;

    let completed = [];
    try {
      completed = JSON.parse(safeStorage.getItem('runner_completed') || '[]');
      if (!Array.isArray(completed)) completed = [];
    } catch (e) {
      completed = [];
    }
    this.completedLevels = completed;

    this.registerEvents();
    this.initUI();
    this.render(); // Initial static render
  }

  initUI() {
    document.getElementById('runner-btn-play').addEventListener('click', () => {
      runnerAudio.init();
      this.levelIdx = this.unlockedLevels - 1;
      if (this.levelIdx >= 20) this.levelIdx = 19;
      this.startLevel(this.levelIdx);
    });

    document.getElementById('runner-btn-levels').addEventListener('click', () => {
      runnerAudio.init();
      this.showScreen('runner-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
    });

    document.getElementById('runner-btn-level-back').addEventListener('click', () => {
      this.showScreen('runner-start-screen');
      this.gameState = 'menu';
    });

    document.getElementById('runner-hud-btn-restart').addEventListener('click', () => this.startLevel(this.levelIdx));
    document.getElementById('runner-hud-btn-home').addEventListener('click', () => {
      this.gameState = 'menu';
      this.stopLoop();
      this.showScreen('runner-start-screen');
      document.getElementById('runner-hud').classList.add('hidden');
    });

    const muteBtn = document.getElementById('runner-hud-btn-mute');
    muteBtn.addEventListener('click', () => {
      runnerAudio.muted = !runnerAudio.muted;
      muteBtn.textContent = runnerAudio.muted ? '🔇' : '🔊';
    });

    document.getElementById('runner-btn-next-level').addEventListener('click', () => {
      if (this.levelIdx + 1 < 20) {
        this.startLevel(this.levelIdx + 1);
      } else {
        this.gameState = 'menu';
        this.showScreen('runner-start-screen');
        document.getElementById('runner-hud').classList.add('hidden');
      }
    });

    document.getElementById('runner-btn-restart-win').addEventListener('click', () => this.startLevel(this.levelIdx));
    document.getElementById('runner-btn-restart-fail').addEventListener('click', () => this.startLevel(this.levelIdx));
    
    document.getElementById('runner-btn-menu-win').addEventListener('click', () => {
      this.showScreen('runner-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
      document.getElementById('runner-hud').classList.add('hidden');
    });
    
    document.getElementById('runner-btn-menu-fail').addEventListener('click', () => {
      this.showScreen('runner-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
      document.getElementById('runner-hud').classList.add('hidden');
    });
  }

  showScreen(screenId) {
    document.querySelectorAll('.runner-overlay').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
  }

  renderLevelGrid() {
    const grid = document.getElementById('runner-level-grid-container');
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
      const container = document.getElementById('runner-game-container');
      if (container) {
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
      }
    } catch(e) {}
    this.levelIdx = idx;
    this.cameraX = 0;
    this.particles = [];
    this.progress = 0;
    
    // Reset player position
    this.player.y = FLOOR_Y - 30;
    this.player.vy = 0;
    this.player.gravityDir = 1;
    this.player.isGrounded = true;

    // Load track layout
    const track = generateTrackForLevel(idx);
    this.hazards = track.hazards;
    this.trackLength = track.length;
    this.runSpeed = track.speed;

    // HUD values
    document.getElementById('runner-hud-level-num').textContent = idx + 1;
    document.getElementById('runner-hud-score').textContent = this.score;
    document.getElementById('runner-hud-progress').textContent = '0%';
    document.getElementById('runner-hud').classList.remove('hidden');

    this.showScreen('dummy-screen'); // hide overlays
    this.gameState = 'playing';

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
    const triggerAction = () => {
      if (this.gameState !== 'playing') return;
      
      if (this.player.isGrounded) {
        this.player.vy = -this.player.jumpForce * this.player.gravityDir;
        this.player.isGrounded = false;
        runnerAudio.playJump();
        
        // Spawn jump sparks
        this.spawnSparks(this.player.x, this.player.gravityDir === 1 ? FLOOR_Y : CEILING_Y);
      }
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        triggerAction();
        e.preventDefault();
      }
    });

    this.canvas.addEventListener('mousedown', triggerAction);
    this.canvas.addEventListener('touchstart', (e) => {
      runnerAudio.init();
      triggerAction();
    });
  }

  // --- PHYSICS ENGINE ---
  updatePhysics() {
    // Camera scrolls
    this.cameraX += this.runSpeed;
    
    // Calculate progress percentage
    const pVal = Math.min(100, Math.floor((this.cameraX / this.trackLength) * 100));
    this.progress = pVal;
    document.getElementById('runner-hud-progress').textContent = `${pVal}%`;

    // Apply gravity
    this.player.vy += this.player.gravitySpeed * this.player.gravityDir;
    this.player.y += this.player.vy;

    // Clamp inside floor and ceiling bounds
    const limitFloor = FLOOR_Y - this.player.h;
    const limitCeiling = CEILING_Y;

    if (this.player.gravityDir === 1) {
      // Normal gravity: land on floor
      if (this.player.y >= limitFloor) {
        this.player.y = limitFloor;
        this.player.vy = 0;
        this.player.isGrounded = true;
      }
    } else {
      // Inverted gravity: land on ceiling
      if (this.player.y <= limitCeiling) {
        this.player.y = limitCeiling;
        this.player.vy = 0;
        this.player.isGrounded = true;
      }
    }

    // Check Win complete
    if (this.cameraX >= this.trackLength) {
      this.handleLevelWin();
      return;
    }

    // Hazard Collisions
    const px = this.player.x + this.cameraX;
    const py = this.player.y;
    const pw = this.player.w;
    const ph = this.player.h;

    for (let h of this.hazards) {
      if (h.collected) continue;

      // Check overlap
      if (px + pw > h.x && px < h.x + h.w && py + ph > h.y && py < h.y + h.h) {
        if (h.type === 'coin') {
          h.collected = true;
          this.score += 200;
          document.getElementById('runner-hud-score').textContent = this.score;
          runnerAudio.playCollect();
          this.spawnCoinCollectEffect(h.x - this.cameraX + h.w/2, h.y + h.h/2);
        } else if (h.type === 'portal') {
          // Flip gravity direction
          this.player.gravityDir = -this.player.gravityDir;
          this.player.isGrounded = false;
          runnerAudio.playFlip();
          // Remove portal so it doesn't double trigger
          h.collected = true; 
        } else if (h.type === 'block') {
          // If landing on top of the block, run on it
          const tolerance = 12;
          if (this.player.gravityDir === 1 && py + ph - this.player.vy <= h.y + tolerance) {
            this.player.y = h.y - ph;
            this.player.vy = 0;
            this.player.isGrounded = true;
          } else if (this.player.gravityDir === -1 && py - this.player.vy >= h.y + h.h - tolerance) {
            this.player.y = h.y + h.h;
            this.player.vy = 0;
            this.player.isGrounded = true;
          } else {
            // Hit the side wall of block = Crash!
            this.handleGameOver();
            return;
          }
        } else {
          // Hit spike = Crash!
          this.handleGameOver();
          return;
        }
      }
    }

    // Particle decays
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  handleLevelWin() {
    this.stopLoop();
    this.gameState = 'complete';
    runnerAudio.playWin();

    // Save completion
    if (!this.completedLevels.includes(this.levelIdx)) {
      this.completedLevels.push(this.levelIdx);
      safeStorage.setItem('runner_completed', JSON.stringify(this.completedLevels));
    }
    
    // Unlock next sector
    if (this.levelIdx + 1 === this.unlockedLevels && this.unlockedLevels < 20) {
      this.unlockedLevels++;
      safeStorage.setItem('runner_unlocked', this.unlockedLevels.toString());
    }

    document.getElementById('runner-complete-desc').textContent = `Sector Score: ${this.score}. Track sync fully complete.`;
    this.showScreen('runner-complete-screen');
  }

  handleGameOver() {
    this.stopLoop();
    this.gameState = 'failed';
    runnerAudio.playCrash();
    
    // Trigger screen shake
    const el = document.getElementById('runner-game-container');
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 250);

    this.showScreen('runner-failed-screen');
  }

  // --- PARTICLES ---
  spawnSparks(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + 15,
        y: y,
        vx: Math.random() * 3 - 1.5,
        vy: -Math.random() * 3 * this.player.gravityDir,
        size: Math.random() * 4 + 2,
        color: '#facc15',
        life: 1.0
      });
    }
  }

  spawnCoinCollectEffect(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color: '#facc15',
        life: 1.0
      });
    }
  }

  // --- RENDER track ---
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Cyber Grid wires scrolling in parallax
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    this.ctx.lineWidth = 1;
    const gridOffset = this.cameraX % 40;
    for (let x = -gridOffset; x < CANVAS_WIDTH; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, CANVAS_HEIGHT);
      this.ctx.stroke();
    }

    // Draw Floor and Ceiling guidelines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, FLOOR_Y);
    this.ctx.lineTo(CANVAS_WIDTH, FLOOR_Y);
    this.ctx.moveTo(0, CEILING_Y);
    this.ctx.lineTo(CANVAS_WIDTH, CEILING_Y);
    this.ctx.stroke();

    // Draw hazard track components relative to CameraX
    this.hazards.forEach(h => {
      if (h.collected) return;
      
      const rx = h.x - this.cameraX;
      if (rx < -100 || rx > CANVAS_WIDTH + 100) return; // out of screen

      this.ctx.save();
      
      if (h.type === 'spike') {
        // Glowing red floor spike
        this.ctx.fillStyle = '#ef4444';
        this.ctx.shadowColor = '#ef4444';
        this.ctx.shadowBlur = 10;
        
        this.ctx.beginPath();
        this.ctx.moveTo(rx, FLOOR_Y);
        this.ctx.lineTo(rx + h.w / 2, FLOOR_Y - h.h);
        this.ctx.lineTo(rx + h.w, FLOOR_Y);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (h.type === 'spike_down') {
        // Glowing red ceiling spike
        this.ctx.fillStyle = '#ef4444';
        this.ctx.shadowColor = '#ef4444';
        this.ctx.shadowBlur = 10;
        
        this.ctx.beginPath();
        this.ctx.moveTo(rx, CEILING_Y);
        this.ctx.lineTo(rx + h.w / 2, CEILING_Y + h.h);
        this.ctx.lineTo(rx + h.w, CEILING_Y);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (h.type === 'block') {
        // Neon solid blue block
        this.ctx.fillStyle = '#1e3a8a';
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.shadowColor = '#3b82f6';
        this.ctx.shadowBlur = 8;
        this.ctx.lineWidth = 1.5;
        this.ctx.fillRect(rx, h.y, h.w, h.h);
        this.ctx.strokeRect(rx, h.y, h.w, h.h);
      } else if (h.type === 'coin') {
        // Spinning golden coin
        this.ctx.fillStyle = '#facc15';
        this.ctx.shadowColor = '#facc15';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        const spin = Math.abs(Math.sin(Date.now() * 0.007));
        this.ctx.ellipse(rx + h.w/2, h.y + h.h/2, (h.w/2) * spin, h.h/2, 0, 0, Math.PI*2);
        this.ctx.fill();
      } else if (h.type === 'portal') {
        // Magenta gravity flip portal
        const grad = this.ctx.createLinearGradient(rx, h.y, rx, h.y + h.h);
        grad.addColorStop(0, '#db2777');
        grad.addColorStop(1, '#701a75');
        this.ctx.fillStyle = grad;
        this.ctx.shadowColor = '#db2777';
        this.ctx.shadowBlur = 12;
        this.ctx.fillRect(rx, h.y, h.w, h.h);
        
        // draw inner portal stripe
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(rx + 5, h.y + 5, h.w - 10, h.h - 10);
      }

      this.ctx.restore();
    });

    // Draw Player Runner
    if (this.gameState === 'playing') {
      this.ctx.save();
      
      const px = this.player.x;
      const py = this.player.y;
      
      this.ctx.fillStyle = '#facc15'; // Glowing gold block
      this.ctx.shadowColor = '#facc15';
      this.ctx.shadowBlur = 12;
      
      this.ctx.fillRect(px, py, this.player.w, this.player.h);
      
      // White inner core
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(px + 6, py + 6, this.player.w - 12, this.player.h - 12);
      
      // Draw tail trail particles
      if (Math.random() < 0.35) {
        this.particles.push({
          x: px,
          y: py + this.player.h/2,
          vx: -this.runSpeed * 0.3,
          vy: Math.random() * 1 - 0.5,
          size: Math.random() * 5 + 2,
          color: 'rgba(250, 204, 21, 0.4)',
          life: 0.6
        });
      }

      this.ctx.restore();
    }

    // Draw Particles
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
  new PulseRunner();
});
