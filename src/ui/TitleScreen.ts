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
        background-color: #050208;
        pointer-events: auto;
        color: #fff;
        text-align: center;
        padding-bottom: max(env(safe-area-inset-bottom, 16px), 16px);
        padding-left: max(env(safe-area-inset-left, 16px), 16px);
        padding-right: max(env(safe-area-inset-right, 16px), 16px);
        box-sizing: border-box;
        cursor: pointer;
        overflow: hidden;
        user-select: none;
      ">
        <!-- Ambient Widescreen Atmosphere (fills sides on wide desktop screens with blurred art colors) -->
        <div class="intro-ambient-bg" style="
          position: absolute;
          inset: -40px;
          background: url('/assets/intro_title.jpg?v=2') center center / cover no-repeat;
          filter: blur(28px) brightness(0.35) saturate(1.4);
          transform: scale(1.08);
          pointer-events: none;
          z-index: 1;
        "></div>

        <!-- Vignette Shadow to smoothly blend edges -->
        <div style="
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%);
          pointer-events: none;
          z-index: 2;
        "></div>

        <!-- 100% Complete Crisp Artwork Canvas (Never cut, preserves logo and artwork fully on desktop & all screens) -->
        <div class="intro-artwork-container" style="
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          pointer-events: none;
          z-index: 3;
          padding: max(env(safe-area-inset-top, 8px), 8px) max(env(safe-area-inset-right, 10px), 10px) max(env(safe-area-inset-bottom, 10px), 10px) max(env(safe-area-inset-left, 10px), 10px);
          box-sizing: border-box;
        ">
          <img 
            id="intro-main-artwork"
            src="/assets/intro_title.jpg?v=2" 
            alt="KISS: Power of the Night" 
            style="
              max-width: 100%;
              max-height: 100%;
              width: 100%;
              height: 100%;
              aspect-ratio: 1024 / 767;
              object-fit: contain;
              object-position: center center;
              image-rendering: pixelated;
              display: block;
              filter: drop-shadow(0 0 40px rgba(0, 0, 0, 0.95));
            "
          />
        </div>

        <!-- CRT Vignette and Scanlines -->
        <div style="
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.22) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.025), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.025));
          background-size: 100% 3px, 6px 100%;
          pointer-events: none;
          z-index: 4;
        "></div>

        <!-- 16-Bit Arcade Start Button Container placed dynamically at the bottom -->
        <div class="intro-action-footer" style="
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: max(env(safe-area-inset-bottom, 16px), 16px);
          pointer-events: auto;
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
            <span class="pixel-btn-label">INICIAR</span>
            <span class="pixel-arrow right-arrow">◄</span>
          </button>

          <!-- 16-Bit Arcade Cabinet Subtitle -->
          <div class="intro-start-subtitle" style="
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
            PULSA EL BOTÓN INICIAR
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

        @media (max-height: 600px) {
          #start-btn {
            padding: 10px 28px !important;
            font-size: 13px !important;
          }
          .intro-action-footer {
            gap: 6px !important;
            margin-bottom: 6px !important;
          }
          .intro-start-subtitle {
            font-size: 8px !important;
            padding: 4px 10px !important;
          }
        }
      </style>
    `;

    // Immediate autoplay attempt if not muted
    if (audio.getIsMusicEnabled()) {
      audio.startIntroBGM();
    }

    // Universal unlock listeners (in case the browser requires a gesture to resume AudioContext)
    const unlockEvents = ['pointerdown', 'mousedown', 'mousemove', 'keydown', 'touchstart', 'wheel', 'focus'];
    const unlockHandler = () => {
      if (audio.getIsMusicEnabled() && !audio.isPlayingBGM()) {
        audio.startIntroBGM();
      }
    };
    unlockEvents.forEach((evt) => window.addEventListener(evt, unlockHandler, { passive: true }));

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.onclick = (e) => {
        e.stopPropagation();
        audio.playPickup();
        if (audio.getIsMusicEnabled()) {
          audio.startIntroBGM();
        }
        setTimeout(() => this.triggerStart(), 120);
      };
    }

    const wrap = document.getElementById('title-screen-wrap');
    if (wrap) {
      wrap.onclick = () => {
        audio.playPickup();
        if (audio.getIsMusicEnabled()) {
          audio.startIntroBGM();
        }
        setTimeout(() => this.triggerStart(), 120);
      };
    }

    // Keyboard support for space and enter on title screen
    this.keyListener = (e: KeyboardEvent) => {
      if (['Space', 'Enter', 'KeyX', 'KeyJ'].includes(e.code)) {
        e.preventDefault();
        audio.playPickup();
        if (audio.getIsMusicEnabled()) {
          audio.startIntroBGM();
        }
        setTimeout(() => this.triggerStart(), 120);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        audio.toggleMusic();
      } else {
        if (audio.getIsMusicEnabled() && !audio.isPlayingBGM()) {
          audio.startIntroBGM();
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
