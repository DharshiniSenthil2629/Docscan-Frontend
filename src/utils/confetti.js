// Simple canvas-based confetti without external libs
export default function fireConfetti(opts = {}) {
  const count = opts.count || 40;
  const colors = opts.colors || ['#ff4757', '#ff6b6b', '#ffd166', '#06d6a0', '#4d96ff'];

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.pointerEvents = 'none';
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.zIndex = 9999;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      r: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 2 * Math.PI,
      speedX: (Math.random() - 0.5) * 6,
      speedY: 2 + Math.random() * 6,
      gravity: 0.25 + Math.random() * 0.3,
      torque: (Math.random() - 0.5) * 0.1,
      alpha: 1
    });
  }

  let rafId;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let p of particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();

      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += p.gravity;
      p.rotation += p.torque;
      p.alpha -= 0.005;
    }
    // remove faded particles
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].alpha <= 0) particles.splice(i, 1);
    }

    if (particles.length > 0) rafId = requestAnimationFrame(draw);
    else cleanup();
  }

  function cleanup() {
    cancelAnimationFrame(rafId);
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }

  draw();
}
