import * as THREE from 'three';
import { Projectile } from './Projectile';

export class ProjectilePool {
  private static readonly POOL_SIZE = 64;
  public pool: Projectile[] = [];
  public group: THREE.Group;

  constructor(scene: THREE.Scene, sharedGeometry: THREE.BufferGeometry) {
    this.group = new THREE.Group();
    scene.add(this.group);

    for (let i = 0; i < ProjectilePool.POOL_SIZE; i++) {
      const proj = new Projectile(sharedGeometry);
      this.group.add(proj.mesh);
      this.pool.push(proj);
    }
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
  ): Projectile | null {
    const proj = this.pool.find((p) => !p.active);
    if (!proj) return null;

    proj.spawn(x, y, vx, vy, damage, lifetime, colorHex, isPlayerOwned, isPiercing);
    return proj;
  }

  public update(dt: number): void {
    for (const proj of this.pool) {
      if (proj.active) {
        proj.update(dt);
      }
    }
  }

  public clear(): void {
    for (const proj of this.pool) {
      proj.deactivate();
    }
  }

  public destroy(): void {
    for (const proj of this.pool) {
      (proj.mesh.material as THREE.Material).dispose();
      this.group.remove(proj.mesh);
    }
  }
}
