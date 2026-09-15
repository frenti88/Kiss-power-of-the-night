export class Health {
  public current: number;
  public max: number;
  public invulnerableTimer: number = 0;
  public defaultInvulnerabilityDuration: number;

  constructor(max: number, defaultInvulnerabilityDuration = 0.8) {
    this.max = max;
    this.current = max;
    this.defaultInvulnerabilityDuration = defaultInvulnerabilityDuration;
  }

  public takeDamage(amount: number, invulnerableDuration?: number): boolean {
    if (this.invulnerableTimer > 0 || this.isDead()) {
      return false;
    }

    this.current = Math.max(0, this.current - amount);
    this.invulnerableTimer = invulnerableDuration !== undefined ? invulnerableDuration : this.defaultInvulnerabilityDuration;
    return true;
  }

  public heal(amount: number): void {
    if (this.isDead()) return;
    this.current = Math.min(this.max, this.current + amount);
  }

  public update(dt: number): void {
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
    }
  }

  public isDead(): boolean {
    return this.current <= 0;
  }

  public isInvulnerable(): boolean {
    return this.invulnerableTimer > 0;
  }
}
