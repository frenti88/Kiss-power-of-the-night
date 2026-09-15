import { LevelTriggerConfig } from '../types';
import { Player } from '../entities/player/Player';
import { CameraController } from '../core/CameraController';
import { ParticleSystem } from '../systems/ParticleSystem';
import { AudioManager } from '../core/AudioManager';
import { EventBus } from '../core/EventBus';
import { AABBCollider } from '../components/AABBCollider';

export class LevelEventManager {
  private triggers: LevelTriggerConfig[];
  private activatedTriggers: Set<string> = new Set();
  private camera: CameraController;
  private particleSystem: ParticleSystem;
  private audioManager: AudioManager;

  constructor(
    triggers: LevelTriggerConfig[],
    camera: CameraController,
    particleSystem: ParticleSystem
  ) {
    this.triggers = triggers;
    this.camera = camera;
    this.particleSystem = particleSystem;
    this.audioManager = AudioManager.getInstance();
  }

  public update(player: Player): void {
    const playerBounds = player.getBounds();

    for (const trig of this.triggers) {
      if (this.activatedTriggers.has(trig.id)) continue;

      const trigBounds = {
        x: trig.x,
        y: trig.y,
        width: trig.width,
        height: trig.height
      };

      if (AABBCollider.overlaps(playerBounds, trigBounds)) {
        this.activatedTriggers.add(trig.id);
        this.executeTrigger(trig, player);
      }
    }
  }

  private executeTrigger(trig: LevelTriggerConfig, player: Player): void {
    switch (trig.action) {
      case 'setCheckpoint': {
        player.checkpointX = trig.payload?.x ?? trig.x;
        player.checkpointY = trig.payload?.y ?? trig.y;
        this.audioManager.playPickup();
        this.particleSystem.emit(player.transform.x, player.transform.y + 20, 'sparks', 16);
        EventBus.getInstance().emit('CHECKPOINT_REACHED', { id: trig.id, x: player.checkpointX });
        break;
      }
      case 'triggerEvent': {
        if (trig.payload === 'car_wreck_blast') {
          // Speeding car explosion event!
          this.camera.triggerShake(10, 800);
          this.audioManager.playExplosion();
          this.particleSystem.emit(trig.x, trig.y + 20, 'fire', 24);
          this.particleSystem.emit(trig.x, trig.y + 20, 'smoke', 18);
          this.particleSystem.emit(trig.x, trig.y + 20, 'debris', 16);
          EventBus.getInstance().emit('LEVEL_EVENT_TRIGGERED', { event: 'car_wreck_blast' });
        }
        break;
      }
      case 'cameraLock': {
        this.camera.lock(trig.payload?.x ?? trig.x);
        break;
      }
      case 'finishLevel': {
        this.audioManager.playRockPowerReady();
        EventBus.getInstance().emit('LEVEL_COMPLETED');
        break;
      }
    }
  }

  public reset(): void {
    this.activatedTriggers.clear();
  }
}
