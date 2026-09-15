import { SaveData } from '../types';

export class SaveManager {
  private static readonly STORAGE_KEY = 'KISS_POWER_OF_THE_NIGHT_SAVE';
  private static readonly CURRENT_VERSION = 1;

  private static defaultData: SaveData = {
    saveVersion: SaveManager.CURRENT_VERSION,
    highScore: 0,
    unlockedCharacters: ['starchild', 'demon'],
    completedWorlds: [],
    settings: {
      masterVolume: 0.8,
      musicVolume: 0.7,
      sfxVolume: 0.9
    }
  };

  public static load(): SaveData {
    try {
      const serialized = localStorage.getItem(SaveManager.STORAGE_KEY);
      if (!serialized) {
        return { ...SaveManager.defaultData };
      }
      const parsed = JSON.parse(serialized) as SaveData;
      if (parsed.saveVersion !== SaveManager.CURRENT_VERSION) {
        // Migration hook for future versions
        return { ...SaveManager.defaultData, ...parsed, saveVersion: SaveManager.CURRENT_VERSION };
      }
      return parsed;
    } catch {
      return { ...SaveManager.defaultData };
    }
  }

  public static save(data: SaveData): boolean {
    try {
      data.saveVersion = SaveManager.CURRENT_VERSION;
      localStorage.setItem(SaveManager.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  public static unlockCharacter(charId: string): SaveData {
    const data = SaveManager.load();
    if (!data.unlockedCharacters.includes(charId)) {
      data.unlockedCharacters.push(charId);
      SaveManager.save(data);
    }
    return data;
  }

  public static updateHighScore(score: number): number {
    const data = SaveManager.load();
    if (score > data.highScore) {
      data.highScore = score;
      SaveManager.save(data);
    }
    return data.highScore;
  }

  public static isMusicMuted(): boolean {
    const data = SaveManager.load();
    return !!data.settings.musicMuted;
  }

  public static setMusicMuted(muted: boolean): boolean {
    const data = SaveManager.load();
    data.settings.musicMuted = muted;
    return SaveManager.save(data);
  }
}
