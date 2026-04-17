let gameState = "playing";

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
  }

  fill(80, 160, 80);
  noStroke();
  for (let p of platforms) {
    rect(p.x, p.y, p.w, p.h);
  }
}

function keyPressed() {
  // UP or W — jump only when standing on a platform
  if ((keyCode === UP_ARROW || keyCode === 87) && player.onGround) {
    player.vy = JUMP_FORCE;
  }
}
