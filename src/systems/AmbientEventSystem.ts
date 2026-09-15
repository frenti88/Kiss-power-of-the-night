import * as THREE from 'three';
import { ParticleSystem } from './ParticleSystem';
import { EnvironmentConfig, DEFAULT_ENVIRONMENT_CONFIG } from '../config/EnvironmentConfig';

export class AmbientEventSystem {
  private scene: THREE.Scene;
  private sharedGeometry: THREE.BufferGeometry;
  private particleSystem: ParticleSystem;
  private config: EnvironmentConfig;

  private timer: number;
  private activeEvent: 'NONE' | 'BRIDGE_VEHICLE' | 'FACTORY_LIGHT' = 'NONE';
  private eventDuration: number = 0;

  // Bridge Vehicle (tiny distant headlights & taillights)
  private vehicleGroup: THREE.Group;
  private headlightMesh: THREE.Mesh;
  private taillightMesh: THREE.Mesh;
  private vehicleX: number = 0;
  private vehicleSpeed: number = 28; // px/s
  private vehicleTargetX: number = 0;

  // Factory light floodlight
  private factoryLightMesh: THREE.Mesh;

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

    this.timer = this.getRandomInterval();

    // 1. Bridge Vehicle group (z = -59, placed directly on the bridge truss roadway)
    this.vehicleGroup = new THREE.Group();
    this.vehicleGroup.position.z = -59;
    this.vehicleGroup.visible = false;
    this.scene.add(this.vehicleGroup);

    // Warm white headlights
    const hlMat = new THREE.MeshBasicMaterial({
      color: 0xfffae0,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    this.headlightMesh = new THREE.Mesh(this.sharedGeometry, hlMat);
    this.headlightMesh.scale.set(3, 2, 1);
    this.vehicleGroup.add(this.headlightMesh);

    // Red taillight
    const tlMat = new THREE.MeshBasicMaterial({
      color: 0xff2200,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    this.taillightMesh = new THREE.Mesh(this.sharedGeometry, tlMat);
    this.taillightMesh.scale.set(2, 2, 1);
    this.taillightMesh.position.set(-6, 0, 0);
    this.vehicleGroup.add(this.taillightMesh);

    // 2. Factory Hangar floodlight (z = -79, behind the skyline)
    const flMat = new THREE.MeshBasicMaterial({
      color: 0x99ccff,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    this.factoryLightMesh = new THREE.Mesh(this.sharedGeometry, flMat);
    this.factoryLightMesh.scale.set(32, 18, 1);
    this.factoryLightMesh.position.set(480, 140, -79);
    this.scene.add(this.factoryLightMesh);
  }

  private getRandomInterval(): number {
    return this.config.ambientEvents.minInterval +
      Math.random() * (this.config.ambientEvents.maxInterval - this.config.ambientEvents.minInterval);
  }

  public update(dt: number, cameraX: number = 0): void {
    if (!this.config.ambientEvents.enabled) return;

    this.timer -= dt;

    // Trigger next event when timer expires and no event is currently running
    if (this.timer <= 0 && this.activeEvent === 'NONE') {
      this.triggerRandomEvent(cameraX);
      this.timer = this.getRandomInterval();
    }

    // Progress active event
    if (this.activeEvent === 'BRIDGE_VEHICLE') {
      this.vehicleX += this.vehicleSpeed * dt;
      this.vehicleGroup.position.x = this.vehicleX;

      if (this.vehicleX >= this.vehicleTargetX) {
        this.vehicleGroup.visible = false;
        this.activeEvent = 'NONE';
      }
    } else if (this.activeEvent === 'FACTORY_LIGHT') {
      this.eventDuration -= dt;
      if (this.eventDuration <= 0) {
        (this.factoryLightMesh.material as THREE.MeshBasicMaterial).opacity = 0;
        this.activeEvent = 'NONE';
      }
    }
  }

  private triggerRandomEvent(cameraX: number): void {
    const choice = Math.floor(Math.random() * 4);

    switch (choice) {
      case 0:
        // Event 1: Distant vehicle cruises across the bridge span
        this.activeEvent = 'BRIDGE_VEHICLE';
        // Spawn on the left side of current camera view on bridge deck (y = 114)
        this.vehicleX = cameraX - 40;
        this.vehicleTargetX = cameraX + 420;
        this.vehicleGroup.position.set(this.vehicleX, 114, -59);
        this.vehicleGroup.visible = true;
        break;

      case 1:
        // Event 2: Distant electrical transformer spark on street facade
        const sparkX = cameraX + 80 + Math.random() * 220;
        this.particleSystem.emit(sparkX, 150, 'sparks', 4);
        break;

      case 2:
        // Event 3: Chimney flare / puff
        const flareX = cameraX + 60 + Math.random() * 250;
        this.particleSystem.emitChimneySmoke(flareX, 175, 7.0, 24.0);
        break;

      case 3:
      default:
        // Event 4: Factory hangar floodlight momentarily turns on
        this.activeEvent = 'FACTORY_LIGHT';
        this.eventDuration = 3.5 + Math.random() * 2.0;
        this.factoryLightMesh.position.x = cameraX + 160 + Math.random() * 80;
        (this.factoryLightMesh.material as THREE.MeshBasicMaterial).opacity = 0.28;
        break;
    }
  }

  public destroy(): void {
    this.headlightMesh.geometry.dispose();
    (this.headlightMesh.material as THREE.Material).dispose();
    this.taillightMesh.geometry.dispose();
    (this.taillightMesh.material as THREE.Material).dispose();
    if (this.vehicleGroup.parent) {
      this.vehicleGroup.parent.remove(this.vehicleGroup);
    }

    this.factoryLightMesh.geometry.dispose();
    (this.factoryLightMesh.material as THREE.Material).dispose();
    if (this.factoryLightMesh.parent) {
      this.factoryLightMesh.parent.remove(this.factoryLightMesh);
    }
  }
}
