export class Transform2D {
  public x: number;
  public y: number;
  public prevX: number;
  public prevY: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public storePrev(): void {
    this.prevX = this.x;
    this.prevY = this.y;
  }
}
