import * as THREE from 'three';
import { LevelDestructibleConfig, AABB } from '../types';
import { Health } from '../components/Health';
import { ParticleSystem } from './ParticleSystem';
import { AudioManager } from '../core/AudioManager';
import { Pickup } from '../entities/pickups/Pickup';

const PROP_TEXTURE_URLS: Record<string, string> = {
  car_muscle: '/assets/levels/detroit/prop_muscle_car.png',
  car_sedan: '/assets/levels/detroit/prop_sedan.png',
  fire_hydrant: '/assets/levels/detroit/prop_hydrant.png',
  barricade: '/assets/levels/detroit/prop_barricade.png',
  dumpster: '/assets/levels/detroit/prop_dumpster.png',
  fire_barrel: '/assets/levels/detroit/prop_fire_barrel.png',
  amp: '/assets/levels/detroit/prop_amp.png'
};

const PROP_DEFAULT_SIZES: Record<string, { width: number; height: number }> = {
  car_muscle: { width: 96, height: 34 },
  car_sedan: { width: 64, height: 28 },
  fire_hydrant: { width: 18, height: 28 },
  barricade: { width: 36, height: 22 },
  dumpster: { width: 48, height: 30 },
  fire_barrel: { width: 22, height: 34 },
  amp: { width: 24, height: 32 },
  barrel: { width: 22, height: 28 },
  crate: { width: 24, height: 24 }
};

export class DestructibleEntity {
  public config: LevelDestructibleConfig;
  public health: Health;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public mesh: THREE.Mesh;
  public active: boolean = true;
  public isHydrantSpraying: boolean = false;
  public sprayTimer: number = 0;

  constructor(
    config: LevelDestructibleConfig,
    fallbackTexture: THREE.Texture,
    sharedGeometry: THREE.BufferGeometry,
    customTexture?: THREE.Texture
  ) {
    this.config = config;
    this.x = config.x;
    this.y = config.y;

    const size = PROP_DEFAULT_SIZES[config.type] || { width: 24, height: 28 };
    this.width = config.width || size.width;
    this.height = config.height || size.height;

    this.health = new Health(config.health, 0.1);

    let mat: THREE.MeshBasicMaterial;

    if (customTexture) {
      mat = new THREE.MeshBasicMaterial({
        map: customTexture,
        transparent: true
      });
    } else {
      mat = new THREE.MeshBasicMaterial({
        map: fallbackTexture.clone(),
        transparent: true
      });
      // Legacy procedural atlas mapping
      const uOffset = config.type === 'amp' ? 0.25 : 0.0;
      mat.map!.repeat.set(0.25, 0.25);
      mat.map!.offset.set(uOffset, 0.25);
      mat.map!.needsUpdate = true;
    }

    this.mesh = new THREE.Mesh(sharedGeometry, mat);
    this.mesh.scale.set(this.width, this.height, 1);
    this.mesh.position.set(this.x + this.width / 2, this.y + this.height / 2, 3);
  }

  public getBounds(): AABB {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

export class DestructionSystem {
  public destructibles: DestructibleEntity[] = [];
  public pickups: Pickup[] = [];
  private scene: THREE.Scene;
  private particleSystem: ParticleSystem;
  private audioManager: AudioManager;
  private tileTexture: THREE.Texture;
  private sharedGeometry: THREE.BufferGeometry;
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
  private loadedTextures: Map<string, THREE.Texture> = new Map();
  private flameTimer: number = 0;

  constructor(
    scene: THREE.Scene,
    particleSystem: ParticleSystem,
    tileTexture: THREE.Texture,
    sharedGeometry: THREE.BufferGeometry
  ) {
    this.scene = scene;
    this.particleSystem = particleSystem;
    this.audioManager = AudioManager.getInstance();
    this.tileTexture = tileTexture;
    this.sharedGeometry = sharedGeometry;

    this.preloadTextures();
  }

  private preloadTextures(): void {
    for (const [key, url] of Object.entries(PROP_TEXTURE_URLS)) {
      this.textureLoader.load(
        url,
        (tex) => {
          tex.magFilter = THREE.LinearFilter;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.generateMipmaps = true;
          tex.needsUpdate = true;
          this.loadedTextures.set(key, tex);

          // Update any already instantiated entities with this texture
          for (const d of this.destructibles) {
            if (d.config.type === key) {
              (d.mesh.material as THREE.MeshBasicMaterial).map = tex;
              (d.mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
            }
          }
        },
        undefined,
        (err) => console.warn(`Could not load prop texture ${url}`, err)
      );
    }
  }

  public addDestructible(config: LevelDestructibleConfig): void {
    const customTex = this.loadedTextures.get(config.type);
    const item = new DestructibleEntity(config, this.tileTexture, this.sharedGeometry, customTex);
    this.scene.add(item.mesh);
    this.destructibles.push(item);
  }

  public damageDestructible(item: DestructibleEntity, amount: number): boolean {
    if (!item.active) return false;

    item.health.takeDamage(amount);
    if (item.health.isDead()) {
      item.active = false;

      if (item.config.type === 'fire_hydrant') {
        // Hydrant breaks and sprays water geyser!
        item.isHydrantSpraying = true;
        item.sprayTimer = 4.0; // sprays for 4 seconds
        this.particleSystem.emit(item.x + item.width / 2, item.y + item.height, 'water_spray', 18);
        this.particleSystem.emit(item.x + item.width / 2, item.y + item.height, 'debris', 6);
        this.audioManager.playExplosion();
      } else if (item.config.type === 'car_muscle' || item.config.type === 'car_sedan') {
        // Big car explosion
        item.mesh.visible = false;
        this.particleSystem.emit(item.x + item.width / 2, item.y + item.height / 2, 'fire', 24);
        this.particleSystem.emit(item.x + item.width / 2, item.y + item.height / 2, 'debris', 16);
        this.particleSystem.emit(item.x + item.width / 2, item.y + item.height / 2, 'smoke', 12);
        this.audioManager.playExplosion();
      } else {
        // Standard barrels, amps, crates, barricades
        item.mesh.visible = false;
        this.particleSystem.emit(item.x + item.width / 2, item.y + item.height / 2, 'fire', 12);
        this.particleSystem.emit(item.x + item.width / 2, item.y + item.height / 2, 'debris', 8);
        this.audioManager.playExplosion();
      }

      // Spawn drop if configured
      if (item.config.drop && item.config.drop !== 'none') {
        const dropType = item.config.drop.includes('health') ? 'health_small' : 'rock_power_small';
        const pickup = new Pickup(
          dropType,
          item.x + item.width / 2,
          item.y + item.height / 2,
          this.tileTexture,
          this.sharedGeometry
        );
        this.scene.add(pickup.mesh);
        this.pickups.push(pickup);
      }
      return true;
    }
    return false;
  }

  public update(dt: number): void {
    // Ambient animations (barrel flames & hydrant water spray)
    this.flameTimer += dt;
    const shouldEmitFlame = this.flameTimer >= 0.12;
    if (shouldEmitFlame) this.flameTimer = 0;

    for (const d of this.destructibles) {
      if (d.active && (d.config.type === 'fire_barrel' || d.config.type === 'barrel') && shouldEmitFlame) {
        this.particleSystem.emit(d.x + d.width / 2, d.y + d.height - 4, 'fire', 1);
      }

      if (d.isHydrantSpraying) {
        d.sprayTimer -= dt;
        if (d.sprayTimer > 0) {
          this.particleSystem.emit(d.x + d.width / 2, d.y + d.height - 2, 'water_spray', 3);
        } else {
          d.isHydrantSpraying = false;
        }
      }
    }

    for (const p of this.pickups) {
      if (p.active) {
        p.update(dt);
      }
    }
  }

  public clear(): void {
    for (const d of this.destructibles) {
      this.scene.remove(d.mesh);
    }
    this.destructibles = [];

    for (const p of this.pickups) {
      this.scene.remove(p.mesh);
    }
    this.pickups = [];
  }
}
