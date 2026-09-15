import { AABB, CollisionLayer } from '../types';

export class AABBCollider {
  public width: number;
  public height: number;
  public offsetX: number;
  public offsetY: number;
  public layer: CollisionLayer;
  public isTrigger: boolean;
  public isOneWay: boolean;

  constructor(
    width: number,
    height: number,
    offsetX = 0,
    offsetY = 0,
    layer: CollisionLayer = 'SOLID',
    isTrigger = false,
    isOneWay = false
  ) {
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.layer = layer;
    this.isTrigger = isTrigger;
    this.isOneWay = isOneWay;
  }

  public getBounds(entityX: number, entityY: number): AABB {
    return {
      x: entityX + this.offsetX - this.width / 2,
      y: entityY + this.offsetY,
      width: this.width,
      height: this.height
    };
  }

  public static overlaps(a: AABB, b: AABB): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}
