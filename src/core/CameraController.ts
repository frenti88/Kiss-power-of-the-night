export class CameraController {
  public x: number = 0;
  public y: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;

  public viewportWidth: number = 384;
  public viewportHeight: number = 216;

  public minX: number = 0;
  public maxX: number = 3200;
  public isLocked: boolean = false;
  public lockX: number = 0;

  // Dead zone & look-ahead
  private deadZoneHalfWidth: number = 24;
  private lookAheadDistance: number = 55;
  private currentLookAhead: number = 0;
  private lerpSpeed: number = 5.0;

  // Screen shake
  private shakeTimer: number = 0;
  private shakeDuration: number = 0;
  private shakeIntensity: number = 0;
  public shakeOffsetX: number = 0;
  public shakeOffsetY: number = 0;

  private worldWidth: number = 3200;

  constructor(viewportWidth = 384, viewportHeight = 216) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public setBounds(minX: number, maxX: number): void {
    this.minX = minX;
    this.worldWidth = maxX;
    this.maxX = Math.max(minX, maxX - this.viewportWidth);
  }

  public onResize(viewportWidth: number, viewportHeight: number, totalWorldWidth?: number): void {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    if (totalWorldWidth !== undefined) {
      this.worldWidth = totalWorldWidth;
    }
    this.maxX = Math.max(this.minX, this.worldWidth - this.viewportWidth);
    if (this.x > this.maxX) this.x = this.maxX;
    if (this.x < this.minX) this.x = this.minX;
  }

  public triggerShake(intensity: number, durationMs: number): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = durationMs / 1000;
    this.shakeTimer = this.shakeDuration;
  }

  public lock(x: number): void {
    this.isLocked = true;
    this.lockX = x;
  }

  public unlock(): void {
    this.isLocked = false;
  }

  public update(targetX: number, facingRight: boolean, dt: number): void {
    // Screen shake update
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const progress = Math.max(0, this.shakeTimer / this.shakeDuration);
      const currentAmp = this.shakeIntensity * progress;
      this.shakeOffsetX = (Math.random() * 2 - 1) * currentAmp;
      this.shakeOffsetY = (Math.random() * 2 - 1) * currentAmp;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    if (this.isLocked) {
      this.x = this.lockX;
      return;
    }

    // Look-ahead calculation
    const targetLookAhead = facingRight ? this.lookAheadDistance : -this.lookAheadDistance;
    this.currentLookAhead += (targetLookAhead - this.currentLookAhead) * (dt * this.lerpSpeed);

    const desiredCenter = targetX + this.currentLookAhead;
    const currentCenter = this.x + this.viewportWidth / 2;
    const diff = desiredCenter - currentCenter;

    if (Math.abs(diff) > this.deadZoneHalfWidth) {
      const followSpeed = 6.0;
      const move = (diff - Math.sign(diff) * this.deadZoneHalfWidth) * (dt * followSpeed);
      this.x += move;
    }

    // Clamp
    if (this.x < this.minX) this.x = this.minX;
    if (this.x > this.maxX) this.x = this.maxX;
  }

  public getPixelAlignedX(): number {
    return Math.round(this.x + this.shakeOffsetX);
  }

  public getPixelAlignedY(): number {
    return Math.round(this.y + this.shakeOffsetY);
  }
}
