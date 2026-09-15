# AGENTS.md — Reglas y Guía para Agentes de IA

Este documento contiene las reglas obligatorias de arquitectura, convenciones y restricciones que cualquier agente de IA (humano o modelo) **DEBE RESPETAR ESTRICTAMENTE** antes de realizar cambios en `kiss-power-of-the-night`.

---

## 1. Principio Fundamental
> **MEJOR ARQUITECTURA + MEJOR GAMEPLAY > MÁS CONTENIDO PREMATURO**

Nunca agregues cientos de líneas o contenido sin una estructura desacoplada. Este proyecto está diseñado para crecer durante meses sin degradarse en código monolítico.

---

## 2. Reglas de Oro Inviolables

1. **PROHIBIDO EL MONOLITO**:
   - `main.ts` solo inicializa la instancia de `Game`. No agregues lógica allí.
   - `Game.ts` solo orquesta sistemas y transiciones entre pantallas. No implementes lógica de colisiones, IA o físicas dentro de `Game.ts`.
2. **DATOS SEPARADOS DE LA LÓGICA (DATA-DRIVEN)**:
   - Todo nuevo personaje, enemigo, nivel o arma debe declararse primero en JSON (`src/data/`).
   - Jamás codifiques coordenadas de plataformas, valores de vida o posiciones fijas dentro de clases TypeScript.
3. **RENDERIZADO 2D PURO CON THREE.JS**:
   - Se utiliza **exclusivamente `OrthographicCamera`** con resolución lógica interna fija a **384 x 216** (16:9).
   - Prohibido usar `PerspectiveCamera` para el gameplay principal.
   - Toda textura debe tener `magFilter = NearestFilter`, `minFilter = NearestFilter` y `generateMipmaps = false`.
   - Reutilizar geometrías compartidas (`sharedPlaneGeometry = new THREE.PlaneGeometry(1, 1)`). Prohibido hacer `new PlaneGeometry(...)` por cada entidad o frame.
4. **LOOP DE FÍSICA A 60 HZ (FIXED TIMESTEP)**:
   - Toda la física, colisiones AABB, movimiento, IA y estados corren en `fixedUpdate(dt = 1/60)` mediante el acumulador de `GameLoop.ts`.
   - La velocidad del jugador jamás debe depender de la tasa de refresco del monitor (60Hz, 120Hz, 144Hz, etc.).
5. **MÁQUINAS DE ESTADO**:
   - Los personajes y enemigos implementan máquinas de estado formales (`PlayerStateMachine`, `PlayerState`).
   - Si agregas una acción (ej. trepar escaleras, dash, transformación), crea un nuevo archivo de estado en `src/entities/player/states/`.
6. **POOLING OBLIGATORIO**:
   - Prohibido instanciar proyectiles o partículas en tiempo de ejecución. Utiliza siempre `ProjectilePool` y `ParticleSystem`.

---

## 3. Estructura del Árbol de Código

```
src/
├── core/         # Motores base: GameLoop, Camera, Input, Audio, EventBus, Save
├── types/        # Interfaces TypeScript estrictas
├── components/   # Datos ECS: Transform2D, Velocity, AABBCollider, Health, Animation
├── entities/     # Player (con sus estados), Enemies, Projectiles, Pickups
├── systems/      # CollisionSystem, CombatSystem, ParticleSystem, DestructionSystem
├── levels/       # Level, LevelLoader, LevelManager, LevelEventManager
├── rendering/    # PixelRenderer, SpriteAtlas, SpriteAnimator, Parallax, DebugOverlay
├── ui/           # UIManager, TitleScreen, CharacterSelect, HUD, PauseMenu
└── data/         # JSONs de configuración (personajes, enemigos, niveles)
```

---

## 4. Orden de Desarrollo y Milestones

1. **Milestone 1 (MVP Jugable)**: ✅ Completado. Motor base, Detroit Street, The Demon, The Starchild, Zombie Roadie, colisiones AABB, disparo, melee, parallax, audio procedural sintetizado, HUD y Debug Mode.
2. **Milestone 2**: Múltiples enemigos (Zombie Fan, Zombie Punk), oleadas, interiores (Detroit Bar), mini-boss y eventos ambientales sincronizados.
3. **Milestone 3**: Boss de Detroit (*The Road King* en motocicleta mutada de 3 fases), cinemática de victoria y desbloqueo de *The Spaceman*.
4. **Mundos 2 a 5**: Creatures of the Night, Rock and Roll All Nite, I Was Made For Lovin' You, God of Thunder.
