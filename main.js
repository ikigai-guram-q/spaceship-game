const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

const app = new PIXI.Application({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: 0x111111,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

document.getElementById("game").appendChild(app.view);

const world = new PIXI.Container();
app.stage.addChild(world);

let spaceship;
let rotateLeft = false;
let rotateRight = false;
let engineBone = null;
let engineRotation = 0;

async function loadGame() {
  PIXI.Assets.add({
    alias: "spaceshipData",
    src: "assets/mining_shuttle/mining_shuttle_anim.json",
  });

  PIXI.Assets.add({
    alias: "spaceshipAtlas",
    src: "assets/mining_shuttle/mining_shuttle_anim.atlas",
  });

  await PIXI.Assets.load(["spaceshipData", "spaceshipAtlas"]);

  spaceship = spine.Spine.from({
    skeleton: "spaceshipData",
    atlas: "spaceshipAtlas",
    scale: 0.5,
  });

  spaceship.x = GAME_WIDTH / 2;
  spaceship.y = GAME_HEIGHT / 2;

  world.addChild(spaceship);
  engineBone = spaceship.skeleton.findBone("engine_ctrl");
  if (!engineBone) {
    console.error("Bone not found: engine_ctrl");
  }

  console.log(
    "Animations:",
    spaceship.skeleton.data.animations.map(a => a.name)
  );

  const firstAnimation = spaceship.skeleton.data.animations[0].name;
  spaceship.state.setAnimation(0, firstAnimation, true);
}

document.getElementById("left").addEventListener("pointerdown", () => {
  rotateLeft = true;
});

document.getElementById("left").addEventListener("pointerup", () => {
  rotateLeft = false;
});

document.getElementById("right").addEventListener("pointerdown", () => {
  rotateRight = true;
});

document.getElementById("right").addEventListener("pointerup", () => {
  rotateRight = false;
});

loadGame();

function resizeGame() {
  const scale = Math.min(
    window.innerWidth / GAME_WIDTH,
    window.innerHeight / GAME_HEIGHT
  );

  app.renderer.resize(window.innerWidth, window.innerHeight);

  world.scale.set(scale);
  world.x = (window.innerWidth - GAME_WIDTH * scale) / 2;
  world.y = (window.innerHeight - GAME_HEIGHT * scale) / 2;
}

window.addEventListener("resize", resizeGame);
resizeGame();

app.ticker.add((delta) => {
  if (!engineBone) return;

  const speed = 3;

  if (rotateLeft) {
    engineRotation -= speed * delta;
  }

  if (rotateRight) {
    engineRotation += speed * delta;
  }

  engineBone.rotation = engineRotation;

});