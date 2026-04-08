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
// INVENTORY
// ======================
let inventory = {
  ore: 0
};

// ======================
// SAVE / LOAD
// ======================
function saveGame() {
  localStorage.setItem("spaceGame", JSON.stringify(inventory));
}

function loadGame() {
  let data = localStorage.getItem("spaceGame");
  if (data) inventory = JSON.parse(data);
}

loadGame();

// ======================
// RANDOM
// ======================
function rand(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
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
// ENEMY SHIPS
// ======================
let enemies = [];

function spawnEnemy() {
  enemies.push({
    x: ship.x + Math.random() * 1000 - 500,
    y: ship.y + Math.random() * 1000 - 500,
    speed: 1 + Math.random()
  });
}

// spawn enemies over time
setInterval(spawnEnemy, 3000);

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
// MINING
// ======================
function mine(x, y) {
  let dist = Math.hypot(player.x - x, player.y - y);

  if (mode === "planet" && dist < 50) {
    inventory.ore += 1;
    saveGame();
  }
}

// ======================
// CLICK TO MINE
// ======================
canvas.addEventListener("click", (e) => {
  let rect = canvas.getBoundingClientRect();

  let mx = e.clientX - rect.left - (canvas.width / 2 - camera.x);
  let my = e.clientY - rect.top - (canvas.height / 2 - camera.y);

  mine(mx, my);
});

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

    // enemies chase ship
    enemies.forEach(e => {
      let dx = ship.x - e.x;
      let dy = ship.y - e.y;
      let d = Math.hypot(dx, dy);

      e.x += (dx / d) * e.speed;
      e.y += (dy / d) * e.speed;
    });

  } else {
    player.x += joy.x * player.speed;
    player.y += joy.y * player.speed;

    cameraTarget.x = player.x;
    cameraTarget.y = player.y;
  }

  // smooth camera
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

  // stars
  ctx.fillStyle = "white";
  stars.forEach(s => {
    let px = s.x - camera.x * s.layer * 0.3;
    let py = s.y - camera.y * s.layer * 0.3;

    ctx.globalAlpha = 0.3 + s.layer * 0.7;
    ctx.fillRect(px, py, 2, 2);
  });
  ctx.globalAlpha = 1;

  if (mode === "space") {

    // ship
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // enemies
    ctx.fillStyle = "red";
    enemies.forEach(e => {
      ctx.beginPath();
      ctx.arc(e.x, e.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

  } else {

    // planet terrain
    for (let x = -300; x < 300; x += 10) {
      let h = Math.sin((x + 100) * 0.05) * 50;

      ctx.fillStyle = "green";
      ctx.fillRect(x, h, 10, 200);

      // ore
      if (rand(x) > 0.9) {
        ctx.fillStyle = "gray";
        ctx.fillRect(x, h - 10, 8, 8);
      }
    }

    // player
    ctx.fillStyle = "orange";
    ctx.fillRect(player.x - 5, player.y - 5, 10, 10);
  }

  ctx.restore();

  // UI
  ctx.fillStyle = "white";
  ctx.fillText("Ore: " + inventory.ore, 20, 30);
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
