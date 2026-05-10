const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

const farBack = new PIXI.Container();
const midBack = new PIXI.Container();
const world = new PIXI.Container();





const app = new PIXI.Application({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: 0x111111,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

document.getElementById("game").appendChild(app.view);

app.stage.addChild(farBack, midBack, world);

let spaceship;
let rotateLeft = false;
let rotateRight = false;
let engineBone = null;
let engineRotation = 0;
let friction=0.98;

const groundY = 900;

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

const input = {
  up: false,
  left: false,
  right: false,
};

function updateShip() {
  // gravity
  ship.vy += ship.gravity;

  // thrust upward
  if (input.up) {
    ship.vy -= ship.thrustPower;
  }

  // horizontal control
  if (input.left) {
    ship.vx -= ship.sidePower;
  } else if (input.right) {
    ship.vx += ship.sidePower;

  } else {
  }

  // friction / air resistance
  ship.vx *= friction;
  ship.vy *= friction;

  // apply movement
  ship.x += ship.vx;
  ship.y += ship.vy;

  if (ship.y > groundY) {
  ship.y = groundY;
  friction = 0.5;
  }

  if (ship.x < 500) {
      ship.x = 500;
      ship.vx = -ship.vx;

    ship.vy = 0;
  }

    if (ship.x > 1430) {
      ship.x = 1430;
      ship.vx = -ship.vx;

    ship.vy = 0;
  }

  spaceship.x = ship.x;
  spaceship.y = ship.y;
}


async function loadGame() {
  PIXI.Assets.add({
    alias: "spaceshipData",
    src: "assets/spaceship/spaceship_anim.json",
  });

  PIXI.Assets.add({
    alias: "spaceshipAtlas",
    src: "assets/spaceship/spaceship_anim.atlas",
  });

  PIXI.Assets.add({ alias: "bgFar", src: "assets/background_back.png" });
  PIXI.Assets.add({ alias: "bgMid", src: "assets/background_front.png" });

  await PIXI.Assets.load(["spaceshipData", "spaceshipAtlas", "bgFar", "bgMid"]);


  spaceship = spine.Spine.from({
    skeleton: "spaceshipData",
    atlas: "spaceshipAtlas",
    scale: 0.5,
  });

  spaceship.x = GAME_WIDTH / 2;
  spaceship.y = GAME_HEIGHT / 2;

  ship.x=spaceship.x;
  ship.y=spaceship.y;

  const farBg = new PIXI.Sprite(PIXI.Texture.from("bgFar"));
  farBg.width = GAME_WIDTH;
  farBg.height = GAME_HEIGHT;
  farBack.addChild(farBg);

  const midBg = new PIXI.Sprite(PIXI.Texture.from("bgMid"));
  midBg.width = GAME_WIDTH;
  midBg.height = GAME_HEIGHT;
  midBack.addChild(midBg);

  world.addChild(spaceship);

  console.log(
    "Animations:",
    spaceship.skeleton.data.animations.map(a => a.name)
  );

  const firstAnimation = spaceship.skeleton.data.animations[0].name;
  spaceship.state.setAnimation(0, firstAnimation, true);
}

document.getElementById("left").addEventListener("pointerdown", () => {
  input.left = true;
});

document.getElementById("left").addEventListener("pointerup", () => {
  input.left = false;
});

document.getElementById("right").addEventListener("pointerdown", () => {
  input.right = true;
});

document.getElementById("right").addEventListener("pointerup", () => {
  input.right = false;
});

document.getElementById("up").addEventListener("pointerdown", () => {
  input.up = true;
});

document.getElementById("up").addEventListener("pointerup", () => {
  input.up = false;
});

loadGame();

function resizeGame() {
  const scale = Math.min(
    window.innerWidth / GAME_WIDTH,
    window.innerHeight / GAME_HEIGHT
  );

  app.renderer.resize(window.innerWidth, window.innerHeight);

  farBack.scale.set(scale);
  midBack.scale.set(scale);
  world.scale.set(scale);

  const baseX = (window.innerWidth - GAME_WIDTH * scale) / 2;
  const baseY = (window.innerHeight - GAME_HEIGHT * scale) / 2;

  farBack.position.set(baseX, baseY);
  midBack.position.set(baseX, baseY);
  world.position.set(baseX, baseY);
}

window.addEventListener("resize", resizeGame);
resizeGame();

app.ticker.add((delta) => {
  if (!spaceship) return;

  updateShip();
});

window.addEventListener("keydown", (e) => {

  if (e.code === "ArrowUp") {
    input.up = true;
    friction = 0.98;
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