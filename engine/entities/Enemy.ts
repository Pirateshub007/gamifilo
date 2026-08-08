import { Entity } from "./Entity";

export class Enemy extends Entity {

  speed = 2;

  constructor(
    x: number,
    y: number
  ) {
    super(
      x,
      y,
      40,
      80,
      "#FF0000"
    );
  }

  update() {
    this.x -= this.speed;
  }

}