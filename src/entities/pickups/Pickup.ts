import * as THREE from 'three';
import { AABB } from '../../types';

export type PickupType = 'health_small' | 'rock_power_small';

export class Pickup {
  public active: boolean = true;
  public type: PickupType;
  public x: number;
  public y: number;
  public baseY: number;
  public width: number = 14;
  public height: number = 14;
  public mesh: THREE.Mesh;
  private time: number = 0;

  constructor(
    type: PickupType,
    x: number,
    y: number,
    texture: THREE.Texture,
    sharedGeometry: THREE.BufferGeometry
  ) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.baseY = y;

    // Use tile texture UVs: Heart at u: 64/128, v: 32/128, Lightning at u: 96/128
    const mat = new THREE.MeshBasicMaterial({
      map: texture.clone(),
      transparent: true,
      depthWrite: false
    });

    // UV coordinates for pickup frame
    const uOffset = type === 'health_small' ? 0.5 : 0.75;
    mat.map!.repeat.set(0.25, 0.25);
    mat.map!.offset.set(uOffset, 0.25);
    mat.map!.needsUpdate = true;

    this.mesh = new THREE.Mesh(sharedGeometry, mat);
    this.mesh.scale.set(this.width, this.height, 1);
    this.mesh.position.set(this.x, this.y, 6);
  }

  public update(dt: number): void {
    if (!this.active) return;
    this.time += dt * 5;
    this.y = this.baseY + Math.sin(this.time) * 3;
    this.mesh.position.y = Math.round(this.y);
  }

  public getBounds(): AABB {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }

  public deactivate(): void {
    this.active = false;
    this.mesh.visible = false;
  }
}
