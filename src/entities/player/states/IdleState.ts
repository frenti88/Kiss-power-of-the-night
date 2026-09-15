import { PlayerState } from './PlayerState';
import { InputState } from '../../../types';

export class IdleState extends PlayerState {
  public enter(): void {
    this.player.animator.animation.play('idle');
    this.player.velocity.vx = 0;
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

    if (input.shootPressed || input.shoot) {
      this.player.stateMachine.changeState('shoot');
      return;
    }

    if (input.jumpPressed || this.player.hasBufferedJump()) {
      this.player.stateMachine.changeState('jump');
      return;
    }

    if (input.down) {
      this.player.stateMachine.changeState('crouch');
      return;
    }

    if (input.left || input.right) {
      this.player.stateMachine.changeState('run');
      return;
    }

    if (!this.player.isGrounded) {
      this.player.stateMachine.changeState('fall');
    }
  }

  public exit(): void {}
  public getName(): string {
    return 'Idle';
  }
}
