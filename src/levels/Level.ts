import { LevelConfig, LevelSolidConfig, LevelSpawnConfig, LevelTriggerConfig, LevelDestructibleConfig } from '../types';

export class Level {
  public config: LevelConfig;

  constructor(config: LevelConfig) {
    this.config = config;
  }

  public get id(): string {
    return this.config.id;
  }

  public get name(): string {
    return this.config.name;
  }

  public get worldWidth(): number {
    return this.config.worldWidth;
  }

  public get worldHeight(): number {
    return this.config.worldHeight;
  }

  public get solids(): LevelSolidConfig[] {
    return this.config.solids;
  }

  public get spawns(): LevelSpawnConfig[] {
    return this.config.spawns;
  }

  public get triggers(): LevelTriggerConfig[] {
    return this.config.triggers;
  }

  public get destructibles(): LevelDestructibleConfig[] {
    return this.config.destructibles;
  }
}
