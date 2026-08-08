export class Input {
  keys: Record<string, boolean> = {};

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener("blur", () => {
  this.keys = {};
});

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }

  isDown(key: string) {
    return !!this.keys[key];
  }
}