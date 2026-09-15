import { PlayerState } from './PlayerState';
import { InputState } from '../../../types';

export class HitState extends PlayerState {
  private timer: number = 0;

  public enter(): void {
    this.player.animator.animation.play('hit', true);
    // Knockback
    this.player.velocity.vx = this.player.facingRight ? -70 : 70;
    this.player.velocity.vy = 50;
    this.timer = 0.25;
  }

  public update(_input: InputState, dt: number): void {
    if (this.player.health.isDead()) {
      this.player.stateMachine.changeState('death');
      return;
    }

    this.timer -= dt;
    if (this.timer <= 0) {
      this.player.stateMachine.changeState(this.player.isGrounded ? 'idle' : 'fall');
    }
  }

  public exit(): void {}
  public getName(): string {
    return 'Hit';
  }
}
