import * as THREE from 'three';
import { ParallaxLayerConfig } from '../types';
import { PlaceholderTextureGenerator } from './PlaceholderTextureGenerator';
import { EnvironmentConfig, DEFAULT_ENVIRONMENT_CONFIG } from '../config/EnvironmentConfig';

interface LayerEntry {
  config: ParallaxLayerConfig;
  mesh: THREE.Mesh;
  texture: THREE.Texture;
  texWidth: number;
  baseYOffset: number;
}

export class ParallaxBackground {
  private group: THREE.Group;
  public layers: LayerEntry[] = [];
  private viewportWidth: number;
  private viewportHeight: number;
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

  public parallaxEnabled: boolean = true;
  private cloudTime: number = 0;
  private animTime: number = 0;
  private envConfig: EnvironmentConfig;

  constructor(
    scene: THREE.Scene,
    configs: ParallaxLayerConfig[],
    sharedPlaneGeom: THREE.BufferGeometry,
    viewportWidth = 384,
    viewportHeight = 216,
    envConfig: EnvironmentConfig = DEFAULT_ENVIRONMENT_CONFIG
  ) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.envConfig = envConfig;
    this.group = new THREE.Group();
    scene.add(this.group);

    for (const cfg of configs) {
      let texWidth = 1024;
      let initialTexture: THREE.Texture;

      // Fallback procedural texture
      initialTexture = PlaceholderTextureGenerator.createParallaxLayer(cfg.texture, texWidth, viewportHeight);
      initialTexture.magFilter = THREE.NearestFilter;
      initialTexture.minFilter = THREE.NearestFilter;
      initialTexture.generateMipmaps = false;
      initialTexture.wrapS = THREE.RepeatWrapping;
      initialTexture.wrapT = THREE.ClampToEdgeWrapping;
      initialTexture.repeat.set(viewportWidth / texWidth, 1.0);

      const material = new THREE.MeshBasicMaterial({
        map: initialTexture,
        transparent: true,
        depthWrite: false
      });

      const mesh = new THREE.Mesh(sharedPlaneGeom, material);
      mesh.scale.set(viewportWidth, viewportHeight, 1);
      const yPos = viewportHeight / 2 + (cfg.yOffset || 0);
      mesh.position.set(viewportWidth / 2, yPos, cfg.zIndex);
      mesh.renderOrder = cfg.zIndex;

      this.group.add(mesh);

      const entry: LayerEntry = {
        config: cfg,
        mesh,
        texture: initialTexture,
        texWidth,
        baseYOffset: cfg.yOffset || 0
      };
      this.layers.push(entry);

      // If an external pixel-art textureUrl is provided, load it asynchronously with NearestFilter
      if (cfg.textureUrl) {
        this.textureLoader.load(
          cfg.textureUrl,
          (loadedTex) => {
            // Strict 16-bit arcade pixel-perfect filtering
            loadedTex.magFilter = THREE.NearestFilter;
            loadedTex.minFilter = THREE.NearestFilter;
            loadedTex.generateMipmaps = false;
            loadedTex.wrapS = THREE.RepeatWrapping;
            loadedTex.wrapT = THREE.ClampToEdgeWrapping;

            const texW = loadedTex.image ? loadedTex.image.width : 1024;
            entry.texWidth = texW;

            // 1:1 Pixel Art Scale: 384 screen pixels across viewportWidth
            loadedTex.repeat.set(this.viewportWidth / texW, 1.0);
            loadedTex.needsUpdate = true;

            material.map = loadedTex;
            material.needsUpdate = true;

            entry.texture = loadedTex;
          },
          undefined,
          (err) => {
            console.warn(`Could not load parallax texture ${cfg.textureUrl}, using procedural fallback.`, err);
          }
        );
      }
    }
  }

  public update(cameraX: number, cameraY: number, dt: number = 0.016): void {
    this.animTime += dt;

    if (this.envConfig.clouds.enabled) {
      this.cloudTime += dt * this.envConfig.clouds.speed;
    }

    const effectiveCamX = this.parallaxEnabled ? cameraX : 0;

    for (const layer of this.layers) {
      // Mesh moves with camera to stay centered in view
      let yOffset = layer.baseYOffset;

      // Subtle cable sway (1-2 px max)
      if (layer.config.id === 'cables' && this.envConfig.cables.enabled) {
        yOffset += Math.sin(this.animTime * this.envConfig.cables.swaySpeed * 2.0 * Math.PI) * this.envConfig.cables.swayPx;
      }

      layer.mesh.position.x = cameraX + this.viewportWidth / 2;
      layer.mesh.position.y = cameraY + this.viewportHeight / 2 + yOffset;

      // Base parallax scroll offset
      let scrollPixelX = effectiveCamX * layer.config.factorX;

      // Continuous cloud drift
      if (layer.config.id === 'clouds' && this.envConfig.clouds.enabled) {
        scrollPixelX += this.cloudTime;
      }

      // River wave shimmer (very subtle 1px oscillation)
      if (layer.config.id === 'bridge' && this.envConfig.river.enabled) {
        const riverWave = Math.sin(this.animTime * this.envConfig.river.scrollSpeed) * 0.8;
        scrollPixelX += riverWave;
      }

      const scrollOffset = scrollPixelX / layer.texWidth;
      layer.texture.offset.x = scrollOffset;
    }
  }

  public setParallaxEnabled(enabled: boolean): void {
    this.parallaxEnabled = enabled;
  }

  public getLayersInfo(): { id: string; zIndex: number; factorX: number }[] {
    return this.layers.map((l) => ({
      id: l.config.id,
      zIndex: l.config.zIndex,
      factorX: l.config.factorX
    }));
  }

  public destroy(): void {
    for (const layer of this.layers) {
      layer.mesh.geometry.dispose();
      (layer.mesh.material as THREE.Material).dispose();
      layer.texture.dispose();
    }
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
