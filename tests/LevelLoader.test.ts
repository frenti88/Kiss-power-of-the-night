import { describe, it, expect } from 'vitest';
import { LevelLoader } from '../src/levels/LevelLoader';

describe('LevelLoader', () => {
  it('should load world01_detroit level configuration with all entities', () => {
    const level = LevelLoader.loadLevel('world01_detroit');

    expect(level.id).toBe('world01_detroit');
    expect(level.worldWidth).toBeGreaterThan(2000);
    expect(level.solids.length).toBeGreaterThan(0);
    expect(level.spawns.length).toBeGreaterThan(0);
    expect(level.triggers.length).toBeGreaterThan(0);
    expect(level.destructibles.length).toBeGreaterThan(0);
  });
});
