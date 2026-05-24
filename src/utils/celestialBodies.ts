export interface CelestialBody {
  id: string;
  name: string;
  type: string;
  description: string;
  color: string; // Theme accent color (hex or hsl)
  emissive?: boolean;
  roughness: number;
  metalness: number;
  metrics: {
    diameter: string;
    gravity: string;
    dayLength: string;
    distanceFromSun: string;
  };
}

export const celestialBodies: CelestialBody[] = [
  {
    id: 'sun',
    name: 'The Sun',
    type: 'Yellow Dwarf (G2V)',
    description: 'The star at the center of our Solar System, comprising 99.8% of its total mass. It is a hot ball of glowing plasma powered by nuclear fusion.',
    color: '#ff9800',
    emissive: true,
    roughness: 0.9,
    metalness: 0.1,
    metrics: {
      diameter: '1,392,700 km',
      gravity: '274 m/s²',
      dayLength: '25-35 Earth Days',
      distanceFromSun: '0 km (Center)'
    }
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet',
    description: 'The smallest and closest planet to the Sun. It experiences extreme temperature swings from blistering heat during the day to freezing cold at night.',
    color: '#9e9e9e',
    roughness: 0.8,
    metalness: 0.2,
    metrics: {
      diameter: '4,879 km',
      gravity: '3.7 m/s²',
      dayLength: '176 Earth Days',
      distanceFromSun: '57.9M km'
    }
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet',
    description: 'Often called Earth\'s twin, Venus has a runaway greenhouse effect with a crushing carbon dioxide atmosphere and clouds of sulfuric acid, making it the hottest planet.',
    color: '#e3bb76',
    roughness: 0.7,
    metalness: 0.1,
    metrics: {
      diameter: '12,104 km',
      gravity: '8.87 m/s²',
      dayLength: '243 Earth Days',
      distanceFromSun: '108.2M km'
    }
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'Terrestrial Planet',
    description: 'Our home planet—the only world known to harbor life. Rich in liquid water, oxygen, and a protective magnetic field fostering a vibrant biosphere.',
    color: '#3b82f6',
    roughness: 0.6,
    metalness: 0.1,
    metrics: {
      diameter: '12,742 km',
      gravity: '9.81 m/s²',
      dayLength: '24 Hours',
      distanceFromSun: '149.6M km'
    }
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Terrestrial Planet',
    description: 'The Red Planet, a cold desert world with a thin atmosphere. It features giant volcanoes like Olympus Mons, deep canyons, and white polar ice caps.',
    color: '#ef4444',
    roughness: 0.75,
    metalness: 0.15,
    metrics: {
      diameter: '6,779 km',
      gravity: '3.71 m/s²',
      dayLength: '24.6 Hours',
      distanceFromSun: '227.9M km'
    }
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Gas Giant',
    description: 'The largest planet in our solar system, more than twice as massive as all other planets combined. It is famous for its colorful bands and the Great Red Spot.',
    color: '#d4a373',
    roughness: 0.5,
    metalness: 0.05,
    metrics: {
      diameter: '139,820 km',
      gravity: '24.79 m/s²',
      dayLength: '9.9 Hours',
      distanceFromSun: '778.5M km'
    }
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Gas Giant',
    description: 'A massive gas giant adorned with a spectacular, complex ring system made of billions of ice particles, rocky debris, and cosmic dust.',
    color: '#e9c46a',
    roughness: 0.5,
    metalness: 0.05,
    metrics: {
      diameter: '116,460 km',
      gravity: '10.44 m/s²',
      dayLength: '10.7 Hours',
      distanceFromSun: '1.43B km'
    }
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'Ice Giant',
    description: 'An ice giant with a pale cyan hue due to atmospheric methane. It rotates on an extreme tilt of 98 degrees, practically rolling on its side around the Sun.',
    color: '#4ea8de',
    roughness: 0.4,
    metalness: 0.05,
    metrics: {
      diameter: '50,724 km',
      gravity: '8.69 m/s²',
      dayLength: '17.2 Hours',
      distanceFromSun: '2.87B km'
    }
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'Ice Giant',
    description: 'The most distant planet in our solar system. A dark, cold ice giant whipped by supersonic winds, featuring dynamic white clouds and deep dark storms.',
    color: '#0077b6',
    roughness: 0.4,
    metalness: 0.05,
    metrics: {
      diameter: '49,244 km',
      gravity: '11.15 m/s²',
      dayLength: '16.1 Hours',
      distanceFromSun: '4.5B km'
    }
  }
];

// Generates concentric circles for planetary rings on a narrow 1D texture
export const createRingTexture = (bodyId: string): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const h = canvas.height;

  switch (bodyId) {
    case 'saturn': {
      // Golden Saturn rings with Cassini division
      // Draw bands on the vertical canvas. They will map to concentric rings.
      ctx.fillStyle = 'rgba(233, 196, 106, 0.85)'; // Outer ring base
      ctx.fillRect(0, 0, 1, h);

      // Cassini Division (around 70%-75% of radius)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, Math.floor(h * 0.65), 1, Math.floor(h * 0.08));

      // Draw various dense / light rings
      const rings = [
        { start: 0.0, end: 0.25, color: 'rgba(182, 141, 88, 0.4)' },
        { start: 0.25, end: 0.45, color: 'rgba(238, 222, 196, 0.9)' },
        { start: 0.45, end: 0.65, color: 'rgba(212, 175, 123, 0.8)' },
        { start: 0.73, end: 0.90, color: 'rgba(196, 159, 110, 0.75)' },
        { start: 0.90, end: 1.0, color: 'rgba(164, 126, 75, 0.3)' }
      ];

      rings.forEach(r => {
        ctx.fillStyle = r.color;
        ctx.fillRect(0, Math.floor(h * r.start), 1, Math.floor(h * (r.end - r.start)));
      });
      break;
    }

    case 'uranus': {
      // Thin, faint vertical rings
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, 1, h);

      // A few narrow pale cyan rings
      const rings = [
        { pos: 0.35, size: 2, color: 'rgba(168, 230, 207, 0.3)' },
        { pos: 0.55, size: 4, color: 'rgba(168, 230, 207, 0.6)' },
        { pos: 0.72, size: 2, color: 'rgba(168, 230, 207, 0.25)' },
        { pos: 0.85, size: 1, color: 'rgba(168, 230, 207, 0.4)' }
      ];

      rings.forEach(r => {
        ctx.fillStyle = r.color;
        ctx.fillRect(0, Math.floor(h * r.pos), 1, r.size);
      });
      break;
    }

    default:
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, 1, h);
  }

  return canvas;
};
