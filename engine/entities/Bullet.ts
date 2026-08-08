import { Entity } from "./Entity";

export class Bullet extends Entity {

  speed = 10;

  constructor(x: number, y: number) {
    super(
      x,
      y,
      15,
      5,
      "#FFFF00"
    );
  }

  update() {
    this.x += this.speed;
  }

}