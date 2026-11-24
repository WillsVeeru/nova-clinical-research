(() => {
  const canvas = document.getElementById('dna-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, visible = false;

  function draw(time = 0) {
    ctx.clearRect(0, 0, width, height);
    const phase = reducedMotion.matches ? .55 : time / 20000 * Math.PI * 2;
    const radius = Math.min(width * .25, 125);
    const top = height * .06, length = height * .72;
    const turns = Math.PI * 4.5;
    const point = (t, strand) => {
      const angle = t * turns + phase + strand * Math.PI;
      const depth = Math.sin(angle);
      return { x: width / 2 + Math.cos(angle) * radius,
        y: top + t * length, z: depth };
    };
    const pieces = [];
    const steps = 28;
    for (let i = 0; i < steps; i++) {
      for (let strand = 0; strand < 2; strand++) {
        const a = point(i / steps, strand), b = point((i + 1) / steps, strand);
        pieces.push({ a, b, z: (a.z + b.z) / 2, rail: true });
      }
    }
    for (let i = 0; i <= steps; i++) {
      const a = point(i / steps, 0), b = point(i / steps, 1);
      pieces.push({ a, b, z: 0, rail: false });
      pieces.push({ a, z: a.z, node: true, teal: i % 3 !== 0 });
      pieces.push({ a: b, z: b.z, node: true, teal: i % 3 === 0 });
    }
    pieces.sort((a, b) => a.z - b.z);
    for (const { a, b, z, rail, node, teal } of pieces) {
      if (node) {
        const size = Math.min(width * .025, 11) * (1 + z * .15);
        const glow = ctx.createRadialGradient(a.x - size * .35, a.y - size * .4, size * .05, a.x, a.y, size);
        glow.addColorStop(0, teal ? '#e1efed' : '#e1e6ed');
        glow.addColorStop(.45, teal ? '#94babe' : '#98a6b6');
        glow.addColorStop(1, teal ? '#387F87' : '#102B4E');
        ctx.globalAlpha = .72 + (z + 1) * .12;
        ctx.beginPath(); ctx.arc(a.x, a.y, size, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();
        ctx.globalAlpha = 1;
        continue;
      }
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.lineWidth = rail ? 5 : 4;
      ctx.strokeStyle = rail ? `rgba(56,127,135,${.3 + (z + 1) * .15})` : 'rgba(184,154,96,.34)';
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(a.x - 1.2, a.y); ctx.lineTo(b.x - 1.2, b.y);
      ctx.lineWidth = rail ? 1.6 : 1.3;
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.stroke();
    }
  }
  function animate(time) {
    draw(time);
    frame = requestAnimationFrame(animate);
  }
  function updateAnimation() {
    cancelAnimationFrame(frame);
    draw();
    if (visible && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(animate);
  }
  new ResizeObserver(() => {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }).observe(canvas);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    updateAnimation();
  }).observe(canvas);
  reducedMotion.addEventListener('change', updateAnimation);
  document.addEventListener('visibilitychange', updateAnimation);
})();
