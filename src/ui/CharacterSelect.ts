import { SaveManager } from '../core/SaveManager';
import { AudioManager } from '../core/AudioManager';

export interface CharacterCardData {
  id: string;
  name: string;
  member: string;
  subtitle: string;
  role: string;
  color: string;
  verticalUrl: string;
  avatarUrl?: string;
  symbol: string;
  desc: string;
  locked: boolean;
  lockReason?: string;
  stats: {
    health: number;  // 1-5
    speed: number;   // 1-5
    power: number;   // 1-5
    defense: number; // 1-5
  };
  weapon: string;
  melee: string;
  special: string;
  ultimate: string;
}

export class CharacterSelect {
  private container: HTMLElement;
  private onSelect: (characterId: string) => void;
  private selectedId: string = 'starchild';
  private keyListener: ((e: KeyboardEvent) => void) | null = null;

  constructor(container: HTMLElement, onSelect: (characterId: string) => void) {
    this.container = container;
    this.onSelect = onSelect;
  }

  public show(): void {
    const saveData = SaveManager.load();
    const audio = AudioManager.getInstance();

    const characters: CharacterCardData[] = [
      {
        id: 'starchild',
        name: 'THE STARCHILD',
        member: 'PAUL STANLEY',
        subtitle: 'Love Gun / Agilidad Equilibrada',
        role: 'EQUILIBRADO / ÁGIL',
        color: '#d056fd',
        verticalUrl: '/assets/characters/vertical_starchild.png',
        avatarUrl: '/assets/characters/avatar_starchild.jpg',
        symbol: '⭐',
        desc: 'Movilidad superior y acrobacias rápidas. Dispara deslumbrantes rayos cósmicos en forma de estrella con alta cadencia de fuego.',
        locked: !saveData.unlockedCharacters.includes('starchild'),
        stats: { health: 4, speed: 5, power: 4, defense: 3 },
        weapon: 'Star Shot (22 DMG - Rapid)',
        melee: 'Guitar Smash & Slash (35 DMG)',
        special: 'Starlight Volley (55 DMG)',
        ultimate: 'Love Gun (230 DMG Burst)'
      },
      {
        id: 'demon',
        name: 'THE DEMON',
        member: 'GENE SIMMONS',
        subtitle: 'God of Thunder / Poder Pesado',
        role: 'PESADO / PODER',
        color: '#ff2a55',
        verticalUrl: '/assets/characters/vertical_demon.png',
        avatarUrl: '/assets/characters/avatar_demon.jpg',
        symbol: '🦇',
        desc: 'Resistencia demoledora y bolas de fuego apocalípticas. Sus golpes cuerpo a cuerpo con el Axe-Bass pulverizan a los roadies.',
        locked: !saveData.unlockedCharacters.includes('demon'),
        stats: { health: 5, speed: 3, power: 5, defense: 4 },
        weapon: 'Fireball (25 DMG)',
        melee: 'Axe Bass / Demon Bite (45 DMG)',
        special: 'Fire Breath (65 DMG)',
        ultimate: 'God of Thunder (250 DMG Full-Screen)'
      },
      {
        id: 'catman',
        name: 'THE CATMAN',
        member: 'PETER CRISS',
        subtitle: 'Wild Claws / Golpeador Combo',
        role: 'MELEE / COMBO',
        color: '#1dd1a1',
        verticalUrl: '/assets/characters/vertical_catman.png',
        avatarUrl: '/assets/characters/avatar_catman.jpg',
        symbol: '🐾',
        desc: '¡Peter Criss desatado! Devastadoras ráfagas de garras multigolpe, baquetas afiladas y atronadoras ondas de choque acústicas.',
        locked: !saveData.unlockedCharacters.includes('catman'),
        lockReason: 'COMPLETA EL MUNDO 3 PARA DESBLOQUEAR',
        stats: { health: 4, speed: 4, power: 4, defense: 4 },
        weapon: 'Claw Slash (28 DMG)',
        melee: 'Cat Flurry (50 DMG)',
        special: 'Pounce (65 DMG)',
        ultimate: 'Drum Shockwave (240 DMG)'
      },
      {
        id: 'spaceman',
        name: 'THE SPACEMAN',
        member: 'ACE FREHLEY',
        subtitle: 'Cosmic Shock / Rayo Eléctrico',
        role: 'A DISTANCIA / AGILIDAD',
        color: '#00d2d3',
        verticalUrl: '/assets/characters/vertical_spaceman.png',
        avatarUrl: '/assets/characters/avatar_spaceman.jpg',
        symbol: '⚡',
        desc: '¡Ace Frehley ataca desde el espacio exterior! Dispara rayos láser cósmicos perforantes de alta velocidad y electrizantes solos de Gibson Les Paul.',
        locked: !saveData.unlockedCharacters.includes('spaceman'),
        lockReason: 'COMPLETA EL MUNDO 1 PARA DESBLOQUEAR',
        stats: { health: 3, speed: 4, power: 5, defense: 3 },
        weapon: 'Cosmic Beam (26 DMG - Piercing)',
        melee: 'Smoke Guitar Shock (30 DMG)',
        special: 'Meteor Strike (70 DMG)',
        ultimate: 'Spacewalk Singularity (260 DMG)'
      },
      {
        id: 'fox',
        name: 'THE FOX',
        member: 'ERIC CARR',
        subtitle: 'Thunder Beats / Carrera Ardiente',
        role: 'VELOCIDAD EXTREMA',
        color: '#ff9f43',
        verticalUrl: '/assets/characters/vertical_fox.png',
        avatarUrl: '/assets/characters/avatar_fox.jpg',
        symbol: '🦊',
        desc: '¡Eric Carr enciende el escenario! Impetuosas carreras con fuego de zorro, ráfagas de percusión con doble bombo y veloces golpes de baqueta.',
        locked: !saveData.unlockedCharacters.includes('fox'),
        lockReason: 'COMPLETA EL MUNDO 2 PARA DESBLOQUEAR',
        stats: { health: 3, speed: 5, power: 4, defense: 3 },
        weapon: 'Fox Fire Blast (22 DMG)',
        melee: 'Thunder Drum Strike (35 DMG)',
        special: 'Fox Blitz Dash (60 DMG)',
        ultimate: 'Tiamat Rage (250 DMG)'
      },
      {
        id: 'ankh_warrior',
        name: 'THE ANKH WARRIOR',
        member: 'VINNIE VINCENT',
        subtitle: 'Hechicero Solar / Rayo Místico',
        role: 'ENERGÍA / MAGIA',
        color: '#f5cd79',
        verticalUrl: '/assets/characters/vertical_ankh_warrior.png',
        avatarUrl: '/assets/characters/avatar_ankh_warrior.jpg',
        symbol: '☥',
        desc: '¡Vinnie Vincent empuña el Anj dorado de la eternidad! Emite rayos de plasma solar, golpes de cetro dorado y protección mística.',
        locked: !saveData.unlockedCharacters.includes('ankh_warrior'),
        lockReason: 'COMPLETA EL MUNDO 4 PARA DESBLOQUEAR',
        stats: { health: 3, speed: 4, power: 5, defense: 4 },
        weapon: 'Solar Beam (26 DMG)',
        melee: 'Ankh Scepter Strike (38 DMG)',
        special: 'Sun Breath (65 DMG)',
        ultimate: 'Solar Ankh Avatar (260 DMG)'
      }
    ];

    const currentHero = characters.find((c) => c.id === this.selectedId) || characters[0];

    const renderPips = (val: number, max: number = 5, color: string = '#ffd700'): string => {
      let html = '<div style="display: flex; gap: 3px; align-items: center;">';
      for (let i = 1; i <= max; i++) {
        const active = i <= val;
        html += `<div style="
          width: 11px;
          height: 9px;
          background: ${active ? (currentHero.locked ? '#777' : color) : '#15151e'};
          border: 1px solid ${active ? (currentHero.locked ? '#aaa' : '#fff') : '#2f2f3e'};
          box-shadow: ${active && !currentHero.locked ? `0 0 6px ${color}` : 'none'};
        "></div>`;
      }
      html += '</div>';
      return html;
    };

    this.container.innerHTML = `
      <div id="char-select-wrap" style="
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        background: radial-gradient(circle at center, #180924 0%, #09030e 70%, #000000 100%);
        pointer-events: auto;
        color: #fff;
        padding: max(env(safe-area-inset-top, 8px), 8px) max(env(safe-area-inset-right, 16px), 16px) max(env(safe-area-inset-bottom, 8px), 8px) max(env(safe-area-inset-left, 16px), 16px);
        box-sizing: border-box;
        user-select: none;
        overflow: hidden;
      ">
        <!-- CRT Scanline Overlay -->
        <div style="
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.28) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.025), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.025));
          background-size: 100% 3px, 6px 100%;
          pointer-events: none;
          z-index: 2;
        "></div>

        <!-- 16-Bit Arcade Header -->
        <div class="char-select-header" style="position: relative; z-index: 5; text-align: center;">
          <h1 style="
            font-size: 18px;
            letter-spacing: 4px;
            color: #ffd700;
            font-family: 'Press Start 2P', 'Courier New', monospace;
            text-shadow: 3px 3px 0 #b80000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 4px 0 #000;
            margin: 0 0 4px 0;
            animation: headerFlicker 2.5s infinite alternate;
          ">
            SELECCIONA TU GUERRERO
          </h1>
          <div class="sub-header-text" style="
            font-size: 9px;
            font-family: 'Press Start 2P', monospace;
            color: #00f0ff;
            letter-spacing: 2px;
            text-shadow: 1px 1px 0 #000;
            animation: subHeaderFlash 1.2s steps(2, start) infinite;
          ">
            [ JUGADOR 1 - ELIGE A TU HÉROE DEL ROCK ]
          </div>
        </div>

        <!-- 6 Vertical Character Bays (As in the original arcade artwork) -->
        <div class="warriors-bays-wrapper" style="
          position: relative;
          z-index: 5;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 8px;
          max-width: 980px;
          width: 100%;
          height: min(56vh, 470px);
          padding: 8px 4px 4px 4px;
          box-sizing: border-box;
          overflow-x: auto;
          overflow-y: hidden;
        ">
          ${characters
            .map((c) => {
              const isSelected = c.id === this.selectedId;
              const isLocked = c.locked;

              // Border and glow logic matching character color
              let borderStyle = 'border: 2px solid #3d3d4e;';
              let boxShadow = '0 6px 12px rgba(0, 0, 0, 0.85);';
              let transform = 'translateY(0) scale(1);';

              if (isSelected) {
                const glowColor = isLocked ? '#ff4757' : c.color;
                borderStyle = `border: 2px solid ${glowColor};`;
                boxShadow = `
                  0 0 20px ${glowColor},
                  inset 0 0 10px rgba(255, 255, 255, 0.3),
                  0 8px 16px rgba(0, 0, 0, 0.95)
                `;
                transform = 'translateY(-8px) scale(1.03);';
              }

              return `
              <div 
                id="bay-${c.id}" 
                class="warrior-bay ${isSelected ? 'warrior-bay-selected' : ''} ${isLocked ? 'warrior-bay-locked' : ''}" 
                data-id="${c.id}" 
                data-locked="${isLocked}" 
                style="
                  position: relative;
                  height: 100%;
                  aspect-ratio: 168 / 586;
                  display: flex;
                  flex-direction: column;
                  cursor: pointer;
                  box-sizing: border-box;
                  ${borderStyle}
                  box-shadow: ${boxShadow};
                  transform: ${transform};
                  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
                  background: #000;
                  overflow: visible;
                  user-select: none;
                "
              >
                <!-- Indicator Arrow if Selected -->
                ${
                  isSelected
                    ? `<div class="bay-indicator" style="
                        position: absolute;
                        top: -18px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-family: 'Press Start 2P', monospace;
                        font-size: 11px;
                        color: ${isLocked ? '#ff4757' : '#ffd700'};
                        text-shadow: 2px 2px 0 #000;
                        animation: indicatorBounce 0.5s steps(2, start) infinite alternate;
                        z-index: 10;
                      ">▼</div>`
                    : ''
                }

                <!-- Sliced Vertical Warrior Artwork -->
                <div style="
                  position: relative;
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                  background: #08080c;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <img 
                    src="${c.verticalUrl}" 
                    alt="${c.name}" 
                    class="vertical-warrior-img ${isLocked ? 'warrior-img-locked' : ''}"
                    style="
                      width: 100%;
                      height: 100%;
                      object-fit: fill;
                      image-rendering: pixelated;
                      display: block;
                      ${
                        isLocked
                          ? 'filter: grayscale(100%) contrast(1.25) brightness(0.65);'
                          : 'filter: none;'
                      }
                    " 
                  />

                  <!-- Locked Overlay (padlock & condition) -->
                  ${
                    isLocked
                      ? `
                    <div class="locked-overlay" style="
                      position: absolute;
                      inset: 0;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      background: rgba(0, 0, 0, 0.45);
                      gap: 6px;
                      pointer-events: none;
                    ">
                      <span style="
                        font-size: 24px; 
                        filter: drop-shadow(0 2px 4px #000);
                      ">🔒</span>
                      <div style="
                        font-family: 'Press Start 2P', monospace;
                        font-size: 7px;
                        background: rgba(180, 0, 0, 0.9);
                        color: #ffffff;
                        padding: 3px 5px;
                        border: 1px solid #ff4757;
                        text-shadow: 1px 1px 0 #000;
                        letter-spacing: 1px;
                      ">BLOQUEADO</div>
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>
            `;
            })
            .join('')}
        </div>

        <!-- 16-Bit Arcade Stats Readout Panel -->
        <div class="stats-hud-panel" style="
          position: relative;
          z-index: 5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          background: rgba(12, 10, 18, 0.95);
          border: 3px solid #000;
          box-shadow: 
            inset 2px 2px 0 rgba(255, 255, 255, 0.2), 
            inset -2px -2px 0 rgba(0, 0, 0, 0.8), 
            0 4px 0 #000, 
            0 0 16px ${currentHero.locked ? 'rgba(255,71,87,0.25)' : `${currentHero.color}35`};
          max-width: 980px;
          width: 100%;
          padding: 8px 16px;
          box-sizing: border-box;
        ">
          <!-- Left: Hero Identity and Loadout -->
          <div style="flex: 1; display: flex; flex-direction: column; gap: 4px; text-align: left;">
            <div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;">
              <span style="
                font-family: 'Press Start 2P', monospace;
                font-size: 13px;
                color: ${currentHero.locked ? '#ddd' : '#ffd700'};
                text-shadow: 2px 2px 0 #000, 0 0 8px ${currentHero.locked ? '#666' : currentHero.color};
                letter-spacing: 1px;
              ">
                ${currentHero.name}
              </span>
              <span style="
                font-family: 'Press Start 2P', monospace;
                font-size: 8px;
                color: #aaa;
              ">
                (${currentHero.member})
              </span>
              <span style="
                font-family: 'Press Start 2P', monospace;
                font-size: 7px;
                color: ${currentHero.locked ? '#ff6b81' : currentHero.color};
                border: 1px solid ${currentHero.locked ? '#ff6b81' : currentHero.color};
                padding: 2px 5px;
                background: rgba(0,0,0,0.6);
              ">
                ${currentHero.role}
              </span>
            </div>

            <!-- Description or Lock requirement -->
            <div style="
              font-family: 'Courier New', monospace;
              font-size: 11px;
              color: ${currentHero.locked ? '#ff7979' : '#ddd'};
              font-weight: bold;
              text-shadow: 1px 1px 0 #000;
              line-height: 1.3;
            ">
              ${
                currentHero.locked
                  ? `🔒 ${currentHero.lockReason} • ¡Completa los niveles previos en Modo Rock para desbloquear a este guerrero!`
                  : `ARMA: ${currentHero.weapon} | ESPECIAL: ${currentHero.special} | DEFINITIVA: ${currentHero.ultimate}`
              }
            </div>
          </div>

          <!-- Right: 16-Bit Pip Meters -->
          <div style="display: flex; gap: 14px; font-family: 'Press Start 2P', monospace; font-size: 7px; align-items: center;">
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <span style="color: #ff4757;">SAL:</span>
                ${renderPips(currentHero.stats.health, 5, '#ff4757')}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <span style="color: #2ed573;">VEL:</span>
                ${renderPips(currentHero.stats.speed, 5, '#2ed573')}
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <span style="color: #ffa502;">POD:</span>
                ${renderPips(currentHero.stats.power, 5, '#ffa502')}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <span style="color: #70a1ff;">DEF:</span>
                ${renderPips(currentHero.stats.defense, 5, '#70a1ff')}
              </div>
            </div>
          </div>
        </div>

        <!-- 16-Bit Arcade Start Button & Controls Hint -->
        <div class="action-footer" style="
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        ">
          ${
            currentHero.locked
              ? `
            <!-- Locked State Button -->
            <button id="confirm-char-btn" style="
              position: relative;
              background: linear-gradient(180deg, #33333e 0%, #202028 50%, #15151c 100%);
              border: 3px solid #444;
              border-radius: 0px;
              color: #ff6b81;
              font-size: 12px;
              font-family: 'Press Start 2P', 'Courier New', monospace;
              font-weight: bold;
              letter-spacing: 2px;
              padding: 10px 28px;
              cursor: pointer;
              outline: none;
              box-shadow: 
                inset 3px 3px 0 #555,
                inset -3px -3px 0 #111,
                0 4px 0 #000;
              text-shadow: 1px 1px 0 #000;
              user-select: none;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            ">
              <span>🔒</span>
              <span>BLOQUEADO: ${currentHero.lockReason}</span>
            </button>
          `
              : `
            <!-- Active 16-Bit Play Button -->
            <button id="confirm-char-btn" style="
              position: relative;
              background: linear-gradient(180deg, #ff2a55 0%, #d8002a 48%, #9e001e 52%, #660014 100%);
              border: 3px solid #000000;
              border-radius: 0px;
              color: #fffb77;
              font-size: 14px;
              font-family: 'Press Start 2P', 'Courier New', monospace;
              font-weight: bold;
              letter-spacing: 3px;
              padding: 11px 36px;
              cursor: pointer;
              outline: none;
              box-shadow: 
                inset 3px 3px 0 #ff9ebb,
                inset -3px -3px 0 #3a000c,
                0 5px 0 #000000,
                0 8px 0 rgba(0, 0, 0, 0.75);
              text-shadow: 
                2px 2px 0 #000, 
                -2px -2px 0 #000, 
                2px -2px 0 #000, 
                -2px 2px 0 #000, 
                0 3px 0 #000;
              animation: arcade16BitFlash 0.9s steps(2, start) infinite;
              user-select: none;
              image-rendering: pixelated;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            ">
              <span class="pixel-arrow left-arrow">►</span>
              <span>¡A ROCKEAR EN DETROIT!</span>
              <span class="pixel-arrow right-arrow">◄</span>
            </button>
          `
          }

          <div class="nav-hint-text" style="
            font-family: 'Press Start 2P', monospace;
            font-size: 8px;
            letter-spacing: 1px;
            color: #888;
            text-shadow: 1px 1px 0 #000;
          ">
            [◄ / ► o A / D] SELECCIONAR • [ENTER / ESPACIO / TOQUE] A ROCKEAR
          </div>
        </div>
      </div>

      <style>
        @keyframes headerFlicker {
          0% { filter: brightness(1); }
          100% { filter: brightness(1.2) drop-shadow(0 0 8px #ff2a55); }
        }
        @keyframes subHeaderFlash {
          0%, 49% { color: #00f0ff; }
          50%, 100% { color: #ffffff; }
        }
        @keyframes indicatorBounce {
          0% { transform: translate(-50%, 0); }
          100% { transform: translate(-50%, -4px); }
        }
        @keyframes arcade16BitFlash {
          0%, 49% {
            color: #fffb77;
            background: linear-gradient(180deg, #ff2a55 0%, #d8002a 48%, #9e001e 52%, #660014 100%);
            box-shadow: 
              inset 3px 3px 0 #ff9ebb,
              inset -3px -3px 0 #3a000c,
              0 5px 0 #000000,
              0 8px 0 rgba(0, 0, 0, 0.75);
          }
          50%, 100% {
            color: #ffffff;
            background: linear-gradient(180deg, #ff476d 0%, #f00033 48%, #bd0025 52%, #7d0018 100%);
            box-shadow: 
              inset 3px 3px 0 #ffffff,
              inset -3px -3px 0 #4a0010,
              0 5px 0 #000000,
              0 8px 0 rgba(255, 215, 0, 0.4);
          }
        }
        .pixel-arrow {
          display: inline-block;
          color: #ffd700;
          text-shadow: 2px 2px 0 #000;
          animation: arrowHop 0.5s steps(2, start) infinite alternate;
        }
        .left-arrow { animation-direction: alternate; }
        .right-arrow { animation-direction: alternate-reverse; }

        @keyframes arrowHop {
          0% { transform: translateX(0); }
          100% { transform: translateX(3px); }
        }

        .warrior-bay:hover {
          transform: translateY(-6px) scale(1.02) !important;
        }
        .warrior-bay:hover .vertical-warrior-img {
          filter: brightness(1.15) !important;
        }
        .warrior-bay:hover .warrior-img-locked {
          filter: grayscale(100%) contrast(1.3) brightness(0.82) !important;
        }

        #confirm-char-btn:hover {
          filter: brightness(1.2);
        }
        #confirm-char-btn:active {
          transform: translateY(3px);
        }

        /* Responsive styling for Mobile Landscape and small screens */
        @media (max-height: 520px) {
          #char-select-wrap {
            padding: 4px 10px 4px 10px !important;
          }
          .char-select-header h1 {
            font-size: 13px !important;
            margin-bottom: 2px !important;
            letter-spacing: 2px !important;
          }
          .sub-header-text {
            font-size: 7px !important;
          }
          .warriors-bays-wrapper {
            height: min(48vh, 195px) !important;
            gap: 5px !important;
            padding: 4px 2px !important;
          }
          .stats-hud-panel {
            padding: 4px 10px !important;
            gap: 8px !important;
          }
          .stats-hud-panel span {
            font-size: 9px !important;
          }
          .stats-hud-panel div {
            font-size: 9px !important;
          }
          #confirm-char-btn {
            padding: 7px 22px !important;
            font-size: 10px !important;
            letter-spacing: 1px !important;
          }
          .nav-hint-text {
            font-size: 6.5px !important;
          }
        }
      </style>
    `;

    // Click handlers for each vertical bay
    characters.forEach((c) => {
      const bay = document.getElementById(`bay-${c.id}`);
      if (bay) {
        bay.onclick = () => {
          if (this.selectedId !== c.id) {
            this.selectedId = c.id;
            audio.playUISelect();
            this.show(); // re-render selection state
          }
        };
      }
    });

    // Confirm button handler
    const confirmBtn = document.getElementById('confirm-char-btn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        if (currentHero.locked) {
          audio.playDenied();
        } else {
          audio.playPickup();
          setTimeout(() => {
            this.hide();
            this.onSelect(this.selectedId);
          }, 150);
        }
      };
    }

    // Keyboard navigation across the 6 vertical bays
    if (this.keyListener) {
      window.removeEventListener('keydown', this.keyListener);
    }
    this.keyListener = (e: KeyboardEvent) => {
      const allIds = characters.map((c) => c.id);
      const currentIndex = allIds.indexOf(this.selectedId);

      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        const nextIndex = (currentIndex - 1 + allIds.length) % allIds.length;
        this.selectedId = allIds[nextIndex];
        audio.playUISelect();
        this.show();
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % allIds.length;
        this.selectedId = allIds[nextIndex];
        audio.playUISelect();
        this.show();
      } else if (['Enter', 'Space', 'KeyJ', 'KeyX'].includes(e.code)) {
        e.preventDefault();
        if (currentHero.locked) {
          audio.playDenied();
        } else {
          audio.playPickup();
          setTimeout(() => {
            this.hide();
            this.onSelect(this.selectedId);
          }, 150);
        }
      }
    };
    window.addEventListener('keydown', this.keyListener);
  }

  public hide(): void {
    if (this.keyListener) {
      window.removeEventListener('keydown', this.keyListener);
      this.keyListener = null;
    }
    this.container.innerHTML = '';
  }
}
