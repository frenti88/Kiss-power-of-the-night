import { PlayerState } from './PlayerState';
import { InputState } from '../../../types';
import { AudioManager } from '../../../core/AudioManager';

export class JumpState extends PlayerState {
  private hasCutJump: boolean = false;

  public enter(): void {
    this.player.animator.animation.play('jump');
    this.player.velocity.vy = this.player.config.stats.jumpForce;
    this.player.isGrounded = false;
    this.player.clearJumpBuffer();
    this.hasCutJump = false;
    AudioManager.getInstance().playJump();
  }

  public update(input: InputState, _dt: number): void {
    if (this.player.health.isDead()) {
      this.player.stateMachine.changeState('death');
      return;
    }

    // Variable jump height
    if (!input.jump && this.player.velocity.vy > 0 && !this.hasCutJump) {
      this.player.velocity.vy *= this.player.config.stats.variableJumpMultiplier;
      this.hasCutJump = true;
    }

    // Air horizontal control
    if (input.right) {
      this.player.facingRight = true;
      this.player.velocity.vx = this.player.config.stats.moveSpeed * 0.9;
    } else if (input.left) {
      this.player.facingRight = false;
      this.player.velocity.vx = -this.player.config.stats.moveSpeed * 0.9;
    } else {
      this.player.velocity.vx *= 0.9;
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
      return;
    }

    if (this.player.velocity.vy <= 0) {
      this.player.stateMachine.changeState('fall');
    }
  }

  public exit(): void {}
  public getName(): string {
    return 'Jump';
  }
}
