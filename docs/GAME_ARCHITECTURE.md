# Arquitectura Técnica del Motor (GAME_ARCHITECTURE.md)

Este documento detalla los principios de diseño de software y la infraestructura matemática del videojuego **KISS: POWER OF THE NIGHT**.

---

## 1. Patrón Arquitectónico General
El motor sigue un híbrido entre **Component-Based Entities** y **Systems Processing**, manteniendo la separación absoluta entre:
- **Datos y Estado**: Componentes planos (`Transform2D`, `Velocity`, `AABBCollider`, `Health`, `SpriteAnimation`).
- **Lógica de Procesamiento**: Sistemas puros (`CollisionSystem`, `CombatSystem`, `DestructionSystem`, `ParticleSystem`).
- **Renderizado y Presentación**: Abstracciones de Three.js (`PixelRenderer`, `SpriteAtlas`, `SpriteAnimator`, `ParallaxBackground`).
- **Interfaz de Usuario**: DOM desacoplado con aceleración por hardware e interactividad CSS.

```
       [InputManager]           [SaveManager]
             │                       │
             ▼                       ▼
    [GameLoop (60Hz)] ──────► [Game.fixedUpdate]
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
  [CollisionSystem]            [CombatSystem]           [LevelManager]
    - AABB Solvers               - Hit-Stop               - Spawn Triggers
    - Platform snapping          - Screen Shake           - Destructibles
    - One-way platforms          - Rock Power Pool        - AI Updates
                                     │
                                     ▼
                            [PixelRenderer]
                               - Three.js OrthographicCamera (384x216)
                               - NearestFilter SpriteAtlases
                               - Multi-layer Parallax Planes
```

---

## 2. Fixed Timestep Loop (Acumulador)
Para asegurar que el movimiento y la respuesta arcade sean 100% idénticos en cualquier pantalla (60Hz, 120Hz, 240Hz):
- Paso de tiempo fijo: `dt = 1/60` (16.666 ms).
- Acumulador con clamp de seguridad anti espiral de muerte (`maxAccumulator = 0.15s`).
- Todas las ecuaciones de movimiento utilizan:
  `pos.x += vel.vx * dt`
  `vel.vy -= gravity * dt`

---

## 3. Sistema de Colisiones AABB y Plataformas Unidireccionales
- **Resolución en dos pasos**:
  1. Eje X: Comprueba colisión con sólidos (`!solid.oneWay`). En caso de solapamiento, ajusta la coordenada `transform.x` contra el borde del bloque y anula `vx`.
  2. Eje Y: Comprueba colisión con sólidos y plataformas unidireccionales.
- **Plataformas Unidireccionales (`oneWay = true`)**:
  - Si el personaje cae (`vy <= 0`) y su base en el frame anterior estaba por encima del nivel superior de la plataforma (`prevY + offsetY >= platformTop - 2`), se le ajusta la posición sobre la plataforma y se marca `isGrounded = true`.
  - Si el jugador mantiene pulsado `Abajo + Saltar`, se activa la bandera `dropThroughOneWay = true`, permitiendo descender inmediatamente.

---

## 4. Game Feel Arcade
- **Coyote Time (110-120 ms)**: Ventana de tolerancia al salir de una plataforma para saltar en el aire.
- **Jump Buffering (130-140 ms)**: Registra la intención de salto si se pulsa el botón décimas antes de tocar el suelo.
- **Salto Variable**: Al soltar el botón de salto mientras se asciende, la velocidad vertical se reduce multiplicándola por `variableJumpMultiplier` (0.45 - 0.5), ofreciendo saltos cortos o largos según la pulsación.
- **Hit Stop**: Pausa de fotogramas (40 ms en proyectiles, 80 ms en melee) al conectar golpes críticos para generar peso e impacto arcade.
- **Screen Shake**: Amortiguación exponencial del temblor de cámara.
