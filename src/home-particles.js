(() => {
  const canvas = document.getElementById("particleField");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas || reducedMotion) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const colors = ["#2dd4bf", "#60a5fa", "#fb7185", "#fbbf24"];
  const particles = [];
  const pointer = {
    active: false,
    x: 0,
    y: 0,
  };
  const smooth = {
    x: 0,
    y: 0,
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particleCount = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particleCount = Math.round((isCoarsePointer ? 105 : 170) * Math.min(width / 1200, 1.18));
    seedParticles();
  }

  function seedParticles() {
    particles.length = 0;
    const centerX = width * 0.55;
    const centerY = height * 0.48;
    const radiusX = Math.max(width * 0.24, 160);
    const radiusY = Math.max(height * 0.22, 130);

    for (let i = 0; i < particleCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const ring = 0.35 + Math.random() * 0.75;
      particles.push({
        baseX: centerX + Math.cos(angle) * radiusX * ring + (Math.random() - 0.5) * width * 0.42,
        baseY: centerY + Math.sin(angle) * radiusY * ring + (Math.random() - 0.5) * height * 0.32,
        phase: Math.random() * Math.PI * 2,
        speed: 0.45 + Math.random() * 0.72,
        size: 0.9 + Math.random() * (isCoarsePointer ? 1.3 : 1.9),
        color: colors[i % colors.length],
      });
    }
  }

  function setPointer(clientX, clientY) {
    pointer.active = true;
    pointer.x = clientX;
    pointer.y = clientY;
  }

  function draw(timeMs) {
    const time = timeMs * 0.001;
    const targetX = pointer.active ? pointer.x : width * 0.54;
    const targetY = pointer.active ? pointer.y : height * 0.42;

    smooth.x += (targetX - smooth.x) * 0.035;
    smooth.y += (targetY - smooth.y) * 0.035;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(smooth.x, smooth.y, 0, smooth.x, smooth.y, Math.max(width, height) * 0.6);
    gradient.addColorStop(0, "rgba(45, 212, 191, 0.16)");
    gradient.addColorStop(0.42, "rgba(96, 165, 250, 0.06)");
    gradient.addColorStop(1, "rgba(5, 7, 13, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const particle of particles) {
      const driftX = Math.sin(time * particle.speed + particle.phase) * 18;
      const driftY = Math.cos(time * particle.speed * 0.82 + particle.phase) * 12;
      const dx = particle.baseX - smooth.x;
      const dy = particle.baseY - smooth.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const pull = Math.max(0, 1 - distance / 270) * (pointer.active ? 34 : 14);
      const x = particle.baseX + driftX - (dx / distance) * pull;
      const y = particle.baseY + driftY - (dy / distance) * pull;

      ctx.beginPath();
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = 0.22 + Math.max(0, 1 - distance / 520) * 0.38;
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#2dd4bf";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(smooth.x, smooth.y, 160, 84, time * 0.08, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    window.requestAnimationFrame(draw);
  }

  window.addEventListener("pointermove", (event) => setPointer(event.clientX, event.clientY), { passive: true });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  window.addEventListener("resize", resize, { passive: true });

  resize();
  window.requestAnimationFrame(draw);
})();
