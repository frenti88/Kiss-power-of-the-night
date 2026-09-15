import { describe, it, expect } from 'vitest';
import { AABBCollider } from '../src/components/AABBCollider';

describe('AABBCollider', () => {
  it('should compute entity bounds correctly with offsets', () => {
    const collider = new AABBCollider(20, 40, 0, -5);
    const bounds = collider.getBounds(100, 50);

    expect(bounds.x).toBe(90);
    expect(bounds.y).toBe(45);
    expect(bounds.width).toBe(20);
    expect(bounds.height).toBe(40);
  });

  it('should detect overlaps between intersecting boxes', () => {
    const boxA = { x: 0, y: 0, width: 30, height: 30 };
    const boxB = { x: 20, y: 20, width: 30, height: 30 };
    const boxC = { x: 100, y: 100, width: 20, height: 20 };

    expect(AABBCollider.overlaps(boxA, boxB)).toBe(true);
    expect(AABBCollider.overlaps(boxA, boxC)).toBe(false);
  });
});
