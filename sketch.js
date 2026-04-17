let gameState = "playing";

const platforms = [
  { x: 0,   y: 460, w: 800, h: 20 },  // ground
  { x: 80,  y: 340, w: 160, h: 16 },  // low-left
  { x: 560, y: 340, w: 160, h: 16 },  // low-right
  { x: 280, y: 230, w: 180, h: 16 },  // mid-centre
  { x: 100, y: 130, w: 140, h: 16 },  // high-left
];

const GRAVITY = 0.5;

function applyGravity(entity) {
  entity.vy += GRAVITY;
  entity.y += entity.vy;
}

function setup() {
  let canvas = createCanvas(800, 500);
  canvas.parent("canvas-container");
}

function draw() {
  background(30);

  fill(80, 160, 80);
  noStroke();
  for (let p of platforms) {
    rect(p.x, p.y, p.w, p.h);
  }
}
