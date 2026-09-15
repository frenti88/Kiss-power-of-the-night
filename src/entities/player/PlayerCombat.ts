import { CharacterConfig, AABB } from '../../types';
import { ProjectilePool } from '../projectiles/ProjectilePool';
import { AudioManager } from '../../core/AudioManager';

export class PlayerCombat {
  private config: CharacterConfig;
  private projectilePool: ProjectilePool;
  private audioManager: AudioManager;

  private shootCooldownTimer: number = 0;
  public rockPower: number = 0;
  public static readonly MAX_ROCK_POWER = 100;

  // Melee state
  public isMeleeActive: boolean = false;
  private meleeTimer: number = 0;
  private meleeHitbox: AABB | null = null;

  constructor(config: CharacterConfig, projectilePool: ProjectilePool) {
    this.config = config;
    this.projectilePool = projectilePool;
    this.audioManager = AudioManager.getInstance();
  }

  public update(dt: number, playerX: number, playerY: number, facingRight: boolean): void {
    if (this.shootCooldownTimer > 0) {
      this.shootCooldownTimer -= dt;
    }

    if (this.isMeleeActive) {
      this.meleeTimer -= dt;
      if (this.meleeTimer <= 0) {
        this.isMeleeActive = false;
        this.meleeHitbox = null;
      } else {
        // Update melee hitbox position
        const range = this.config.combat.melee.range;
        const width = this.config.combat.melee.width;
        const height = this.config.combat.melee.height;
        const hx = facingRight ? playerX + range - width / 2 : playerX - range - width / 2;
        const hy = playerY + 8;
        this.meleeHitbox = { x: hx, y: hy, width, height };
      }
    }
  }

  public canShoot(): boolean {
    return this.shootCooldownTimer <= 0 && !this.isMeleeActive;
  }

  public shoot(playerX: number, playerY: number, facingRight: boolean, isCrouched = false, aimUp = false): boolean {
    if (!this.canShoot()) return false;

    const wp = this.config.combat.primaryWeapon;
    this.shootCooldownTimer = wp.fireRateMs / 1000;

    let spawnX = facingRight ? playerX + 22 : playerX - 22;
    let spawnY = isCrouched ? playerY + 16 : playerY + 28;
    let vx = facingRight ? wp.speed : -wp.speed;
    let vy = 0;

    if (aimUp) {
      spawnX = playerX;
      spawnY = playerY + 44;
      vx = 0;
      vy = wp.speed;
    }

    const colorHex = wp.color ? parseInt(wp.color.replace('#', '0x')) : 0xff4500;
    this.projectilePool.spawn(
      spawnX,
      spawnY,
      vx,
      vy,
      wp.damage,
      wp.lifetime,
      colorHex,
      true,
      wp.piercing
    );

    this.audioManager.playShoot();
    return true;
  }

  public startMelee(playerX: number, playerY: number, facingRight: boolean): boolean {
    if (this.isMeleeActive) return false;

    this.isMeleeActive = true;
    this.meleeTimer = this.config.combat.melee.durationMs / 1000;
    const width = this.config.combat.melee.width;
    const height = this.config.combat.melee.height;
    const range = this.config.combat.melee.range;
    const hx = facingRight ? playerX + range - width / 2 : playerX - range - width / 2;
    const hy = playerY + 8;
    this.meleeHitbox = { x: hx, y: hy, width, height };

    this.audioManager.playMelee();
    return true;
  }

  public addRockPower(amount: number): boolean {
    const wasFull = this.rockPower >= PlayerCombat.MAX_ROCK_POWER;
    this.rockPower = Math.min(PlayerCombat.MAX_ROCK_POWER, this.rockPower + amount);
    if (!wasFull && this.rockPower >= PlayerCombat.MAX_ROCK_POWER) {
      this.audioManager.playRockPowerReady();
      return true; // just became full
    }
    return false;
  }

  public canUseUltimate(): boolean {
    return this.rockPower >= PlayerCombat.MAX_ROCK_POWER;
  }

  public consumeUltimate(): boolean {
    if (!this.canUseUltimate()) return false;
    this.rockPower = 0;
    return true;
  }

  public getMeleeHitbox(): AABB | null {
    return this.isMeleeActive ? this.meleeHitbox : null;
  }

  public getMeleeDamage(): number {
    return this.config.combat.melee.damage;
  }
}
