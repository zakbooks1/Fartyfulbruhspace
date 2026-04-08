const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ======================
// STATE
// ======================
let mode = "space";

let camera = { x: 0, y: 0 };
let cameraTarget = { x: 0, y: 0 };

let ship = { x: 0, y: 0, speed: 3 };
let player = { x: 0, y: 0, speed: 2 };

let angle = 0;

// ======================
// LOAD SPRITES
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
// DRAW SPRITE (AUTO SCALE)
// ======================
function drawSprite(img, x, y, size, rot = 0, alpha = 1) {
  if (!img.complete) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  let aspect = img.width / img.height;

  let w, h;
  if (aspect > 1) {
    w = size;
    h = size / aspect;
  } else {
    h = size;
    w = size * aspect;
  }

  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);

  ctx.restore();
}

// ======================
// PARALLAX STARS
// ======================
const stars = [];

for (let i = 0; i < 150; i++) {
  stars.push({
    x: Math.random() * 4000 - 2000,
    y: Math.random() * 4000 - 2000,
    layer: Math.random(), // 0 = far, 1 = close
    size: Math.random() * 2 + 1
  });
}

// ======================
// INPUT (JOYSTICK)
// ======================
let joy = { x: 0, y: 0 };

const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");

let dragging = false;

joystick.addEventListener("touchstart", () => dragging = true);

joystick.addEventListener("touchmove", (e) => {
  if (!dragging) return;

  let t = e.touches[0];
  let rect = joystick.getBoundingClientRect();

  let dx = t.clientX - (rect.left + rect.width / 2);
  let dy = t.clientY - (rect.top + rect.height / 2);

  let dist = Math.sqrt(dx * dx + dy * dy);
  let max = 40;

  if (dist > max) {
    dx = (dx / dist) * max;
    dy = (dy / dist) * max;
  }

  joy.x = dx / max;
  joy.y = dy / max;

  stick.style.transform = `translate(${dx}px, ${dy}px)`;
});

joystick.addEventListener("touchend", () => {
  dragging = false;
  joy.x = 0;
  joy.y = 0;
  stick.style.transform = `translate(0px, 0px)`;
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
const starsBig = [];

for (let i = 0; i < 100; i++) {
  starsBig.push({
    x: rand(i) * 4000 - 2000,
    y: rand(i * 2) * 4000 - 2000
  });
}

// ======================
// UPDATE
// ======================
function update() {
  // MOVEMENT
  if (mode === "space") {
    ship.x += joy.x * ship.speed;
    ship.y += joy.y * ship.speed;

    cameraTarget.x = ship.x;
    cameraTarget.y = ship.y;

    if (joy.x !== 0 || joy.y !== 0) {
      angle = Math.atan2(joy.y, joy.x);
    }
  } else {
    player.x += joy.x * player.speed;
    player.y += joy.y * player.speed;

    cameraTarget.x = player.x;
    cameraTarget.y = player.y;
  }

  // SMOOTH CAMERA (EASE)
  camera.x += (cameraTarget.x - camera.x) * 0.08;
  camera.y += (cameraTarget.y - camera.y) * 0.08;
}

// ======================
// WARP
// ======================
function warp() {
  let t = starsBig[Math.floor(Math.random() * starsBig.length)];
  ship.x = t.x;
  ship.y = t.y;
}

// ======================
// LAND / EXIT
// ======================
function togglePlanet() {
  if (mode === "space") {
    mode = "planet";
    player.x = ship.x;
    player.y = ship.y;
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

  // 🌌 PARALLAX STARS
  ctx.fillStyle = "white";
  stars.forEach(s => {
    let parallaxX = s.x - camera.x * s.layer * 0.3;
    let parallaxY = s.y - camera.y * s.layer * 0.3;

    ctx.globalAlpha = 0.3 + s.layer * 0.7;
    ctx.fillRect(parallaxX, parallaxY, s.size, s.size);
  });
  ctx.globalAlpha = 1;

  if (mode === "space") {
    // 🌟 GLOW EFFECT
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 20;

    drawSprite(
      shipImg,
      ship.x,
      ship.y,
      60,
      angle - Math.PI / 2,
      1
    );

    ctx.shadowBlur = 0;

    // 🔥 THRUSTER EFFECT
    if (joy.y !== 0 || joy.x !== 0) {
      ctx.fillStyle = "orange";
      ctx.globalAlpha = 0.7;

      ctx.beginPath();
      ctx.arc(
        ship.x - Math.cos(angle) * 20,
        ship.y - Math.sin(angle) * 20,
        6 + Math.random() * 4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.globalAlpha = 1;
    }

  } else {
    // 🪐 PLANET
    drawSprite(planetImg, 0, 0, 300);

    // 👤 PLAYER
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
