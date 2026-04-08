const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ======================
// GAME STATE
// ======================
let mode = "space";

let camera = { x: 0, y: 0 };

let ship = { x: 0, y: 0, speed: 3 };
let player = { x: 0, y: 0, speed: 2 };

// ======================
// JOYSTICK
// ======================
let joy = { x: 0, y: 0 };

const joystick = document.getElementById("joystick");

joystick.addEventListener("touchmove", e => {
  let touch = e.touches[0];
  let rect = joystick.getBoundingClientRect();

  let dx = touch.clientX - (rect.left + rect.width / 2);
  let dy = touch.clientY - (rect.top + rect.height / 2);

  joy.x = dx / 50;
  joy.y = dy / 50;
});

joystick.addEventListener("touchend", () => {
  joy.x = 0;
  joy.y = 0;
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
  } else {
    player.x += joy.x * player.speed;
    player.y += joy.y * player.speed;
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

    // ship
    ctx.fillStyle = "cyan";
    ctx.fillRect(ship.x - 5, ship.y - 5, 10, 10);

  } else {
    // planet terrain (simple noise-like)
    for (let x = -500; x < 500; x += 20) {
      let h = Math.sin((x + planetSeed) * 0.05) * 50;

      ctx.fillStyle = "green";
      ctx.fillRect(x, h, 20, 200);
    }

    // player
    ctx.fillStyle = "orange";
    ctx.fillRect(player.x - 5, player.y - 5, 10, 10);
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