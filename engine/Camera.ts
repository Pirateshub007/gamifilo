export class Camera {
  x = 0;

  update(playerX: number, canvasWidth: number, worldWidth: number) {
    this.x = playerX - canvasWidth / 2;

    if (this.x < 0) this.x = 0;

    if (this.x > worldWidth - canvasWidth) {
      this.x = worldWidth - canvasWidth;
    }
  }
}