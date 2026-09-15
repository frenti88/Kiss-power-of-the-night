import { PlayerState } from './PlayerState';
import { InputState } from '../../../types';
import { EventBus } from '../../../core/EventBus';

export class DeathState extends PlayerState {
  private respawnTimer: number = 2.0;

  public enter(): void {
    this.player.animator.animation.play('death', true);
    this.player.velocity.vx = 0;
    this.player.velocity.vy = 40;
    this.respawnTimer = 2.0;
    EventBus.getInstance().emit('PLAYER_DEATH');
  }

  public update(_input: InputState, dt: number): void {
    this.respawnTimer -= dt;
    if (this.respawnTimer <= 0) {
      this.player.respawn();
    }
  }

  public exit(): void {}
  public getName(): string {
    return 'Death';
  }
}
