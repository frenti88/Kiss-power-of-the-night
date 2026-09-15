import { PlayerState } from './PlayerState';
import { InputState } from '../../../types';

export class RunState extends PlayerState {
  public enter(): void {
    this.player.animator.animation.play('run');
  }

  public update(input: InputState, _dt: number): void {
    if (this.player.health.isDead()) {
      this.player.stateMachine.changeState('death');
      return;
    }

    if (input.meleePressed) {
      this.player.stateMachine.changeState('melee');
      return;
    }

    if (input.jumpPressed || this.player.hasBufferedJump()) {
      this.player.stateMachine.changeState('jump');
      return;
    }

    if (!this.player.isGrounded) {
      this.player.stateMachine.changeState('fall');
      return;
    }

    if (input.down) {
      this.player.stateMachine.changeState('crouch');
      return;
    }

    // Direction and movement
    if (input.right) {
      this.player.facingRight = true;
      this.player.velocity.vx = this.player.config.stats.moveSpeed;
    } else if (input.left) {
      this.player.facingRight = false;
      this.player.velocity.vx = -this.player.config.stats.moveSpeed;
    } else {
      this.player.stateMachine.changeState('idle');
      return;
    }

    // Run-and-gun: shoot while running
    if (input.shoot || input.shootPressed) {
      this.player.combat.shoot(
        this.player.transform.x,
        this.player.transform.y,
        this.player.facingRight,
        false,
        input.up
      );
    }
  }

  public exit(): void {}
  public getName(): string {
    return 'Run';
  }
}
