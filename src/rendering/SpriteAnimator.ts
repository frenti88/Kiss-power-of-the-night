import * as THREE from 'three';
import { SpriteAtlas } from './SpriteAtlas';
import { SpriteAnimation } from '../components/SpriteAnimation';

export class SpriteAnimator {
  public mesh: THREE.Mesh;
  public atlas: SpriteAtlas;
  public animation: SpriteAnimation;
  public material: THREE.MeshBasicMaterial;

  constructor(
    sharedGeometry: THREE.BufferGeometry,
    atlas: SpriteAtlas,
    animation: SpriteAnimation,
    width: number,
    height: number
  ) {
    this.atlas = atlas;
    this.animation = animation;

    // Clone texture clone or separate texture instance so UV repeats don't collide
    const tex = atlas.texture.clone();
    tex.needsUpdate = true;
    this.atlas = new SpriteAtlas(tex, atlas.frameWidth, atlas.frameHeight, atlas.totalCols, atlas.totalRows);

    this.material = new THREE.MeshBasicMaterial({
      map: this.atlas.texture,
      transparent: true,
      depthWrite: false,
      depthTest: true
    });

    this.mesh = new THREE.Mesh(sharedGeometry, this.material);
    this.mesh.scale.set(width, height, 1);
  }

  public update(dt: number, flipX: boolean, isHitFlashing = false): void {
    this.animation.update(dt);
    const row = this.animation.getCurrentRow();
    const col = this.animation.currentFrame;

    this.atlas.applyFrameToMaterial(this.material, row, col, flipX);

    if (isHitFlashing) {
      this.material.color.setRGB(3, 3, 3); // Bright flash
    } else {
      this.material.color.setRGB(1, 1, 1);
    }
  }

  public setPosition(x: number, y: number, z = 0): void {
    this.mesh.position.set(Math.round(x), Math.round(y), z);
  }
}
