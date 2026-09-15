import * as THREE from 'three';

export class PlaceholderTextureGenerator {
  private static setPixelated(tex: THREE.Texture): THREE.Texture {
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    return tex;
  }

  // Generates character spritesheet atlas (64x64 per frame, 8 columns, 12 rows)
  public static createCharacterAtlas(type: 'demon' | 'starchild'): THREE.CanvasTexture {
    const frameW = 64;
    const frameH = 64;
    const cols = 8;
    const rows = 12;
    const canvas = document.createElement('canvas');
    canvas.width = cols * frameW;
    canvas.height = rows * frameH;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const isDemon = type === 'demon';
    const primaryColor = isDemon ? '#c0392b' : '#8e44ad';
    const armorColor = isDemon ? '#2c3e50' : '#34495e';
    const faceColor = '#ecf0f1';
    const hairColor = '#111111';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * frameW;
        const y = r * frameH;

        ctx.save();
        ctx.translate(x, y);

        // Draw character figure (32x48 approx in 64x64 frame, centered)
        const bounce = (r === 1 || r === 0) ? Math.sin((c / cols) * Math.PI * 2) * 2 : 0;
        const cx = 32;
        const cy = 34 + bounce;

        // Shadow under feet
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx, 58, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs / Boots
        const legSpread = r === 1 ? Math.sin((c / cols) * Math.PI * 2) * 6 : 4;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(cx - 7 - legSpread, cy + 12, 6, 12);
        ctx.fillRect(cx + 1 + legSpread, cy + 12, 6, 12);

        // Silver boot trim
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(cx - 8 - legSpread, cy + 20, 8, 4);
        ctx.fillRect(cx + 1 + legSpread, cy + 20, 8, 4);

        // Torso / Rock Costume
        ctx.fillStyle = armorColor;
        ctx.fillRect(cx - 10, cy - 6, 20, 18);

        // Demon Bat Wings or Starchild Vest trim
        if (isDemon) {
          ctx.fillStyle = '#1b1b1b';
          ctx.beginPath();
          ctx.moveTo(cx - 10, cy - 2);
          ctx.lineTo(cx - 18, cy + 6);
          ctx.lineTo(cx - 10, cy + 10);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(cx + 10, cy - 2);
          ctx.lineTo(cx + 18, cy + 6);
          ctx.lineTo(cx + 10, cy + 10);
          ctx.fill();
        }

        // Chest Emblem / Spikes
        ctx.fillStyle = primaryColor;
        if (isDemon) {
          ctx.fillRect(cx - 4, cy - 2, 8, 8); // Red demon core
        } else {
          // Starchild Star emblem
          ctx.fillRect(cx - 3, cy - 4, 6, 10);
          ctx.fillRect(cx - 5, cy - 2, 10, 6);
        }

        // Head (White face paint)
        ctx.fillStyle = faceColor;
        ctx.fillRect(cx - 7, cy - 20, 14, 14);

        // Big 80s Rocker Hair
        ctx.fillStyle = hairColor;
        ctx.fillRect(cx - 10, cy - 26, 20, 8);
        ctx.fillRect(cx - 12, cy - 22, 5, 16);
        ctx.fillRect(cx + 7, cy - 22, 5, 16);

        // Face Paint Makeup
        if (isDemon) {
          // The Demon eye bats
          ctx.fillStyle = '#000000';
          ctx.fillRect(cx - 6, cy - 18, 5, 4);
          ctx.fillRect(cx + 1, cy - 18, 5, 4);
          // Red tongue flick when idle/shooting
          if (c % 2 === 0 && (r === 0 || r === 5)) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(cx - 2, cy - 10, 4, 6);
          }
        } else {
          // The Starchild Star on right eye
          ctx.fillStyle = '#000000';
          ctx.fillRect(cx + 1, cy - 19, 5, 5);
          ctx.fillStyle = '#e056fd';
          ctx.fillRect(cx + 2, cy - 18, 3, 3);
          // Left eye dot
          ctx.fillStyle = '#000000';
          ctx.fillRect(cx - 5, cy - 17, 3, 2);
        }

        // Arm / Weapon pose depending on row
        ctx.fillStyle = '#bdc3c7';
        if (r === 5 || r === 6 || r === 7) {
          // Shooting arm outstretched
          ctx.fillStyle = primaryColor;
          ctx.fillRect(cx + 6, cy - 4, 14, 5);
          // Muzzle flash
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx + 20, cy - 6, 6, 9);
        } else if (r === 8) {
          // Melee swing
          ctx.fillStyle = '#e67e22';
          ctx.beginPath();
          ctx.arc(cx + 14, cy - 2, 14, -Math.PI / 3, Math.PI / 3);
          ctx.lineWidth = 4;
          ctx.strokeStyle = primaryColor;
          ctx.stroke();
        } else {
          // Resting/running arms
          ctx.fillStyle = armorColor;
          ctx.fillRect(cx - 12, cy - 2, 4, 10);
          ctx.fillRect(cx + 8, cy - 2, 4, 10);
        }

        ctx.restore();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return PlaceholderTextureGenerator.setPixelated(texture) as THREE.CanvasTexture;
  }

  // Generates Zombie Roadie atlas
  public static createZombieRoadieAtlas(): THREE.CanvasTexture {
    const frameW = 64;
    const frameH = 64;
    const cols = 8;
    const rows = 6;
    const canvas = document.createElement('canvas');
    canvas.width = cols * frameW;
    canvas.height = rows * frameH;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * frameW;
        const y = r * frameH;

        ctx.save();
        ctx.translate(x, y);

        const cx = 32;
        const cy = 34 + Math.sin(c * 0.8) * 2;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(cx, 58, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rotten legs
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(cx - 7, cy + 12, 5, 12);
        ctx.fillRect(cx + 2, cy + 12, 5, 12);

        // Undead Body / Torn Roadie Vest
        ctx.fillStyle = '#34495e'; // Denim vest
        ctx.fillRect(cx - 9, cy - 4, 18, 16);
        ctx.fillStyle = '#27ae60'; // Green rotting skin showing through
        ctx.fillRect(cx - 4, cy + 2, 8, 6);

        // Backstage pass lanyard
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(cx - 3, cy, 6, 8);

        // Zombie Head
        ctx.fillStyle = '#2ecc71'; // Undead green skin
        ctx.fillRect(cx - 6, cy - 18, 12, 14);

        // Messy metal hair / bald patches
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(cx - 8, cy - 22, 16, 6);

        // Glowing red zombie eyes
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(cx - 4, cy - 15, 3, 3);
        ctx.fillRect(cx + 1, cy - 15, 3, 3);

        // Arms holding broken guitar neck or pipe
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(cx + 6, cy - 2, 10, 5);
        ctx.fillStyle = '#d35400'; // Rusty pipe/guitar
        ctx.fillRect(cx + 12, cy - 10, 4, 18);

        if (r === 3) {
          // Hit flash
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillRect(cx - 10, cy - 22, 22, 45);
        }

        ctx.restore();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return PlaceholderTextureGenerator.setPixelated(texture) as THREE.CanvasTexture;
  }

  // Generates parallax background layers
  public static createParallaxLayer(id: string, width = 512, height = 216): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    if (id === 'detroit_sky') {
      // Midnight violet gradient with stars and red moon
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0a0a1a');
      grad.addColorStop(0.6, '#170c2a');
      grad.addColorStop(1, '#2c123d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 47) % width;
        const sy = (i * 31) % (height * 0.6);
        ctx.fillRect(sx, sy, 1, 1);
        if (i % 3 === 0) ctx.fillRect(sx + 1, sy, 1, 1);
      }

      // Blood red Rock Moon
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(380, 50, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff7799';
      ctx.beginPath();
      ctx.arc(374, 44, 20, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'detroit_skyline') {
      ctx.clearRect(0, 0, width, height);
      // Dark factory towers and distant Detroit skyline
      ctx.fillStyle = '#14142b';
      for (let x = 0; x < width; x += 32) {
        const h = 40 + ((x * 13) % 60);
        ctx.fillRect(x, height - h, 28, h);
        // Blinking red antenna towers
        ctx.fillStyle = '#ff0033';
        ctx.fillRect(x + 13, height - h - 10, 2, 10);
        ctx.fillRect(x + 12, height - h - 11, 4, 2);
        ctx.fillStyle = '#14142b';
      }
    } else if (id === 'detroit_buildings') {
      ctx.clearRect(0, 0, width, height);
      // Industrial brick buildings, motels, record stores with neon lights
      for (let x = 0; x < width; x += 64) {
        const bH = 80 + ((x * 17) % 70);
        ctx.fillStyle = '#1e1c33';
        ctx.fillRect(x, height - bH, 56, bH);

        // Brick accents
        ctx.fillStyle = '#292544';
        for (let by = height - bH + 8; by < height - 10; by += 12) {
          ctx.fillRect(x + 4, by, 48, 1);
        }

        // Yellow lighted windows
        ctx.fillStyle = '#f1c40f';
        for (let wx = x + 8; wx < x + 48; wx += 14) {
          for (let wy = height - bH + 16; wy < height - 20; wy += 22) {
            if ((wx + wy) % 5 !== 0) {
              ctx.fillRect(wx, wy, 8, 12);
            }
          }
        }

        // Neon Sign on some buildings
        if (x === 64) {
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(x + 10, height - bH + 4, 36, 8);
        } else if (x === 256) {
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(x + 10, height - bH + 4, 36, 8);
        }
      }
    } else if (id === 'detroit_props') {
      ctx.clearRect(0, 0, width, height);
      // Street lamps, cables, trash cans
      for (let x = 40; x < width; x += 120) {
        // Lamppost
        ctx.fillStyle = '#333344';
        ctx.fillRect(x, height - 70, 4, 70);
        ctx.fillRect(x - 6, height - 70, 16, 4);
        // Glowing bulb & yellow light cone
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(x - 4, height - 66, 12, 6);

        // Soft yellow ground cone
        ctx.fillStyle = 'rgba(255, 234, 167, 0.08)';
        ctx.beginPath();
        ctx.moveTo(x + 2, height - 60);
        ctx.lineTo(x - 30, height);
        ctx.lineTo(x + 34, height);
        ctx.fill();
      }
    } else if (id === 'detroit_fg') {
      ctx.clearRect(0, 0, width, height);
      // Foreground fences and steam pipes
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, height - 16, width, 4);
      for (let x = 0; x < width; x += 16) {
        ctx.fillRect(x, height - 24, 2, 24);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return PlaceholderTextureGenerator.setPixelated(texture) as THREE.CanvasTexture;
  }

  // Generates Asphalt ground, platforms and props
  public static createEnvironmentTiles(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Tile 0 (0..64, 0..32): Detroit Road Asphalt
    ctx.fillStyle = '#1c1e24';
    ctx.fillRect(0, 0, 64, 32);
    // Curb top
    ctx.fillStyle = '#4a4e69';
    ctx.fillRect(0, 0, 64, 3);
    // Yellow street divider marks
    ctx.fillStyle = '#e0a912';
    ctx.fillRect(8, 16, 24, 3);
    ctx.fillRect(44, 16, 20, 3);

    // Tile 1 (64..128, 0..32): Metal Platform
    ctx.fillStyle = '#3d405b';
    ctx.fillRect(64, 0, 64, 12);
    ctx.fillStyle = '#8187dc';
    ctx.fillRect(64, 0, 64, 2);
    // Rivets
    ctx.fillStyle = '#f4f1de';
    for (let rx = 68; rx < 128; rx += 14) {
      ctx.fillRect(rx, 5, 2, 2);
    }

    // Tile 2 (0..32, 32..64): Red Barrel Destructible
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(4, 34, 24, 28);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(4, 34, 24, 4);
    ctx.fillRect(4, 46, 24, 3);
    ctx.fillRect(4, 58, 24, 4);
    // Skull symbol
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(14, 40, 4, 4);

    // Tile 3 (32..64, 32..64): Marshall Amp Destructible
    ctx.fillStyle = '#111111';
    ctx.fillRect(34, 34, 26, 28);
    ctx.fillStyle = '#dcdde1';
    ctx.fillRect(36, 36, 22, 14); // Speaker mesh
    ctx.fillStyle = '#e1b12c';
    ctx.fillRect(36, 52, 22, 4); // Gold control panel

    // Tile 4 (64..96, 32..64): Health Pickup (Heart)
    ctx.fillStyle = '#e84118';
    ctx.beginPath();
    ctx.moveTo(76, 42);
    ctx.lineTo(84, 42);
    ctx.lineTo(80, 52);
    ctx.fill();
    ctx.fillRect(74, 38, 5, 5);
    ctx.fillRect(81, 38, 5, 5);

    // Tile 5 (96..128, 32..64): Rock Power Pickup (Lightning)
    ctx.fillStyle = '#fbc531';
    ctx.beginPath();
    ctx.moveTo(112, 36);
    ctx.lineTo(104, 48);
    ctx.lineTo(110, 48);
    ctx.lineTo(106, 60);
    ctx.lineTo(118, 46);
    ctx.lineTo(112, 46);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return PlaceholderTextureGenerator.setPixelated(texture) as THREE.CanvasTexture;
  }
}
