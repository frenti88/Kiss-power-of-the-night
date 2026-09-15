# Sistema de Creación de Niveles (LEVEL_SYSTEM.md)

El diseño de niveles en **KISS: POWER OF THE NIGHT** es **100% Data-Driven**. Ninguna coordenada de plataformas o posiciones de enemigos se escribe en el código TypeScript.

---

## 1. Estructura de un Archivo de Nivel (`.json`)

Cada nivel se define dentro de `src/data/levels/`:

```json
{
  "id": "identificador_unico",
  "name": "Nombre visible en el HUD",
  "world": 1,
  "worldWidth": 3200,
  "worldHeight": 216,
  "spawnPoint": { "x": 60, "y": 32 },
  "music": "identificador_de_pista",
  "parallaxLayers": [ ... ],
  "solids": [ ... ],
  "destructibles": [ ... ],
  "spawns": [ ... ],
  "triggers": [ ... ]
}
```

---

## 2. Sección `parallaxLayers`
Define el fondo continuo con diferentes velocidades relativas a la cámara:
- `factorX`: Factor de velocidad horizontal (0.05 = fondo muy distante como la luna; 1.15 = primer plano cercano).
- `zIndex`: Posición en el eje de profundidad Z (ej. -100 para el cielo, 40 para el primer plano).
- `repeatX`: Si la textura se repite indefinidamente a lo largo del nivel.

---

## 3. Sección `solids`
Superficies físicas contra las que colisiona el jugador y los enemigos:
- `type`: `"ground" | "platform" | "wall"`
- `x`, `y`, `width`, `height`: Coordenadas y dimensiones en píxeles.
- `oneWay`: Booleano opcional. Si es `true`, permite atravesar desde abajo y dejarse caer pulsando `Abajo + Saltar`.

---

## 4. Sección `destructibles`
Objetos interactivos del escenario con barra de vida:
- `type`: `"barrel" | "amp" | "crate"`
- `health`: Daño necesario para destruirlo.
- `drop`: Ítem que suelta al romperse (`"health_small"` o `"rock_power_small"`).

---

## 5. Sección `spawns`
Oleadas y apariciones dinámicas de enemigos:
- `enemyType`: Tipo de enemigo configurado en `src/data/enemies/`.
- `triggerX`: Coordenada horizontal del jugador en la que el enemigo es instanciado en el mundo.

---

## 6. Sección `triggers`
Zonas invisibles que activan eventos al ser cruzadas por el jugador:
- `setCheckpoint`: Guarda un nuevo punto de reaparición.
- `triggerEvent`: Dispara una explosión cinemática, temblor de cámara o spawn especial.
- `cameraLock`: Fija la cámara en una posición determinada (ej. arenas de combate).
- `finishLevel`: Completa el nivel y muestra la pantalla de victoria.
