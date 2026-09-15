import * as THREE from 'three';
import { Level } from './Level';
import { LevelSpawnConfig, EnemyConfig } from '../types';
import { Player } from '../entities/player/Player';
import { Enemy } from '../entities/enemies/Enemy';
import { ZombieRoadie } from '../entities/enemies/ZombieRoadie';
import { LevelEventManager } from './LevelEventManager';
import { DestructionSystem } from '../systems/DestructionSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { CameraController } from '../core/CameraController';
import { CollisionSystem, SolidBox } from '../systems/CollisionSystem';
import { NeonFlickerEffect } from '../rendering/NeonFlickerEffect';
import { AmbientEnvironment } from '../rendering/AmbientEnvironment';
import { AmbientEventSystem } from '../systems/AmbientEventSystem';
import { EnvironmentConfig, DEFAULT_ENVIRONMENT_CONFIG } from '../config/EnvironmentConfig';
import zombieRoadieData from '../data/enemies/zombie_roadie.json';

export class LevelManager {
  public currentLevel: Level;
  public enemies: Enemy[] = [];
  public eventManager: LevelEventManager;
  public destructionSystem: DestructionSystem;
  public neonFlicker: NeonFlickerEffect;
  public ambientEnvironment: AmbientEnvironment;
  public ambientEventSystem: AmbientEventSystem;
  public envConfig: EnvironmentConfig;

  private scene: THREE.Scene;
  private sharedGeometry: THREE.BufferGeometry;
  private tileTexture: THREE.Texture;
  private enemyAtlasTexture: THREE.Texture;
  private solidsGroup: THREE.Group;
  private propsGroup: THREE.Group;
  private spawnedIds: Set<string> = new Set();
  private pendingSpawns: LevelSpawnConfig[] = [];
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

  constructor(
    level: Level,
    scene: THREE.Scene,
    sharedGeometry: THREE.BufferGeometry,
    tileTexture: THREE.Texture,
    enemyAtlasTexture: THREE.Texture,
    camera: CameraController,
    particleSystem: ParticleSystem,
    envConfig: EnvironmentConfig = DEFAULT_ENVIRONMENT_CONFIG
  ) {
    this.currentLevel = level;
    this.scene = scene;
    this.sharedGeometry = sharedGeometry;
    this.tileTexture = tileTexture;
    this.enemyAtlasTexture = enemyAtlasTexture;
    this.envConfig = envConfig;

    this.solidsGroup = new THREE.Group();
    this.scene.add(this.solidsGroup);

    this.propsGroup = new THREE.Group();
    this.scene.add(this.propsGroup);

    this.destructionSystem = new DestructionSystem(scene, particleSystem, tileTexture, sharedGeometry);
    this.eventManager = new LevelEventManager(level.triggers, camera, particleSystem);
    this.neonFlicker = new NeonFlickerEffect(scene, sharedGeometry, particleSystem);
    this.ambientEnvironment = new AmbientEnvironment(scene, sharedGeometry, particleSystem, envConfig);
    this.ambientEventSystem = new AmbientEventSystem(scene, sharedGeometry, particleSystem, envConfig);

    this.buildLevelSolids();
    this.initDetroitAtmosphere();
    this.initDestructibles();
    this.pendingSpawns = [...level.spawns];
  }

  private buildLevelSolids(): void {
    // Wet asphalt street texture with strict 16-bit NearestFilter
    const groundTex = this.textureLoader.load('/assets/levels/detroit/detroit_ground_wet.png', (tex) => {
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
    });

    for (const solid of this.currentLevel.solids) {
      if (solid.type === 'ground') {
        const mat = new THREE.MeshBasicMaterial({
          map: groundTex,
          transparent: true
        });
        groundTex.wrapS = THREE.RepeatWrapping;
        mat.map!.repeat.set(solid.width / 256, 1.0);

        const mesh = new THREE.Mesh(this.sharedGeometry, mat);
        mesh.scale.set(solid.width, solid.height, 1);
        mesh.position.set(solid.x + solid.width / 2, solid.y + solid.height / 2, 0);
        this.solidsGroup.add(mesh);
      } else {
        // One-way platforms (scaffolding, catwalks, car roofs)
        const mat = new THREE.MeshBasicMaterial({
          map: this.tileTexture.clone(),
          transparent: true
        });
        mat.map!.magFilter = THREE.NearestFilter;
        mat.map!.minFilter = THREE.NearestFilter;
        mat.map!.repeat.set(solid.width / 64, 0.25);
        mat.map!.offset.set(0.5, 0.0);
        mat.map!.wrapS = THREE.RepeatWrapping;
        mat.map!.needsUpdate = true;

        const mesh = new THREE.Mesh(this.sharedGeometry, mat);
        mesh.scale.set(solid.width, solid.height, 1);
        mesh.position.set(solid.x + solid.width / 2, solid.y + solid.height / 2, 2);
        this.solidsGroup.add(mesh);
      }
    }
  }

  private initDetroitAtmosphere(): void {
    // 1. Streetlamp warm volumetric light cones & halos along the sidewalk (Section 7)
    if (this.envConfig.streetlamps.enabled) {
      for (const lx of this.envConfig.streetlamps.lampXPositions) {
        this.neonFlicker.addStreetlight(lx, 74, 80, 10, 56);
      }
    }

    // 2. Individual neon signs with independent channels (Section 6)
    if (this.envConfig.neon.enabled) {
      for (const signDef of this.envConfig.neon.signs) {
        this.neonFlicker.addNeonSign(signDef);
      }
    }

    // 3. Manhole covers along the wet avenue
    const manholePositions = [320, 840, 1440, 2060, 2680];
    const manholeTex = this.textureLoader.load('/assets/levels/detroit/prop_manhole.png', (tex) => {
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
    });

    for (const mx of manholePositions) {
      const mat = new THREE.MeshBasicMaterial({
        map: manholeTex,
        transparent: true
      });
      const mesh = new THREE.Mesh(this.sharedGeometry, mat);
      mesh.scale.set(34, 12, 1);
      mesh.position.set(mx, 32 + 5, 2);
      this.propsGroup.add(mesh);
    }
  }

  private initDestructibles(): void {
    for (const d of this.currentLevel.destructibles) {
      this.destructionSystem.addDestructible(d);
    }
  }

  public update(player: Player, dt: number): void {
    // 1. Check spawn triggers
    for (let i = this.pendingSpawns.length - 1; i >= 0; i--) {
      const sp = this.pendingSpawns[i];
      if (player.transform.x >= sp.triggerX && !this.spawnedIds.has(sp.id)) {
        this.spawnEnemy(sp);
        this.spawnedIds.add(sp.id);
        this.pendingSpawns.splice(i, 1);
      }
    }

    // 2. Update existing enemies
    const solids: SolidBox[] = this.currentLevel.solids;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.active) {
        this.scene.remove(enemy.animator.mesh);
        enemy.destroy();
        this.enemies.splice(i, 1);
        continue;
      }

      // Physics & movement
      const res = CollisionSystem.resolveEntityMovement(
        enemy.transform,
        enemy.velocity,
        enemy.collider,
        solids,
        dt
      );
      enemy.isGrounded = res.grounded;

      enemy.update(player.transform.x, player.transform.y, dt);
    }

    // 3. Update level events, destructibles and FX
    this.eventManager.update(player);
    this.destructionSystem.update(dt);
    this.neonFlicker.update(dt);

    // 4. Update Ambient Environment & Events (Sections 4, 5, 8, 10, 11, 13)
    this.ambientEnvironment.update(dt, player.transform.x);
    this.ambientEventSystem.update(dt, player.transform.x);
  }

  private spawnEnemy(sp: LevelSpawnConfig): void {
    const config = zombieRoadieData as unknown as EnemyConfig;
    const enemy = new ZombieRoadie(
      config,
      this.enemyAtlasTexture,
      this.sharedGeometry,
      sp.x,
      sp.y
    );
    this.scene.add(enemy.animator.mesh);
    this.enemies.push(enemy);
  }

  public destroy(): void {
    while (this.solidsGroup.children.length > 0) {
      const child = this.solidsGroup.children[0] as THREE.Mesh;
      child.geometry.dispose();
      (child.material as THREE.Material).dispose();
      this.solidsGroup.remove(child);
    }
    this.scene.remove(this.solidsGroup);

    while (this.propsGroup.children.length > 0) {
      const child = this.propsGroup.children[0] as THREE.Mesh;
      child.geometry.dispose();
      (child.material as THREE.Material).dispose();
      this.propsGroup.remove(child);
    }
    this.scene.remove(this.propsGroup);

    for (const e of this.enemies) {
      this.scene.remove(e.animator.mesh);
      e.destroy();
    }
    this.enemies = [];
    this.destructionSystem.clear();
    this.neonFlicker.destroy();
    this.ambientEnvironment.destroy();
    this.ambientEventSystem.destroy();
  }
}
