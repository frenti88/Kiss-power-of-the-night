import { TitleScreen } from './TitleScreen';
import { CharacterSelect } from './CharacterSelect';
import { HUD } from './HUD';
import { PauseMenu } from './PauseMenu';
import { VirtualGamepad } from './VirtualGamepad';
import { Player } from '../entities/player/Player';
import { InputManager } from '../core/InputManager';
import { AudioManager } from '../core/AudioManager';

export class UIManager {
  private overlayContainer: HTMLElement;
  public titleScreen: TitleScreen;
  public characterSelect: CharacterSelect;
  public hud: HUD;
  public pauseMenu: PauseMenu;
  public virtualGamepad: VirtualGamepad;
  private toastTimeout: number | null = null;

  constructor(
    overlayContainer: HTMLElement,
    inputManager: InputManager,
    onTitleStart: () => void,
    onCharacterChosen: (charId: string) => void,
    onResumeGame: () => void,
    onRestartLevel: () => void,
    onQuitToTitle: () => void
  ) {
    this.overlayContainer = overlayContainer;

    this.titleScreen = new TitleScreen(this.overlayContainer, onTitleStart);
    this.characterSelect = new CharacterSelect(this.overlayContainer, onCharacterChosen);
    this.hud = new HUD(this.overlayContainer);
    this.pauseMenu = new PauseMenu(
      this.overlayContainer,
      onResumeGame,
      onRestartLevel,
      onQuitToTitle
    );
    this.virtualGamepad = new VirtualGamepad(this.overlayContainer, inputManager);
    this.virtualGamepad.init();

    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.onclick = (e) => {
        e.stopPropagation();
        onResumeGame();
      };
    }

    this.initMusicControls();
  }

  public showTitle(): void {
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.style.display = 'none';
    this.virtualGamepad.hide();
    this.hud.hide();
    this.pauseMenu.hide();
    this.characterSelect.hide();
    this.titleScreen.show();
  }

  public showCharacterSelect(): void {
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.style.display = 'none';
    this.virtualGamepad.hide();
    this.titleScreen.hide();
    this.hud.hide();
    this.characterSelect.show();
  }

  public showGameplayHUD(): void {
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.style.display = 'flex';
    this.titleScreen.hide();
    this.characterSelect.hide();
    this.pauseMenu.hide();
    this.hud.init();
    this.virtualGamepad.show();
  }

  public updateHUD(player: Player): void {
    this.hud.update(player);
  }

  public showPause(isPaused: boolean): void {
    const pauseBtn = document.getElementById('pause-btn');
    if (isPaused) {
      if (pauseBtn) pauseBtn.style.display = 'none';
      this.virtualGamepad.hide();
      this.pauseMenu.show();
    } else {
      if (pauseBtn) pauseBtn.style.display = 'flex';
      this.pauseMenu.hide();
      this.virtualGamepad.show();
    }
  }

  public showVictoryBanner(score: number, onContinue: () => void): void {
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.style.display = 'none';
    this.virtualGamepad.hide();
    const banner = document.createElement('div');
    banner.id = 'victory-banner';
    banner.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      pointer-events: auto;
      z-index: 600;
    `;
    banner.innerHTML = `
      <div style="font-size: 14px; letter-spacing: 4px; color: #ff0055;">¡MUNDO 1 SUPERADO!</div>
      <h1 style="font-size: 38px; color: #ffd700; margin: 10px 0; text-shadow: 0 0 20px #ff0055;">NIVEL COMPLETADO</h1>
      <div style="font-size: 18px; color: #fff; margin-bottom: 25px;">PUNTUACIÓN TOTAL: ${score}</div>
      <button id="victory-continue-btn" style="
        padding: 12px 30px;
        background: linear-gradient(180deg, #ff0055 0%, #b80000 100%);
        border: 2px solid #fff;
        color: #fff;
        font-weight: bold;
        cursor: pointer;
        border-radius: 4px;
        letter-spacing: 2px;
      ">SELECCIÓN DE FASE</button>
    `;
    this.overlayContainer.appendChild(banner);
    document.getElementById('victory-continue-btn')!.onclick = () => {
      banner.remove();
      onContinue();
    };
  }

  private initMusicControls(): void {
    const musicBtn = document.getElementById('music-btn');
    const audio = AudioManager.getInstance();

    const updateBtn = (enabled: boolean) => {
      const icon = document.getElementById('music-btn-icon');
      const label = document.getElementById('music-btn-label');
      if (icon) icon.textContent = enabled ? '🔊' : '🔇';
      if (label) label.textContent = enabled ? 'MÚSICA: SÍ' : 'MÚSICA: NO';
      if (musicBtn) {
        if (enabled) {
          musicBtn.classList.remove('muted');
        } else {
          musicBtn.classList.add('muted');
        }
      }
    };

    updateBtn(audio.getIsMusicEnabled());

    audio.onMusicToggle = (enabled: boolean) => {
      updateBtn(enabled);
      this.showNotification(enabled ? '🔊 MÚSICA ACTIVADA' : '🔇 MÚSICA SILENCIADA');
      if (this.pauseMenu) {
        this.pauseMenu.updateMusicState();
      }
    };

    if (musicBtn) {
      musicBtn.onclick = (e) => {
        e.stopPropagation();
        audio.toggleMusic();
      };
    }
  }

  public showNotification(message: string, durationMs: number = 1500): void {
    let toast = document.getElementById('arcade-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'arcade-toast';
      toast.style.cssText = `
        position: absolute;
        top: 54px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(10, 8, 20, 0.95);
        border: 2px solid #ffd700;
        color: #ffd700;
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        padding: 8px 16px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.85);
        pointer-events: none;
        z-index: 1000;
        transition: opacity 0.25s;
        border-radius: 2px;
        text-align: center;
        letter-spacing: 1px;
      `;
      this.overlayContainer.parentElement?.appendChild(toast) || this.overlayContainer.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.display = 'block';

    if (this.toastTimeout !== null) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = window.setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast) toast.style.display = 'none';
        }, 250);
      }
    }, durationMs);
  }
}
