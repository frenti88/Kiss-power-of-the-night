import { Game } from './core/Game';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const uiOverlay = document.getElementById('ui-overlay') as HTMLElement;

  if (!canvas || !uiOverlay) {
    console.error('Fatal: Missing canvas or ui-overlay container in DOM!');
    return;
  }

  const game = new Game(canvas, uiOverlay);
  game.start();

  // Expose on window for debugging/testing
  (window as any).__KISS_GAME__ = game;
});
