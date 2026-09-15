export type CollisionLayer = 
  | 'SOLID'
  | 'ONE_WAY'
  | 'PLAYER'
  | 'ENEMY'
  | 'PLAYER_PROJECTILE'
  | 'ENEMY_PROJECTILE'
  | 'TRIGGER'
  | 'DESTRUCTIBLE'
  | 'PICKUP';

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnimationDefinition {
  row: number;
  frames: number;
  fps: number;
  loop: boolean;
}

export interface CharacterConfig {
  id: string;
  name: string;
  subtitle: string;
  role: string;
  portraitColor: string;
  avatarUrl?: string;
  frameWidth: number;
  frameHeight: number;
  collider: {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  };
  stats: {
    maxHealth: number;
    moveSpeed: number;
    jumpForce: number;
    gravity: number;
    coyoteTimeMs: number;
    jumpBufferMs: number;
    variableJumpMultiplier: number;
  };
  combat: {
    primaryWeapon: {
      name: string;
      damage: number;
      speed: number;
      fireRateMs: number;
      piercing: boolean;
      lifetime: number;
      color: string;
    };
    melee: {
      damage: number;
      range: number;
      width: number;
      height: number;
      startupFrames: number[];
      activeFrames: number[];
      recoveryFrames: number[];
      durationMs: number;
    };
    special: {
      name: string;
      cost: number;
      damage: number;
    };
    ultimate: {
      name: string;
      cost: number;
      damage: number;
      screenShake: {
        intensity: number;
        durationMs: number;
      };
    };
  };
  animations: Record<string, AnimationDefinition>;
}

export interface EnemyConfig {
  id: string;
  name: string;
  frameWidth: number;
  frameHeight: number;
  collider: {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  };
  stats: {
    maxHealth: number;
    moveSpeed: number;
    damage: number;
    points: number;
    patrolDistance: number;
    detectionRange: number;
    attackRange: number;
    attackCooldownMs: number;
  };
  drops: Array<{
    type: 'health_small' | 'rock_power_small';
    chance: number;
  }>;
  animations: Record<string, AnimationDefinition>;
}

export interface ParallaxLayerConfig {
  id: string;
  texture: string;
  factorX: number;
  factorY: number;
  repeatX: boolean;
  zIndex: number;
  textureUrl?: string;
  yOffset?: number;
}

export interface LevelSolidConfig {
  type: 'ground' | 'platform' | 'wall';
  x: number;
  y: number;
  width: number;
  height: number;
  oneWay?: boolean;
}

export interface LevelSpawnConfig {
  id: string;
  x: number;
  y: number;
  enemyType: string;
  triggerX: number;
}

export interface LevelTriggerConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: 'setCheckpoint' | 'triggerEvent' | 'cameraLock' | 'finishLevel';
  payload?: any;
}

export interface LevelDestructibleConfig {
  id: string;
  type: 'barrel' | 'amp' | 'crate' | 'car_muscle' | 'car_sedan' | 'fire_hydrant' | 'barricade' | 'dumpster' | 'fire_barrel';
  x: number;
  y: number;
  health: number;
  drop: 'health_small' | 'rock_power_small' | 'health_large' | 'rock_power_large' | 'none';
  width?: number;
  height?: number;
}

export interface LevelConfig {
  id: string;
  name: string;
  world: number;
  worldWidth: number;
  worldHeight: number;
  spawnPoint: { x: number; y: number };
  music: string;
  parallaxLayers: ParallaxLayerConfig[];
  solids: LevelSolidConfig[];
  destructibles: LevelDestructibleConfig[];
  spawns: LevelSpawnConfig[];
  triggers: LevelTriggerConfig[];
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpPressed: boolean;
  shoot: boolean;
  shootPressed: boolean;
  melee: boolean;
  meleePressed: boolean;
  special: boolean;
  specialPressed: boolean;
  dash: boolean;
  pausePressed: boolean;
}

export interface SaveData {
  saveVersion: number;
  highScore: number;
  unlockedCharacters: string[];
  completedWorlds: number[];
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
}

export type GameState = 'TITLE' | 'CHARACTER_SELECT' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';
