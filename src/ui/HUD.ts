import { Player } from '../entities/player/Player';

export class HUD {
  private container: HTMLElement;
  private hudElement: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public init(): void {
    this.container.innerHTML = `
      <div id="arcade-hud" style="
        position: absolute;
        top: max(env(safe-area-inset-top, 8px), 8px);
        left: max(env(safe-area-inset-left, 16px), 16px);
        right: max(env(safe-area-inset-right, 16px), 16px);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        pointer-events: none;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        text-shadow: 1px 1px 0 #000;
        z-index: 400;
      ">
        <!-- Player Status Block -->
        <div style="display: flex; gap: 8px; align-items: center; background: rgba(0,0,0,0.7); padding: 6px 12px; border: 2px solid #555; border-radius: 4px;">
          <div id="hud-portrait" style="
            width: 44px;
            height: 44px;
            background: #111;
            border: 2px solid #000;
            box-shadow: inset 2px 2px 0 #ffd700, inset -2px -2px 0 #550000, 0 2px 4px rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #fff;
            font-weight: bold;
            overflow: hidden;
            flex-shrink: 0;
          ">
            KISS
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span id="hud-name" style="color: #ffd700;">THE DEMON</span>
              <span id="hud-lives" style="color: #ff3366;">VIDAS: 3</span>
            </div>

            <!-- Health Bar -->
            <div style="width: 140px; height: 10px; background: #222; border: 1px solid #777; position: relative;">
              <div id="hud-health-bar" style="width: 100%; height: 100%; background: linear-gradient(90deg, #e74c3c 0%, #f1c40f 100%); transition: width 0.1s;"></div>
            </div>

            <!-- Rock Power Bar -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="font-size: 9px; color: #00e5ff; letter-spacing: 1px;">ROCK POWER</div>
              <div style="width: 80px; height: 6px; background: #111; border: 1px solid #444; position: relative;">
                <div id="hud-rock-power-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #00b4d8 0%, #00f0ff 100%); transition: width 0.1s;"></div>
              </div>
              <span id="hud-rock-status" style="font-size: 9px; color: #00f0ff;">0%</span>
            </div>
          </div>
        </div>

        <!-- Score & World Info -->
        <div style="background: rgba(0,0,0,0.7); padding: 6px 14px; border: 2px solid #555; border-radius: 4px; text-align: right;">
          <div style="font-size: 10px; color: #aaa;">MUNDO 1: DETROIT ROCK CITY</div>
          <div id="hud-score" style="font-size: 16px; color: #ffd700; letter-spacing: 2px;">PUNTOS: 000000</div>
        </div>
      </div>

      <style>
        @media (max-width: 700px), (max-height: 480px) {
          #arcade-hud {
            transform: scale(0.82);
            transform-origin: top left;
            width: 122%;
          }
        }
      </style>
    `;

    this.hudElement = document.getElementById('arcade-hud');
  }

  public update(player: Player): void {
    if (!this.hudElement) return;

    // Portrait & Name
    const nameEl = document.getElementById('hud-name');
    const portraitEl = document.getElementById('hud-portrait');
    if (nameEl) nameEl.textContent = player.config.name;
    if (portraitEl) {
      if (player.config.avatarUrl) {
        if (!portraitEl.querySelector('img')) {
          portraitEl.innerHTML = `<img src="${player.config.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; object-position: center 15%; image-rendering: pixelated;" alt="${player.config.name}" />`;
        }
      } else {
        portraitEl.style.backgroundColor = player.config.portraitColor;
        portraitEl.textContent = player.config.id === 'demon' ? 'DEMON' : 'STAR';
      }
    }

    // Lives
    const livesEl = document.getElementById('hud-lives');
    if (livesEl) livesEl.textContent = `VIDAS: ${player.lives}`;

    // Health Bar
    const healthPercent = Math.max(0, Math.min(100, (player.health.current / player.health.max) * 100));
    const healthBar = document.getElementById('hud-health-bar');
    if (healthBar) {
      healthBar.style.width = `${healthPercent}%`;
      if (healthPercent < 25) {
        healthBar.style.background = '#e74c3c';
      } else {
        healthBar.style.background = 'linear-gradient(90deg, #e74c3c 0%, #f1c40f 100%)';
      }
    }

    // Rock Power Bar
    const rockPercent = Math.max(0, Math.min(100, (player.combat.rockPower / 100) * 100));
    const rockBar = document.getElementById('hud-rock-power-bar');
    const rockStatus = document.getElementById('hud-rock-status');
    if (rockBar) {
      rockBar.style.width = `${rockPercent}%`;
      if (rockPercent >= 100) {
        rockBar.style.background = 'linear-gradient(90deg, #ff0055 0%, #ffd700 100%)';
      } else {
        rockBar.style.background = 'linear-gradient(90deg, #00b4d8 0%, #00f0ff 100%)';
      }
    }
    if (rockStatus) {
      if (rockPercent >= 100) {
        rockStatus.innerHTML = '<span style="color:#ffd700; font-weight:bold; animation: blink 0.5s infinite;">¡LISTO!</span>';
      } else {
        rockStatus.textContent = `${Math.floor(rockPercent)}%`;
      }
    }

    // Score
    const scoreEl = document.getElementById('hud-score');
    if (scoreEl) {
      scoreEl.textContent = `PUNTOS: ${player.score.toString().padStart(6, '0')}`;
    }
  }

  public hide(): void {
    if (this.hudElement) {
      this.hudElement.remove();
      this.hudElement = null;
    }
  }
}
