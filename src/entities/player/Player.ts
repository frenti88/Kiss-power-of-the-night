import * as THREE from 'three';
import { CharacterConfig, InputState, AABB } from '../../types';
import { Transform2D } from '../../components/Transform2D';
import { Velocity } from '../../components/Velocity';
import { AABBCollider } from '../../components/AABBCollider';
import { Health } from '../../components/Health';
import { SpriteAnimation } from '../../components/SpriteAnimation';
import { SpriteAnimator } from '../../rendering/SpriteAnimator';
import { SpriteAtlas } from '../../rendering/SpriteAtlas';
import { PlayerStateMachine } from './PlayerStateMachine';
import { PlayerCombat } from './PlayerCombat';
import { ProjectilePool } from '../projectiles/ProjectilePool';
import { IdleState } from './states/IdleState';
import { RunState } from './states/RunState';
import { JumpState } from './states/JumpState';
import { FallState } from './states/FallState';
import { CrouchState } from './states/CrouchState';
import { ShootState } from './states/ShootState';
import { MeleeState } from './states/MeleeState';
import { HitState } from './states/HitState';
import { DeathState } from './states/DeathState';
import { EventBus } from '../../core/EventBus';

export class Player {
  public config: CharacterConfig;
  public transform: Transform2D;
  public velocity: Velocity;
  public collider: AABBCollider;
  public health: Health;
  public animator: SpriteAnimator;
  public stateMachine: PlayerStateMachine;
  public combat: PlayerCombat;

  public facingRight: boolean = true;
  public isGrounded: boolean = false;
  public dropThroughOneWay: boolean = false;

  // Jump feel helpers
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;

  // Checkpoint & Lives
  public checkpointX: number = 50;
  public checkpointY: number = 40;
  public lives: number = 3;
  public score: number = 0;

  constructor(
    config: CharacterConfig,
    atlasTexture: THREE.Texture,
    sharedPlaneGeom: THREE.BufferGeometry,
    projectilePool: ProjectilePool,
    startX = 50,
    startY = 40
  ) {
    this.config = config;
    this.transform = new Transform2D(startX, startY);
    this.velocity = new Velocity(0, 0);

    this.collider = new AABBCollider(
      config.collider.width,
      config.collider.height,
      config.collider.offsetX,
      config.collider.offsetY,
      'PLAYER'
    );

    this.health = new Health(config.stats.maxHealth, 1.2);

    const atlas = new SpriteAtlas(atlasTexture, config.frameWidth, config.frameHeight, 8, 12);
    const spriteAnimation = new SpriteAnimation(config.animations, 'idle');
    this.animator = new SpriteAnimator(sharedPlaneGeom, atlas, spriteAnimation, config.frameWidth, config.frameHeight);

    this.combat = new PlayerCombat(config, projectilePool);

    // Initialize State Machine
    this.stateMachine = new PlayerStateMachine();
    this.stateMachine.registerState('idle', new IdleState(this));
    this.stateMachine.registerState('run', new RunState(this));
    this.stateMachine.registerState('jump', new JumpState(this));
    this.stateMachine.registerState('fall', new FallState(this));
    this.stateMachine.registerState('crouch', new CrouchState(this));
    this.stateMachine.registerState('shoot', new ShootState(this));
    this.stateMachine.registerState('melee', new MeleeState(this));
    this.stateMachine.registerState('hit', new HitState(this));
    this.stateMachine.registerState('death', new DeathState(this));

    this.stateMachine.changeState('idle');

    this.checkpointX = startX;
    this.checkpointY = startY;
  }

  public update(input: InputState, dt: number): void {
    this.transform.storePrev();
    this.health.update(dt);

    // Update Coyote timer
    if (this.isGrounded) {
      this.coyoteTimer = this.config.stats.coyoteTimeMs / 1000;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= dt;
    }

    // Update Jump Buffer
    if (input.jumpPressed) {
      this.jumpBufferTimer = this.config.stats.jumpBufferMs / 1000;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.vy -= this.config.stats.gravity * dt;
    }

    // Update combat timers
    this.combat.update(dt, this.transform.x, this.transform.y, this.facingRight);

    // Update state machine
    this.stateMachine.update(input, dt);

    // Update visual sprite
    const isHitFlashing = this.health.isInvulnerable() && Math.floor(performance.now() / 80) % 2 === 0;
    this.animator.update(dt, !this.facingRight, isHitFlashing);
    this.animator.setPosition(this.transform.x, this.transform.y, 5);
  }

  public takeDamage(amount: number, fromRight: boolean): boolean {
    if (this.health.isDead() || this.health.isInvulnerable()) return false;

    const damaged = this.health.takeDamage(amount);
    if (damaged) {
      this.facingRight = fromRight; // Turn towards danger
      this.stateMachine.changeState('hit');
      EventBus.getInstance().emit('PLAYER_DAMAGED', { health: this.health.current });
      return true;
    }
    return false;
  }

  public canCoyoteJump(): boolean {
    return this.coyoteTimer > 0;
  }

  public hasBufferedJump(): boolean {
    return this.jumpBufferTimer > 0;
  }

  public clearJumpBuffer(): void {
    this.jumpBufferTimer = 0;
  }

  public respawn(): void {
    this.lives = Math.max(0, this.lives - 1);
    this.health.heal(this.config.stats.maxHealth);
    this.transform.setPosition(this.checkpointX, this.checkpointY);
    this.velocity.set(0, 0);
    this.stateMachine.changeState('idle');
    EventBus.getInstance().emit('PLAYER_RESPAWN', { lives: this.lives });
  }

  public getBounds(): AABB {
    return this.collider.getBounds(this.transform.x, this.transform.y);
  }
}
