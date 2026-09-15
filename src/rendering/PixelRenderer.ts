import * as THREE from 'three';

export class PixelRenderer {
  public static readonly LOGICAL_WIDTH = 384;
  public static readonly LOGICAL_HEIGHT = 216;
  public static readonly BASE_WIDTH = 384;
  public static readonly BASE_HEIGHT = 216;

  public logicalWidth: number = PixelRenderer.LOGICAL_WIDTH;
  public logicalHeight: number = PixelRenderer.LOGICAL_HEIGHT;
  public onResize?: (logicalWidth: number, logicalHeight: number) => void;

  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.OrthographicCamera;
  public canvas: HTMLCanvasElement;

  // Single shared 1x1 plane geometry for zero-allocation rendering
  public sharedPlaneGeometry: THREE.PlaneGeometry;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setClearColor(0x0a0a16, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.scene = new THREE.Scene();

    // Orthographic camera: (left, right, top, bottom, near, far)
    // Origin (0, 0) is bottom-left
    this.camera = new THREE.OrthographicCamera(
      0,
      PixelRenderer.LOGICAL_WIDTH,
      PixelRenderer.LOGICAL_HEIGHT,
      0,
      0.1,
      1000
    );
    this.camera.position.z = 100;

    this.sharedPlaneGeometry = new THREE.PlaneGeometry(1, 1);

    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(this.handleResize, 100);
    });
  }

  public handleResize = (): void => {
    const windowWidth = Math.max(window.innerWidth, 1);
    const windowHeight = Math.max(window.innerHeight, 1);
    const aspect = windowWidth / windowHeight;

    // Fullscreen-first mobile landscape cover:
    // Maintain vertical height at 216 units so gameplay height is preserved.
    // Width scales dynamically so pixels are 100% square and fill the entire screen edge-to-edge.
    this.logicalHeight = PixelRenderer.BASE_HEIGHT;
    this.logicalWidth = Math.round(this.logicalHeight * aspect);

    // Update orthographic camera projection to cover the screen exactly
    this.camera.left = 0;
    this.camera.right = this.logicalWidth;
    this.camera.top = this.logicalHeight;
    this.camera.bottom = 0;
    this.camera.updateProjectionMatrix();

    // Canvas occupies 100% of the viewport with no black margins
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(windowWidth, windowHeight, false);

    if (this.onResize) {
      this.onResize(this.logicalWidth, this.logicalHeight);
    }
  };

  public setCameraPosition(pixelX: number, pixelY: number): void {
    this.camera.position.x = pixelX;
    this.camera.position.y = pixelY;
    this.camera.updateMatrixWorld();
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.sharedPlaneGeometry.dispose();
    this.renderer.dispose();
  }
}
