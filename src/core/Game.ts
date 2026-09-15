import * as THREE from 'three';
import { GameState, CharacterConfig } from '../types';
import { PixelRenderer } from '../rendering/PixelRenderer';
import { GameLoop } from './GameLoop';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { CameraController } from './CameraController';
import { EventBus } from './EventBus';
import { SaveManager } from './SaveManager';
import { PlaceholderTextureGenerator } from '../rendering/PlaceholderTextureGenerator';
import { ParallaxBackground } from '../rendering/ParallaxBackground';
import { ParticleSystem } from '../systems/ParticleSystem';
import { ProjectilePool } from '../entities/projectiles/ProjectilePool';
import { CombatSystem } from '../systems/CombatSystem';
import { CollisionSystem, SolidBox } from '../systems/CollisionSystem';
import { LevelLoader } from '../levels/LevelLoader';
import { LevelManager } from '../levels/LevelManager';
import { Player } from '../entities/player/Player';
import { DebugOverlay } from '../rendering/DebugOverlay';
import { UIManager } from '../ui/UIManager';

// Character configs import
import demonConfig from '../data/characters/demon.json';
import starchildConfig from '../data/characters/starchild.json';

export class Game {
  private canvas: HTMLCanvasElement;
  private uiOverlay: HTMLElement;

  public renderer: PixelRenderer;
  public gameLoop: GameLoop;
  public inputManager: InputManager;
  public audioManager: AudioManager;
  public cameraController: CameraController;
  public debugOverlay: DebugOverlay;
  public uiManager: UIManager;

  public state: GameState = 'TITLE';
  public selectedCharacterId: string = 'starchild';

  // Systems and entities
  private particleSystem!: ParticleSystem;
  private projectilePool!: ProjectilePool;
  private combatSystem!: CombatSystem;
  private parallaxBackground: ParallaxBackground | null = null;
  private levelManager: LevelManager | null = null;
  public player: Player | null = null;

  // Cached Atlas Textures
  private demonAtlas!: THREE.CanvasTexture;
  private starchildAtlas!: THREE.CanvasTexture;
  private zombieAtlas!: THREE.CanvasTexture;
  private tileTexture!: THREE.CanvasTexture;

  constructor(canvas: HTMLCanvasElement, uiOverlay: HTMLElement) {
    this.canvas = canvas;
    this.uiOverlay = uiOverlay;

    this.renderer = new PixelRenderer(this.canvas);
    this.inputManager = new InputManager();
    this.audioManager = AudioManager.getInstance();
    this.cameraController = new CameraController();
    this.debugOverlay = new DebugOverlay(this.renderer.scene);
    this.inputManager.onDebugToggle = () => {
      this.debugOverlay.toggle();
    };
    this.inputManager.onToggleParallax = () => {
      if (this.parallaxBackground) {
        this.parallaxBackground.setParallaxEnabled(!this.parallaxBackground.parallaxEnabled);
      }
    };
    this.inputManager.onToggleParticles = () => {
      this.particleSystem.particlesEnabled = !this.particleSystem.particlesEnabled;
    };
    this.inputManager.onToggleRain = () => {
      this.particleSystem.rainEnabled = !this.particleSystem.rainEnabled;
    };
    this.inputManager.onToggleNeons = () => {
      if (this.levelManager) {
        this.levelManager.neonFlicker.setEnabled(!this.levelManager.neonFlicker.enabled);
      }
    };
    this.inputManager.onToggleSmoke = () => {
      this.particleSystem.smokeEnabled = !this.particleSystem.smokeEnabled;
    };

    this.uiManager = new UIManager(
      this.uiOverlay,
      this.inputManager,
      () => this.onTitleStart(),
      (charId) => this.onCharacterChosen(charId),
      () => this.togglePause(),
      () => this.restartCurrentLevel(),
      () => this.quitToTitle()
    );

    this.gameLoop = new GameLoop(
      (dt) => this.fixedUpdate(dt),
      (alpha) => this.render(alpha)
    );

    this.initAssets();
    this.setupEventListeners();
  }

  private initAssets(): void {
    // Generate crisp 16-bit procedural textures immediately
    this.demonAtlas = PlaceholderTextureGenerator.createCharacterAtlas('demon');
    this.starchildAtlas = PlaceholderTextureGenerator.createCharacterAtlas('starchild');
    this.zombieAtlas = PlaceholderTextureGenerator.createZombieRoadieAtlas();
    this.tileTexture = PlaceholderTextureGenerator.createEnvironmentTiles();

    // Setup particle and projectile pools
    this.particleSystem = new ParticleSystem(this.renderer.scene, this.renderer.sharedPlaneGeometry);
    this.projectilePool = new ProjectilePool(this.renderer.scene, this.renderer.sharedPlaneGeometry);
  }

  private setupEventListeners(): void {
    const bus = EventBus.getInstance();

    bus.on('ENEMY_KILLED', () => {
      if (this.player) {
        this.player.combat.addRockPower(12);
        this.player.score += 100;
        SaveManager.updateHighScore(this.player.score);
      }
    });

    bus.on('LEVEL_COMPLETED', () => {
      this.state = 'VICTORY';
      this.audioManager.stopBGM();
      const finalScore = this.player?.score || 0;
      SaveManager.updateHighScore(finalScore);
      this.uiManager.showVictoryBanner(finalScore, () => {
        this.quitToTitle();
      });
    });
  }

  public start(): void {
    this.uiManager.showTitle();
    this.gameLoop.start();
    this.audioManager.startIntroBGM();
  }

  private onTitleStart(): void {
    this.audioManager.init();
    this.state = 'CHARACTER_SELECT';
    this.uiManager.showCharacterSelect();
  }

  private onCharacterChosen(charId: string): void {
    this.selectedCharacterId = charId;
    this.startLevel('world01_detroit');
  }

  public startLevel(levelId: string): void {
    this.cleanupCurrentLevel();

    const level = LevelLoader.loadLevel(levelId);
    this.cameraController.setBounds(0, level.worldWidth);

    // Parallax background
    this.parallaxBackground = new ParallaxBackground(
      this.renderer.scene,
      level.config.parallaxLayers,
      this.renderer.sharedPlaneGeometry
    );

    // Level Manager
    this.levelManager = new LevelManager(
      level,
      this.renderer.scene,
      this.renderer.sharedPlaneGeometry,
      this.tileTexture,
      this.zombieAtlas,
      this.cameraController,
      this.particleSystem
    );

    // Player setup
    const isDemon = this.selectedCharacterId === 'demon';
    const charConfig = (isDemon ? demonConfig : starchildConfig) as unknown as CharacterConfig;
    const charAtlas = isDemon ? this.demonAtlas : this.starchildAtlas;

    this.player = new Player(
      charConfig,
      charAtlas,
      this.renderer.sharedPlaneGeometry,
      this.projectilePool,
      level.config.spawnPoint.x,
      level.config.spawnPoint.y
    );
    this.renderer.scene.add(this.player.animator.mesh);

    // Combat System
    this.combatSystem = new CombatSystem(
      this.player,
      this.levelManager.enemies,
      this.projectilePool,
      this.levelManager.destructionSystem,
      this.particleSystem,
      this.cameraController
    );

    this.state = 'PLAYING';
    this.uiManager.showGameplayHUD();
    this.audioManager.startBGM();
  }

  private cleanupCurrentLevel(): void {
    if (this.levelManager) {
      this.levelManager.destroy();
      this.levelManager = null;
    }
    if (this.parallaxBackground) {
      this.parallaxBackground.destroy();
      this.parallaxBackground = null;
    }
    if (this.player) {
      this.renderer.scene.remove(this.player.animator.mesh);
      (this.player.animator.mesh.material as THREE.Material).dispose();
      this.player = null;
    }
    this.projectilePool.clear();
  }

  public togglePause(): void {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.uiManager.showPause(true);
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.uiManager.showPause(false);
    }
  }

  public restartCurrentLevel(): void {
    this.uiManager.showPause(false);
    this.startLevel('world01_detroit');
  }

  public quitToTitle(): void {
    this.cleanupCurrentLevel();
    this.state = 'TITLE';
    this.uiManager.showTitle();
    this.audioManager.startIntroBGM();
  }

  // FIXED TIMESTEP LOGIC UPDATE (60 Hz)
  public fixedUpdate(dt: number): void {
    this.inputManager.update();

    if (this.inputManager.state.pausePressed) {
      if (this.state === 'PLAYING' || this.state === 'PAUSED') {
        this.togglePause();
      }
    }

    if (this.state !== 'PLAYING' || !this.player || !this.levelManager) {
      return;
    }

    // 1. Player Physics & Solids
    const solids: SolidBox[] = this.levelManager.currentLevel.solids;
    const pRes = CollisionSystem.resolveEntityMovement(
      this.player.transform,
      this.player.velocity,
      this.player.collider,
      solids,
      dt,
      this.player.dropThroughOneWay
    );
    this.player.isGrounded = pRes.grounded;

    // 2. Player Logic & State Machine
    this.player.update(this.inputManager.state, dt);

    // 3. Level & Enemies Update
    this.levelManager.update(this.player, dt);

    // 4. Projectiles & Particles Update
    this.projectilePool.update(dt);
    this.particleSystem.update(
      dt,
      this.cameraController.getPixelAlignedX(),
      this.cameraController.getPixelAlignedY()
    );

    // 5. Combat System Update
    this.combatSystem.setEnemies(this.levelManager.enemies);
    this.combatSystem.update(dt);

    // 6. Camera Update
    this.cameraController.update(this.player.transform.x, this.player.facingRight, dt);

    // 7. Update Parallax Background
    if (this.parallaxBackground) {
      this.parallaxBackground.update(
        this.cameraController.getPixelAlignedX(),
        this.cameraController.getPixelAlignedY(),
        dt
      );
    }

    // 8. Update HUD
    this.uiManager.updateHUD(this.player);
  }

  // RENDER STEP
  public render(_alpha: number): void {
    const camX = this.cameraController.getPixelAlignedX();
    const camY = this.cameraController.getPixelAlignedY();
    this.renderer.setCameraPosition(camX, camY);

    // Debug Mode Overlay Rendering
    if (this.debugOverlay.isVisible && this.player && this.levelManager) {
      this.debugOverlay.clearBoxes();

      // Draw Solids
      for (const solid of this.levelManager.currentLevel.solids) {
        this.debugOverlay.drawAABB(solid, 'green');
      }

      // Draw Player
      this.debugOverlay.drawAABB(this.player.getBounds(), 'red');

      // Draw Enemies
      for (const enemy of this.levelManager.enemies) {
        if (enemy.active) {
          this.debugOverlay.drawAABB(enemy.getBounds(), 'red');
        }
      }

      // Draw Triggers
      for (const trig of this.levelManager.currentLevel.triggers) {
        this.debugOverlay.drawAABB(trig, 'yellow');
      }

      // Update HUD stats with ambient status (Section 20)
      this.debugOverlay.updateStats(
        this.gameLoop.fps,
        this.player.transform.x,
        this.player.transform.y,
        this.player.stateMachine.getCurrentStateName(),
        this.levelManager.enemies.length,
        this.projectilePool.pool.filter((p) => p.active).length,
        this.player.combat.rockPower,
        {
          parallax: this.parallaxBackground ? this.parallaxBackground.parallaxEnabled : true,
          particles: this.particleSystem.particlesEnabled,
          rain: this.particleSystem.rainEnabled,
          neons: this.levelManager ? this.levelManager.neonFlicker.enabled : true,
          smoke: this.particleSystem.smokeEnabled,
          activeSmokeCount: this.particleSystem.getActiveSmokeCount(),
          activeGeneralFxCount: this.particleSystem.getActiveCount(),
          activeRainCount: this.particleSystem.getActiveRainCount(),
          totalActiveParticles: this.particleSystem.getTotalActiveCount()
        }
      );
    }

    this.renderer.render();
  }
}
