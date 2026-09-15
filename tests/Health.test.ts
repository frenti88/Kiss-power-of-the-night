import { describe, it, expect } from 'vitest';
import { Health } from '../src/components/Health';

describe('Health Component', () => {
  it('should initialize with full health and accept damage', () => {
    const health = new Health(100, 0.5);
    expect(health.current).toBe(100);
    expect(health.isDead()).toBe(false);

    const hit = health.takeDamage(30);
    expect(hit).toBe(true);
    expect(health.current).toBe(70);
    expect(health.isInvulnerable()).toBe(true);
  });

  it('should prevent damage while invulnerable', () => {
    const health = new Health(100, 0.5);
    health.takeDamage(20);

    const blockedHit = health.takeDamage(20);
    expect(blockedHit).toBe(false);
    expect(health.current).toBe(80);

    // Advance time past invulnerability
    health.update(0.6);
    expect(health.isInvulnerable()).toBe(false);

    const secondHit = health.takeDamage(20);
    expect(secondHit).toBe(true);
    expect(health.current).toBe(60);
  });

  it('should clamp health and detect death', () => {
    const health = new Health(50);
    health.takeDamage(60);
    expect(health.current).toBe(0);
    expect(health.isDead()).toBe(true);
  });
});
