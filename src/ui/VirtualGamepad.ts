import { InputManager } from '../core/InputManager';

export class VirtualGamepad {
  private container: HTMLElement;
  private inputManager: InputManager;
  private gamepadEl: HTMLElement | null = null;
  private isVisible: boolean = false;
  private userPrefersVisible: boolean = true;

  constructor(container: HTMLElement, inputManager: InputManager) {
    this.container = container;
    this.inputManager = inputManager;

    // Auto-detect touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.userPrefersVisible = isTouchDevice;
  }

  public init(): void {
    if (this.gamepadEl) return;

    this.gamepadEl = document.createElement('div');
    this.gamepadEl.id = 'virtual-gamepad';
    this.gamepadEl.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 450;
      display: ${this.isVisible ? 'flex' : 'none'};
      justify-content: space-between;
      align-items: flex-end;
      padding: env(safe-area-inset-top, 12px) env(safe-area-inset-right, 16px) env(safe-area-inset-bottom, 14px) env(safe-area-inset-left, 16px);
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    `;

    this.gamepadEl.innerHTML = `
      <!-- Top Control Bar (Pause & Gamepad Toggle) -->
      <div style="
        position: absolute;
        top: max(env(safe-area-inset-top, 8px), 8px);
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 12px;
        pointer-events: auto;
        z-index: 500;
      ">
        <button id="vpad-pause-btn" class="vpad-meta-btn" title="Pause Game">
          ⏸ PAUSE
        </button>
      </div>

      <!-- Toggle Visibility Icon (Top Right) -->
      <div style="
        position: absolute;
        top: max(env(safe-area-inset-top, 8px), 8px);
        right: max(env(safe-area-inset-right, 10px), 10px);
        pointer-events: auto;
        z-index: 500;
      ">
        <button id="vpad-toggle-btn" class="vpad-meta-btn" title="Toggle On-Screen Controls">
          🎮 CONTROLS
        </button>
      </div>

      <!-- Left Side: 16-Bit Virtual D-PAD -->
      <div id="vpad-dpad-cluster" style="
        position: relative;
        width: 144px;
        height: 144px;
        margin-bottom: 8px;
        margin-left: 6px;
        pointer-events: auto;
        touch-action: none;
      ">
        <!-- D-PAD Cross Background -->
        <div style="
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Horizontal Bar -->
          <div style="
            position: absolute;
            width: 144px;
            height: 48px;
            background: rgba(22, 20, 30, 0.85);
            border: 3px solid #000;
            box-shadow: inset 2px 2px 0 rgba(255,255,255,0.25), inset -2px -2px 0 rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.8);
          "></div>
          <!-- Vertical Bar -->
          <div style="
            position: absolute;
            width: 48px;
            height: 144px;
            background: rgba(22, 20, 30, 0.85);
            border: 3px solid #000;
            box-shadow: inset 2px 2px 0 rgba(255,255,255,0.25), inset -2px -2px 0 rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.8);
          "></div>
          <!-- Center Pivot -->
          <div style="
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: radial-gradient(circle, #333 0%, #111 100%);
            box-shadow: inset 0 0 4px #000;
            z-index: 2;
          "></div>
        </div>

        <!-- 4 Directional Touch Buttons -->
        <!-- UP Button -->
        <button id="vbtn-up" data-action="up" class="vpad-dir-btn" style="
          position: absolute;
          top: 0;
          left: 48px;
          width: 48px;
          height: 48px;
        ">▲</button>

        <!-- DOWN Button -->
        <button id="vbtn-down" data-action="down" class="vpad-dir-btn" style="
          position: absolute;
          bottom: 0;
          left: 48px;
          width: 48px;
          height: 48px;
        ">▼</button>

        <!-- LEFT Button -->
        <button id="vbtn-left" data-action="left" class="vpad-dir-btn" style="
          position: absolute;
          top: 48px;
          left: 0;
          width: 48px;
          height: 48px;
        ">◄</button>

        <!-- RIGHT Button -->
        <button id="vbtn-right" data-action="right" class="vpad-dir-btn" style="
          position: absolute;
          top: 48px;
          right: 0;
          width: 48px;
          height: 48px;
        ">►</button>
      </div>

      <!-- Right Side: 16-Bit Action Buttons Cluster -->
      <div id="vpad-action-cluster" style="
        position: relative;
        width: 170px;
        height: 154px;
        margin-bottom: 8px;
        margin-right: 6px;
        pointer-events: auto;
        touch-action: none;
      ">
        <!-- [Y] ROCK POWER / SPECIAL (Top) -->
        <button id="vbtn-special" data-action="special" class="vpad-action-btn" style="
          position: absolute;
          top: 0;
          left: 56px;
          background: linear-gradient(180deg, #9b59b6 0%, #6c3483 100%);
          border-color: #000;
          box-shadow: inset 3px 3px 0 #d2b4de, inset -3px -3px 0 #3a1548, 0 4px 0 #000;
          color: #fff;
        ">
          <span style="font-size: 13px;">⚡</span>
          <span style="font-size: 8px;">Y</span>
        </button>

        <!-- [X] MELEE (Left) -->
        <button id="vbtn-melee" data-action="melee" class="vpad-action-btn" style="
          position: absolute;
          top: 48px;
          left: 0;
          background: linear-gradient(180deg, #1abc9c 0%, #117a65 100%);
          border-color: #000;
          box-shadow: inset 3px 3px 0 #a2d9ce, inset -3px -3px 0 #0b4539, 0 4px 0 #000;
          color: #fff;
        ">
          <span style="font-size: 13px;">⚔</span>
          <span style="font-size: 8px;">X</span>
        </button>

        <!-- [B] SHOOT (Bottom) -->
        <button id="vbtn-shoot" data-action="shoot" class="vpad-action-btn" style="
          position: absolute;
          bottom: 4px;
          left: 50px;
          background: linear-gradient(180deg, #e74c3c 0%, #922b21 100%);
          border-color: #000;
          box-shadow: inset 3px 3px 0 #f5b7b1, inset -3px -3px 0 #581812, 0 4px 0 #000;
          color: #fff;
        ">
          <span style="font-size: 13px;">💥</span>
          <span style="font-size: 8px;">B</span>
        </button>

        <!-- [A] JUMP (Right - Large Primary Button) -->
        <button id="vbtn-jump" data-action="jump" class="vpad-action-btn vpad-primary-btn" style="
          position: absolute;
          top: 40px;
          right: 0;
          width: 58px;
          height: 58px;
          background: linear-gradient(180deg, #f1c40f 0%, #b7950b 100%);
          border-color: #000;
          box-shadow: inset 3px 3px 0 #fcf3cf, inset -3px -3px 0 #6e5603, 0 5px 0 #000;
          color: #111;
        ">
          <span style="font-size: 15px;">▲</span>
          <span style="font-size: 9px; font-weight: 900;">A</span>
        </button>
      </div>

      <style>
        .vpad-meta-btn {
          background: rgba(10, 8, 16, 0.85);
          border: 2px solid #ffd700;
          color: #ffd700;
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          padding: 6px 12px;
          border-radius: 0px;
          cursor: pointer;
          user-select: none;
          touch-action: none;
          box-shadow: 0 3px 0 #000;
        }
        .vpad-meta-btn:active {
          transform: translateY(2px);
          box-shadow: 0 1px 0 #000;
        }
        .vpad-dir-btn {
          background: transparent;
          border: none;
          outline: none;
          color: #ffeaa7;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          touch-action: none;
          z-index: 3;
          text-shadow: 0 2px 4px #000;
          transition: background 0.05s;
        }
        .vpad-dir-btn.vpad-active {
          background: rgba(255, 215, 0, 0.4) !important;
          color: #fff !important;
          text-shadow: 0 0 10px #ffd700 !important;
        }
        .vpad-action-btn {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3px solid #000;
          cursor: pointer;
          user-select: none;
          touch-action: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Press Start 2P', monospace;
          outline: none;
          transition: transform 0.05s;
        }
        .vpad-action-btn.vpad-active {
          transform: translateY(4px) scale(0.95) !important;
          filter: brightness(1.3) !important;
          box-shadow: inset 3px 3px 0 rgba(0,0,0,0.8), 0 1px 0 #000 !important;
        }

        /* Mobile landscape fine-tuning */
        @media (max-height: 480px) {
          #vpad-dpad-cluster {
            transform: scale(0.85);
            transform-origin: bottom left;
          }
          #vpad-action-cluster {
            transform: scale(0.85);
            transform-origin: bottom right;
          }
        }
      </style>
    `;

    this.container.appendChild(this.gamepadEl);
    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.gamepadEl) return;

    // Toggle button handler
    const toggleBtn = this.gamepadEl.querySelector('#vpad-toggle-btn') as HTMLElement;
    if (toggleBtn) {
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        this.userPrefersVisible = !this.userPrefersVisible;
        this.setVisible(this.userPrefersVisible);
      };
    }

    // Pause button handler
    const pauseBtn = this.gamepadEl.querySelector('#vpad-pause-btn') as HTMLElement;
    if (pauseBtn) {
      pauseBtn.onclick = (e) => {
        e.stopPropagation();
        this.inputManager.setTouchAction('pause', true);
        setTimeout(() => this.inputManager.setTouchAction('pause', false), 100);
      };
    }

    // Setup touch handlers for D-Pad and Action buttons
    const interactiveButtons = this.gamepadEl.querySelectorAll('button[data-action]');
    interactiveButtons.forEach((btn) => {
      const el = btn as HTMLElement;
      const action = el.dataset.action as any;

      const triggerPress = (active: boolean) => {
        if (active) {
          el.classList.add('vpad-active');
          this.inputManager.setTouchAction(action, true);
        } else {
          el.classList.remove('vpad-active');
          this.inputManager.setTouchAction(action, false);
        }
      };

      // Pointer / Touch events
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.setPointerCapture(e.pointerId);
        triggerPress(true);
      });

      el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerPress(false);
      });

      el.addEventListener('pointercancel', () => {
        triggerPress(false);
      });

      el.addEventListener('pointerleave', () => {
        triggerPress(false);
      });
    });

    // Support touch sliding across the D-Pad cluster
    const dpadCluster = this.gamepadEl.querySelector('#vpad-dpad-cluster') as HTMLElement;
    if (dpadCluster) {
      let currentDpadAction: string | null = null;

      dpadCluster.addEventListener(
        'touchmove',
        (e) => {
          e.preventDefault();
          const touch = e.touches[0];
          if (!touch) return;

          const elem = document.elementFromPoint(touch.clientX, touch.clientY);
          const button = elem?.closest('button[data-action]') as HTMLElement | null;
          const newAction = button ? (button.dataset.action as any) : null;

          if (newAction !== currentDpadAction) {
            // Release previous
            if (currentDpadAction) {
              const prevBtn = dpadCluster.querySelector(`button[data-action="${currentDpadAction}"]`);
              prevBtn?.classList.remove('vpad-active');
              this.inputManager.setTouchAction(currentDpadAction as any, false);
            }
            // Press new
            if (newAction && ['up', 'down', 'left', 'right'].includes(newAction)) {
              button?.classList.add('vpad-active');
              this.inputManager.setTouchAction(newAction, true);
              currentDpadAction = newAction;
            } else {
              currentDpadAction = null;
            }
          }
        },
        { passive: false }
      );

      const releaseCluster = () => {
        if (currentDpadAction) {
          const prevBtn = dpadCluster.querySelector(`button[data-action="${currentDpadAction}"]`);
          prevBtn?.classList.remove('vpad-active');
          this.inputManager.setTouchAction(currentDpadAction as any, false);
          currentDpadAction = null;
        }
      };
      dpadCluster.addEventListener('touchend', releaseCluster);
      dpadCluster.addEventListener('touchcancel', releaseCluster);
    }
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible && this.userPrefersVisible;
    if (this.gamepadEl) {
      this.gamepadEl.style.display = this.isVisible ? 'flex' : 'none';
    }
  }

  public hide(): void {
    if (this.gamepadEl) {
      this.gamepadEl.style.display = 'none';
    }
    // Release all ongoing touch actions
    const actions: any[] = ['left', 'right', 'up', 'down', 'jump', 'shoot', 'melee', 'special', 'pause'];
    actions.forEach((act) => this.inputManager.setTouchAction(act, false));
    if (this.gamepadEl) {
      this.gamepadEl.querySelectorAll('.vpad-active').forEach((el) => el.classList.remove('vpad-active'));
    }
  }

  public show(): void {
    this.setVisible(true);
  }

  public destroy(): void {
    if (this.gamepadEl && this.gamepadEl.parentNode) {
      this.gamepadEl.parentNode.removeChild(this.gamepadEl);
      this.gamepadEl = null;
    }
  }
}
