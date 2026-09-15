import { PlayerState } from './states/PlayerState';
import { InputState } from '../../types';

export class PlayerStateMachine {
  private states: Map<string, PlayerState> = new Map();
  public currentState: PlayerState | null = null;

  public registerState(name: string, state: PlayerState): void {
    this.states.set(name.toLowerCase(), state);
  }

  public changeState(name: string): void {
    const nextState = this.states.get(name.toLowerCase());
    if (!nextState) {
      console.warn(`[PlayerStateMachine] State "${name}" not found!`);
      return;
    }

    if (this.currentState) {
      this.currentState.exit();
    }

    this.currentState = nextState;
    this.currentState.enter();
  }

  public update(input: InputState, dt: number): void {
    if (this.currentState) {
      this.currentState.update(input, dt);
    }
  }

  public getCurrentStateName(): string {
    return this.currentState ? this.currentState.getName() : 'None';
  }
}
