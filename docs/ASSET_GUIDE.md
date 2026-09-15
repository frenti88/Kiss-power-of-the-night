# Guía de Assets y Spritesheets (ASSET_GUIDE.md)

Esta guía establece las dimensiones, cuadrículas, convenciones de nomenclatura y requisitos técnicos para integrar arte pixel art definitivo en el juego.

---

## 1. Convenciones Generales de Arte
- **Estilo**: Pixel Art 16-Bit Premium (estética arcade Neo Geo / CPS-1 de finales de los 80).
- **Resolución Interna del Juego**: 384 x 216 píxeles (relación de aspecto 16:9).
- **Filtro de Textura**: `NearestFilter` obligatorio (sin antialiasing ni interpolación bilineal).
- **Formato**: PNG transparente de 32 bits (con canal Alpha).

---

## 2. Estructura de Spritesheets de Personajes
- **Tamaño de Cuadrícula**: Celdas uniformes de **64 x 64 píxeles**.
- **Distribución de Columnas y Filas**: 8 columnas x 12 filas.
- **Pivote**: La base de los pies del personaje debe coincidir con el píxel `Y = 56` dentro de cada celda de 64x64, con el centro del cuerpo en `X = 32`.

### Asignación de Filas:
- **Fila 0**: `idle` (6-8 frames)
- **Fila 1**: `run` (8 frames)
- **Fila 2**: `jump` (4 frames)
- **Fila 3**: `fall` (3 frames)
- **Fila 4**: `crouch` (3 frames)
- **Fila 5**: `shoot` (4 frames, disparo horizontal en pie)
- **Fila 6**: `crouch_shoot` (4 frames, disparo agachado)
- **Fila 7**: `jump_shoot` (4 frames, disparo en el aire)
- **Fila 8**: `melee` (5 frames, golpe físico con guitarra o puño)
- **Fila 9**: `hit` (3 frames, retroceso al recibir impacto)
- **Fila 10**: `death` (6 frames, colapso y caída)
- **Fila 11**: `special` (8 frames, ataque especial)

---

## 3. Spritesheets de Enemigos
- **Zombie Roadie**: 64 x 64 píxeles por celda (8 columnas x 6 filas).
  - Fila 0: `idle` (4 frames)
  - Fila 1: `patrol` / `chase` (6 frames)
  - Fila 2: `attack` (5 frames, ataque con tubo o mástil de guitarra)
  - Fila 3: `hit` (2 frames, parpadeo blanco/impacto)
  - Fila 4: `death` (5 frames, desintegración o caída)

---

## 4. Fondos Parallax
- **Dimensiones recomendadas**: 512 x 216 píxeles (ancho repitiéndose en bucle continuo).
- **Capas recomendadas**:
  - `detroit_sky.png`: Cielo oscuro, luna y estrellas.
  - `detroit_skyline.png`: Siluetas de fábricas lejanas y antenas.
  - `detroit_buildings.png`: Edificios de ladrillo con luces y carteles de neón.
  - `detroit_props.png`: Farolas, cables colgantes y contenedores.
  - `detroit_fg.png`: Vallas y tuberías en primer plano.

---

## 5. Nomenclatura de Archivos (snake_case estricto)
- `player_<id>_atlas.png` (ej. `player_demon_atlas.png`)
- `enemy_<id>_atlas.png` (ej. `enemy_zombie_roadie_atlas.png`)
- `bg_<world>_<layer>.png` (ej. `bg_world01_skyline.png`)
- `prop_<tipo>.png` (ej. `prop_marshall_amp.png`)
