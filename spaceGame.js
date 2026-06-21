// NEBULA INVADERS - Game Logic

class SpaceAudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playLaser() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playExplosion(isBoss = false) {
    if (this.muted) return;
    this.init();
    const duration = isBoss ? 0.8 : 0.35;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isBoss ? 80 : 130, now);
    osc.frequency.linearRampToValueAtTime(30, now + duration);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
    
    // Low frequency crunch noise
    this.playNoise(duration, 0.25, isBoss ? 150 : 250);
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

  playHit() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.setValueAtTime(100, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playPowerup() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const freqs = [261.63, 329.63, 392.00, 523.25, 783.99]; // ascending arpeggio
    
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.06);
      
      gain.gain.setValueAtTime(0.08, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
      
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.15);
    });
  }

  playWin() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.1);
      gain.gain.setValueAtTime(0.1, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }

  playGameOver() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const freqs = [300, 220, 150, 100];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + i * 0.15);
      gain.gain.setValueAtTime(0.1, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.4);
    });
  }
}

const spaceAudio = new SpaceAudioManager();

class SpaceGame {
  constructor() {
    this.canvas = document.getElementById('spaceCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.width = 960;
    this.height = 600;
    
    this.gameState = 'menu'; // menu, playing, complete, gameover
    this.stage = 1;
    this.score = 0;
    
    // Player ship properties
    this.player = {
      x: this.width / 2,
      y: this.height - 80,
      width: 45,
      height: 45,
      speed: 7,
      maxShield: 100,
      shield: 100,
      blasterLevel: 1,
      lastShotTime: 0,
      shootCooldown: 220
    };

    // Lists
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.enemies = [];
    this.particles = [];
    this.powerups = [];
    this.stars = [];
    this.keys = {};

    this.boss = null;
    
    this.initStars();
    this.registerEvents();
    this.initUI();
    this.gameLoop();
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.5
      });
    }
  }

  initUI() {
    document.getElementById('space-btn-play').addEventListener('click', () => {
      spaceAudio.init();
      this.startStage(1);
    });

    document.getElementById('space-hud-btn-restart').addEventListener('click', () => this.startStage(this.stage));
    document.getElementById('space-hud-btn-home').addEventListener('click', () => {
      this.gameState = 'menu';
      this.showScreen('space-start-screen');
      document.getElementById('space-hud').classList.add('hidden');
    });

    const muteBtn = document.getElementById('space-hud-btn-mute');
    muteBtn.addEventListener('click', () => {
      spaceAudio.muted = !spaceAudio.muted;
      muteBtn.textContent = spaceAudio.muted ? '🔇' : '🔊';
    });

    document.getElementById('space-btn-next-level').addEventListener('click', () => {
      if (this.stage < 20) {
        this.startStage(this.stage + 1);
      } else {
        this.gameState = 'menu';
        this.showScreen('space-start-screen');
        document.getElementById('space-hud').classList.add('hidden');
      }
    });

    document.getElementById('space-btn-restart-win').addEventListener('click', () => this.startStage(this.stage));
    document.getElementById('space-btn-restart-fail').addEventListener('click', () => this.startStage(this.stage));
    
    document.getElementById('space-btn-menu-win').addEventListener('click', () => {
      this.gameState = 'menu';
      this.showScreen('space-start-screen');
      document.getElementById('space-hud').classList.add('hidden');
    });
    
    document.getElementById('space-btn-menu-fail').addEventListener('click', () => {
      this.gameState = 'menu';
      this.showScreen('space-start-screen');
      document.getElementById('space-hud').classList.add('hidden');
    });
  }

  showScreen(screenId) {
    document.querySelectorAll('.space-overlay').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
  }

  startStage(stageNum) {
    try {
      const container = document.getElementById('space-game-container');
      if (container) {
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
      }
    } catch(e) {}
    this.stage = stageNum;
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.enemies = [];
    this.particles = [];
    this.powerups = [];
    this.boss = null;
    
    // Reset player shield slightly on new stage
    this.player.shield = Math.min(this.player.maxShield, this.player.shield + 40);
    this.player.x = this.width / 2;

    // Build enemies based on stage
    const isBossStage = (stageNum % 5 === 0);
    if (isBossStage) {
      this.spawnBoss(stageNum);
    } else {
      this.spawnEnemyGrid(stageNum);
    }

    // Update HUD
    document.getElementById('space-hud-level-num').textContent = this.stage;
    document.getElementById('space-hud-score').textContent = this.score;
    this.updateShieldBar();
    document.getElementById('space-hud').classList.remove('hidden');

    this.showScreen('space-dummy-screen');
    this.gameState = 'playing';
  }

  spawnEnemyGrid(stage) {
    const rows = Math.min(5, 2 + Math.floor(stage / 4));
    const cols = 8;
    const startX = 120;
    const startY = 80;
    const spacingX = 90;
    const spacingY = 50;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Higher stage introduces armored and fast aliens
        let type = 'green';
        let hp = 1;
        if (r === 0 && stage > 4) {
          type = 'red';
          hp = 3;
        } else if (r <= 2 && stage > 8) {
          type = 'yellow';
          hp = 2;
        }

        this.enemies.push({
          x: startX + c * spacingX,
          y: startY + r * spacingY,
          width: 40,
          height: 30,
          type: type,
          hp: hp,
          maxHp: hp,
          direction: 1,
          speed: 1 + (stage * 0.1),
          descendProgress: 0,
          shootCooldown: Math.random() * 3000 + 1000
        });
      }
    }
  }

  spawnBoss(stage) {
    this.boss = {
      x: this.width / 2 - 80,
      y: 80,
      width: 160,
      height: 90,
      maxHp: 20 + stage * 10,
      hp: 20 + stage * 10,
      speed: 2 + stage * 0.1,
      direction: 1,
      lastShotTime: 0,
      shootCooldown: 800
    };
  }

  registerEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // Touch and drag support for mobile
    let touchStartX = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        spaceAudio.init();
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0 && this.gameState === 'playing') {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const diff = touchX - touchStartX;
        this.player.x += diff * 1.5;
        this.player.x = Math.max(20, Math.min(this.width - 20 - this.player.width, this.player.x));
        touchStartX = touchX;
      }
    }, { passive: false });
  }

  firePlayerLaser() {
    const now = Date.now();
    if (now - this.player.lastShotTime > this.player.shootCooldown) {
      spaceAudio.playLaser();
      this.player.lastShotTime = now;

      const py = this.player.y;
      const px = this.player.x + this.player.width / 2;

      if (this.player.blasterLevel === 1) {
        this.projectiles.push({ x: px, y: py - 10, vx: 0, vy: -10, power: 1 });
      } else if (this.player.blasterLevel === 2) {
        this.projectiles.push({ x: px - 12, y: py, vx: 0, vy: -10, power: 1 });
        this.projectiles.push({ x: px + 12, y: py, vx: 0, vy: -10, power: 1 });
      } else {
        // Triple Shot
        this.projectiles.push({ x: px, y: py - 10, vx: 0, vy: -10, power: 1 });
        this.projectiles.push({ x: px - 16, y: py, vx: -2, vy: -9, power: 1 });
        this.projectiles.push({ x: px + 16, y: py, vx: 2, vy: -9, power: 1 });
      }
    }
  }

  // --- ENGINE ---
  update() {
    if (this.gameState !== 'playing') return;

    // Star animation
    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > this.height) {
        s.y = 0;
        s.x = Math.random() * this.width;
      }
    });

    // Keyboard movement
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      this.player.x -= this.player.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      this.player.x += this.player.speed;
    }
    this.player.x = Math.max(20, Math.min(this.width - 20 - this.player.width, this.player.x));

    // Auto-fire or key-fire
    if (this.keys[' '] || this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] || true) {
      // By default, auto fire helps on web/touch
      this.firePlayerLaser();
    }

    // Move player projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) this.projectiles.splice(i, 1);
    }

    // Move enemy projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.y += ep.vy;
      // Collision with player
      if (
        ep.x > this.player.x && ep.x < this.player.x + this.player.width &&
        ep.y > this.player.y && ep.y < this.player.y + this.player.height
      ) {
        this.enemyProjectiles.splice(i, 1);
        this.damagePlayer(15);
        continue;
      }
      if (ep.y > this.height + 10) this.enemyProjectiles.splice(i, 1);
    }

    // Move powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i];
      pu.y += 2.5;
      // Collide with player
      if (
        pu.x + pu.size > this.player.x && pu.x < this.player.x + this.player.width &&
        pu.y + pu.size > this.player.y && pu.y < this.player.y + this.player.height
      ) {
        this.powerups.splice(i, 1);
        this.applyPowerup(pu.type);
        continue;
      }
      if (pu.y > this.height) this.powerups.splice(i, 1);
    }

    // Move standard enemies
    let descendAll = false;
    this.enemies.forEach(e => {
      e.x += e.speed * e.direction;
      if (e.x < 20 || e.x > this.width - 20 - e.width) {
        descendAll = true;
      }

      // Enemy fire
      e.shootCooldown -= 16.6; // ~60fps frame delta
      if (e.shootCooldown <= 0) {
        e.shootCooldown = Math.random() * 4000 + 2000;
        this.enemyProjectiles.push({
          x: e.x + e.width / 2,
          y: e.y + e.height,
          vy: 4 + (this.stage * 0.15)
        });
      }
    });

    if (descendAll) {
      this.enemies.forEach(e => {
        e.direction *= -1;
        e.y += 20;
        // Reach bottom
        if (e.y > this.player.y - 20) {
          this.damagePlayer(100); // Game Over
        }
      });
    }

    // Update Boss state
    if (this.boss) {
      this.boss.x += this.boss.speed * this.boss.direction;
      if (this.boss.x < 30 || this.boss.x > this.width - 30 - this.boss.width) {
        this.boss.direction *= -1;
      }

      // Boss weapon routines
      const now = Date.now();
      if (now - this.boss.lastShotTime > this.boss.shootCooldown) {
        this.boss.lastShotTime = now;
        // Radial 3-way burst
        this.enemyProjectiles.push({ x: this.boss.x + this.boss.width / 2, y: this.boss.y + this.boss.height, vy: 5 });
        this.enemyProjectiles.push({ x: this.boss.x + this.boss.width / 2 - 30, y: this.boss.y + this.boss.height, vy: 4.8 });
        this.enemyProjectiles.push({ x: this.boss.x + this.boss.width / 2 + 30, y: this.boss.y + this.boss.height, vy: 4.8 });
      }
    }

    // Hit registration (player lasers vs enemies)
    for (let pIdx = this.projectiles.length - 1; pIdx >= 0; pIdx--) {
      const proj = this.projectiles[pIdx];
      let projectileRemoved = false;

      // Check boss hit
      if (this.boss) {
        if (
          proj.x > this.boss.x && proj.x < this.boss.x + this.boss.width &&
          proj.y > this.boss.y && proj.y < this.boss.y + this.boss.height
        ) {
          this.projectiles.splice(pIdx, 1);
          this.boss.hp -= proj.power;
          spaceAudio.playHit();
          this.spawnDebris(proj.x, proj.y, '#f43f5e', 5);
          
          if (this.boss.hp <= 0) {
            this.triggerBossExplode();
          }
          continue;
        }
      }

      // Check grid enemy hits
      for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
        const enemy = this.enemies[eIdx];
        if (
          proj.x > enemy.x && proj.x < enemy.x + enemy.width &&
          proj.y > enemy.y && proj.y < enemy.y + enemy.height
        ) {
          this.projectiles.splice(pIdx, 1);
          projectileRemoved = true;
          enemy.hp -= proj.power;
          spaceAudio.playHit();
          this.spawnDebris(proj.x, proj.y, '#22c55e', 4);

          if (enemy.hp <= 0) {
            this.enemies.splice(eIdx, 1);
            this.score += enemy.maxHp * 100;
            document.getElementById('space-hud-score').textContent = this.score;
            spaceAudio.playExplosion(false);
            this.spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.type);
            this.rollPowerup(enemy.x, enemy.y);
          }
          break;
        }
      }
    }

    // Check Win Stage
    if (this.enemies.length === 0 && !this.boss) {
      this.handleStageComplete();
    }

    // Particles updating
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.035;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  damagePlayer(amount) {
    this.player.shield -= amount;
    this.updateShieldBar();
    spaceAudio.playHit();
    
    // Add red damage flash or screen shake
    const c = document.getElementById('space-game-container');
    c.classList.add('shake');
    setTimeout(() => c.classList.remove('shake'), 200);

    if (this.player.shield <= 0) {
      this.player.shield = 0;
      this.handleGameOver();
    }
  }

  applyPowerup(type) {
    spaceAudio.playPowerup();
    if (type === 'shield') {
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + 35);
      this.updateShieldBar();
    } else if (type === 'weapon') {
      this.player.blasterLevel = Math.min(3, this.player.blasterLevel + 1);
    }
  }

  rollPowerup(x, y) {
    if (Math.random() < 0.15) {
      const type = Math.random() > 0.6 ? 'weapon' : 'shield';
      this.powerups.push({ x, y, size: 20, type });
    }
  }

  updateShieldBar() {
    const shieldPercent = (this.player.shield / this.player.maxShield) * 100;
    document.getElementById('space-hud-shield-fill').style.width = `${shieldPercent}%`;
  }

  triggerBossExplode() {
    this.score += 5000;
    document.getElementById('space-hud-score').textContent = this.score;
    spaceAudio.playExplosion(true);
    this.spawnExplosion(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2, 'boss');
    this.boss = null;
  }

  handleStageComplete() {
    this.gameState = 'complete';
    spaceAudio.playWin();
    document.getElementById('space-complete-desc').textContent = `Stage score: ${this.score}. Superb shooting, Captain!`;
    this.showScreen('space-complete-screen');
  }

  handleGameOver() {
    this.gameState = 'gameover';
    spaceAudio.playGameOver();
    this.showScreen('space-failed-screen');
  }

  // --- PARTICLES ---
  spawnDebris(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        life: 1.0
      });
    }
  }

  spawnExplosion(x, y, type) {
    const isBoss = (type === 'boss');
    const color = type === 'red' ? '#ef4444' : (type === 'yellow' ? '#f59e0b' : '#10b981');
    const count = isBoss ? 60 : 25;
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isBoss ? 8 : 5) + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * (isBoss ? 15 : 8) + 3,
        color: Math.random() > 0.4 ? color : '#fb7185',
        life: 1.0
      });
    }
  }

  // --- DRAWING ---
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Stars
    this.ctx.fillStyle = '#ffffff';
    this.stars.forEach(s => {
      this.ctx.globalAlpha = s.speed / 2.5;
      this.ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    this.ctx.globalAlpha = 1.0;

    // Draw Player Ship
    this.drawPlayer();

    // Draw Projectiles
    this.ctx.fillStyle = '#67e8f9'; // cyan player lasers
    this.projectiles.forEach(p => {
      this.ctx.fillRect(p.x - 2, p.y, 4, 15);
    });

    // Draw Enemy Projectiles
    this.ctx.fillStyle = '#f43f5e'; // red enemy lasers
    this.enemyProjectiles.forEach(ep => {
      this.ctx.fillRect(ep.x - 2.5, ep.y, 5, 12);
    });

    // Draw Powerups
    this.powerups.forEach(pu => {
      this.ctx.save();
      this.ctx.fillStyle = pu.type === 'shield' ? '#10b981' : '#f59e0b';
      this.ctx.shadowColor = this.ctx.fillStyle;
      this.ctx.shadowBlur = 10;
      this.ctx.fillRect(pu.x, pu.y, pu.size, pu.size);
      
      // text sign
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 12px Outfit';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(pu.type === 'shield' ? 'S' : 'W', pu.x + pu.size/2, pu.y + pu.size/2);
      this.ctx.restore();
    });

    // Draw standard enemies
    this.enemies.forEach(e => {
      this.drawEnemy(e);
    });

    // Draw Boss
    if (this.boss) {
      this.drawBoss();
    }

    // Draw explosion/sparks particles
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

  drawPlayer() {
    this.ctx.save();
    
    // Draw modern vector triangle ship
    const px = this.player.x;
    const py = this.player.y;
    const pw = this.player.width;
    const ph = this.player.height;

    this.ctx.shadowColor = '#06b6d4';
    this.ctx.shadowBlur = 12;

    // Glowing cyan theme
    const shipGrad = this.ctx.createLinearGradient(px, py, px, py + ph);
    shipGrad.addColorStop(0, '#67e8f9');
    shipGrad.addColorStop(1, '#0891b2');
    this.ctx.fillStyle = shipGrad;

    this.ctx.beginPath();
    this.ctx.moveTo(px + pw / 2, py); // top tip
    this.ctx.lineTo(px + pw, py + ph); // bottom right
    this.ctx.lineTo(px + pw * 0.8, py + ph * 0.8); // dent right
    this.ctx.lineTo(px + pw * 0.2, py + ph * 0.8); // dent left
    this.ctx.lineTo(px, py + ph); // bottom left
    this.ctx.closePath();
    this.ctx.fill();

    // Thrust particles/flicker
    if (this.gameState === 'playing') {
      const flareGrad = this.ctx.createLinearGradient(px + pw/2, py + ph*0.8, px + pw/2, py + ph + 15);
      flareGrad.addColorStop(0, '#f97316');
      flareGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      this.ctx.fillStyle = flareGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(px + pw*0.35, py + ph*0.8);
      this.ctx.lineTo(px + pw*0.65, py + ph*0.8);
      this.ctx.lineTo(px + pw/2, py + ph + 10 + Math.random()*8);
      this.ctx.closePath();
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawEnemy(e) {
    this.ctx.save();
    let col = '#22c55e'; // Green standard
    if (e.type === 'red') col = '#ef4444';
    else if (e.type === 'yellow') col = '#eab308';

    this.ctx.shadowColor = col;
    this.ctx.shadowBlur = 8;
    this.ctx.fillStyle = col;

    const ex = e.x;
    const ey = e.y;
    const ew = e.width;
    const eh = e.height;

    // Draw stylized insectoid/alien invader
    this.ctx.beginPath();
    this.ctx.moveTo(ex + ew*0.2, ey);
    this.ctx.lineTo(ex + ew*0.8, ey);
    this.ctx.lineTo(ex + ew, ey + eh*0.6);
    this.ctx.lineTo(ex + ew*0.7, ey + eh);
    this.ctx.lineTo(ex + ew*0.5, ey + eh*0.7); // belly dent
    this.ctx.lineTo(ex + ew*0.3, ey + eh);
    this.ctx.lineTo(ex, ey + eh*0.6);
    this.ctx.closePath();
    this.ctx.fill();

    // Glowing eyes
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(ex + ew*0.3, ey + eh*0.2, 3, 3);
    this.ctx.fillRect(ex + ew*0.65, ey + eh*0.2, 3, 3);

    this.ctx.restore();
  }

  drawBoss() {
    this.ctx.save();
    this.ctx.shadowColor = '#ec4899'; // boss pink glow
    this.ctx.shadowBlur = 20;

    const bx = this.boss.x;
    const by = this.boss.y;
    const bw = this.boss.width;
    const bh = this.boss.height;

    const bGrad = this.ctx.createLinearGradient(bx, by, bx, by + bh);
    bGrad.addColorStop(0, '#f472b6');
    bGrad.addColorStop(0.5, '#db2777');
    bGrad.addColorStop(1, '#9d174d');
    this.ctx.fillStyle = bGrad;

    // Giant skull/ufo ship shape
    this.ctx.beginPath();
    this.ctx.moveTo(bx + bw*0.3, by);
    this.ctx.lineTo(bx + bw*0.7, by);
    this.ctx.bezierCurveTo(bx + bw, by + bh*0.2, bx + bw, by + bh*0.8, bx + bw*0.8, by + bh);
    this.ctx.lineTo(bx + bw*0.2, by + bh);
    this.ctx.bezierCurveTo(bx, by + bh*0.8, bx, by + bh*0.2, bx + bw*0.3, by);
    this.ctx.closePath();
    this.ctx.fill();

    // Boss Core/Eye
    this.ctx.fillStyle = '#06b6d4';
    this.ctx.beginPath();
    this.ctx.arc(bx + bw/2, by + bh*0.45, 16 + Math.sin(Date.now()*0.005)*3, 0, Math.PI*2);
    this.ctx.fill();

    // Boss HP bar top overlay
    const barWidth = bw;
    const hpRatio = this.boss.hp / this.boss.maxHp;
    this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this.ctx.fillRect(bx, by - 20, barWidth, 6);
    this.ctx.fillStyle = '#ec4899';
    this.ctx.fillRect(bx, by - 20, barWidth * hpRatio, 6);

    this.ctx.restore();
  }

  // --- GAME LOOP ---
  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
  new SpaceGame();
});
