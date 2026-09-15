import * as THREE from 'three';
import { AABB } from '../types';

export interface AmbientDebugStatus {
  parallax: boolean;
  particles: boolean;
  rain: boolean;
  neons: boolean;
  smoke: boolean;
  activeSmokeCount: number;
  activeGeneralFxCount: number;
  activeRainCount: number;
  totalActiveParticles: number;
}

export class DebugOverlay {
  public isVisible: boolean = false;
  private domElement: HTMLElement | null;
  private scene: THREE.Scene;
  private lineGroup: THREE.Group;
  private lineMaterial: THREE.LineBasicMaterial;
  private redLineMaterial: THREE.LineBasicMaterial;
  private yellowLineMaterial: THREE.LineBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.domElement = document.getElementById('debug-info');
    this.lineGroup = new THREE.Group();
    this.lineGroup.position.z = 80;
    this.scene.add(this.lineGroup);

    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff66 }); // Green for solids
    this.redLineMaterial = new THREE.LineBasicMaterial({ color: 0xff3333 }); // Red for hurt/hitboxes
    this.yellowLineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 }); // Yellow for triggers

    // Check URL
    if (window.location.search.includes('debug=true')) {
      this.toggle(true);
    }
  }

  public toggle(forceState?: boolean): void {
    this.isVisible = forceState !== undefined ? forceState : !this.isVisible;
    if (this.domElement) {
      this.domElement.style.display = this.isVisible ? 'block' : 'none';
    }
    this.lineGroup.visible = this.isVisible;
  }

  public updateStats(
    fps: number,
    playerX: number,
    playerY: number,
    playerState: string,
    enemyCount: number,
    projectileCount: number,
    rockPower: number,
    ambient?: AmbientDebugStatus
  ): void {
    if (!this.isVisible || !this.domElement) return;

    let ambientHtml = '';
    if (ambient) {
      ambientHtml = `
        <hr style="border-color:#444;margin:4px 0;"/>
        <b style="color:#ffcc00;">[AMBIENT ANIMATIONS - SECTION 20]</b><br/>
        Parallax [F2]: <span style="color:${ambient.parallax ? '#00ff66' : '#ff4444'}">${ambient.parallax ? 'ACTIVE' : 'FROZEN'}</span> |
        Particles [F3]: <span style="color:${ambient.particles ? '#00ff66' : '#ff4444'}">${ambient.particles ? 'ON' : 'OFF'}</span><br/>
        Rain [F4]: <span style="color:${ambient.rain ? '#00ff66' : '#888'}">${ambient.rain ? 'ON' : 'OFF (default)'}</span> |
        Neons [F5]: <span style="color:${ambient.neons ? '#00ff66' : '#ff4444'}">${ambient.neons ? 'ON' : 'OFF'}</span> |
        Smoke [F6]: <span style="color:${ambient.smoke ? '#00ff66' : '#ff4444'}">${ambient.smoke ? 'ON' : 'OFF'}</span><br/>
        <b style="color:#00e5ff;">PARTICLES:</b> Smoke: ${ambient.activeSmokeCount}/40 | FX: ${ambient.activeGeneralFxCount}/250 | Rain: ${ambient.activeRainCount}/60 (Total: ${ambient.totalActiveParticles})<br/>
        <b style="color:#ff77ff;">LAYERS (Z):</b> [L0 Sky:-100] [L1 Clouds:-90] [L2 Skyline:-80] [L3 River/Bridge:-60] [L4 Facades:-30] [L5 Ground:0] [L5.5 Refl:1] [L6 FX:20] [L7 FG:40]<br/>
      `;
    }

    this.domElement.innerHTML = `
      <b>[DEBUG MODE - F1 to toggle]</b><br/>
      FPS: ${fps}<br/>
      PLAYER: X: ${Math.round(playerX)} | Y: ${Math.round(playerY)}<br/>
      STATE: ${playerState}<br/>
      ENEMIES: ${enemyCount} | PROJECTILES: ${projectileCount}<br/>
      ROCK POWER: ${Math.round(rockPower)}/100<br/>
      ${ambientHtml}
    `;
  }

  public clearBoxes(): void {
    while (this.lineGroup.children.length > 0) {
      const child = this.lineGroup.children[0] as THREE.Line;
      child.geometry.dispose();
      this.lineGroup.remove(child);
    }
  }

  public drawAABB(box: AABB, color: 'green' | 'red' | 'yellow' = 'green'): void {
    if (!this.isVisible) return;

    const points = [
      new THREE.Vector3(box.x, box.y, 0),
      new THREE.Vector3(box.x + box.width, box.y, 0),
      new THREE.Vector3(box.x + box.width, box.y + box.height, 0),
      new THREE.Vector3(box.x, box.y + box.height, 0),
      new THREE.Vector3(box.x, box.y, 0)
    ];

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    let mat = this.lineMaterial;
    if (color === 'red') mat = this.redLineMaterial;
    if (color === 'yellow') mat = this.yellowLineMaterial;

    const line = new THREE.Line(geom, mat);
    this.lineGroup.add(line);
  }
}
