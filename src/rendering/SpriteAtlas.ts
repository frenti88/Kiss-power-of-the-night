import * as THREE from 'three';

export class SpriteAtlas {
  public texture: THREE.Texture;
  public frameWidth: number;
  public frameHeight: number;
  public totalCols: number;
  public totalRows: number;

  constructor(
    texture: THREE.Texture,
    frameWidth: number,
    frameHeight: number,
    totalCols = 8,
    totalRows = 12
  ) {
    this.texture = texture;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.totalCols = totalCols;
    this.totalRows = totalRows;
  }

  // Computes UV transform parameters (offset and repeat)
  public applyFrameToMaterial(material: THREE.MeshBasicMaterial, row: number, col: number, flipX: boolean): void {
    const uScale = 1 / this.totalCols;
    const vScale = 1 / this.totalRows;

    const uOffset = col * uScale;
    // In Three.js, UV origin is bottom-left
    const vOffset = 1.0 - (row + 1) * vScale;

    material.map = this.texture;
    if (material.map) {
      if (flipX) {
        material.map.repeat.set(-uScale, vScale);
        material.map.offset.set(uOffset + uScale, vOffset);
      } else {
        material.map.repeat.set(uScale, vScale);
        material.map.offset.set(uOffset, vOffset);
      }
    }
  }
}
