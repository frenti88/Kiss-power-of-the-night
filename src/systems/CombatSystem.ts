import { Player } from '../entities/player/Player';
import { Enemy } from '../entities/enemies/Enemy';
import { ProjectilePool } from '../entities/projectiles/ProjectilePool';
import { DestructionSystem } from './DestructionSystem';
import { ParticleSystem } from './ParticleSystem';
import { CameraController } from '../core/CameraController';
import { AudioManager } from '../core/AudioManager';
import { AABBCollider } from '../components/AABBCollider';

export class CombatSystem {
  private player: Player;
  private enemies: Enemy[];
  private projectilePool: ProjectilePool;
  private destructionSystem: DestructionSystem;
  private particleSystem: ParticleSystem;
  private camera: CameraController;
  private audioManager: AudioManager;

  // Arcade Hit Stop (freeze frames)
  public hitStopTimer: number = 0;

  constructor(
    player: Player,
    enemies: Enemy[],
    projectilePool: ProjectilePool,
    destructionSystem: DestructionSystem,
    particleSystem: ParticleSystem,
    camera: CameraController
  ) {
    this.player = player;
    this.enemies = enemies;
    this.projectilePool = projectilePool;
    this.destructionSystem = destructionSystem;
    this.particleSystem = particleSystem;
    this.camera = camera;
    this.audioManager = AudioManager.getInstance();
  }

  public setEnemies(enemies: Enemy[]): void {
    this.enemies = enemies;
  }

  public update(dt: number): void {
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      return; // Freeze combat updates during hit stop
    }

    const playerBounds = this.player.getBounds();

    // 1. Check Player Melee vs Enemies & Destructibles
    const meleeBox = this.player.combat.getMeleeHitbox();
    if (meleeBox) {
      const meleeDamage = this.player.combat.getMeleeDamage();

      for (const enemy of this.enemies) {
        if (!enemy.active || enemy.health.isDead()) continue;
        if (AABBCollider.overlaps(meleeBox, enemy.getBounds())) {
          const hit = enemy.takeDamage(meleeDamage, this.player.transform.x < enemy.transform.x);
          if (hit) {
            this.triggerHitImpact(enemy.transform.x, enemy.transform.y + 20, true);
            this.player.combat.addRockPower(15);
            this.player.score += 50;
          }
        }
      }

      for (const dest of this.destructionSystem.destructibles) {
        if (!dest.active) continue;
        if (AABBCollider.overlaps(meleeBox, dest.getBounds())) {
          this.destructionSystem.damageDestructible(dest, meleeDamage);
          this.triggerHitImpact(dest.x + dest.width / 2, dest.y + dest.height / 2, false);
        }
      }
    }

    // 2. Check Player Projectiles vs Enemies & Destructibles
    for (const proj of this.projectilePool.pool) {
      if (!proj.active || !proj.isPlayerOwned) continue;
      const projBounds = proj.getBounds();

      // Vs Enemies
      for (const enemy of this.enemies) {
        if (!enemy.active || enemy.health.isDead()) continue;
        if (AABBCollider.overlaps(projBounds, enemy.getBounds())) {
          const hit = enemy.takeDamage(proj.damage, proj.vx > 0);
          if (hit) {
            this.triggerHitImpact(proj.x, proj.y, false);
            this.player.combat.addRockPower(8);
            this.player.score += 25;
            if (!proj.isPiercing) {
              proj.deactivate();
              break;
            }
          }
        }
      }

      // Vs Destructibles
      if (proj.active) {
        for (const dest of this.destructionSystem.destructibles) {
          if (!dest.active) continue;
          if (AABBCollider.overlaps(projBounds, dest.getBounds())) {
            this.destructionSystem.damageDestructible(dest, proj.damage);
            this.triggerHitImpact(proj.x, proj.y, false);
            if (!proj.isPiercing) {
              proj.deactivate();
              break;
            }
          }
        }
      }
    }

    // 3. Check Enemies vs Player (Damage contact / attack)
    for (const enemy of this.enemies) {
      if (!enemy.active || enemy.health.isDead()) continue;

      if (AABBCollider.overlaps(playerBounds, enemy.getBounds())) {
        const fromRight = enemy.transform.x > this.player.transform.x;
        const damaged = this.player.takeDamage(enemy.config.stats.damage, fromRight);
        if (damaged) {
          this.camera.triggerShake(5, 200);
          this.audioManager.playHit();
          this.particleSystem.emit(this.player.transform.x, this.player.transform.y + 24, 'sparks', 8);
        }
      }
    }

    // 4. Check Pickups vs Player
    for (const pickup of this.destructionSystem.pickups) {
      if (!pickup.active) continue;
      if (AABBCollider.overlaps(playerBounds, pickup.getBounds())) {
        pickup.deactivate();
        this.audioManager.playPickup();
        this.particleSystem.emit(pickup.x, pickup.y, 'sparks', 10);

        if (pickup.type === 'health_small') {
          this.player.health.heal(30);
        } else if (pickup.type === 'rock_power_small') {
          this.player.combat.addRockPower(25);
        }
      }
    }
  }

  private triggerHitImpact(x: number, y: number, isHeavy: boolean): void {
    this.audioManager.playHit();
    this.particleSystem.emit(x, y, 'blood', isHeavy ? 10 : 5);
    this.particleSystem.emit(x, y, 'sparks', isHeavy ? 12 : 6);

    if (isHeavy) {
      this.camera.triggerShake(4, 180);
      this.hitStopTimer = 0.08; // 80ms hit stop
    } else {
      this.camera.triggerShake(2, 100);
      this.hitStopTimer = 0.04; // 40ms hit stop
    }
  }
}
