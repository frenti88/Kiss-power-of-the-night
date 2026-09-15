import { LevelConfig } from '../types';
import { Level } from './Level';
import world01DetroitData from '../data/levels/world01_detroit.json';

export class LevelLoader {
  private static registeredLevels: Map<string, LevelConfig> = new Map([
    ['world01_detroit', world01DetroitData as unknown as LevelConfig]
  ]);

  public static registerLevel(config: LevelConfig): void {
    this.registeredLevels.set(config.id, config);
  }

  public static loadLevel(id: string): Level {
    const config = this.registeredLevels.get(id);
    if (!config) {
      throw new Error(`[LevelLoader] Level "${id}" not found in registered levels!`);
    }
    return new Level(config);
  }

  public static getAllLevelIds(): string[] {
    return Array.from(this.registeredLevels.keys());
  }
}
