export class Velocity {
  public vx: number;
  public vy: number;

  constructor(vx = 0, vy = 0) {
    this.vx = vx;
    this.vy = vy;
  }

  public set(vx: number, vy: number): void {
    this.vx = vx;
    this.vy = vy;
  }
}
