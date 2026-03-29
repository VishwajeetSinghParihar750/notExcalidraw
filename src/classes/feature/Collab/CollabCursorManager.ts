import z from "zod";
import {
  playerPosition,
  playerPositionUpdatePayload,
  type playerName,
} from "../../../types/wsZodSchemas";
import CollabCursor from "./CollabCursor";
//
type playerType = z.infer<typeof playerName>;
type playerPositionType = z.infer<typeof playerPosition>;
type playerPositionUpdateType = z.infer<typeof playerPositionUpdatePayload>;

export default class CollabCursorManager {
  //
  players: Record<playerType, CollabCursor> = {};

  constructor(players: playerPositionUpdateType[]) {
    players.forEach((player) => {
      this.players[player.playerName] = new CollabCursor(
        player.playerName,
        player.playerPosition,
      );
    });
  }
  destructor() {
    this.players = {};
  }

  addNewPlayer(player: playerType, position: playerPositionType) {
    let newShape = new CollabCursor(player, position);
    this.players[player] = newShape;
  }

  handlePlayerPositionUpdate(player: playerType, position: playerPositionType) {
    if (!this.players[player]) {
      this.addNewPlayer(player, position);
      return;
    }

    this.players[player].setPlayerPosition(position);
  }
  handlePlayerDisconnected(player: playerType) {
    delete this.players[player];
  }
}
//
