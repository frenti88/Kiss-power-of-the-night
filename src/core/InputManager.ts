import { InputState } from '../types';

export class InputManager {
  private keyMap: Map<string, boolean> = new Map();
  private justPressedKeys: Set<string> = new Set();
  private touchState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    shoot: false,
    melee: false,
    special: false,
    pause: false
  };
  private justPressedTouch: Set<string> = new Set();

  public state: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpPressed: false,
    shoot: false,
    shootPressed: false,
    melee: false,
    meleePressed: false,
    special: false,
    specialPressed: false,
    dash: false,
    pausePressed: false
  };

  public onDebugToggle?: () => void;
  public onToggleParallax?: () => void;
  public onToggleParticles?: () => void;
  public onToggleRain?: () => void;
  public onToggleNeons?: () => void;
  public onToggleSmoke?: () => void;
  public onToggleMusic?: () => void;

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.repeat) return;

    if (e.key === 'F1' || e.key === '`' || e.key === '~') {
      e.preventDefault();
      if (this.onDebugToggle) this.onDebugToggle();
      return;
    }
    if (e.key === 'F2') {
      e.preventDefault();
      if (this.onToggleParallax) this.onToggleParallax();
      return;
    }
    if (e.key === 'F3') {
      e.preventDefault();
      if (this.onToggleParticles) this.onToggleParticles();
      return;
    }
    if (e.key === 'F4') {
      e.preventDefault();
      if (this.onToggleRain) this.onToggleRain();
      return;
    }
    if (e.key === 'F5') {
      e.preventDefault();
      if (this.onToggleNeons) this.onToggleNeons();
      return;
    }
    if (e.key === 'F6') {
      e.preventDefault();
      if (this.onToggleSmoke) this.onToggleSmoke();
      return;
    }
    if (e.code === 'KeyM') {
      e.preventDefault();
      if (this.onToggleMusic) this.onToggleMusic();
      return;
    }

    const key = e.code;
    this.keyMap.set(key, true);
    this.justPressedKeys.add(key);

    // Prevent scrolling with arrows/space
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keyMap.set(e.code, false);
  };

  public setTouchAction(
    action: 'left' | 'right' | 'up' | 'down' | 'jump' | 'shoot' | 'melee' | 'special' | 'pause',
    active: boolean
  ): void {
    const wasActive = this.touchState[action];
    this.touchState[action] = active;
    if (active && !wasActive) {
      this.justPressedTouch.add(action);
    }
  }

  public update(): void {
    // Check Gamepad
    let gpLeft = false;
    let gpRight = false;
    let gpUp = false;
    let gpDown = false;
    let gpJump = false;
    let gpShoot = false;
    let gpMelee = false;
    let gpSpecial = false;
    let gpPause = false;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (gp && gp.connected) {
      const axisX = gp.axes[0] || 0;
      const axisY = gp.axes[1] || 0;
      const dpadUp = gp.buttons[12]?.pressed;
      const dpadDown = gp.buttons[13]?.pressed;
      const dpadLeft = gp.buttons[14]?.pressed;
      const dpadRight = gp.buttons[15]?.pressed;

      gpLeft = axisX < -0.3 || dpadLeft;
      gpRight = axisX > 0.3 || dpadRight;
      gpUp = axisY < -0.3 || dpadUp;
      gpDown = axisY > 0.3 || dpadDown;

      gpJump = gp.buttons[0]?.pressed; // A
      gpShoot = gp.buttons[2]?.pressed; // X
      gpMelee = gp.buttons[1]?.pressed; // B
      gpSpecial = gp.buttons[3]?.pressed; // Y
      gpPause = gp.buttons[9]?.pressed; // Start
    }

    const isDown = (...keys: string[]) => keys.some((k) => this.keyMap.get(k));
    const wasJustPressed = (...keys: string[]) => keys.some((k) => this.justPressedKeys.has(k));

    const left = isDown('ArrowLeft', 'KeyA') || gpLeft || this.touchState.left;
    const right = isDown('ArrowRight', 'KeyD') || gpRight || this.touchState.right;
    const up = isDown('ArrowUp', 'KeyW') || gpUp || this.touchState.up;
    const down = isDown('ArrowDown', 'KeyS') || gpDown || this.touchState.down;

    const jump = isDown('Space', 'KeyK') || gpJump || this.touchState.jump;
    const jumpPressed = wasJustPressed('Space', 'KeyK') || gpJump || this.justPressedTouch.has('jump');

    const shoot = isDown('KeyJ', 'KeyX') || gpShoot || this.touchState.shoot;
    const shootPressed = wasJustPressed('KeyJ', 'KeyX') || gpShoot || this.justPressedTouch.has('shoot');

    const melee = isDown('KeyC', 'KeyH') || gpMelee || this.touchState.melee;
    const meleePressed = wasJustPressed('KeyC', 'KeyH') || gpMelee || this.justPressedTouch.has('melee');

    const special = isDown('KeyL', 'KeyV') || gpSpecial || this.touchState.special;
    const specialPressed = wasJustPressed('KeyL', 'KeyV') || gpSpecial || this.justPressedTouch.has('special');

    const dash = isDown('ShiftLeft', 'ShiftRight');
    const pausePressed = wasJustPressed('Enter', 'Escape') || gpPause || this.justPressedTouch.has('pause');

    this.state = {
      left,
      right,
      up,
      down,
      jump,
      jumpPressed,
      shoot,
      shootPressed,
      melee,
      meleePressed,
      special,
      specialPressed,
      dash,
      pausePressed
    };

    // Clear edge-triggered keys and touches for next frame
    this.justPressedKeys.clear();
    this.justPressedTouch.clear();
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
