// PULSE BREAKER - Game Logic

class BreakerAudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playBounce(type = 'wall') {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    if (type === 'paddle') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    }
    
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playBrickHit(hpLeft) {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(hpLeft <= 0 ? 350 : 220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playLaser() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playExplosion() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(20, now + 0.4);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.start(now);
    osc.stop(now + 0.4);

    // Rumbling noise
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
    filter.frequency.setValueAtTime(120, now);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    noiseNode.start();
  }

  playPowerup() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [329.63, 392.00, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.06, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.15);
    });
  }

  playWin() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.07, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }

  playFail() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [300, 250, 200, 150];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0.08, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.3);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.3);
    });
  }
}

const breakerAudio = new BreakerAudioManager();

// Game Config
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 600;
const PADDLE_Y = 540;
const PADDLE_H = 15;
const BALL_SPEED = 6.5;

// handcrafting 20 brick sector arrays
function generateBricksForLevel(levelIdx) {
  const bricks = [];
  const rows = 3 + Math.floor(levelIdx / 4);
  const cols = 12;
  const bw = 65; // brick width
  const bh = 22; // brick height
  const startX = (CANVAS_WIDTH - cols * (bw + 6)) / 2;
  const startY = 80;
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Create interesting pattern formations based on row/column math
      if (levelIdx === 0 && (r === 1 && (c === 0 || c === cols-1))) continue; // space patterns
      if (levelIdx === 1 && (c % 3 === 0)) continue;
      if (levelIdx === 2 && (r + c) % 2 === 0) continue;
      if (levelIdx > 3 && (c === 0 || c === cols-1 || r === 0)) {
        // Armored brick borders
        bricks.push({ x: startX + c * (bw + 6), y: startY + r * (bh + 6), w: bw, h: bh, type: 'armored', maxHp: 2, hp: 2 });
        continue;
      }
      
      // Randomize special brick types on higher levels
      let type = 'standard';
      let hp = 1;
      const rand = Math.random();
      
      if (rand < 0.12 && levelIdx > 2) {
        type = 'explosive';
      } else if (rand < 0.25 && levelIdx > 5) {
        type = 'armored';
        hp = 2;
      }

      bricks.push({
        x: startX + c * (bw + 6),
        y: startY + r * (bh + 6),
        w: bw,
        h: bh,
        type: type,
        maxHp: hp,
        hp: hp
      });
    }
  }
  return bricks;
}

class BreakerGame {
  constructor() {
    this.canvas = document.getElementById('breakerCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.levelIdx = 0;
    this.score = 0;
    this.lives = 3;
    this.gameState = 'menu'; // menu, level_select, playing, complete, failed
    
    // Paddle state
    this.paddle = {
      x: CANVAS_WIDTH / 2 - 60,
      width: 120,
      maxLaserTime: 0,
      laserActive: false
    };

    // Lists
    this.balls = [];
    this.bricks = [];
    this.particles = [];
    this.powerups = [];
    this.lasers = []; // laser bullets shot by paddle
    
    // Safety Shield barrier
    this.shieldActive = false;
    
    // Unlocked level progress
    this.unlockedLevels = parseInt(localStorage.getItem('breaker_unlocked') || '1');
    this.completedLevels = JSON.parse(localStorage.getItem('breaker_completed') || '[]');

    this.registerEvents();
    this.initUI();
    this.gameLoop();
  }

  initUI() {
    document.getElementById('breaker-btn-play').addEventListener('click', () => {
      breakerAudio.init();
      this.levelIdx = this.unlockedLevels - 1;
      if (this.levelIdx >= 20) this.levelIdx = 19;
      this.startLevel(this.levelIdx);
    });

    document.getElementById('breaker-btn-levels').addEventListener('click', () => {
      breakerAudio.init();
      this.showScreen('breaker-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
    });

    document.getElementById('breaker-btn-level-back').addEventListener('click', () => {
      this.showScreen('breaker-start-screen');
      this.gameState = 'menu';
    });

    document.getElementById('breaker-hud-btn-restart').addEventListener('click', () => this.startLevel(this.levelIdx));
    document.getElementById('breaker-hud-btn-home').addEventListener('click', () => {
      this.gameState = 'menu';
      this.showScreen('breaker-start-screen');
      document.getElementById('breaker-hud').classList.add('hidden');
    });

    const muteBtn = document.getElementById('breaker-hud-btn-mute');
    muteBtn.addEventListener('click', () => {
      breakerAudio.muted = !breakerAudio.muted;
      muteBtn.textContent = breakerAudio.muted ? '🔇' : '🔊';
    });

    document.getElementById('breaker-btn-next-level').addEventListener('click', () => {
      if (this.levelIdx + 1 < 20) {
        this.startLevel(this.levelIdx + 1);
      } else {
        this.gameState = 'menu';
        this.showScreen('breaker-start-screen');
        document.getElementById('breaker-hud').classList.add('hidden');
      }
    });

    document.getElementById('breaker-btn-restart-win').addEventListener('click', () => this.startLevel(this.levelIdx));
    document.getElementById('breaker-btn-restart-fail').addEventListener('click', () => this.startLevel(this.levelIdx));
    
    document.getElementById('breaker-btn-menu-win').addEventListener('click', () => {
      this.showScreen('breaker-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
      document.getElementById('breaker-hud').classList.add('hidden');
    });
    
    document.getElementById('breaker-btn-menu-fail').addEventListener('click', () => {
      this.showScreen('breaker-level-screen');
      this.gameState = 'level_select';
      this.renderLevelGrid();
      document.getElementById('breaker-hud').classList.add('hidden');
    });
  }

  showScreen(screenId) {
    document.querySelectorAll('.breaker-overlay').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
  }

  renderLevelGrid() {
    const grid = document.getElementById('breaker-level-grid-container');
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
    this.levelIdx = idx;
    this.lives = 3;
    this.particles = [];
    this.powerups = [];
    this.lasers = [];
    this.shieldActive = false;
    this.paddle.laserActive = false;
    
    // Paddle size scales down slightly on later sectors
    this.paddle.width = Math.max(80, 130 - idx * 2);
    this.paddle.x = CANVAS_WIDTH / 2 - this.paddle.width / 2;

    // Load bricks
    this.bricks = generateBricksForLevel(idx);
    
    // Initialize single ball resting on paddle center
    this.balls = [{
      x: CANVAS_WIDTH / 2,
      y: PADDLE_Y - 11,
      vx: 3,
      vy: -BALL_SPEED,
      radius: 9,
      attached: true
    }];

    // Update HUD
    document.getElementById('breaker-hud-level-num').textContent = idx + 1;
    document.getElementById('breaker-hud-lives').textContent = this.lives;
    document.getElementById('breaker-hud-score').textContent = this.score;
    document.getElementById('breaker-hud').classList.remove('hidden');

    this.showScreen('dummy-screen'); // hide overlays
    this.gameState = 'playing';
  }

  registerEvents() {
    const getCanvasMouseX = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      return (e.clientX - rect.left) * scaleX;
    };

    const handleMove = (x) => {
      if (this.gameState !== 'playing') return;
      this.paddle.x = x - this.paddle.width / 2;
      this.paddle.x = Math.max(10, Math.min(CANVAS_WIDTH - 10 - this.paddle.width, this.paddle.x));
      
      // Update attached balls
      this.balls.forEach(b => {
        if (b.attached) {
          b.x = this.paddle.x + this.paddle.width / 2;
        }
      });
    };

    const handleAction = () => {
      if (this.gameState !== 'playing') return;
      // Release attached balls
      this.balls.forEach(b => {
        if (b.attached) {
          b.attached = false;
          b.vx = (Math.random() * 4 - 2);
          b.vy = -BALL_SPEED;
        }
      });
    };

    // Mouse Listeners
    this.canvas.addEventListener('mousemove', (e) => handleMove(getCanvasMouseX(e)));
    this.canvas.addEventListener('mousedown', handleAction);

    // Touch Listeners
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        breakerAudio.init();
        handleAction();
        handleMove(getCanvasMouseX(e.touches[0]));
      }
    });
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0 && this.gameState === 'playing') {
        e.preventDefault();
        handleMove(getCanvasMouseX(e.touches[0]));
      }
    }, { passive: false });
  }

  // --- PHYSICS ENGINE ---
  updatePhysics() {
    // 1. Move and update Balls
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];
      if (b.attached) continue;

      b.x += b.vx;
      b.y += b.vy;

      // Wall boundaries bounce
      if (b.x < b.radius) {
        b.x = b.radius;
        b.vx = -b.vx;
        breakerAudio.playBounce('wall');
      }
      if (b.x > CANVAS_WIDTH - b.radius) {
        b.x = CANVAS_WIDTH - b.radius;
        b.vx = -b.vx;
        breakerAudio.playBounce('wall');
      }
      if (b.y < b.radius) {
        b.y = b.radius;
        b.vy = -b.vy;
        breakerAudio.playBounce('wall');
      }

      // Safety Shield collision on bottom
      if (this.shieldActive && b.y > CANVAS_HEIGHT - 50 - b.radius) {
        b.y = CANVAS_HEIGHT - 50 - b.radius;
        b.vy = -b.vy;
        this.shieldActive = false; // consume shield
        breakerAudio.playBounce('paddle');
        continue;
      }

      // Bottom death boundary
      if (b.y > CANVAS_HEIGHT + 20) {
        this.balls.splice(i, 1);
        continue;
      }

      // Paddle Collision
      if (
        b.y + b.radius > PADDLE_Y && b.y - b.radius < PADDLE_Y + PADDLE_H &&
        b.x + b.radius > this.paddle.x && b.x - b.radius < this.paddle.x + this.paddle.width
      ) {
        // Adjust bounce angle depending on where it hits the paddle
        const hitX = b.x - (this.paddle.x + this.paddle.width / 2);
        const ratio = hitX / (this.paddle.width / 2);
        b.vx = ratio * 5; // horizontal spin
        b.vy = -Math.sqrt(BALL_SPEED*BALL_SPEED - b.vx*b.vx); // conserve speed
        b.y = PADDLE_Y - b.radius;
        breakerAudio.playBounce('paddle');
      }

      // Brick Collisions
      this.checkBallBricksCollision(b);
    }

    // 2. Check no balls left
    if (this.balls.length === 0) {
      this.damagePlayerLife();
    }

    // 3. Move and update lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.y -= 8;
      
      let hitsBrick = false;
      for (let j = this.bricks.length - 1; j >= 0; j--) {
        const br = this.bricks[j];
        if (l.x > br.x && l.x < br.x + br.w && l.y > br.y && l.y < br.y + br.h) {
          this.lasers.splice(i, 1);
          hitsBrick = true;
          this.damageBrick(br, j);
          break;
        }
      }
      if (!hitsBrick && l.y < 0) this.lasers.splice(i, 1);
    }

    // 4. Move and update powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i];
      pu.y += 2.5;
      
      // Collide with paddle
      if (
        pu.y + pu.size > PADDLE_Y && pu.y < PADDLE_Y + PADDLE_H &&
        pu.x + pu.size > this.paddle.x && pu.x < this.paddle.x + this.paddle.width
      ) {
        this.powerups.splice(i, 1);
        this.applyPowerup(pu.type);
        continue;
      }
      if (pu.y > CANVAS_HEIGHT) this.powerups.splice(i, 1);
    }

    // 5. Update Paddle shooting if active
    if (this.paddle.laserActive) {
      if (Date.now() > this.paddle.maxLaserTime) {
        this.paddle.laserActive = false;
      } else if (Math.random() < 0.05) {
        breakerAudio.playLaser();
        this.lasers.push({ x: this.paddle.x + 10, y: PADDLE_Y - 5 });
        this.lasers.push({ x: this.paddle.x + this.paddle.width - 10, y: PADDLE_Y - 5 });
      }
    }

    // 6. Win check (all breakable bricks destroyed)
    const breakablesRemaining = this.bricks.some(b => b.type !== 'portal'); // all standard/explosive/armored
    if (!breakablesRemaining) {
      this.handleLevelWin();
    }

    // 7. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  checkBallBricksCollision(ball) {
    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const br = this.bricks[i];
      
      // Find closest point on brick to ball
      const closestX = Math.max(br.x, Math.min(ball.x, br.x + br.w));
      const closestY = Math.max(br.y, Math.min(ball.y, br.y + br.h));
      
      const dist = Math.hypot(ball.x - closestX, ball.y - closestY);
      
      if (dist < ball.radius) {
        // Reflect physics bounce velocity depending on hit face
        const buffer = 4;
        if (ball.x < br.x + buffer || ball.x > br.x + br.w - buffer) {
          ball.vx = -ball.vx;
        } else {
          ball.vy = -ball.vy;
        }
        
        this.damageBrick(br, i);
        break;
      }
    }
  }

  damageBrick(brick, idx) {
    brick.hp--;
    breakerAudio.playBrickHit(brick.hp);
    
    if (brick.hp <= 0) {
      this.bricks.splice(idx, 1);
      this.score += brick.maxHp * 150;
      document.getElementById('breaker-hud-score').textContent = this.score;

      this.spawnBrickExplode(brick.x + brick.w/2, brick.y + brick.h/2, brick.type);
      this.rollPowerup(brick.x + brick.w/2, brick.y + brick.h/2);

      // Handle explosive radius chains
      if (brick.type === 'explosive') {
        breakerAudio.playExplosion();
        const rad = 90;
        
        // Loop back to destroy neighboring bricks
        for (let k = this.bricks.length - 1; k >= 0; k--) {
          const checkB = this.bricks[k];
          const dist = Math.hypot(checkB.x + checkB.w/2 - (brick.x + brick.w/2), checkB.y + checkB.h/2 - (brick.y + brick.h/2));
          if (dist < rad) {
            this.damageBrick(checkB, k);
          }
        }
      }
    }
  }

  applyPowerup(type) {
    breakerAudio.playPowerup();
    if (type === 'multiball') {
      // Spawn two new balls
      if (this.balls.length > 0) {
        const b = this.balls[0];
        this.balls.push({ x: b.x, y: b.y, vx: -b.vx - 1, vy: -b.vy, radius: 9 });
        this.balls.push({ x: b.x, y: b.y, vx: b.vx + 1, vy: b.vy - 0.5, radius: 9 });
      } else {
        this.balls.push({ x: CANVAS_WIDTH/2, y: PADDLE_Y-11, vx: 2, vy: -BALL_SPEED, radius: 9 });
      }
    } else if (type === 'laser') {
      this.paddle.laserActive = true;
      this.paddle.maxLaserTime = Date.now() + 5000; // 5 seconds of blasters
    } else if (type === 'shield') {
      this.shieldActive = true;
    }
  }

  rollPowerup(x, y) {
    if (Math.random() < 0.18) {
      const types = ['multiball', 'laser', 'shield'];
      const pick = types[Math.floor(Math.random() * types.length)];
      this.powerups.push({ x: x - 10, y, size: 20, type: pick });
    }
  }

  damagePlayerLife() {
    this.lives--;
    document.getElementById('breaker-hud-lives').textContent = this.lives;
    breakerAudio.playFail();

    if (this.lives <= 0) {
      this.handleGameOver();
    } else {
      // Respawn resting ball
      this.balls = [{
        x: this.paddle.x + this.paddle.width / 2,
        y: PADDLE_Y - 11,
        vx: 3,
        vy: -BALL_SPEED,
        radius: 9,
        attached: true
      }];
    }
  }

  handleLevelWin() {
    this.gameState = 'complete';
    breakerAudio.playWin();
    
    // Save completion
    if (!this.completedLevels.includes(this.levelIdx)) {
      this.completedLevels.push(this.levelIdx);
      localStorage.setItem('breaker_completed', JSON.stringify(this.completedLevels));
    }
    
    // Unlock next sector
    if (this.levelIdx + 1 === this.unlockedLevels && this.unlockedLevels < 20) {
      this.unlockedLevels++;
      localStorage.setItem('breaker_unlocked', this.unlockedLevels.toString());
    }

    document.getElementById('breaker-complete-desc').textContent = `Sector Score: ${this.score}. Shield shattered successfully!`;
    this.showScreen('breaker-complete-screen');
  }

  handleGameOver() {
    this.gameState = 'failed';
    this.showScreen('breaker-failed-screen');
  }

  // --- PARTICLES ---
  spawnBrickExplode(x, y, type) {
    const col = type === 'explosive' ? '#f43f5e' : (type === 'armored' ? '#fbbf24' : '#ec4899');
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: col,
        life: 1.0
      });
    }
  }

  // --- CANVAS DRAWING ---
  draw() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid wires
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.01)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, CANVAS_HEIGHT);
      this.ctx.stroke();
    }

    // Draw Bricks
    this.bricks.forEach(b => {
      this.drawBrick(b);
    });

    // Draw Safety Shield bottom line
    if (this.shieldActive) {
      this.ctx.save();
      this.ctx.strokeStyle = '#10b981';
      this.ctx.shadowColor = '#10b981';
      this.ctx.shadowBlur = 10;
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(0, CANVAS_HEIGHT - 30);
      this.ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 30);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Draw lasers bullets
    this.ctx.fillStyle = '#f43f5e';
    this.lasers.forEach(l => {
      this.ctx.fillRect(l.x - 2, l.y, 4, 12);
    });

    // Draw falling powerups
    this.powerups.forEach(pu => {
      this.ctx.save();
      this.ctx.fillStyle = pu.type === 'multiball' ? '#06b6d4' : (pu.type === 'laser' ? '#f43f5e' : '#10b981');
      this.ctx.shadowColor = this.ctx.fillStyle;
      this.ctx.shadowBlur = 10;
      this.ctx.fillRect(pu.x, pu.y, pu.size, pu.size);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 11px Outfit';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(pu.type[0].toUpperCase(), pu.x + pu.size/2, pu.y + pu.size/2);
      this.ctx.restore();
    });

    // Draw Paddle
    this.drawPaddle();

    // Draw Balls
    this.balls.forEach(b => {
      this.drawBall(b);
    });

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

  drawPaddle() {
    this.ctx.save();
    
    // Paddle glow theme based on active weapon
    const color = this.paddle.laserActive ? '#f43f5e' : '#ec4899';
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 12;

    const grad = this.ctx.createLinearGradient(this.paddle.x, PADDLE_Y, this.paddle.x, PADDLE_Y + PADDLE_H);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, color);
    grad.addColorStop(1, '#881337');
    this.ctx.fillStyle = grad;
    
    // Standard paddle bar
    this.ctx.fillRect(this.paddle.x, PADDLE_Y, this.paddle.width, PADDLE_H);

    // If lasers active, draw shooter nozzles
    if (this.paddle.laserActive) {
      this.ctx.fillStyle = '#f43f5e';
      this.ctx.fillRect(this.paddle.x + 5, PADDLE_Y - 4, 8, 4);
      this.ctx.fillRect(this.paddle.x + this.paddle.width - 13, PADDLE_Y - 4, 8, 4);
    }
    
    this.ctx.restore();
  }

  drawBall(b) {
    this.ctx.save();
    this.ctx.shadowColor = '#06b6d4';
    this.ctx.shadowBlur = 10;
    
    const grad = this.ctx.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, b.radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.6, '#06b6d4');
    grad.addColorStop(1, '#0891b2');
    this.ctx.fillStyle = grad;
    
    this.ctx.beginPath();
    this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawBrick(br) {
    this.ctx.save();
    
    let mainColor = '#db2777'; // magenta default
    let strokeColor = '#f472b6';
    
    if (brickTypes[br.type]) {
      mainColor = brickTypes[br.type].main;
      strokeColor = brickTypes[br.type].stroke;
    }
    
    this.ctx.shadowColor = strokeColor;
    this.ctx.shadowBlur = 6;
    
    const grad = this.ctx.createLinearGradient(br.x, br.y, br.x, br.y + br.h);
    grad.addColorStop(0, strokeColor);
    grad.addColorStop(1, mainColor);
    
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(br.x, br.y, br.w, br.h);
    
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(br.x, br.y, br.w, br.h);

    // Show cracks if armored is damaged
    if (br.type === 'armored' && br.hp === 1) {
      this.ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      this.ctx.beginPath();
      this.ctx.moveTo(br.x + br.w/4, br.y + 2);
      this.ctx.lineTo(br.x + br.w/2, br.y + br.h - 2);
      this.ctx.lineTo(br.x + 3*br.w/4, br.y + 2);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  // --- MAIN LOOP ---
  gameLoop() {
    if (this.gameState === 'playing') {
      this.updatePhysics();
    }
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

const brickTypes = {
  standard: { main: '#881337', stroke: '#ec4899' },
  armored: { main: '#78350f', stroke: '#fbbf24' },
  explosive: { main: '#7f1d1d', stroke: '#ef4444' }
};

window.addEventListener('DOMContentLoaded', () => {
  new BreakerGame();
});
