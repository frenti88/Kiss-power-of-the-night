import { PlayerState } from './PlayerState';
import { InputState } from '../../../types';

export class CrouchState extends PlayerState {
  public enter(): void {
    this.player.animator.animation.play('crouch');
    this.player.velocity.vx = 0;
  }

  public update(input: InputState, _dt: number): void {
    if (this.player.health.isDead()) {
      this.player.stateMachine.changeState('death');
      return;
    }

    if (!input.down) {
      this.player.stateMachine.changeState('idle');
      return;
    }

    // Drop through one-way platform
    if (input.jumpPressed) {
      this.player.dropThroughOneWay = true;
      this.player.stateMachine.changeState('fall');
      return;
    }

    if (input.meleePressed) {
      this.player.stateMachine.changeState('melee');
      return;
    }

    // Crouch shoot
    if (input.shootPressed || input.shoot) {
      this.player.animator.animation.play('crouch_shoot');
      this.player.combat.shoot(
        this.player.transform.x,
        this.player.transform.y,
        this.player.facingRight,
        true,
        false
      );
    }
  }

  public exit(): void {
    this.player.dropThroughOneWay = false;
  }

  public getName(): string {
    return 'Crouch';
  }
}
