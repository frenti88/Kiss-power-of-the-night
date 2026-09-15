import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../src/core/SaveManager';

describe('SaveManager', () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    globalThis.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
      length: 0,
      key: () => null
    } as any;
  });

  it('should load default save data when storage is empty', () => {
    const data = SaveManager.load();
    expect(data.unlockedCharacters).toContain('demon');
    expect(data.unlockedCharacters).toContain('starchild');
    expect(data.highScore).toBe(0);
  });

  it('should update high scores', () => {
    SaveManager.updateHighScore(500);
    expect(SaveManager.load().highScore).toBe(500);

    SaveManager.updateHighScore(300); // Lower shouldn't overwrite
    expect(SaveManager.load().highScore).toBe(500);

    SaveManager.updateHighScore(1200);
    expect(SaveManager.load().highScore).toBe(1200);
  });

  it('should unlock new characters', () => {
    SaveManager.unlockCharacter('spaceman');
    const data = SaveManager.load();
    expect(data.unlockedCharacters).toContain('spaceman');
  });
});
