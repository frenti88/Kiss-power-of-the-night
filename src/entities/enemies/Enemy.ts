import * as THREE from 'three';
import { EnemyConfig, AABB } from '../../types';
import { Transform2D } from '../../components/Transform2D';
import { Velocity } from '../../components/Velocity';
import { AABBCollider } from '../../components/AABBCollider';
import { Health } from '../../components/Health';
import { SpriteAnimation } from '../../components/SpriteAnimation';
import { SpriteAnimator } from '../../rendering/SpriteAnimator';
import { SpriteAtlas } from '../../rendering/SpriteAtlas';
import { EventBus } from '../../core/EventBus';

export type EnemyAIState = 'IDLE' | 'PATROL' | 'CHASE' | 'ATTACK' | 'HIT' | 'DEATH';

export class Enemy {
  public config: EnemyConfig;
  public transform: Transform2D;
  public velocity: Velocity;
  public collider: AABBCollider;
  public health: Health;
  public animator: SpriteAnimator;

  public active: boolean = true;
  public facingRight: boolean = false;
  public isGrounded: boolean = false;

  public aiState: EnemyAIState = 'PATROL';
  private patrolOriginX: number;
  private patrolTimer: number = 0;
  private attackTimer: number = 0;
  private stateTimer: number = 0;

  constructor(
    config: EnemyConfig,
    atlasTexture: THREE.Texture,
    sharedGeometry: THREE.BufferGeometry,
    startX: number,
    startY: number
  ) {
    this.config = config;
    this.transform = new Transform2D(startX, startY);
    this.velocity = new Velocity(0, 0);
    this.patrolOriginX = startX;

    this.collider = new AABBCollider(
      config.collider.width,
      config.collider.height,
      config.collider.offsetX,
      config.collider.offsetY,
      'ENEMY'
    );

    this.health = new Health(config.stats.maxHealth, 0.2);

    const atlas = new SpriteAtlas(atlasTexture, config.frameWidth, config.frameHeight, 8, 6);
    const spriteAnimation = new SpriteAnimation(config.animations, 'patrol');
    this.animator = new SpriteAnimator(sharedGeometry, atlas, spriteAnimation, config.frameWidth, config.frameHeight);
  }

  public updateAI(playerX: number, playerY: number, dt: number): void {
    if (this.health.isDead()) {
      if (this.aiState !== 'DEATH') {
        this.aiState = 'DEATH';
        this.animator.animation.play('death', true);
        this.velocity.vx = 0;
        this.stateTimer = 0.6; // death anim duration
      } else {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.active = false;
          this.animator.mesh.visible = false;
        }
      }
      return;
    }

    if (this.aiState === 'HIT') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.aiState = 'CHASE';
        this.animator.animation.play('chase');
      }
      return;
    }

    if (this.aiState === 'ATTACK') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.aiState = 'CHASE';
        this.animator.animation.play('chase');
      }
      return;
    }

    // Distance to player
    const dist = Math.hypot(playerX - this.transform.x, playerY - this.transform.y);
    const dx = playerX - this.transform.x;

    if (dist < this.config.stats.detectionRange) {
      this.facingRight = dx > 0;

      if (dist <= this.config.stats.attackRange && this.attackTimer <= 0) {
        // Attack
        this.aiState = 'ATTACK';
        this.animator.animation.play('attack', true);
        this.velocity.vx = 0;
        this.stateTimer = 0.5;
        this.attackTimer = this.config.stats.attackCooldownMs / 1000;
      } else {
        // Chase
        this.aiState = 'CHASE';
        this.animator.animation.play('chase');
        this.velocity.vx = (dx > 0 ? 1 : -1) * this.config.stats.moveSpeed;
      }
    } else {
      // Patrol
      this.aiState = 'PATROL';
      this.animator.animation.play('patrol');
      this.patrolTimer += dt;

      const offset = this.transform.x - this.patrolOriginX;
      if (Math.abs(offset) > this.config.stats.patrolDistance) {
        this.facingRight = offset < 0;
      }

      this.velocity.vx = (this.facingRight ? 1 : -1) * (this.config.stats.moveSpeed * 0.6);
    }

    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
    }
  }

  public update(playerX: number, playerY: number, dt: number): void {
    if (!this.active) return;

    this.transform.storePrev();
    this.health.update(dt);
    this.updateAI(playerX, playerY, dt);

    // Gravity
    if (!this.isGrounded) {
      this.velocity.vy -= 700 * dt;
    }

    const isHitFlashing = this.health.isInvulnerable();
    this.animator.update(dt, !this.facingRight, isHitFlashing);
    this.animator.setPosition(this.transform.x, this.transform.y, 4);
  }

  public takeDamage(amount: number, fromRight: boolean): boolean {
    if (this.health.isDead() || !this.active) return false;

    const damaged = this.health.takeDamage(amount);
    if (damaged) {
      this.aiState = 'HIT';
      this.animator.animation.play('hit', true);
      this.velocity.vx = fromRight ? -45 : 45;
      this.velocity.vy = 30;
      this.stateTimer = 0.2;

      if (this.health.isDead()) {
        EventBus.getInstance().emit('ENEMY_KILLED', {
          enemy: this,
          points: this.config.stats.points
        });
      }
      return true;
    }
    return false;
  }

  public getBounds(): AABB {
    return this.collider.getBounds(this.transform.x, this.transform.y);
  }

  public destroy(): void {
    (this.animator.mesh.material as THREE.Material).dispose();
  }
}
