import { describe, it, expect } from 'vitest';
import { CameraController } from '../src/core/CameraController';

describe('CameraController Responsive Viewport', () => {
  it('should initialize with base resolution and calculate bounds', () => {
    const cam = new CameraController(384, 216);
    cam.setBounds(0, 3200);

    expect(cam.viewportWidth).toBe(384);
    expect(cam.viewportHeight).toBe(216);
    expect(cam.minX).toBe(0);
    expect(cam.maxX).toBe(3200 - 384); // 2816
  });

  it('should adapt bounds dynamically on landscape mobile resize', () => {
    const cam = new CameraController(384, 216);
    cam.setBounds(0, 3200);

    // Modern mobile landscape (e.g. 19.5:9 -> logical width 468)
    cam.onResize(468, 216, 3200);

    expect(cam.viewportWidth).toBe(468);
    expect(cam.viewportHeight).toBe(216);
    expect(cam.maxX).toBe(3200 - 468); // 2732

    // Clamping works properly
    cam.x = 3000;
    cam.onResize(468, 216, 3200);
    expect(cam.x).toBe(2732);
  });
});
