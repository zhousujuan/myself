(() => {
  const canvas = document.getElementById("particleField");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas || reducedMotion) {
    return;
  }

  import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js")
    .then((THREE) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120);
  camera.position.z = 28;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const particleCount = isCoarsePointer ? 620 : 1180;
  const positions = new Float32Array(particleCount * 3);
  const basePositions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const phases = new Float32Array(particleCount);
  const accentColors = [
    new THREE.Color("#2dd4bf"),
    new THREE.Color("#60a5fa"),
    new THREE.Color("#fb7185"),
    new THREE.Color("#fbbf24"),
  ];

  for (let i = 0; i < particleCount; i += 1) {
    const i3 = i * 3;
    const radius = 7 + Math.random() * 25;
    const angle = Math.random() * Math.PI * 2;
    const depth = (Math.random() - 0.5) * 26;
    const yBias = (Math.random() - 0.5) * 12;

    basePositions[i3] = Math.cos(angle) * radius;
    basePositions[i3 + 1] = Math.sin(angle) * radius * 0.56 + yBias;
    basePositions[i3 + 2] = depth;
    positions[i3] = basePositions[i3];
    positions[i3 + 1] = basePositions[i3 + 1];
    positions[i3 + 2] = basePositions[i3 + 2];
    phases[i] = Math.random() * Math.PI * 2;

    const color = accentColors[i % accentColors.length].clone().lerp(new THREE.Color("#ffffff"), Math.random() * 0.22);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.86,
      size: isCoarsePointer ? 0.07 : 0.09,
      transparent: true,
      vertexColors: true,
    }),
  );
  scene.add(particles);

  const ring = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: 96 }, (_, index) => {
        const angle = (index / 96) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * 8.5, Math.sin(angle) * 8.5, 0);
      }),
    ),
    new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      opacity: 0.16,
      transparent: true,
    }),
  );
  ring.position.z = -8;
  scene.add(ring);

  const pointer = {
    active: false,
    x: 0,
    y: 0,
  };
  const target = {
    x: 0,
    y: 0,
  };
  const smooth = {
    x: 0,
    y: 0,
  };

  function setPointer(clientX, clientY) {
    pointer.active = true;
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((clientY / window.innerHeight) * 2 - 1);
    target.x = pointer.x;
    target.y = pointer.y;
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function animate(timeMs) {
    const time = timeMs * 0.001;
    smooth.x += (target.x - smooth.x) * 0.045;
    smooth.y += (target.y - smooth.y) * 0.045;

    const attractX = smooth.x * 16;
    const attractY = smooth.y * 9;
    const influence = pointer.active ? 1 : 0.34;

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      const bx = basePositions[i3];
      const by = basePositions[i3 + 1];
      const bz = basePositions[i3 + 2];
      const dx = bx - attractX;
      const dy = by - attractY;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
      const pull = Math.max(0, 1 - dist / 18) * influence;
      const phase = phases[i] + time;

      positions[i3] = bx + Math.sin(phase * 0.72 + bz) * 0.22 - dx * pull * 0.15;
      positions[i3 + 1] = by + Math.cos(phase * 0.64 + bx) * 0.18 - dy * pull * 0.15;
      positions[i3 + 2] = bz + Math.sin(phase * 0.52 + dist) * 0.46 + pull * 5.5;
    }

    geometry.attributes.position.needsUpdate = true;
    particles.rotation.y = time * 0.026 + smooth.x * 0.12;
    particles.rotation.x = -0.13 + smooth.y * 0.08;
    ring.rotation.z = -time * 0.08;
    ring.rotation.x = 1.08 + smooth.y * 0.12;
    ring.position.x = smooth.x * 2.4;
    ring.position.y = smooth.y * 1.7;
    camera.position.x += (smooth.x * 1.25 - camera.position.x) * 0.025;
    camera.position.y += (smooth.y * 0.75 - camera.position.y) * 0.025;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  }

  window.addEventListener("pointermove", (event) => setPointer(event.clientX, event.clientY), { passive: true });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
    target.x = 0;
    target.y = 0;
  });
  window.addEventListener("resize", resize, { passive: true });

  resize();
  window.requestAnimationFrame(animate);
    })
    .catch(() => {
      canvas.style.display = "none";
    });
})();
