import { AnimationDefinition } from '../types';

export class SpriteAnimation {
  public animations: Record<string, AnimationDefinition>;
  public currentAnim: string = '';
  public currentFrame: number = 0;
  public frameTimer: number = 0;
  public isFinished: boolean = false;

  constructor(animations: Record<string, AnimationDefinition>, initialAnim = 'idle') {
    this.animations = animations;
    this.play(initialAnim);
  }

  public play(name: string, restartIfSame = false): void {
    if (this.currentAnim === name && !restartIfSame) {
      return;
    }
    if (!this.animations[name]) {
      return;
    }
    this.currentAnim = name;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.isFinished = false;
  }

  public update(dt: number): void {
    const def = this.animations[this.currentAnim];
    if (!def || def.frames <= 1) return;

    this.frameTimer += dt;
    const frameDuration = 1 / def.fps;

    if (this.frameTimer >= frameDuration) {
      this.frameTimer -= frameDuration;
      if (this.currentFrame < def.frames - 1) {
        this.currentFrame++;
      } else if (def.loop) {
        this.currentFrame = 0;
      } else {
        this.isFinished = true;
      }
    }
  }

  public getCurrentRow(): number {
    return this.animations[this.currentAnim]?.row ?? 0;
  }
}
