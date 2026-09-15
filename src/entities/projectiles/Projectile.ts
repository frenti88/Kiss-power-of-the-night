import * as THREE from 'three';
import { AABB } from '../../types';

export class Projectile {
  public active: boolean = false;
  public x: number = 0;
  public y: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public damage: number = 20;
  public lifetime: number = 0;
  public maxLifetime: number = 2;
  public isPiercing: boolean = false;
  public isPlayerOwned: boolean = true;
  public width: number = 12;
  public height: number = 8;
  public mesh: THREE.Mesh;

  constructor(sharedGeometry: THREE.BufferGeometry) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      transparent: true
    });
    this.mesh = new THREE.Mesh(sharedGeometry, mat);
    this.mesh.visible = false;
  }

  public spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    lifetime: number,
    colorHex: number,
    isPlayerOwned = true,
    isPiercing = false
  ): void {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.isPlayerOwned = isPlayerOwned;
    this.isPiercing = isPiercing;
    this.active = true;

    this.mesh.visible = true;
    this.mesh.scale.set(this.width, this.height, 1);
    this.mesh.position.set(x, y, 10);
    (this.mesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
  }

  public update(dt: number): void {
    if (!this.active) return;

    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.deactivate();
      return;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.mesh.position.set(Math.round(this.x), Math.round(this.y), 10);
  }

  public deactivate(): void {
    this.active = false;
    this.mesh.visible = false;
  }

  public getBounds(): AABB {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }
}
