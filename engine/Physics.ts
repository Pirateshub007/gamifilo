import { Player } from "./entities/Player";
import { Platform } from "./entities/Platform";

export class Physics {
  static update(player: Player, platforms: Platform[]) {
    player.grounded = false;

    // World ground
    if (player.y > 470) {
  player.y = 470;
  player.vy = 0;
  player.grounded = true;
}

    // Platforms
    for (const platform of platforms) {
      if (
        player.vy >= 0 &&
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.y + player.height >= platform.y &&
        player.y + player.height <= platform.y + 20
      ) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.grounded = true;
      }
    }

    // World boundaries
    if (player.x < 0) player.x = 0;
    if (player.x > 2950) player.x = 2950;
  }
}