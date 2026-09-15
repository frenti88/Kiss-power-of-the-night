import { Player } from '../Player';
import { InputState } from '../../../types';

export abstract class PlayerState {
  protected player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  public abstract enter(): void;
  public abstract update(input: InputState, dt: number): void;
  public abstract exit(): void;
  public abstract getName(): string;
}
