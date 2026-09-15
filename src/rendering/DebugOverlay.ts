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
        <b style="color:#ffcc00;">[ANIMACIONES AMBIENTALES - SECCIÓN 20]</b><br/>
        Parallax [F2]: <span style="color:${ambient.parallax ? '#00ff66' : '#ff4444'}">${ambient.parallax ? 'ACTIVO' : 'CONGELADO'}</span> |
        Partículas [F3]: <span style="color:${ambient.particles ? '#00ff66' : '#ff4444'}">${ambient.particles ? 'SÍ' : 'NO'}</span><br/>
        Lluvia [F4]: <span style="color:${ambient.rain ? '#00ff66' : '#888'}">${ambient.rain ? 'SÍ' : 'NO (por defecto)'}</span> |
        Neones [F5]: <span style="color:${ambient.neons ? '#00ff66' : '#ff4444'}">${ambient.neons ? 'SÍ' : 'NO'}</span> |
        Humo [F6]: <span style="color:${ambient.smoke ? '#00ff66' : '#ff4444'}">${ambient.smoke ? 'SÍ' : 'NO'}</span><br/>
        <b style="color:#00e5ff;">PARTÍCULAS:</b> Humo: ${ambient.activeSmokeCount}/40 | FX: ${ambient.activeGeneralFxCount}/250 | Lluvia: ${ambient.activeRainCount}/60 (Total: ${ambient.totalActiveParticles})<br/>
        <b style="color:#ff77ff;">CAPAS (Z):</b> [C0 Cielo:-100] [C1 Nubes:-90] [C2 Skyline:-80] [C3 Río/Puente:-60] [C4 Fachadas:-30] [C5 Suelo:0] [C5.5 Refl:1] [C6 FX:20] [C7 Primer plano:40]<br/>
      `;
    }

    this.domElement.innerHTML = `
      <b>[MODO DEPURACIÓN - F1 para alternar]</b><br/>
      FPS: ${fps}<br/>
      JUGADOR: X: ${Math.round(playerX)} | Y: ${Math.round(playerY)}<br/>
      ESTADO: ${playerState}<br/>
      ENEMIGOS: ${enemyCount} | PROYECTILES: ${projectileCount}<br/>
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
