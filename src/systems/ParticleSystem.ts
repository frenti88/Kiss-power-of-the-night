import * as THREE from 'three';

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  life: number;
  maxLife: number;
  size: number;
  type: string;
  mesh: THREE.Mesh;
}

export class ParticleSystem {
  private static readonly MAX_GENERAL_PARTICLES = 250;
  private static readonly MAX_SMOKE_PARTICLES = 40; // Strict limit per spec
  private static readonly MAX_RAIN_PARTICLES = 60;

  private generalPool: Particle[] = [];
  private smokePool: Particle[] = [];
  private rainPool: Particle[] = [];

  private group: THREE.Group;
  private smokeGroup: THREE.Group;
  private rainGroup: THREE.Group;

  public particlesEnabled: boolean = true;
  public smokeEnabled: boolean = true;
  public rainEnabled: boolean = false;

  constructor(scene: THREE.Scene, sharedGeometry: THREE.BufferGeometry) {
    this.group = new THREE.Group();
    this.group.position.z = 25; // FX layer in front of gameplay
    scene.add(this.group);

    this.smokeGroup = new THREE.Group();
    this.smokeGroup.position.z = -75; // Smoke rises behind city skyline/bridge
    scene.add(this.smokeGroup);

    this.rainGroup = new THREE.Group();
    this.rainGroup.position.z = 35; // Rain in front of gameplay
    scene.add(this.rainGroup);

    // 1. General FX pool (sparks, fire, steam, blood, debris, water_spray)
    for (let i = 0; i < ParticleSystem.MAX_GENERAL_PARTICLES; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(sharedGeometry, mat);
      mesh.visible = false;
      this.group.add(mesh);

      this.generalPool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        gravity: 180,
        life: 0,
        maxLife: 1,
        size: 3,
        type: 'sparks',
        mesh
      });
    }

    // 2. Dedicated Chimney Smoke pool (20-40 particles strictly pooled)
    for (let i = 0; i < ParticleSystem.MAX_SMOKE_PARTICLES; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x5a5568,
        transparent: true,
        opacity: 0.6,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(sharedGeometry, mat);
      mesh.visible = false;
      this.smokeGroup.add(mesh);

      this.smokePool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        gravity: 0,
        life: 0,
        maxLife: 2.5,
        size: 4,
        type: 'chimney_smoke',
        mesh
      });
    }

    // 3. Optional Rain pool
    for (let i = 0; i < ParticleSystem.MAX_RAIN_PARTICLES; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x88bbdd,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(sharedGeometry, mat);
      mesh.visible = false;
      this.rainGroup.add(mesh);

      this.rainPool.push({
        active: false,
        x: 0,
        y: 0,
        vx: -30,
        vy: -200,
        gravity: 0,
        life: 0,
        maxLife: 1.0,
        size: 2,
        type: 'rain',
        mesh
      });
    }
  }

  // Industrial Chimney Smoke Emitter (slow rise, lateral drift, expansion, fade out)
  public emitChimneySmoke(x: number, y: number, driftSpeed = 5.0, riseSpeed = 18.0): void {
    if (!this.particlesEnabled || !this.smokeEnabled) return;

    const p = this.smokePool.find((item) => !item.active);
    if (!p) return;

    p.active = true;
    p.x = x + (Math.random() * 4 - 2);
    p.y = y;
    p.type = 'chimney_smoke';
    p.vx = driftSpeed + (Math.random() * 3 - 1.5);
    p.vy = riseSpeed + (Math.random() * 6 - 3);
    p.gravity = -2; // slight buoyancy
    p.life = 2.0 + Math.random() * 1.5;
    p.maxLife = p.life;
    p.size = 3 + Math.floor(Math.random() * 3);

    // Varied smoky palette (charcoal, industrial blue-grey, faint ember haze)
    const smokeColors = [0x4a4658, 0x585265, 0x676278, 0x767086];
    (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(
      smokeColors[Math.floor(Math.random() * smokeColors.length)]
    );
    (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.65;

    p.mesh.visible = true;
    p.mesh.scale.set(p.size, p.size, 1);
    p.mesh.position.set(Math.round(p.x), Math.round(p.y), 0);
  }

  // General Particle Emitter
  public emit(
    x: number,
    y: number,
    type: 'fire' | 'sparks' | 'blood' | 'smoke' | 'debris' | 'steam' | 'water_spray' = 'sparks',
    count = 8
  ): void {
    if (!this.particlesEnabled) return;

    for (let i = 0; i < count; i++) {
      const p = this.generalPool.find((item) => !item.active);
      if (!p) break;

      p.active = true;
      p.x = x;
      p.y = y;
      p.type = type;

      const angle = Math.random() * Math.PI * 2;
      let speed = 40 + Math.random() * 80;
      p.life = 0.2 + Math.random() * 0.3;
      p.maxLife = p.life;
      p.size = 2 + Math.floor(Math.random() * 3);
      p.gravity = 180;

      if (type === 'fire') {
        p.vx = (Math.random() * 2 - 1) * 25;
        p.vy = 30 + Math.random() * 50;
        p.gravity = -20;
        p.life = 0.35 + Math.random() * 0.3;
        p.maxLife = p.life;
        const colors = [0xff2200, 0xff5500, 0xffaa00, 0xffea00];
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(
          colors[Math.floor(Math.random() * colors.length)]
        );
      } else if (type === 'steam') {
        p.vx = (Math.random() * 2 - 1) * 7 + 3; // soft right drift
        p.vy = 26 + Math.random() * 28; // upward plume
        p.gravity = -12;
        p.life = 0.65 + Math.random() * 0.5;
        p.maxLife = p.life;
        p.size = 3 + Math.floor(Math.random() * 3);
        const steamColors = [0xd0d5e8, 0xc0c8df, 0xe4e8f8];
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(
          steamColors[Math.floor(Math.random() * steamColors.length)]
        );
      } else if (type === 'water_spray') {
        p.vx = (Math.random() * 2 - 1) * 35;
        p.vy = 90 + Math.random() * 80;
        p.gravity = 240;
        p.life = 0.45 + Math.random() * 0.3;
        p.maxLife = p.life;
        p.size = 2 + Math.floor(Math.random() * 3);
        const waterColors = [0x00f0ff, 0x70d6ff, 0xffffff];
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(
          waterColors[Math.floor(Math.random() * waterColors.length)]
        );
      } else if (type === 'sparks') {
        p.vx = Math.cos(angle) * speed * 1.5;
        p.vy = Math.sin(angle) * speed * 1.5;
        p.gravity = 140;
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
      } else if (type === 'blood') {
        p.vx = (Math.random() * 2 - 1) * 60;
        p.vy = Math.random() * 90;
        p.gravity = 220;
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x27ae60);
      } else if (type === 'smoke') {
        p.vx = (Math.random() * 2 - 1) * 18;
        p.vy = 18 + Math.random() * 35;
        p.gravity = -8;
        p.life = 0.5 + Math.random() * 0.4;
        p.maxLife = p.life;
        p.size = 4 + Math.floor(Math.random() * 4);
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x555566);
      } else {
        // Debris
        p.vx = (Math.random() * 2 - 1) * 90;
        p.vy = 50 + Math.random() * 120;
        p.gravity = 250;
        p.life = 0.4 + Math.random() * 0.3;
        p.maxLife = p.life;
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x95a5a6);
      }

      p.mesh.visible = true;
      p.mesh.scale.set(p.size, p.size, 1);
      p.mesh.position.set(p.x, p.y, 0);
    }
  }

  // Rain emitter
  private emitRain(cameraX: number, cameraY: number, count = 2): void {
    if (!this.rainEnabled) return;

    for (let i = 0; i < count; i++) {
      const p = this.rainPool.find((item) => !item.active);
      if (!p) break;

      p.active = true;
      // Spawn slightly above and wider than screen
      p.x = cameraX - 50 + Math.random() * 484;
      p.y = cameraY + 220 + Math.random() * 30;
      p.vx = -40 + (Math.random() * 10 - 5); // Wind angle
      p.vy = -220 - Math.random() * 60;
      p.gravity = 0;
      p.life = 1.0;
      p.maxLife = p.life;
      p.size = 2;

      p.mesh.visible = true;
      p.mesh.scale.set(1, 4, 1); // Elongated raindrop streak
      p.mesh.position.set(p.x, p.y, 0);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.random() * 0.25;
    }
  }

  public update(dt: number, cameraX = 0, cameraY = 0): void {
    // 1. Update general particles
    for (const p of this.generalPool) {
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= p.gravity * dt;

      // Expand steam & smoke as it rises
      if (p.type === 'steam' || p.type === 'smoke') {
        const expand = (1 - p.life / p.maxLife) * 3;
        p.mesh.scale.set(p.size + expand, p.size + expand, 1);
      }

      const progress = p.life / p.maxLife;
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = progress * 0.85;
      p.mesh.position.set(Math.round(p.x), Math.round(p.y), 0);
    }

    // 2. Update Chimney Smoke particles
    for (const p of this.smokePool) {
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Gradual expansion from small point to large billow
      const progress = 1 - p.life / p.maxLife;
      const currentScale = p.size + progress * 10; // expands up to ~14px
      p.mesh.scale.set(currentScale, currentScale, 1);

      // Smooth fade out
      const alpha = (1 - progress) * 0.65;
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, alpha);

      p.mesh.position.set(Math.round(p.x), Math.round(p.y), 0);
    }

    // 3. Update Rain if active
    if (this.rainEnabled) {
      this.emitRain(cameraX, cameraY, 3);

      for (const p of this.rainPool) {
        if (!p.active) continue;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Ground hit splash / ripple
        if (p.y <= 32) {
          p.active = false;
          p.mesh.visible = false;
          continue;
        }

        p.mesh.position.set(Math.round(p.x), Math.round(p.y), 0);
      }
    } else {
      // Deactivate all rain
      for (const p of this.rainPool) {
        if (p.active) {
          p.active = false;
          p.mesh.visible = false;
        }
      }
    }
  }

  // Active particle metrics for Debug Overlay
  public getActiveCount(): number {
    return this.generalPool.filter((p) => p.active).length;
  }

  public getActiveSmokeCount(): number {
    return this.smokePool.filter((p) => p.active).length;
  }

  public getActiveRainCount(): number {
    return this.rainPool.filter((p) => p.active).length;
  }

  public getTotalActiveCount(): number {
    return this.getActiveCount() + this.getActiveSmokeCount() + this.getActiveRainCount();
  }

  public destroy(): void {
    for (const p of this.generalPool) {
      (p.mesh.material as THREE.Material).dispose();
      this.group.remove(p.mesh);
    }
    for (const p of this.smokePool) {
      (p.mesh.material as THREE.Material).dispose();
      this.smokeGroup.remove(p.mesh);
    }
    for (const p of this.rainPool) {
      (p.mesh.material as THREE.Material).dispose();
      this.rainGroup.remove(p.mesh);
    }
    if (this.group.parent) this.group.parent.remove(this.group);
    if (this.smokeGroup.parent) this.smokeGroup.parent.remove(this.smokeGroup);
    if (this.rainGroup.parent) this.rainGroup.parent.remove(this.rainGroup);
  }
}
