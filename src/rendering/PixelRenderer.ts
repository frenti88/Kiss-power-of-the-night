import * as THREE from 'three';

export class PixelRenderer {
  public static readonly LOGICAL_WIDTH = 384;
  public static readonly LOGICAL_HEIGHT = 216;

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
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Maintain 16:9 aspect ratio in display
    const targetAspect = 16 / 9;
    let displayW = windowWidth;
    let displayH = windowWidth / targetAspect;

    if (displayH > windowHeight) {
      displayH = windowHeight;
      displayW = windowHeight * targetAspect;
    }

    this.canvas.style.width = `${Math.floor(displayW)}px`;
    this.canvas.style.height = `${Math.floor(displayH)}px`;

    // Render in crisp HD native resolution buffer for scenarios and props
    this.renderer.setSize(Math.floor(displayW), Math.floor(displayH), false);
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
