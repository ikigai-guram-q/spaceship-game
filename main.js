// ================================
// CONFIG
// ================================
const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

const groundY = 900;
const friction = 0.98;

// ================================
// PIXI APP
// ================================
const app = new PIXI.Application({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: 0x111111,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

document.getElementById("game").appendChild(app.view);

// ================================
// LAYERS
// ================================
const farBack = new PIXI.Container();
const midBack = new PIXI.Container();
const world = new PIXI.Container();

app.stage.addChild(farBack, midBack, world);

// ================================
// GAME STATE
// ================================
let spaceship = null;

const input = {
  up: false,
  left: false,
  right: false,
};

const ship = {
  x: 300,
  y: 300,
  vx: 0,
  vy: 0,
  rotation: 0,

  thrustPower: 0.35,
  sidePower: 0.18,
  gravity: 0.12,

  width: 80,
  height: 50,
};

// ================================
// LOAD GAME
// ================================
async function loadGame() {
  PIXI.Assets.add({ alias: "spaceshipData", src: "assets/spaceship/spaceship_anim.json" });
  PIXI.Assets.add({ alias: "spaceshipAtlas", src: "assets/spaceship/spaceship_anim.atlas" });
  PIXI.Assets.add({ alias: "bgFar", src: "assets/background_back.png" });
  PIXI.Assets.add({ alias: "bgMid", src: "assets/background_front.png" });
  PIXI.Assets.add({ alias: "shadow", src: "assets/shadow.png" });

  await PIXI.Assets.load([
    "spaceshipData",
    "spaceshipAtlas",
    "bgFar",
    "bgMid",
    "shadow",
  ]);

  createBackgrounds();
  createSpaceship();
}

function createBackgrounds() {
  const farBg = new PIXI.Sprite(PIXI.Texture.from("bgFar"));
  farBg.width = GAME_WIDTH;
  farBg.height = GAME_HEIGHT;
  farBack.addChild(farBg);

  const midBg = new PIXI.Sprite(PIXI.Texture.from("bgMid"));
  midBg.width = GAME_WIDTH;
  midBg.height = GAME_HEIGHT;
  midBack.addChild(midBg);
}

function createSpaceship() {
  spaceship = spine.Spine.from({
    skeleton: "spaceshipData",
    atlas: "spaceshipAtlas",
    scale: 0.5,
  });

  spaceship.x = GAME_WIDTH / 2;
  spaceship.y = GAME_HEIGHT / 2;

  ship.x = spaceship.x;
  ship.y = spaceship.y;

  const shadow = new PIXI.Sprite(PIXI.Texture.from("shadow"));
  shadow.anchor.set(0.5);
  shadow.x = spaceship.x;
  shadow.y = groundY-40;  // Offset below spaceship
  shadow.alpha = 0.5;  // Semi-transparent
  shadow.scale.set(0.2);  // Adjust size

  world.addChild(shadow);

  // Store reference for updates
  spaceship.shadow = shadow;

  world.addChild(spaceship);

  const animations = spaceship.skeleton.data.animations.map(a => a.name);
  console.log("Animations:", animations);

  if (animations.length > 0) {
    spaceship.state.setAnimation(0, animations[0], true);
  }
}

// ================================
// UPDATE LOOP
// ================================
function updateShip() {
  // Gravity
  ship.vy += ship.gravity;

  // Vertical thrust
  if (input.up) {
    ship.vy -= ship.thrustPower;
  }

  // Horizontal movement
  if (input.left) {
    ship.vx -= ship.sidePower;
  }

  if (input.right) {
    ship.vx += ship.sidePower;
  }

  // Friction / air resistance
  ship.vx *= friction;
  ship.vy *= friction;

  // Apply movement
  ship.x += ship.vx;
  ship.y += ship.vy;

  handleBounds();

  spaceship.x = ship.x;
  spaceship.y = ship.y;
  if (spaceship.shadow) {
    spaceship.shadow.x = ship.x; 
  }
}

function handleBounds() {
  // Ground
  if (ship.y > groundY) {
    ship.y = groundY;
    ship.vy = 0;
  }

  // Left wall
  if (ship.x < 500) {
    ship.x = 500;
    ship.vx = -ship.vx;
    ship.vy = 0;
  }

  // Right wall
  if (ship.x > 1430) {
    ship.x = 1430;
    ship.vx = -ship.vx;
    ship.vy = 0;
  }
}

app.ticker.add(() => {
  if (!spaceship) return;
  updateShip();
});

// ================================
// RESIZE
// ================================
function resizeGame() {
  const scale = Math.min(
    window.innerWidth / GAME_WIDTH,
    window.innerHeight / GAME_HEIGHT
  );

  app.renderer.resize(window.innerWidth, window.innerHeight);

  const baseX = (window.innerWidth - GAME_WIDTH * scale) / 2;
  const baseY = (window.innerHeight - GAME_HEIGHT * scale) / 2;

  farBack.scale.set(scale);
  midBack.scale.set(scale);
  world.scale.set(scale);

  farBack.position.set(baseX, baseY);
  midBack.position.set(baseX, baseY);
  world.position.set(baseX, baseY);
}

window.addEventListener("resize", resizeGame);

// ================================
// INPUT — BUTTONS
// ================================
function setupButtonInput() {
  const leftButton = document.getElementById("left");
  const rightButton = document.getElementById("right");
  const upButton = document.getElementById("up");

  leftButton.addEventListener("pointerdown", () => {
    input.left = true;
  });

  leftButton.addEventListener("pointerup", () => {
    input.left = false;
  });

  rightButton.addEventListener("pointerdown", () => {
    input.right = true;
  });

  rightButton.addEventListener("pointerup", () => {
    input.right = false;
  });

  upButton.addEventListener("pointerdown", () => {
    input.up = true;
  });

  upButton.addEventListener("pointerup", () => {
    input.up = false;
  });
}

// ================================
// INPUT — KEYBOARD
// ================================
function setupKeyboardInput() {
  window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp") {
      input.up = true;
    }

    if (e.code === "ArrowLeft") {
      input.left = true;
    }

    if (e.code === "ArrowRight") {
      input.right = true;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowUp") {
      input.up = false;
    }

    if (e.code === "ArrowLeft") {
      input.left = false;
    }

    if (e.code === "ArrowRight") {
      input.right = false;
    }
  });
}

// ================================
// START
// ================================
setupButtonInput();
setupKeyboardInput();
resizeGame();
loadGame();