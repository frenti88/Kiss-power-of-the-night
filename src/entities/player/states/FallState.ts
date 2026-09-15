import { PlayerState } from './PlayerState';
import { InputState } from '../../../types';

export class FallState extends PlayerState {
  public enter(): void {
    this.player.animator.animation.play('fall');
  }

  public update(input: InputState, _dt: number): void {
    if (this.player.health.isDead()) {
      this.player.stateMachine.changeState('death');
      return;
    }

    // Coyote time check
    if (this.player.canCoyoteJump() && input.jumpPressed) {
      this.player.stateMachine.changeState('jump');
      return;
    }

    // Landing check
    if (this.player.isGrounded) {
      if (input.left || input.right) {
        this.player.stateMachine.changeState('run');
      } else {
        this.player.stateMachine.changeState('idle');
      }
      return;
    }

    // Air horizontal movement
    if (input.right) {
      this.player.facingRight = true;
      this.player.velocity.vx = this.player.config.stats.moveSpeed * 0.9;
    } else if (input.left) {
      this.player.facingRight = false;
      this.player.velocity.vx = -this.player.config.stats.moveSpeed * 0.9;
    }

    // Air shooting
    if (input.shootPressed || input.shoot) {
      this.player.combat.shoot(
        this.player.transform.x,
        this.player.transform.y,
        this.player.facingRight,
        false,
        input.up
      );
    }

    if (input.meleePressed) {
      this.player.stateMachine.changeState('melee');
    }
  }

  public exit(): void {}
  public getName(): string {
    return 'Fall';
  }
}
