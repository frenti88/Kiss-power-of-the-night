import * as THREE from 'three';
import { Enemy } from './Enemy';
import { EnemyConfig } from '../../types';

export class ZombieRoadie extends Enemy {
  constructor(
    config: EnemyConfig,
    atlasTexture: THREE.Texture,
    sharedGeometry: THREE.BufferGeometry,
    startX: number,
    startY: number
  ) {
    super(config, atlasTexture, sharedGeometry, startX, startY);
  }
}
