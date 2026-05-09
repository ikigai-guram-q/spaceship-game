const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

const app = new PIXI.Application({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: 0x111111,
});

document.getElementById("game").appendChild(app.view);

const stage = new PIXI.Container();
app.stage.addChild(stage);

let spaceship;
let moveLeft = false;
let moveRight = false;

PIXI.Assets.load([
  "assets/mining_shuttle/mining_shuttle.json",
]).then((spineData) => {
  const spaceship = new PIXI.spine.Spine(spineData);

  spaceship.x = GAME_WIDTH / 2;
  spaceship.y = GAME_HEIGHT * 0.7;
  spaceship.scale.set(1);
  spaceship.state.setAnimation(0, "mining_shuttle_anim", true);

  stage.addChild(spaceship);
});

function resizeGame() {
  const scale = Math.min(
    window.innerWidth / GAME_WIDTH,
    window.innerHeight / GAME_HEIGHT
  );

  app.renderer.resize(window.innerWidth, window.innerHeight);

  stage.scale.set(scale);
  stage.x = (window.innerWidth - GAME_WIDTH * scale) / 2;
  stage.y = (window.innerHeight - GAME_HEIGHT * scale) / 2;
}

window.addEventListener("resize", resizeGame);
resizeGame();

document.getElementById("left").addEventListener("pointerdown", () => moveLeft = true);
document.getElementById("left").addEventListener("pointerup", () => moveLeft = false);

document.getElementById("right").addEventListener("pointerdown", () => moveRight = true);
document.getElementById("right").addEventListener("pointerup", () => moveRight = false);

app.ticker.add((delta) => {
  if (!spaceship) return;

  const speed = 8;

  if (moveLeft) spaceship.x -= speed * delta;
  if (moveRight) spaceship.x += speed * delta;

  spaceship.x = Math.max(100, Math.min(GAME_WIDTH - 100, spaceship.x));
});