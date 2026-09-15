import { PlayerState } from './PlayerState';
import { InputState } from '../../../types';

export class ShootState extends PlayerState {
  public enter(): void {
    this.player.animator.animation.play('shoot');
    this.player.velocity.vx = 0;
  }

  public update(input: InputState, _dt: number): void {
    if (this.player.health.isDead()) {
      this.player.stateMachine.changeState('death');
      return;
    }

    if (input.jumpPressed || this.player.hasBufferedJump()) {
      this.player.stateMachine.changeState('jump');
      return;
    }

    if (input.meleePressed) {
      this.player.stateMachine.changeState('melee');
      return;
    }

    if (input.left || input.right) {
      this.player.stateMachine.changeState('run');
      return;
    }

    if (input.down) {
      this.player.stateMachine.changeState('crouch');
      return;
    }

    if (input.shoot || input.shootPressed) {
      this.player.combat.shoot(
        this.player.transform.x,
        this.player.transform.y,
        this.player.facingRight,
        false,
        input.up
      );
    } else {
      this.player.stateMachine.changeState('idle');
    }
  }

  public exit(): void {}
  public getName(): string {
    return 'Shoot';
  }
}
