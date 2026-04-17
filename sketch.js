let gameState = "playing";
let score = 0;

// --- Audio ---
let shootOsc;
let shootEnv;
let laughOsc;
let laughEnv;
let jumpOsc;
let jumpEnv;

const platforms = [
  { x: 0,   y: 460, w: 800, h: 20 },  // ground
  { x: 80,  y: 340, w: 160, h: 16 },  // low-left
  { x: 560, y: 340, w: 160, h: 16 },  // low-right
  { x: 280, y: 230, w: 180, h: 16 },  // mid-centre
  { x: 100, y: 130, w: 140, h: 16 },  // high-left
];

const GRAVITY = 0.5;
const PLAYER_SPEED = 4;
const JUMP_FORCE = -10;
const BULLET_SPEED = 8;

const bullets = [];

const ENEMY_W = 28;
const ENEMY_H = 36;
const ENEMY_SPEED = 1.5;

const enemies = [
  { x: 200, y: platforms[0].y - ENEMY_H, vx: ENEMY_SPEED, vy: 0, w: ENEMY_W, h: ENEMY_H, platformIndex: 0, onGround: false },
  { x: 100, y: platforms[1].y - ENEMY_H, vx: ENEMY_SPEED, vy: 0, w: ENEMY_W, h: ENEMY_H, platformIndex: 1, onGround: false },
  { x: 580, y: platforms[2].y - ENEMY_H, vx: -ENEMY_SPEED, vy: 0, w: ENEMY_W, h: ENEMY_H, platformIndex: 2, onGround: false },
  { x: 310, y: platforms[3].y - ENEMY_H, vx: ENEMY_SPEED, vy: 0, w: ENEMY_W, h: ENEMY_H, platformIndex: 3, onGround: false },
];

const TOP_PLATFORM = platforms[4]; // high-left: x:100, y:130, w:140

const player = {
  w: 32,
  h: 40,
  x: TOP_PLATFORM.x + (TOP_PLATFORM.w - 32) / 2,
  y: TOP_PLATFORM.y - 40,
  vx: 0,
  vy: 0,
  facingRight: true,
  onGround: false,
};

function applyGravity(entity) {
  entity.vy += GRAVITY;
  entity.y += entity.vy;
}

function collidePlatforms(entity, platforms) {
  entity.onGround = false;
  for (let p of platforms) {
    let overlapX = entity.x < p.x + p.w && entity.x + entity.w > p.x;
    let entityBottom = entity.y + entity.h;
    let prevEntityBottom = entityBottom - entity.vy;
    if (overlapX && entity.vy >= 0 && prevEntityBottom <= p.y && entityBottom >= p.y) {
      entity.y = p.y - entity.h;
      entity.vy = 0;
      entity.onGround = true;
    }
  }
}

function setup() {
  let canvas = createCanvas(800, 500);
  canvas.parent("canvas-container");

  // Shoot sound — short irritating high-pitched square-wave beep
  shootOsc = new p5.Oscillator('square');
  shootOsc.freq(1800);
  shootOsc.amp(0);
  shootOsc.start();

  shootEnv = new p5.Envelope();
  shootEnv.setADSR(0.001, 0.08, 0.0, 0.01);
  shootEnv.setRange(0.4, 0);

  // Creepy laugh sound — sawtooth for a harsh descending glide
  laughOsc = new p5.Oscillator('sawtooth');
  laughOsc.freq(600);
  laughOsc.amp(0);
  laughOsc.start();

  laughEnv = new p5.Envelope();
  laughEnv.setADSR(0.01, 0.5, 0.0, 0.05);
  laughEnv.setRange(0.45, 0);

  // Jump sound — short ascending sine-wave tone
  jumpOsc = new p5.Oscillator('sine');
  jumpOsc.freq(300);
  jumpOsc.amp(0);
  jumpOsc.start();

  jumpEnv = new p5.Envelope();
  jumpEnv.setADSR(0.005, 0.15, 0.0, 0.02);
  jumpEnv.setRange(0.35, 0);
}

function playShootSound() {
  if (getAudioContext().state !== 'running') return;
  shootEnv.play(shootOsc);
}

function playCreepyLaugh() {
  if (getAudioContext().state !== 'running') return;
  laughOsc.freq(600, 0, 0);   // snap to 600 Hz immediately
  laughOsc.freq(100, 0.5, 0); // glide down to 100 Hz over 0.5 s
  laughEnv.play(laughOsc);
}

function playJumpSound() {
  if (getAudioContext().state !== 'running') return;
  jumpOsc.freq(300, 0, 0);    // snap to 300 Hz immediately
  jumpOsc.freq(700, 0.15, 0); // glide up to 700 Hz over 0.15 s
  jumpEnv.play(jumpOsc);
}

function draw() {
  background(30);

  if (gameState === "playing") {
    // Horizontal movement
    player.vx = 0;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // LEFT or A
      player.vx = -PLAYER_SPEED;
      player.facingRight = false;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // RIGHT or D
      player.vx = PLAYER_SPEED;
      player.facingRight = true;
    }
    player.x += player.vx;
    player.x = constrain(player.x, 0, width - player.w);

    applyGravity(player);
    collidePlatforms(player, platforms);

    if (player.y > height) {
      gameState = "dead";
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].x += bullets[i].vx;
      if (bullets[i].x < 0 || bullets[i].x > width) {
        bullets.splice(i, 1);
      }
    }

    for (let e of enemies) {
      let p = platforms[e.platformIndex];
      e.x += e.vx;
      if (e.x <= p.x) {
        e.x = p.x;
        e.vx = Math.abs(e.vx);
      } else if (e.x + e.w >= p.x + p.w) {
        e.x = p.x + p.w - e.w;
        e.vx = -Math.abs(e.vx);
      }
      applyGravity(e);
      collidePlatforms(e, platforms);
    }

    // Bullet–enemy AABB collision
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      let b = bullets[bi];
      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        let e = enemies[ei];
        let hit = b.x + 4 > e.x && b.x - 4 < e.x + e.w &&
                  b.y + 4 > e.y && b.y - 4 < e.y + e.h;
        if (hit) {
          bullets.splice(bi, 1);
          enemies.splice(ei, 1);
          score++;
          playCreepyLaugh();
          break;
        }
      }
    }

    if (enemies.length === 0) {
      gameState = "win";
    }
  }

  fill(80, 160, 80);
  noStroke();
  for (let p of platforms) {
    rect(p.x, p.y, p.w, p.h);
  }

  // Draw bullets as small bright-coloured circles
  noStroke();
  fill(255, 220, 0);
  for (let b of bullets) {
    circle(b.x, b.y, 8);
  }

  for (let e of enemies) {
    drawEnemy(e);
  }

  drawPlayer();

  // Score display
  fill(255);
  noStroke();
  textSize(18);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 12, 10);

  // Game Over overlay
  if (gameState === "dead") {
    fill(0, 0, 0, 160);
    noStroke();
    rect(0, 0, width, height);
    fill(255, 60, 60);
    textSize(52);
    textAlign(CENTER, CENTER);
    text("GAME OVER 🤡", width / 2, height / 2 - 30);
    fill(220);
    textSize(24);
    text("Press R to restart", width / 2, height / 2 + 36);
  }

  // You Win overlay
  if (gameState === "win") {
    fill(0, 0, 0, 160);
    noStroke();
    rect(0, 0, width, height);
    fill(80, 220, 80);
    textSize(52);
    textAlign(CENTER, CENTER);
    text("YOU WIN 🎉", width / 2, height / 2 - 30);
    fill(220);
    textSize(24);
    text("Press R to restart", width / 2, height / 2 + 36);
  }
}

function drawEnemy(e) {
  let cx = e.x + e.w / 2;
  let headCY = e.y + 13;

  push();
  noStroke();

  // Ruffled collar — orange/red ruffle
  fill(255, 100, 0);
  arc(cx - 8,  e.y + 28, 16, 12, PI, TWO_PI, CHORD);
  arc(cx + 1,  e.y + 28, 16, 12, PI, TWO_PI, CHORD);
  arc(cx + 8,  e.y + 28, 16, 12, PI, TWO_PI, CHORD);

  // Head circle
  fill(255, 220, 180);
  circle(cx, headCY, 24);

  // Hat (green triangle — distinct from player's purple)
  fill(30, 160, 30);
  triangle(cx, e.y - 2, cx - 9, e.y + 13, cx + 9, e.y + 13);

  // Red nose — bigger than the player's
  fill(255, 30, 30);
  circle(cx, headCY, 11);

  pop();
}

function drawPlayer() {
  let cx = player.x + player.w / 2;
  let headCY = player.y + 14;

  push();
  noStroke();

  // Ruffled collar — three arc bumps; head will cover their tops
  fill(255, 50, 150);
  arc(cx - 9,  player.y + 30, 18, 14, PI, TWO_PI, CHORD);
  arc(cx + 1,  player.y + 30, 18, 14, PI, TWO_PI, CHORD);
  arc(cx + 9,  player.y + 30, 18, 14, PI, TWO_PI, CHORD);

  // Head circle
  fill(255, 220, 180);
  circle(cx, headCY, 26);

  // Hat (purple triangle on top of head)
  fill(180, 50, 220);
  triangle(cx, player.y - 2, cx - 10, player.y + 14, cx + 10, player.y + 14);

  // Red nose dot
  fill(255, 40, 40);
  circle(cx, headCY, 8);

  pop();
}

function resetGame() {
  gameState = "playing";
  score = 0;

  bullets.length = 0;

  enemies.length = 0;
  enemies.push(
    { x: 200, y: platforms[0].y - ENEMY_H, vx:  ENEMY_SPEED, vy: 0, w: ENEMY_W, h: ENEMY_H, platformIndex: 0, onGround: false },
    { x: 100, y: platforms[1].y - ENEMY_H, vx:  ENEMY_SPEED, vy: 0, w: ENEMY_W, h: ENEMY_H, platformIndex: 1, onGround: false },
    { x: 580, y: platforms[2].y - ENEMY_H, vx: -ENEMY_SPEED, vy: 0, w: ENEMY_W, h: ENEMY_H, platformIndex: 2, onGround: false },
    { x: 310, y: platforms[3].y - ENEMY_H, vx:  ENEMY_SPEED, vy: 0, w: ENEMY_W, h: ENEMY_H, platformIndex: 3, onGround: false }
  );

  player.x = TOP_PLATFORM.x + (TOP_PLATFORM.w - 32) / 2;
  player.y = TOP_PLATFORM.y - 40;
  player.vx = 0;
  player.vy = 0;
  player.facingRight = true;
  player.onGround = false;
}

function keyPressed() {
  // Unlock browser audio on first keypress (required by browser autoplay policy)
  if (getAudioContext().state !== "running") {
    getAudioContext().resume();
  }

  // R — restart from game over or win screen
  if (keyCode === 82 && (gameState === "dead" || gameState === "win")) {
    resetGame();
  }

  // UP or W — jump only when standing on a platform
  if ((keyCode === UP_ARROW || keyCode === 87) && player.onGround) {
    player.vy = JUMP_FORCE;
    playJumpSound();
  }

  // SPACE — shoot bullet in facing direction
  if (keyCode === 32 && gameState === "playing") {
    let bvx = player.facingRight ? BULLET_SPEED : -BULLET_SPEED;
    bullets.push({
      x: player.x + player.w / 2,
      y: player.y + player.h / 2,
      vx: bvx,
    });
    playShootSound();
  }
}
