type Particle = {
  left: string;
  delay: string;
  duration: string;
  size: string;
  driftX: string;
};

function buildParticles(count: number, seed: number): Particle[] {
  return Array.from({ length: count }, (_, index) => {
    const left = ((index * 97 + seed * 23) % 100) + 1;
    const duration = 10 + ((index * 5 + seed * 3) % 9);
    const phaseOffset =
      ((((index * 17 + seed * 11) % 100) / 100) * duration).toFixed(2);
    const delay = `-${phaseOffset}s`;
    const size = 2 + ((index + seed) % 4);
    const drift = -30 + ((index * 19 + seed * 5) % 56);

    return {
      left: `${left}%`,
      delay,
      duration: `${duration}s`,
      size: `${size}px`,
      driftX: `${drift}px`,
    };
  });
}

const PARTICLES = buildParticles(52, 2);
const EXTRA_PARTICLES = buildParticles(44, 9);

export function ParticleField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PARTICLES.map((particle) => (
        <span
          key={`${particle.left}-${particle.delay}`}
          className="landing-particle"
          style={{
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            width: particle.size,
            height: particle.size,
            ["--particle-drift-x" as string]: particle.driftX,
          }}
        />
      ))}
      {EXTRA_PARTICLES.map((particle) => (
        <span
          key={`extra-${particle.left}-${particle.delay}`}
          className="landing-particle landing-particle--extra"
          style={{
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            width: particle.size,
            height: particle.size,
            ["--particle-drift-x" as string]: particle.driftX,
          }}
        />
      ))}
    </div>
  );
}
