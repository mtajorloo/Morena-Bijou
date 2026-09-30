import { useEffect, useRef } from "react";

interface ParticleCanvasProps {
  active?: boolean;
  burst?: boolean;
}

export function ParticleCanvas({ active = true, burst = false }: ParticleCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let animation = 0;
    const styles = getComputedStyle(document.documentElement);
    const gold = styles.getPropertyValue("--gold").trim();
    const goldLight = styles.getPropertyValue("--gold-light").trim();
    const rose = styles.getPropertyValue("--rose-300").trim();
    const cream = styles.getPropertyValue("--cream").trim();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: burst ? 180 : 60 }, () => ({
      x: burst ? window.innerWidth / 2 : Math.random() * window.innerWidth,
      y: burst ? window.innerHeight * 0.42 : Math.random() * window.innerHeight,
      vx: burst ? (Math.random() - 0.5) * 18 : (Math.random() - 0.5) * 0.15,
      vy: burst ? -Math.random() * 15 - 3 : -Math.random() * 0.22 - 0.05,
      size: Math.random() * (burst ? 5 : 1.5) + 1,
      opacity: Math.random() * 0.45 + 0.22,
      color: burst ? [gold, goldLight, rose, cream][Math.floor(Math.random() * 4)] : goldLight,
      rotation: Math.random() * Math.PI,
    }));

    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((particle) => {
        if (burst) particle.vy += 0.32;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += 0.08;
        if (!burst && particle.y < -8) {
          particle.y = window.innerHeight + 8;
          particle.x = Math.random() * window.innerWidth;
        }
        context.save();
        context.globalAlpha = particle.opacity;
        context.fillStyle = particle.color;
        context.shadowBlur = burst ? 0 : 8;
        context.shadowColor = gold;
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        if (burst) context.fillRect(-particle.size, -particle.size / 2, particle.size * 2, particle.size);
        else {
          context.beginPath();
          context.arc(0, 0, particle.size, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      });
      frame += 1;
      if (!reduced && (!burst || frame < 150)) animation = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
    };
  }, [active, burst]);

  if (!active) return null;
  return <canvas ref={ref} className={burst ? "shansi-confetti" : "shansi-particles"} aria-hidden="true" />;
}
