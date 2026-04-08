
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let shipRotationOffset = -Math.PI / 2;

// ======================
// GAME STATE
// ======================
let mode = "space";

let camera = { x: 0, y: 0 };

let ship = { x: 0, y: 0, speed: 3 };
let player = { x: 0, y: 0, speed: 2 };

let angle = 0;

// ======================
// AUTO SCALE FUNCTION
// ======================
function drawSprite(shipImg, ship.x, ship.y, 50, angle + shipRotationOffset); {
  if (!img.complete) return;

  let aspect = img.width / img.height;

  let width, height;

  if (aspect > 1) {
    width = targetSize;
    height = targetSize / aspect;
  } else {
    height = targetSize;
    width = targetSize * aspect;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();
}

// ======================
// LOAD IMAGES
// ======================
function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const shipImg = loadImage("assets/ship.png");
const playerImg = loadImage("assets/player.png");
const planetImg = loadImage("assets/planet.png");

// ======================
// JOYSTICK
// ======================
let joy = { x: 0, y: 0 };

const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");

let dragging = false;

joystick.addEventListener("touchstart", () => dragging = true);

joystick.addEventListener("touchmove", (e) => {
  if (!dragging) return;

  let touch = e.touches[0];
  let rect = joystick.getBoundingClientRect();

  let dx = touch.clientX - (rect.left + rect.width / 2);
  let dy = touch.clientY - (rect.top + rect.height / 2);

  let dist = Math.sqrt(dx * dx + dy * dy);
  let max = 40;

  if (dist > max) {
    dx = (dx / dist) * max;
    dy = (dy / dist) * max;
  }

  joy.x = dx / max;
  joy.y = dy / max;

  stick.style.left = dx + 40 + "px";
  stick.style.top = dy + 40 + "px";
});

joystick.addEventListener("touchend", () => {
  dragging = false;
  joy.x = 0;
  joy.y = 0;

  stick.style.left = "35px";
  stick.style.top = "35px";
});

// ======================
// BUTTONS
// ======================
document.getElementById("warpBtn").onclick = warp;
document.getElementById("landBtn").onclick = togglePlanet;

// ======================
// RANDOM
// ======================
function rand(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ======================
// GALAXY
// ======================
const stars = [];
const seed = 9999;

for (let i = 0; i < 100; i++) {
  stars.push({
    x: rand(i + seed) * 4000 - 2000,
    y: rand(i * 2 + seed) * 4000 - 2000
  });
}

// ======================
// PLANET
// ======================
let planetSeed = 0;

// ======================
// UPDATE
// ======================
function update() {
  if (mode === "space") {
    ship.x += joy.x * ship.speed;
    ship.y += joy.y * ship.speed;

    camera.x = ship.x;
    camera.y = ship.y;

    if (joy.x !== 0 || joy.y !== 0) {
      angle = Math.atan2(joy.y, joy.x);
    }

  } else {
    player.x += joy.x * player.speed;
    player.y += joy.y * player.speed;

    camera.x = player.x;
    camera.y = player.y;
  }
}

// ======================
// WARP
// ======================
function warp() {
  let target = stars[Math.floor(Math.random() * stars.length)];
  ship.x = target.x;
  ship.y = target.y;
}

// ======================
// LAND / EXIT
// ======================
function togglePlanet() {
  if (mode === "space") {
    mode = "planet";
    player.x = ship.x;
    player.y = ship.y;
    planetSeed = Math.random() * 1000;
  } else {
    mode = "space";
  }
}

// ======================
// DRAW
// ======================
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2 - camera.x, canvas.height / 2 - camera.y);

  if (mode === "space") {
    // stars
    ctx.fillStyle = "white";
    stars.forEach(s => {
      ctx.fillRect(s.x, s.y, 2, 2);
    });

    // ship (AUTO SCALED + ROTATED)
    drawSprite(shipImg, ship.x, ship.y, 50, angle);

  } else {
    // planet (AUTO SCALED BIG)
    drawSprite(planetImg, 0, 0, 300);

    // player (AUTO SCALED)
    drawSprite(playerImg, player.x, player.y, 40);
  }

  ctx.restore();
}

// ======================
// LOOP
// ======================
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
