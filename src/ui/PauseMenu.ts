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
    `;

    el.innerHTML = `
      <h2 style="
        font-size: 32px;
        letter-spacing: 4px;
        color: #ffd700;
        margin-bottom: 25px;
        text-shadow: 2px 2px 0 #b80000;
        font-family: Impact, 'Arial Black', sans-serif;
      ">
        PAUSED
      </h2>

      <div style="display: flex; flex-direction: column; gap: 14px; width: 220px;">
        <button id="pause-resume-btn" style="
          padding: 10px;
          background: #27ae60;
          color: #fff;
          font-weight: bold;
          border: 2px solid #fff;
          cursor: pointer;
          border-radius: 4px;
          letter-spacing: 2px;
        ">RESUME</button>

        <button id="pause-restart-btn" style="
          padding: 10px;
          background: #d35400;
          color: #fff;
          font-weight: bold;
          border: 2px solid #fff;
          cursor: pointer;
          border-radius: 4px;
          letter-spacing: 2px;
        ">RESTART LEVEL</button>

        <button id="pause-quit-btn" style="
          padding: 10px;
          background: #c0392b;
          color: #fff;
          font-weight: bold;
          border: 2px solid #fff;
          cursor: pointer;
          border-radius: 4px;
          letter-spacing: 2px;
        ">TITLE SCREEN</button>
      </div>
    `;

    this.container.appendChild(el);

    document.getElementById('pause-resume-btn')!.onclick = () => this.onResume();
    document.getElementById('pause-restart-btn')!.onclick = () => this.onRestart();
    document.getElementById('pause-quit-btn')!.onclick = () => this.onQuit();
  }

  public hide(): void {
    const el = document.getElementById('pause-menu-overlay');
    if (el) el.remove();
  }
}
