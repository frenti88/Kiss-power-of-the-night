import { AudioManager } from '../core/AudioManager';

export class PauseMenu {
  private container: HTMLElement;
  private onResume: () => void;
  private onRestart: () => void;
  private onQuit: () => void;

  constructor(
    container: HTMLElement,
    onResume: () => void,
    onRestart: () => void,
    onQuit: () => void
  ) {
    this.container = container;
    this.onResume = onResume;
    this.onRestart = onRestart;
    this.onQuit = onQuit;
  }

  public show(): void {
    const audio = AudioManager.getInstance();
    const isMusicOn = audio.getIsMusicEnabled();

    const el = document.createElement('div');
    el.id = 'pause-menu-overlay';
    el.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      pointer-events: auto;
      z-index: 500;
      font-family: 'Press Start 2P', 'Courier New', monospace;
    `;

    el.innerHTML = `
      <h2 style="
        font-size: 28px;
        letter-spacing: 4px;
        color: #ffd700;
        margin-bottom: 25px;
        text-shadow: 2px 2px 0 #b80000;
        font-family: 'Press Start 2P', Impact, sans-serif;
      ">
        PAUSED
      </h2>

      <div style="display: flex; flex-direction: column; gap: 14px; width: 240px;">
        <button id="pause-resume-btn" style="
          padding: 12px 10px;
          background: #27ae60;
          color: #fff;
          font-weight: bold;
          border: 2px solid #fff;
          cursor: pointer;
          border-radius: 4px;
          letter-spacing: 1px;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          box-shadow: 0 4px 0 #000;
        ">RESUME</button>

        <button id="pause-music-btn" style="
          padding: 12px 10px;
          background: ${isMusicOn ? '#1a3a3a' : '#332222'};
          color: ${isMusicOn ? '#00ffcc' : '#aaa'};
          font-weight: bold;
          border: 2px solid ${isMusicOn ? '#00ffcc' : '#666'};
          cursor: pointer;
          border-radius: 4px;
          letter-spacing: 1px;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          box-shadow: 0 4px 0 #000;
        ">${isMusicOn ? '🔊 MUSIC: ON' : '🔇 MUSIC: OFF'}</button>

        <button id="pause-restart-btn" style="
          padding: 12px 10px;
          background: #d35400;
          color: #fff;
          font-weight: bold;
          border: 2px solid #fff;
          cursor: pointer;
          border-radius: 4px;
          letter-spacing: 1px;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          box-shadow: 0 4px 0 #000;
        ">RESTART LEVEL</button>

        <button id="pause-quit-btn" style="
          padding: 12px 10px;
          background: #c0392b;
          color: #fff;
          font-weight: bold;
          border: 2px solid #fff;
          cursor: pointer;
          border-radius: 4px;
          letter-spacing: 1px;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          box-shadow: 0 4px 0 #000;
        ">TITLE SCREEN</button>
      </div>
    `;

    this.container.appendChild(el);

    document.getElementById('pause-resume-btn')!.onclick = () => this.onResume();
    document.getElementById('pause-restart-btn')!.onclick = () => this.onRestart();
    document.getElementById('pause-quit-btn')!.onclick = () => this.onQuit();

    const musicBtn = document.getElementById('pause-music-btn');
    if (musicBtn) {
      musicBtn.onclick = () => {
        audio.toggleMusic();
        this.updateMusicState();
      };
    }
  }

  public updateMusicState(): void {
    const musicBtn = document.getElementById('pause-music-btn');
    if (!musicBtn) return;
    const isMusicOn = AudioManager.getInstance().getIsMusicEnabled();
    musicBtn.textContent = isMusicOn ? '🔊 MUSIC: ON' : '🔇 MUSIC: OFF';
    musicBtn.style.background = isMusicOn ? '#1a3a3a' : '#332222';
    musicBtn.style.color = isMusicOn ? '#00ffcc' : '#aaa';
    musicBtn.style.borderColor = isMusicOn ? '#00ffcc' : '#666';
  }

  public hide(): void {
    const el = document.getElementById('pause-menu-overlay');
    if (el) el.remove();
  }
}
