/**
 * three-bg.js
 * 3D Interactive Canvas Background using Three.js (with canvas fallback)
 * Features:
 * - Floating wireframe 3D geometric polyhedrons
 * - 3D particle constellation with emerald / teal lighting
 * - Smooth mouse parallax tracking
 * - Camera depth shift on section transition
 */

(function () {
  const container = document.getElementById('three-canvas');
  if (!container) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  // Track mouse
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - windowHalfX) * 0.0008;
    mouseY = (e.clientY - windowHalfY) * 0.0008;

    // Set CSS variable for CSS-based 3D parallax
    document.documentElement.style.setProperty('--mouse-x', (e.clientX / window.innerWidth - 0.5).toFixed(3));
    document.documentElement.style.setProperty('--mouse-y', (e.clientY / window.innerHeight - 0.5).toFixed(3));
  });

  // Check if Three.js is available
  if (typeof THREE !== 'undefined') {
    initThreeJs();
  } else {
    // Pure Canvas 2D/3D Fallback
    initCanvasFallback();
  }

  function initThreeJs() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle Constellation
    const particleCount = 130;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x10b981); // Emerald
    const color2 = new THREE.Color(0x06b6d4); // Cyan

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1200;
      positions[i + 1] = (Math.random() - 0.5) * 1000;
      positions[i + 2] = (Math.random() - 0.5) * 800;

      const mixed = color1.clone().lerp(color2, Math.random());
      colors[i] = mixed.r;
      colors[i + 1] = mixed.g;
      colors[i + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(16,185,129,0.8)');
    grad.addColorStop(1, 'rgba(16,185,129,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const pTexture = new THREE.CanvasTexture(canvas);

    const pMaterial = new THREE.PointsMaterial({
      size: 5,
      map: pTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, pMaterial);
    scene.add(particles);

    // Floating 3D Geometric shapes
    const polyGroup = new THREE.Group();
    scene.add(polyGroup);

    // Icosahedron wireframe
    const icoGeo = new THREE.IcosahedronGeometry(70, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    icoMesh.position.set(280, 100, -100);
    polyGroup.add(icoMesh);

    // Torus wireframe
    const torusGeo = new THREE.TorusGeometry(55, 16, 12, 36);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(-320, -120, -80);
    polyGroup.add(torusMesh);

    // Octahedron wireframe
    const octGeo = new THREE.OctahedronGeometry(45, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    octMesh.position.set(150, -220, 50);
    polyGroup.add(octMesh);

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 150;
      camera.position.y = -targetY * 150;
      camera.lookAt(scene.position);

      particles.rotation.y += 0.0006;
      particles.rotation.x += 0.0003;

      icoMesh.rotation.x += 0.004;
      icoMesh.rotation.y += 0.005;

      torusMesh.rotation.x += 0.003;
      torusMesh.rotation.z += 0.004;

      octMesh.rotation.y += 0.006;
      octMesh.rotation.x += 0.003;

      renderer.render(scene, camera);
    }
    animate();

    // Export camera zoom pulse on section change
    window.triggerThreeZoom = function () {
      const startZ = camera.position.z;
      const targetZ = startZ - 40;
      let progress = 0;
      function zoomStep() {
        progress += 0.06;
        if (progress <= 1) {
          camera.position.z = startZ - Math.sin(progress * Math.PI) * 35;
          requestAnimationFrame(zoomStep);
        } else {
          camera.position.z = startZ;
        }
      }
      zoomStep();
    };
  }

  function initCanvasFallback() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const nodes = [];
    const count = 55;
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(6, 182, 212, 0.6)'
      });
    }

    function renderFallback() {
      ctx.clearRect(0, 0, width, height);

      // Draw lines between close nodes
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.18 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < count; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      }

      requestAnimationFrame(renderFallback);
    }
    renderFallback();
  }
})();
