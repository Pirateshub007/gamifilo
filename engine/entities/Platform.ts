import { Entity } from "./Entity";

export class Platform extends Entity {

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color = "#8B4513"
  ) {
    super(
      x,
      y,
      width,
      height,
      color
    );
  }

}