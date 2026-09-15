export class GameLoop {
  public static readonly FIXED_TIMESTEP: number = 1 / 60; // 60 updates per second
  private static readonly MAX_ACCUMULATOR: number = 0.15; // Anti-death spiral clamp

  private isRunning: boolean = false;
  private accumulator: number = 0;
  private lastTime: number = 0;
  private rafId: number | null = null;

  private onFixedUpdate: (dt: number) => void;
  private onRender: (alpha: number) => void;

  public fps: number = 60;
  private frameCount: number = 0;
  private fpsTimer: number = 0;

  constructor(
    onFixedUpdate: (dt: number) => void,
    onRender: (alpha: number) => void
  ) {
    this.onFixedUpdate = onFixedUpdate;
    this.onRender = onRender;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
    this.rafId = requestAnimationFrame(this.step);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private step = (currentTime: number): void => {
    if (!this.isRunning) return;

    let delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp delta to prevent spiral of death when tab is backgrounded
    if (delta > GameLoop.MAX_ACCUMULATOR) {
      delta = GameLoop.MAX_ACCUMULATOR;
    }

    // FPS computation
    this.frameCount++;
    this.fpsTimer += delta;
    if (this.fpsTimer >= 0.5) {
      this.fps = Math.round(this.frameCount / this.fpsTimer);
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    this.accumulator += delta;

    while (this.accumulator >= GameLoop.FIXED_TIMESTEP) {
      this.onFixedUpdate(GameLoop.FIXED_TIMESTEP);
      this.accumulator -= GameLoop.FIXED_TIMESTEP;
    }

    const alpha = this.accumulator / GameLoop.FIXED_TIMESTEP;
    this.onRender(alpha);

    this.rafId = requestAnimationFrame(this.step);
  };
}
