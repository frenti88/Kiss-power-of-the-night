export interface CloudConfig {
  enabled: boolean;
  speed: number; // pixels/second drift
  parallaxFactor: number;
}

export interface SmokeConfig {
  enabled: boolean;
  density: number;
  maxParticles: number;
  driftSpeed: number;
  riseSpeed: number;
}

export interface SteamConfig {
  enabled: boolean;
  minActiveTime: number; // seconds (2-4s)
  maxActiveTime: number;
  minPauseTime: number;  // seconds (1-3s)
  maxPauseTime: number;
}

export interface NeonSignDef {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  baseIntensity: number;
  flickerProbability: number;
  minIntensity: number;
  maxIntensity: number;
  letterDropout?: boolean;
}

export interface NeonConfig {
  enabled: boolean;
  flicker: boolean;
  signs: NeonSignDef[];
}

export interface StreetlampConfig {
  enabled: boolean;
  minIntensity: number; // 0.90
  maxIntensity: number; // 1.00
  oscillationSpeed: number; // rad/s
  haloOpacity: number;
  lampXPositions: number[];
}

export interface WetAsphaltConfig {
  enabled: boolean;
  maxDriftPx: number; // 1-2px
  shimmerSpeed: number;
}

export interface RiverConfig {
  enabled: boolean;
  scrollSpeed: number;
  shimmerIntensity: number;
}

export interface SkylineConfig {
  enabled: boolean;
  windowToggleProbability: number; // 0.05
  windowCheckInterval: number; // seconds
  hazardBlinkOn: number;  // 1.0s
  hazardBlinkOff: number; // 0.5s
  beaconPositions: { x: number; y: number; phaseOffset: number }[];
}

export interface CableConfig {
  enabled: boolean;
  swayPx: number; // 1-2px
  swaySpeed: number;
}

export interface AmbientEventsConfig {
  enabled: boolean;
  minInterval: number; // 8 seconds
  maxInterval: number; // 20 seconds
}

export interface RainConfig {
  enabled: boolean; // default false
  dropCount: number;
  speed: number;
}

export interface DebugEnvironmentConfig {
  showLayerNames: boolean;
  parallaxEnabled: boolean;
  particlesEnabled: boolean;
  rainEnabled: boolean;
  neonsEnabled: boolean;
  smokeEnabled: boolean;
}

export interface EnvironmentConfig {
  clouds: CloudConfig;
  smoke: SmokeConfig;
  steam: SteamConfig;
  neon: NeonConfig;
  streetlamps: StreetlampConfig;
  wetAsphalt: WetAsphaltConfig;
  river: RiverConfig;
  skyline: SkylineConfig;
  cables: CableConfig;
  ambientEvents: AmbientEventsConfig;
  rain: RainConfig;
  debug: DebugEnvironmentConfig;
}

export const DEFAULT_ENVIRONMENT_CONFIG: EnvironmentConfig = {
  clouds: {
    enabled: true,
    speed: 3.2, // 2-5 px/s
    parallaxFactor: 0.04
  },
  smoke: {
    enabled: true,
    density: 0.7,
    maxParticles: 36, // 20-40 visible particles
    driftSpeed: 5.0,
    riseSpeed: 18.0
  },
  steam: {
    enabled: true,
    minActiveTime: 2.5,
    maxActiveTime: 4.0,
    minPauseTime: 1.2,
    maxPauseTime: 2.8
  },
  neon: {
    enabled: true,
    flicker: true,
    signs: [
      {
        name: 'The Ritz',
        x: 105,
        y: 118,
        width: 44,
        height: 14,
        color: 0xff1a3c, // Vibrant red neon
        baseIntensity: 0.92,
        flickerProbability: 0.09,
        minIntensity: 0.25,
        maxIntensity: 1.0
      },
      {
        name: 'Motor City Records',
        x: 235,
        y: 110,
        width: 52,
        height: 12,
        color: 0xff9900, // Golden amber neon
        baseIntensity: 0.88,
        flickerProbability: 0.05,
        minIntensity: 0.35,
        maxIntensity: 1.0
      },
      {
        name: 'Riverside Motel',
        x: 320,
        y: 122,
        width: 14,
        height: 48,
        color: 0xff0044, // Motel red with letter dropout
        baseIntensity: 0.86,
        flickerProbability: 0.07,
        minIntensity: 0.15,
        maxIntensity: 1.0,
        letterDropout: true
      }
    ]
  },
  streetlamps: {
    enabled: true,
    minIntensity: 0.90,
    maxIntensity: 1.00,
    oscillationSpeed: 1.4,
    haloOpacity: 0.14,
    lampXPositions: [210, 720, 1260, 1840, 2460, 2980]
  },
  wetAsphalt: {
    enabled: true,
    maxDriftPx: 1.5,
    shimmerSpeed: 0.75
  },
  river: {
    enabled: true,
    scrollSpeed: 1.2,
    shimmerIntensity: 0.2
  },
  skyline: {
    enabled: true,
    windowToggleProbability: 0.05,
    windowCheckInterval: 4.0,
    hazardBlinkOn: 1.0,
    hazardBlinkOff: 0.5,
    beaconPositions: [
      { x: 58, y: 172, phaseOffset: 0.0 },
      { x: 195, y: 185, phaseOffset: 0.35 },
      { x: 480, y: 190, phaseOffset: 0.75 },
      { x: 740, y: 178, phaseOffset: 1.15 }
    ]
  },
  cables: {
    enabled: true,
    swayPx: 1.0,
    swaySpeed: 0.5
  },
  ambientEvents: {
    enabled: true,
    minInterval: 8.0,
    maxInterval: 20.0
  },
  rain: {
    enabled: false,
    dropCount: 50,
    speed: 220
  },
  debug: {
    showLayerNames: false,
    parallaxEnabled: true,
    particlesEnabled: true,
    rainEnabled: false,
    neonsEnabled: true,
    smokeEnabled: true
  }
};
