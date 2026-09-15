# KISS: POWER OF THE NIGHT
## *An 80s Horror Rock Run & Gun*

Un videojuego web 2D tipo *Run & Gun* con estética arcade de 16-bit (Neo Geo / Capcom CPS-1 style) desarrollado con **Three.js + TypeScript + Vite**.

Inspirado en la teatralidad de KISS y los grandes clásicos de acción lateral (*Metal Slug*, *Contra*, *Gunstar Heroes*, *Sunset Riders*).

---

## 🎮 Instrucciones Rápidas

### Requisitos
- Node.js 18+ y npm

### Instalación y Ejecución
```bash
# 1. Entrar en el directorio
cd kiss-power-of-the-night

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```
Abre tu navegador en `http://localhost:3000`.

### Ejecutar Tests Unitarios
```bash
npm run test
```

### Compilar para Producción
```bash
npm run build
```

---

## 🕹️ Controles

| Acción | Teclado | Gamepad (Standard) |
| :--- | :--- | :--- |
| **Mover / Apuntar** | `W, A, S, D` o Flechas de Dirección | Cruceta (D-Pad) o Stick Izquierdo |
| **Saltar** | `Space` o `K` *(soporta altura variable)* | Botón `A` (Cruz) |
| **Disparar** | `J` o `X` *(disparo en carrera, salto y agachado)* | Botón `X` (Cuadrado) |
| **Ataque Melee** | `C` o `H` *(golpe cercano con hitbox activa)* | Botón `B` (Círculo) |
| **Poder Especial** | `L` o `V` | Botón `Y` (Triángulo) |
| **Pausar** | `Enter` o `Escape` | Botón `Start` |
| **Debug Overlay** | `F1` o `~` (o añadir `?debug=true` a la URL) | — |

---

## 🏛️ Arquitectura del Proyecto

El motor está construido con separación estricta de responsabilidades:

- **`src/core/`**:
  - `GameLoop.ts`: Acumulador con paso de tiempo fijo a **60 Hz** (`dt = 1/60`).
  - `CameraController.ts`: Cámara ortográfica con dead zone, look-ahead progresivo y screen shake.
  - `AudioManager.ts`: Sintetizador procedural con Web Audio API para audio retro sin dependencias externas de assets.
  - `InputManager.ts`: Lectura simultánea de Teclado y Gamepad API con detección de pulsación única (edge trigger) y buffer.
  - `SaveManager.ts`: Persistencia con versionado en `localStorage`.
- **`src/entities/`**:
  - `player/`: Jugador desacoplado con máquina de estados (`Idle`, `Run`, `Jump`, `Fall`, `Crouch`, `Shoot`, `Melee`, `Hit`, `Death`), coyote time (110ms) y jump buffer (130ms).
  - `enemies/`: Clase base `Enemy` con IA de estados (`Patrol`, `Chase`, `Attack`, `Hit`, `Death`) y subclase `ZombieRoadie`.
  - `projectiles/`: Sistema de proyectiles con `ProjectilePool` para evitar recolección de basura.
  - `pickups/`: Salud y recargas de Rock Power.
- **`src/systems/`**:
  - `CollisionSystem.ts`: Solver AABB 2D con plataformas unidireccionales y separación de ejes X e Y.
  - `CombatSystem.ts`: Detección de impactos, hit-stop arcade (40-80ms), retroceso e incremento de Rock Power.
  - `ParticleSystem.ts`: Pool de partículas para fuego, chispas, humo, escombros y sangre zombi.
  - `DestructionSystem.ts`: Barriles y amplificadores destruibles en el escenario.
- **`src/levels/`**:
  - `LevelLoader.ts`: Carga de mundos desde JSON.
  - `LevelManager.ts`: Construcción de suelos, plataformas, destructibles y spawns dinámicos.
  - `LevelEventManager.ts`: Checkpoints, eventos cinemáticos y zonas de meta.
- **`src/rendering/`**:
  - `PixelRenderer.ts`: Canvas pixel-perfect a resolución lógica fija de **384 x 216** con `OrthographicCamera`.
  - `SpriteAtlas.ts` & `SpriteAnimator.ts`: Mapeo dinámico de coordenadas UV sobre planos compartidos.
  - `ParallaxBackground.ts`: Fondos continuos multicapa con diferentes factores de scroll.
  - `PlaceholderTextureGenerator.ts`: Generador procedural en Canvas 2D de texturas 16-bit temáticas.
- **`src/ui/`**:
  - `TitleScreen.ts`: Portada arcade con efectos de neón.
  - `CharacterSelect.ts`: Selector de 6 guerreros (The Demon y The Starchild jugables en el MVP).
  - `HUD.ts`: Retrato, barras de salud y Rock Power, puntuación y vidas.

---

## 🛠️ Guía de Extensión y Datos (Data-Driven)

### ¿Cómo agregar un nuevo personaje?
1. Crea un archivo JSON en `src/data/characters/<nombre>.json` siguiendo la interfaz `CharacterConfig`.
2. Define los stats, daño de arma, frames de melee y filas de animación en el atlas.
3. Regístralo en `src/core/SaveManager.ts` o desbloquéalo al superar mundos.

### ¿Cómo agregar un nuevo enemigo?
1. Crea su configuración en `src/data/enemies/<nombre>.json`.
2. Si requiere patrones especiales, extiende de `Enemy` en `src/entities/enemies/`.
3. Agrégalo al array `spawns` del nivel JSON que desees.

### ¿Cómo agregar o modificar un nivel?
1. Edita o crea un JSON en `src/data/levels/`.
2. Define el ancho del mundo (`worldWidth`), las capas de parallax, los bloques sólidos (`solids`), destructibles (`destructibles`) y triggers (`triggers`).
3. Regístralo en `LevelLoader.ts`.

### ¿Cómo sustituir los spritesheets placeholder por arte final?
1. Coloca tu archivo PNG de spritesheet en `public/assets/characters/` o `public/assets/enemies/`.
2. Asegúrate de respetar la cuadrícula del atlas (ej. 64x64 por celda) y las filas asignadas a cada animación.
3. Carga la textura con `new THREE.TextureLoader().load(...)`, configúrala con `NearestFilter` y pásala al constructor de la entidad sin alterar una sola línea de código de lógica.
