import { Player } from "./entities/Player";
import { Input } from "./Input";
import { Platform } from "./entities/Platform";
import { Physics } from "./Physics";
import { Camera } from "./Camera";
import { Enemy } from "./entities/Enemy";
import { Bullet } from "./entities/Bullet";

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  worldWidth = 3000;

  player = new Player();
  camera = new Camera();
  enemies = [
  new Enemy(900, 470),
  new Enemy(1400, 470),
];
bullets: Bullet[] = [];

  platforms = [
  new Platform(400, 420, 180, 20),
  new Platform(700, 330, 180, 20),
  new Platform(1100, 250, 180, 20),
];
  input = new Input();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas context not found");
    }

    this.ctx = context;
  }

  start() {
  const loop = () => {
    this.draw();
    requestAnimationFrame(loop);
  };

  loop();
}

  draw() {

    this.player.update(this.input);
    if (this.input.isDown("x") && this.bullets.length < 5) {
  this.bullets.push(
    new Bullet(
      this.player.x + this.player.width,
      this.player.y + 35
    )
  );
}
Physics.update(this.player, this.platforms);
    this.camera.update(
  this.player.x,
  this.canvas.width,
  this.worldWidth
);

    // Sky
    this.ctx.fillStyle = "#87CEEB";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Ground
this.ctx.save();

this.ctx.translate(-this.camera.x, 0);

// Ground
this.ctx.fillStyle = "#3CB043";
this.ctx.fillRect(0, 550, this.worldWidth, 50);

// Platforms
for (const platform of this.platforms) {
  platform.draw(this.ctx);
}

// Bullets
for (const bullet of this.bullets) {
  bullet.update();
}


// Bullet vs Enemy collision
this.bullets = this.bullets.filter((bullet) => {

  for (const enemy of this.enemies) {

    if (
      bullet.x < enemy.x + enemy.width &&
      bullet.x + bullet.width > enemy.x &&
      bullet.y < enemy.y + enemy.height &&
      bullet.y + bullet.height > enemy.y
    ) {

      this.enemies = this.enemies.filter(e => e !== enemy);
      return false;

    }

  }

  return bullet.x < this.worldWidth;
});


// Draw bullets
for (const bullet of this.bullets) {
  bullet.draw(this.ctx);
}

// Enemies
this.enemies = this.enemies.filter((enemy) => {

  enemy.update();

  enemy.draw(this.ctx);

  return enemy.x > -100;
});

// Player
this.player.draw(this.ctx);

this.ctx.restore();
  }
}