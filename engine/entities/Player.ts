import { Entity } from "./Entity";

export class Player extends Entity {
vx = 0;
vy = 0;
constructor() {
  super(
    100,
    470,
    40,
    80,
    "#0066FF"
  );
}

grounded = false;

speed = 6;
jumpForce = -15;
gravity = 0.8;

  update(input: any) {
  // Horizontal movement
  this.vx = 0;

  if (input.isDown("ArrowLeft")) {
    this.vx = -this.speed;
  }

  if (input.isDown("ArrowRight")) {
    this.vx = this.speed;
  }

  // Jump
  if (input.isDown(" ") && this.grounded) {
  this.vy = this.jumpForce;
  this.grounded = false;
}

  // Gravity
  this.vy += this.gravity;

  // Apply movement
  this.x += this.vx;
  this.y += this.vy;
}
}