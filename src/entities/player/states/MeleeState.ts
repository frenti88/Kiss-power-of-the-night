import { PlayerState } from './PlayerState';
import { InputState } from '../../../types';

export class MeleeState extends PlayerState {
  private timer: number = 0;

  public enter(): void {
    this.player.animator.animation.play('melee', true);
    this.player.velocity.vx *= 0.2; // slight slowdown
    this.player.combat.startMelee(
      this.player.transform.x,
      this.player.transform.y,
      this.player.facingRight
    );
    this.timer = this.player.config.combat.melee.durationMs / 1000;
  }

  public update(_input: InputState, dt: number): void {
    if (this.player.health.isDead()) {
      this.player.stateMachine.changeState('death');
      return;
    }

    this.timer -= dt;
    if (this.timer <= 0 || this.player.animator.animation.isFinished) {
      this.player.stateMachine.changeState(this.player.isGrounded ? 'idle' : 'fall');
    }
  }

  public exit(): void {}
  public getName(): string {
    return 'Melee';
  }
}
