import * as THREE from 'three';
import { ParticleSystem } from '../systems/ParticleSystem';
import { EnvironmentConfig, DEFAULT_ENVIRONMENT_CONFIG } from '../config/EnvironmentConfig';

interface HazardBeacon {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  phaseOffset: number;
}

interface SkylineWindow {
  mesh: THREE.Mesh;
  isOn: boolean;
  baseColor: number;
}

interface SteamVentCycle {
  x: number;
  y: number;
  isActive: boolean;
  stateTimer: number;
  puffTimer: number;
}

interface ChimneyStack {
  x: number;
  y: number;
  timer: number;
  interval: number;
}

export class AmbientEnvironment {
  private scene: THREE.Scene;
  private sharedGeometry: THREE.BufferGeometry;
  private particleSystem: ParticleSystem;
  private config: EnvironmentConfig;

  // Groups
  private skylineFxGroup: THREE.Group;
  private streetReflectionMesh: THREE.Mesh | null = null;
  private reflectionTexture: THREE.Texture | null = null;

  // Trackers
  private beacons: HazardBeacon[] = [];
  private skylineWindows: SkylineWindow[] = [];
  private steamVents: SteamVentCycle[] = [];
  private chimneyStacks: ChimneyStack[] = [];

  private animTime: number = 0;
  private windowCheckTimer: number = 0;
  private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();

  constructor(
    scene: THREE.Scene,
    sharedGeometry: THREE.BufferGeometry,
    particleSystem: ParticleSystem,
    config: EnvironmentConfig = DEFAULT_ENVIRONMENT_CONFIG
  ) {
    this.scene = scene;
    this.sharedGeometry = sharedGeometry;
    this.particleSystem = particleSystem;
    this.config = config;

    this.skylineFxGroup = new THREE.Group();
    this.skylineFxGroup.position.z = -78; // Just in front of skyline (z = -80)
    this.scene.add(this.skylineFxGroup);

    this.initHazardBeacons();
    this.initSkylineWindows();
    this.initChimneySmokestacks();
    this.initSteamVents();
    this.initWetAsphaltReflections();
  }

  // 1. Red obstacle hazard beacons on factory chimneys and towers (Section 11)
  private initHazardBeacons(): void {
    if (!this.config.skyline.enabled) return;

    for (const b of this.config.skyline.beaconPositions) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff1100, // Warning red beacon
        transparent: true,
        opacity: 0.9,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(this.sharedGeometry, mat);
      mesh.scale.set(3, 3, 1);
      mesh.position.set(b.x, b.y, 0);
      this.skylineFxGroup.add(mesh);

      this.beacons.push({
        mesh,
        x: b.x,
        y: b.y,
        phaseOffset: b.phaseOffset
      });
    }
  }

  // 2. Subtle skyline windows (Section 10)
  private initSkylineWindows(): void {
    if (!this.config.skyline.enabled) return;

    // A cluster of distant windows on Detroit skyline facades
    const windowPositions = [
      { x: 120, y: 140 }, { x: 135, y: 142 }, { x: 150, y: 138 },
      { x: 380, y: 155 }, { x: 395, y: 150 }, { x: 410, y: 158 },
      { x: 620, y: 148 }, { x: 635, y: 145 }, { x: 650, y: 152 },
      { x: 860, y: 135 }, { x: 875, y: 138 }, { x: 890, y: 132 }
    ];

    for (const pos of windowPositions) {
      const isOn = Math.random() > 0.25; // 75% initially illuminated
      const mat = new THREE.MeshBasicMaterial({
        color: isOn ? 0xffdf88 : 0x222233,
        transparent: true,
        opacity: isOn ? 0.85 : 0.2,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(this.sharedGeometry, mat);
      mesh.scale.set(2, 3, 1);
      mesh.position.set(pos.x, pos.y, 0);
      this.skylineFxGroup.add(mesh);

      this.skylineWindows.push({
        mesh,
        isOn,
        baseColor: 0xffdf88
      });
    }
  }

  // 3. Chimney smokestacks on Detroit skyline (Section 4)
  private initChimneySmokestacks(): void {
    // Chimney emitter points matching skyline stacks
    const stackPoints = [
      { x: 58, y: 170, interval: 0.18 },
      { x: 195, y: 182, interval: 0.22 },
      { x: 480, y: 188, interval: 0.20 },
      { x: 740, y: 176, interval: 0.25 }
    ];

    for (const p of stackPoints) {
      this.chimneyStacks.push({
        x: p.x,
        y: p.y,
        timer: Math.random() * p.interval,
        interval: p.interval
      });
    }
  }

  // 4. Irregular Sewer Steam Vents (Section 5)
  private initSteamVents(): void {
    const manholePositions = [320, 840, 1440, 2060, 2680];
    for (const mx of manholePositions) {
      this.steamVents.push({
        x: mx,
        y: 34,
        isActive: Math.random() > 0.3,
        stateTimer: 2.0 + Math.random() * 2.0,
        puffTimer: 0.12
      });
    }
  }

  // 5. Wet Asphalt Shimmer Reflection Layer (Section 8)
  private initWetAsphaltReflections(): void {
    if (!this.config.wetAsphalt.enabled) return;

    this.reflectionTexture = this.textureLoader.load(
      '/assets/levels/detroit/detroit_wet_reflections.png',
      (tex) => {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.generateMipmaps = false;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(3200 / 1024, 1.0);
        tex.needsUpdate = true;
      }
    );

    const refMat = new THREE.MeshBasicMaterial({
      map: this.reflectionTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.streetReflectionMesh = new THREE.Mesh(this.sharedGeometry, refMat);
    // Spans the entire 3200 level width across the street height (y = 0 to 45)
    this.streetReflectionMesh.scale.set(3200, 48, 1);
    this.streetReflectionMesh.position.set(1600, 24, 1); // z = 1 (just above asphalt at z = 0)
    this.scene.add(this.streetReflectionMesh);
  }

  public update(dt: number, _cameraX: number = 0): void {
    this.animTime += dt;

    // 1. Blinking Red Obstacle Hazard Beacons (Section 11)
    // 1.0s ON, 0.5s OFF with individual phase offsets
    if (this.config.skyline.enabled) {
      const cycleTime = this.config.skyline.hazardBlinkOn + this.config.skyline.hazardBlinkOff; // 1.5s
      for (const b of this.beacons) {
        const localTime = (this.animTime + b.phaseOffset) % cycleTime;
        const isOn = localTime < this.config.skyline.hazardBlinkOn;
        (b.mesh.material as THREE.MeshBasicMaterial).opacity = isOn ? 0.95 : 0.05;
      }

      // 2. Occasional Skyline Window Toggles (Section 10)
      this.windowCheckTimer += dt;
      if (this.windowCheckTimer >= this.config.skyline.windowCheckInterval) {
        this.windowCheckTimer = 0;
        for (const win of this.skylineWindows) {
          if (Math.random() < this.config.skyline.windowToggleProbability) {
            win.isOn = !win.isOn;
            const mat = win.mesh.material as THREE.MeshBasicMaterial;
            mat.color.setHex(win.isOn ? win.baseColor : 0x222233);
            mat.opacity = win.isOn ? 0.85 : 0.2;
          }
        }
      }
    }

    // 3. Factory Chimney Smoke Particles (Section 4)
    if (this.config.smoke.enabled && this.particleSystem.smokeEnabled) {
      for (const stack of this.chimneyStacks) {
        stack.timer -= dt;
        if (stack.timer <= 0) {
          stack.timer = stack.interval + (Math.random() * 0.08 - 0.04);
          // Emit with slow rise and lateral drift
          this.particleSystem.emitChimneySmoke(
            stack.x,
            stack.y,
            this.config.smoke.driftSpeed,
            this.config.smoke.riseSpeed
          );
        }
      }
    }

    // 4. Irregular Sewer Steam Plumes (Section 5)
    // Active for 2-4s, paused for 1-3s
    if (this.config.steam.enabled) {
      for (const vent of this.steamVents) {
        vent.stateTimer -= dt;
        if (vent.stateTimer <= 0) {
          // Switch state between ACTIVE and PAUSED
          vent.isActive = !vent.isActive;
          if (vent.isActive) {
            vent.stateTimer = this.config.steam.minActiveTime +
              Math.random() * (this.config.steam.maxActiveTime - this.config.steam.minActiveTime);
          } else {
            vent.stateTimer = this.config.steam.minPauseTime +
              Math.random() * (this.config.steam.maxPauseTime - this.config.steam.minPauseTime);
          }
        }

        if (vent.isActive) {
          vent.puffTimer -= dt;
          if (vent.puffTimer <= 0) {
            vent.puffTimer = 0.12 + Math.random() * 0.08;
            this.particleSystem.emit(vent.x, vent.y, 'steam', 1);
          }
        }
      }
    }

    // 5. Wet Asphalt Subtle Reflection Shimmer (Section 8)
    // 1-2 px horizontal drift without moving the ground geometry
    if (this.streetReflectionMesh && this.reflectionTexture && this.config.wetAsphalt.enabled) {
      // Subtle sine wave displacement (1-2 px in texture coordinates)
      const shimmerDrift = Math.sin(this.animTime * this.config.wetAsphalt.shimmerSpeed * 2.0 * Math.PI) *
        (this.config.wetAsphalt.maxDriftPx / 1024.0);
      this.reflectionTexture.offset.x = shimmerDrift;
    }
  }

  public destroy(): void {
    for (const b of this.beacons) {
      b.mesh.geometry.dispose();
      (b.mesh.material as THREE.Material).dispose();
    }
    for (const win of this.skylineWindows) {
      win.mesh.geometry.dispose();
      (win.mesh.material as THREE.Material).dispose();
    }
    if (this.skylineFxGroup.parent) {
      this.skylineFxGroup.parent.remove(this.skylineFxGroup);
    }
    if (this.streetReflectionMesh) {
      this.streetReflectionMesh.geometry.dispose();
      (this.streetReflectionMesh.material as THREE.Material).dispose();
      if (this.streetReflectionMesh.parent) {
        this.streetReflectionMesh.parent.remove(this.streetReflectionMesh);
      }
    }
    if (this.reflectionTexture) {
      this.reflectionTexture.dispose();
    }
  }
}
