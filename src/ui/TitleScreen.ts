import { AudioManager } from '../core/AudioManager';

export class TitleScreen {
  private container: HTMLElement;
  private onStart: () => void;
  private keyListener: ((e: KeyboardEvent) => void) | null = null;
  private pointerListener: (() => void) | null = null;

  constructor(container: HTMLElement, onStart: () => void) {
    this.container = container;
    this.onStart = onStart;
  }

  public show(): void {
    const audio = AudioManager.getInstance();

    this.container.innerHTML = `
      <div id="title-screen-wrap" style="
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        background: #000 url('/assets/intro_title.jpg?v=2') center center / contain no-repeat;
        pointer-events: auto;
        color: #fff;
        text-align: center;
        padding-bottom: 24px;
        cursor: pointer;
      ">
        <!-- CRT Vignette and Scanlines -->
        <div style="
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
          background-size: 100% 3px, 6px 100%;
          pointer-events: none;
        "></div>

        <!-- Music Status & Toggle Button (Top Right) -->
        <div id="music-toggle-btn" style="
          position: absolute;
          top: 14px;
          right: 16px;
          z-index: 20;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #ffd700;
          color: #ffd700;
          padding: 6px 12px;
          font-size: 11px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          letter-spacing: 1px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
          user-select: none;
        ">
          <span id="music-icon">${audio.isPlayingBGM() ? '🔊' : '🎵'}</span>
          <span id="music-label">${audio.isPlayingBGM() ? 'DETROIT ROCK CITY: ON' : 'PLAY DETROIT ROCK CITY'}</span>
        </div>

        <!-- 16-Bit Arcade Start Button Container placed dynamically at the bottom -->
        <div style="
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        ">
          <!-- 16-Bit Beveled Arcade START Button -->
          <button id="start-btn" style="
            position: relative;
            background: linear-gradient(180deg, #ff2a55 0%, #d8002a 48%, #9e001e 52%, #660014 100%);
            border: 4px solid #000000;
            border-radius: 0px;
            color: #fffb77;
            font-size: 18px;
            font-family: 'Press Start 2P', 'Courier New', monospace;
            font-weight: bold;
            letter-spacing: 4px;
            padding: 16px 42px;
            cursor: pointer;
            outline: none;
            box-shadow: 
              inset 4px 4px 0 #ff9ebb,
              inset -4px -4px 0 #3a000c,
              0 6px 0 #000000,
              0 10px 0 rgba(0, 0, 0, 0.75);
            text-shadow: 
              2px 2px 0 #000, 
              -2px -2px 0 #000, 
              2px -2px 0 #000, 
              -2px 2px 0 #000, 
              0 3px 0 #000, 
              3px 0 0 #000, 
              -2px 0 0 #000, 
              0 -2px 0 #000;
            animation: arcade16BitFlash 0.9s steps(2, start) infinite;
            user-select: none;
            image-rendering: pixelated;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
          ">
            <span class="pixel-arrow left-arrow">►</span>
            <span class="pixel-btn-label">Start</span>
            <span class="pixel-arrow right-arrow">◄</span>
          </button>

          <!-- 16-Bit Arcade Cabinet Subtitle -->
          <div style="
            font-family: 'Press Start 2P', 'Courier New', monospace;
            font-size: 10px;
            letter-spacing: 2px;
            color: #ffd700;
            text-shadow: 2px 2px 0 #000;
            background: rgba(0, 0, 0, 0.85);
            padding: 6px 16px;
            border: 2px solid #555;
            box-shadow: inset 2px 2px 0 #888, inset -2px -2px 0 #222, 0 4px 0 #000;
          ">
            PUSH START BUTTON
          </div>
        </div>
      </div>

      <style>
        @keyframes arcade16BitFlash {
          0%, 49% {
            color: #fffb77;
            background: linear-gradient(180deg, #ff2a55 0%, #d8002a 48%, #9e001e 52%, #660014 100%);
            box-shadow: 
              inset 4px 4px 0 #ff9ebb,
              inset -4px -4px 0 #3a000c,
              0 6px 0 #000000,
              0 10px 0 rgba(0, 0, 0, 0.75);
          }
          50%, 100% {
            color: #ffffff;
            background: linear-gradient(180deg, #ff476d 0%, #f00033 48%, #bd0025 52%, #7d0018 100%);
            box-shadow: 
              inset 4px 4px 0 #ffffff,
              inset -4px -4px 0 #4a0010,
              0 6px 0 #000000,
              0 10px 0 rgba(255, 215, 0, 0.4);
          }
        }

        .pixel-arrow {
          display: inline-block;
          color: #ffd700;
          text-shadow: 2px 2px 0 #000;
          animation: arrowHop 0.5s steps(2, start) infinite alternate;
        }
        .left-arrow {
          animation-direction: alternate;
        }
        .right-arrow {
          animation-direction: alternate-reverse;
        }

        @keyframes arrowHop {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(4px);
          }
        }

        #start-btn:hover {
          filter: brightness(1.25);
        }

        #start-btn:active {
          transform: translateY(4px);
          box-shadow: 
            inset 4px 4px 0 #3a000c,
            inset -4px -4px 0 #ff9ebb,
            0 2px 0 #000000,
            0 4px 0 rgba(0, 0, 0, 0.75) !important;
        }

        #music-toggle-btn:hover {
          background: rgba(30, 30, 40, 0.95);
          border-color: #ff0055;
          color: #ff0055;
        }
      </style>
    `;

    const musicBtn = document.getElementById('music-toggle-btn');
    const updateMusicUI = () => {
      const isPlaying = audio.isPlayingBGM();
      const icon = document.getElementById('music-icon');
      const label = document.getElementById('music-label');
      if (icon) icon.textContent = isPlaying ? '🔊' : '🎵';
      if (label) label.textContent = isPlaying ? 'DETROIT ROCK CITY: ON' : 'PLAY DETROIT ROCK CITY';
    };

    if (musicBtn) {
      musicBtn.onclick = (e) => {
        e.stopPropagation();
        if (audio.isPlayingBGM()) {
          audio.stopBGM();
        } else {
          audio.startIntroBGM();
        }
        updateMusicUI();
      };
    }

    // Immediate autoplay attempt
    audio.startIntroBGM();
    setTimeout(updateMusicUI, 100);

    // Universal unlock listeners (in case the browser requires a gesture to resume AudioContext)
    const unlockEvents = ['pointerdown', 'mousedown', 'mousemove', 'keydown', 'touchstart', 'wheel', 'focus'];
    const unlockHandler = () => {
      if (!audio.isPlayingBGM()) {
        audio.startIntroBGM();
        updateMusicUI();
      }
    };
    unlockEvents.forEach((evt) => window.addEventListener(evt, unlockHandler, { passive: true }));

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.onclick = (e) => {
        e.stopPropagation();
        audio.playPickup();
        audio.startIntroBGM();
        setTimeout(() => this.triggerStart(), 120);
      };
    }

    const wrap = document.getElementById('title-screen-wrap');
    if (wrap) {
      wrap.onclick = () => {
        audio.playPickup();
        audio.startIntroBGM();
        setTimeout(() => this.triggerStart(), 120);
      };
    }

    // Keyboard support for space and enter on title screen
    this.keyListener = (e: KeyboardEvent) => {
      if (['Space', 'Enter', 'KeyX', 'KeyJ'].includes(e.code)) {
        e.preventDefault();
        audio.playPickup();
        audio.startIntroBGM();
        setTimeout(() => this.triggerStart(), 120);
      } else {
        if (!audio.isPlayingBGM()) {
          audio.startIntroBGM();
          updateMusicUI();
        }
      }
    };
    window.addEventListener('keydown', this.keyListener);

    this.pointerListener = () => {
      unlockEvents.forEach((evt) => window.removeEventListener(evt, unlockHandler));
    };
  }

  private triggerStart(): void {
    this.hide();
    this.onStart();
  }

  public hide(): void {
    if (this.keyListener) {
      window.removeEventListener('keydown', this.keyListener);
      this.keyListener = null;
    }
    if (this.pointerListener) {
      this.pointerListener();
      this.pointerListener = null;
    }
    this.container.innerHTML = '';
  }
}
