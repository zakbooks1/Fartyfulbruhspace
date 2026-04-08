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
// DRAW PROCEDURAL SHIP
// ======================
function drawShip(x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Glow
  ctx.shadowColor = "cyan";
  ctx.shadowBlur = 20;

  // Body
  ctx.fillStyle = "#00bfff";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(12, 20);
  ctx.lineTo(-12, 20);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.restore();
}

// ======================
// DRAW PROCEDURAL PLAYER
// ======================
function drawPlayer(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "orange";

  // Head
  ctx.beginPath();
  ctx.arc(0, -8, 5, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillRect(-4, -3, 8, 12);

  ctx.restore();
}

// ======================
// DRAW PROCEDURAL PLANET
// ======================
function drawPlanet(x, y) {
  let gradient = ctx.createRadialGradient(x, y, 20, x, y, 200);
  gradient.addColorStop(0, "#2ecc71");
  gradient.addColorStop(1, "#145a32");

  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.arc(x, y, 150, 0, Math.PI * 2);
  ctx.fill();
}

// ======================
// STARS
// ======================
const stars = [];

for (let i = 0; i < 150; i++) {
  stars.push({
    x: Math.random() * 4000 - 2000,
    y: Math.random() * 4000 - 2000,
    layer: Math.random()
  });
}

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
  stick.style.transform = "translate(0px, 0px)";
});

// ======================
// BUTTONS
// ======================
document.getElementById("warpBtn").onclick = warp;
document.getElementById("landBtn").onclick = togglePlanet;

// ======================
// WARP
// ======================
function warp() {
  ship.x = Math.random() * 4000 - 2000;
  ship.y = Math.random() * 4000 - 2000;
}

// ======================
// LAND
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
// UPDATE
// ======================
function update() {
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

  // Smooth camera
  camera.x += (cameraTarget.x - camera.x) * 0.08;
  camera.y += (cameraTarget.y - camera.y) * 0.08;
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
    let px = s.x - camera.x * s.layer * 0.3;
    let py = s.y - camera.y * s.layer * 0.3;

    ctx.globalAlpha = 0.3 + s.layer * 0.7;
    ctx.fillRect(px, py, 2, 2);
  });
  ctx.globalAlpha = 1;

  if (mode === "space") {

    // 🚀 SHIP + THRUSTER
    drawShip(ship.x, ship.y, angle - Math.PI / 2);

    if (joy.x !== 0 || joy.y !== 0) {
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.arc(
        ship.x - Math.cos(angle) * 20,
        ship.y - Math.sin(angle) * 20,
        6 + Math.random() * 4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

  } else {

    // 🪐 PLANET
    drawPlanet(0, 0);

    // 👤 PLAYER
    drawPlayer(player.x, player.y);
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
