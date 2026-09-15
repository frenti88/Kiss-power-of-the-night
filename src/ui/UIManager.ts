import { TitleScreen } from './TitleScreen';
import { CharacterSelect } from './CharacterSelect';
import { HUD } from './HUD';
import { PauseMenu } from './PauseMenu';
import { VirtualGamepad } from './VirtualGamepad';
import { Player } from '../entities/player/Player';
import { InputManager } from '../core/InputManager';

export class UIManager {
  private overlayContainer: HTMLElement;
  public titleScreen: TitleScreen;
  public characterSelect: CharacterSelect;
  public hud: HUD;
  public pauseMenu: PauseMenu;
  public virtualGamepad: VirtualGamepad;

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
  }

  public showTitle(): void {
    this.virtualGamepad.hide();
    this.hud.hide();
    this.pauseMenu.hide();
    this.characterSelect.hide();
    this.titleScreen.show();
  }

  public showCharacterSelect(): void {
    this.virtualGamepad.hide();
    this.titleScreen.hide();
    this.hud.hide();
    this.characterSelect.show();
  }

  public showGameplayHUD(): void {
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
    if (isPaused) {
      this.virtualGamepad.hide();
      this.pauseMenu.show();
    } else {
      this.pauseMenu.hide();
      this.virtualGamepad.show();
    }
  }

  public showVictoryBanner(score: number, onContinue: () => void): void {
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
      <div style="font-size: 14px; letter-spacing: 4px; color: #ff0055;">WORLD 1 CLEARED!</div>
      <h1 style="font-size: 38px; color: #ffd700; margin: 10px 0; text-shadow: 0 0 20px #ff0055;">STAGE COMPLETE</h1>
      <div style="font-size: 18px; color: #fff; margin-bottom: 25px;">TOTAL SCORE: ${score}</div>
      <button id="victory-continue-btn" style="
        padding: 12px 30px;
        background: linear-gradient(180deg, #ff0055 0%, #b80000 100%);
        border: 2px solid #fff;
        color: #fff;
        font-weight: bold;
        cursor: pointer;
        border-radius: 4px;
        letter-spacing: 2px;
      ">STAGE SELECT</button>
    `;
    this.overlayContainer.appendChild(banner);
    document.getElementById('victory-continue-btn')!.onclick = () => {
      banner.remove();
      onContinue();
    };
  }
}
