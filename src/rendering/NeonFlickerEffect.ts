import * as THREE from 'three';
import { ParticleSystem } from '../systems/ParticleSystem';
import { NeonSignDef } from '../config/EnvironmentConfig';

interface ActiveNeonSign {
  def: NeonSignDef;
  mesh: THREE.Mesh;
  letterMesh?: THREE.Mesh; // For single-letter dropouts
  state: 'NORMAL' | 'MICROFLICKER' | 'DROPOUT' | 'LETTER_DROPOUT';
  timer: number;
  duration: number;
  currentIntensity: number;
}

interface Streetlamp {
  mesh: THREE.Mesh;
  haloMesh: THREE.Mesh;
  baseX: number;
  baseY: number;
  phase: number;
}

export class NeonFlickerEffect {
  private signs: ActiveNeonSign[] = [];
  private streetlamps: Streetlamp[] = [];
  private group: THREE.Group;
  private sharedGeometry: THREE.BufferGeometry;
  private particleSystem?: ParticleSystem;
  public enabled: boolean = true;
  private animTime: number = 0;

  constructor(scene: THREE.Scene, sharedGeometry: THREE.BufferGeometry, particleSystem?: ParticleSystem) {
    this.group = new THREE.Group();
    this.group.position.z = 15; // In midground / facades layer
    scene.add(this.group);
    this.sharedGeometry = sharedGeometry;
    this.particleSystem = particleSystem;
  }

  public addNeonSign(def: NeonSignDef): void {
    const mat = new THREE.MeshBasicMaterial({
      color: def.color,
      transparent: true,
      opacity: def.baseIntensity,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(this.sharedGeometry, mat);
    mesh.scale.set(def.width, def.height, 1);
    mesh.position.set(def.x, def.y, 0);
    this.group.add(mesh);

    let letterMesh: THREE.Mesh | undefined;

    // For signs with letter dropout (e.g. Riverside Motel), create a separate letter submesh
    if (def.letterDropout) {
      const letterMat = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: def.baseIntensity,
        depthWrite: false
      });
      letterMesh = new THREE.Mesh(this.sharedGeometry, letterMat);
      // Represents the 'M' or 'O' in Motel
      letterMesh.scale.set(def.width * 0.9, def.height * 0.22, 1);
      letterMesh.position.set(def.x, def.y - def.height * 0.2, 0.5);
      this.group.add(letterMesh);
    }

    this.signs.push({
      def,
      mesh,
      letterMesh,
      state: 'NORMAL',
      timer: 1.0 + Math.random() * 3.0,
      duration: 0,
      currentIntensity: def.baseIntensity
    });
  }

  public addStreetlight(x: number, y: number, height = 75, topWidth = 10, bottomWidth = 54): void {
    // 1. Triangular volumetric light cone
    const shape = new THREE.Shape();
    shape.moveTo(-topWidth / 2, height / 2);
    shape.lineTo(topWidth / 2, height / 2);
    shape.lineTo(bottomWidth / 2, -height / 2);
    shape.lineTo(-bottomWidth / 2, -height / 2);
    shape.closePath();

    const geom = new THREE.ShapeGeometry(shape);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffea9f,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
    });
    const coneMesh = new THREE.Mesh(geom, coneMat);
    coneMesh.position.set(x, y - height / 2, -5);
    this.group.add(coneMesh);

    // 2. Pixel-art compatible circular lamp halo
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffdf88,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    });
    const haloMesh = new THREE.Mesh(this.sharedGeometry, haloMat);
    haloMesh.scale.set(16, 16, 1);
    haloMesh.position.set(x, y, -4);
    this.group.add(haloMesh);

    this.streetlamps.push({
      mesh: coneMesh,
      haloMesh,
      baseX: x,
      baseY: y,
      phase: Math.random() * Math.PI * 2
    });
  }

  public update(dt: number): void {
    if (!this.enabled) {
      // Keep static normal intensity when disabled
      for (const sign of this.signs) {
        (sign.mesh.material as THREE.MeshBasicMaterial).opacity = sign.def.baseIntensity;
        if (sign.letterMesh) {
          (sign.letterMesh.material as THREE.MeshBasicMaterial).opacity = sign.def.baseIntensity;
        }
      }
      return;
    }

    this.animTime += dt;

    // 1. Update individual neon signs with independent states
    for (const sign of this.signs) {
      sign.timer -= dt;

      if (sign.timer <= 0) {
        if (sign.state === 'NORMAL') {
          // Determine next state stochastically
          const rand = Math.random();

          if (sign.def.letterDropout && rand < 0.18) {
            // Letter dropout: 200-400ms shutdown on single letter
            sign.state = 'LETTER_DROPOUT';
            sign.duration = 0.20 + Math.random() * 0.20;
            sign.timer = sign.duration;
          } else if (rand < sign.def.flickerProbability * 2.5) {
            // Occasional failure / dropout: 20-50% for 40-150ms
            sign.state = 'DROPOUT';
            sign.duration = 0.04 + Math.random() * 0.11;
            sign.timer = sign.duration;
            sign.currentIntensity = sign.def.minIntensity + Math.random() * 0.25;

            // Occasional spark on dropout
            if (this.particleSystem && Math.random() < 0.3) {
              this.particleSystem.emit(sign.def.x, sign.def.y, 'sparks', 2);
            }
          } else if (rand < 0.5) {
            // Microflicker: 80-95%
            sign.state = 'MICROFLICKER';
            sign.duration = 0.05 + Math.random() * 0.08;
            sign.timer = sign.duration;
            sign.currentIntensity = sign.def.baseIntensity * (0.80 + Math.random() * 0.15);
          } else {
            // Stay normal, reset timer
            sign.timer = 1.0 + Math.random() * 3.5;
          }
        } else {
          // Revert to normal
          sign.state = 'NORMAL';
          sign.timer = 1.2 + Math.random() * 4.0;
          sign.currentIntensity = sign.def.baseIntensity;
        }
      }

      // Apply intensity
      const mainMat = sign.mesh.material as THREE.MeshBasicMaterial;
      mainMat.opacity = sign.state === 'DROPOUT' ? sign.currentIntensity : (
        sign.state === 'MICROFLICKER' ? sign.currentIntensity : sign.def.baseIntensity
      );

      // Handle letter dropout submesh
      if (sign.letterMesh) {
        const letterMat = sign.letterMesh.material as THREE.MeshBasicMaterial;
        if (sign.state === 'LETTER_DROPOUT') {
          letterMat.opacity = 0.05; // letter turned off
        } else {
          letterMat.opacity = mainMat.opacity;
        }
      }
    }

    // 2. Streetlamps: 90-100% subtle intensity oscillation (Section 7)
    for (const lamp of this.streetlamps) {
      // Gentle breathing sine wave with phase offset
      const osc = Math.sin(this.animTime * 1.5 + lamp.phase);
      const intensityFactor = 0.90 + 0.10 * (0.5 + 0.5 * osc); // 90% to 100%

      const coneMat = lamp.mesh.material as THREE.MeshBasicMaterial;
      coneMat.opacity = 0.12 * intensityFactor;

      const haloMat = lamp.haloMesh.material as THREE.MeshBasicMaterial;
      haloMat.opacity = 0.16 * intensityFactor;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public destroy(): void {
    for (const sign of this.signs) {
      sign.mesh.geometry.dispose();
      (sign.mesh.material as THREE.Material).dispose();
      if (sign.letterMesh) {
        sign.letterMesh.geometry.dispose();
        (sign.letterMesh.material as THREE.Material).dispose();
      }
    }
    for (const lamp of this.streetlamps) {
      lamp.mesh.geometry.dispose();
      (lamp.mesh.material as THREE.Material).dispose();
      lamp.haloMesh.geometry.dispose();
      (lamp.haloMesh.material as THREE.Material).dispose();
    }
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
