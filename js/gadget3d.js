/* ============================================================
   SUPERGADGET X100 EN 3D (three.js)
   Un objeto real dentro del espacio: gira sobre su eje con el scroll
   y lo ilumina la escena (ámbar desde el planeta, violeta desde arriba).
   main.js lo controla con window.superGadget3D.pose({ rot, calor }) y
   window.superGadget3D.activo(true/false) (solo se dibuja cuando se ve).
   ============================================================ */
(function () {
  'use strict';
  const PANTALLA = 'data:image/webp;base64,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';
  const canvas = document.getElementById('gadgetCanvas');
  const caja = document.getElementById('gadget3d');
  if (!canvas || !window.THREE) return;
  const T = window.THREE;
  let activo = false, pendiente = false; // estado del dibujo (declarado antes de usarse)

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (e) {
    caja.classList.add('sin-3d'); // sin WebGL: queda la imagen de respaldo
    return;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;

  const escena = new T.Scene();
  const camara = new T.PerspectiveCamera(30, 1, 0.1, 50);
  camara.position.set(0, 0.55, 5.2);
  camara.lookAt(0, -0.02, 0);

  // ---------- medidas (en unidades 3D) ----------
  const R = 0.62;        // radio del cuerpo
  const H = 2.2;         // alto total
  const gadget = new T.Group();
  escena.add(gadget);

  // ---------- cuerpo: cilindro con bordes redondeados (torneado) ----------
  const perfil = [];
  const b = 0.1; // radio del redondeo
  perfil.push(new T.Vector2(0, -H / 2));
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2); perfil.push(new T.Vector2(R - b + Math.cos(a) * b, -H / 2 + b + Math.sin(a) * b)); }
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); perfil.push(new T.Vector2(R - b + Math.cos(a) * b, H / 2 - b + Math.sin(a) * b)); }
  perfil.push(new T.Vector2(0, H / 2));
  const cuerpo = new T.Mesh(
    new T.LatheGeometry(perfil, 96),
    new T.MeshStandardMaterial({ color: 0x15171d, roughness: 0.42, metalness: 0.15 })
  );
  gadget.add(cuerpo);

  // tapa superior algo más clara
  const tapa = new T.Mesh(new T.CircleGeometry(R - b * 0.9, 64), new T.MeshStandardMaterial({ color: 0x3a3d46, roughness: 0.5, metalness: 0.2 }));
  tapa.rotation.x = -Math.PI / 2; tapa.position.y = H / 2 + 0.002;
  gadget.add(tapa);

  // ---------- aros celestes (con un segundo aro difuso como brillo) ----------
  const celeste = new T.Color(0x7fe6ff);
  function aro(y) {
    const nitido = new T.Mesh(new T.TorusGeometry(R + 0.004, 0.016, 12, 128), new T.MeshBasicMaterial({ color: celeste }));
    nitido.rotation.x = Math.PI / 2; nitido.position.y = y;
    const brillo = new T.Mesh(new T.TorusGeometry(R + 0.01, 0.05, 12, 128), new T.MeshBasicMaterial({ color: 0x4fc9f0, transparent: true, opacity: 0.22, blending: T.AdditiveBlending, depthWrite: false }));
    brillo.rotation.x = Math.PI / 2; brillo.position.y = y;
    gadget.add(nitido, brillo);
  }
  aro(H / 2 - 0.1);
  aro(-H / 2 + 0.12);

  // ---------- cara: ojos, triángulo y pantalla dibujados en una textura ----------
  const CW = 512, CH = 820;
  const base = document.createElement('canvas'); base.width = CW; base.height = CH;
  const luz = document.createElement('canvas'); luz.width = CW; luz.height = CH;
  const gb = base.getContext('2d'), gl = luz.getContext('2d');

  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  function dibujarCara(pantallaImg) {
    // base oscura con brillo vertical suave
    const fondo = gb.createLinearGradient(0, 0, CW, 0);
    fondo.addColorStop(0, '#07080c'); fondo.addColorStop(0.35, '#15181f'); fondo.addColorStop(0.5, '#1b1f27'); fondo.addColorStop(1, '#07080c');
    gb.fillStyle = fondo; rr(gb, 0, 0, CW, CH, 70); gb.fill();
    // visor de los ojos
    gb.fillStyle = '#05060a'; rr(gb, 26, 22, CW - 52, CH * 0.44, 60); gb.fill();
    gb.strokeStyle = 'rgba(255,255,255,.06)'; gb.lineWidth = 3; rr(gb, 26, 22, CW - 52, CH * 0.44, 60); gb.stroke();

    gl.fillStyle = '#000'; gl.fillRect(0, 0, CW, CH);
    // ojos
    [[0.255, 0.235], [0.745, 0.235]].forEach(([x, y]) => {
      const cx = x * CW, cy = y * CH, r = 0.118 * CW;
      [gb, gl].forEach((g) => {
        g.save(); g.shadowColor = '#36c8f4'; g.shadowBlur = 40;
        const gr = g.createRadialGradient(cx - r * 0.2, cy - r * 0.25, r * 0.1, cx, cy, r);
        gr.addColorStop(0, '#dff8ff'); gr.addColorStop(0.55, '#5fd0f5'); gr.addColorStop(1, '#1a86c0');
        g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, r, r * 1.08, 0, 0, Math.PI * 2); g.fill(); g.restore();
      });
    });
    // triángulo
    [gb, gl].forEach((g) => {
      g.fillStyle = '#4aa6e0'; g.beginPath();
      g.moveTo(CW * 0.41, CH * 0.49); g.lineTo(CW * 0.59, CH * 0.49); g.lineTo(CW * 0.5, CH * 0.535); g.closePath(); g.fill();
    });
    // pantalla (la misma imagen de tu render)
    const px = 0.227 * CW, py = 0.597 * CH, pw = (0.78 - 0.227) * CW, ph = (0.88 - 0.597) * CH;
    [gb, gl].forEach((g) => {
      g.save(); rr(g, px, py, pw, ph, 10); g.clip();
      if (pantallaImg) g.drawImage(pantallaImg, px, py, pw, ph);
      else { const s = g.createLinearGradient(0, py, 0, py + ph); s.addColorStop(0, '#6f9fd8'); s.addColorStop(1, '#f2c27b'); g.fillStyle = s; g.fillRect(px, py, pw, ph); }
      g.restore();
    });
    texBase.needsUpdate = true; texLuz.needsUpdate = true;
    pedirCuadro();
  }
  const texBase = new T.CanvasTexture(base); texBase.colorSpace = T.SRGBColorSpace; texBase.anisotropy = 4;
  const texLuz = new T.CanvasTexture(luz); texLuz.colorSpace = T.SRGBColorSpace;
  dibujarCara(null);
  const imgPantalla = new Image();
  imgPantalla.onload = () => dibujarCara(imgPantalla);
  // la pantallita del render, incrustada (así funciona también abriendo el archivo con doble clic)
  imgPantalla.src = PANTALLA;

  const anguloCara = (110 * Math.PI) / 180;
  const altoCara = 1.58;
  const cara = new T.Mesh(
    new T.CylinderGeometry(R + 0.003, R + 0.003, altoCara, 64, 1, true, -anguloCara / 2, anguloCara),
    new T.MeshStandardMaterial({ map: texBase, emissiveMap: texLuz, emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.25, metalness: 0.1, transparent: true })
  );
  cara.position.y = 0.01;
  gadget.add(cara);

  // brillo de los ojos (siempre mira a la cámara)
  const halo = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(160,235,255,.9)'); gr.addColorStop(0.35, 'rgba(80,200,245,.35)'); gr.addColorStop(1, 'rgba(80,200,245,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  })();
  const matHalo = new T.SpriteMaterial({ map: halo, transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0.55 });
  const ojos = [];
  [-1, 1].forEach((lado) => {
    const s = new T.Sprite(matHalo);
    const ang = lado * (anguloCara / 2) * 0.49; // posición del ojo sobre la curva
    s.position.set(Math.sin(ang) * (R + 0.08), 0.01 + altoCara / 2 - 0.235 * altoCara, Math.cos(ang) * (R + 0.08));
    s.scale.set(0.55, 0.55, 1);
    gadget.add(s); ojos.push(s);
  });

  // ---------- lente del proyector (atrás) ----------
  const lente = new T.Group();
  const aroLente = new T.Mesh(new T.CylinderGeometry(0.19, 0.2, 0.08, 48), new T.MeshStandardMaterial({ color: 0x0a0b0f, roughness: 0.3, metalness: 0.6 }));
  aroLente.rotation.x = Math.PI / 2;
  const vidrio = new T.Mesh(new T.CircleGeometry(0.13, 48), new T.MeshStandardMaterial({ color: 0x0d2a45, emissive: 0x3fb8ff, emissiveIntensity: 0.9, roughness: 0.1 }));
  vidrio.position.z = 0.041;
  const brilloLente = new T.Sprite(matHalo.clone()); brilloLente.material.opacity = 0.7; brilloLente.scale.set(0.7, 0.7, 1); brilloLente.position.z = 0.12;
  lente.add(aroLente, vidrio, brilloLente);
  lente.position.set(0, 0.28, -(R + 0.02));
  lente.rotation.y = Math.PI; // mira hacia atrás
  gadget.add(lente);

  // ---------- luces de la escena ----------
  escena.add(new T.AmbientLight(0x2a2140, 0.9));
  const hemi = new T.HemisphereLight(0xa88bff, 0xffa05a, 0.7); escena.add(hemi);
  const planeta = new T.DirectionalLight(0xffa860, 1.2); planeta.position.set(1.5, -3, 2.5); escena.add(planeta);
  const cielo = new T.DirectionalLight(0xb49cff, 1.0); cielo.position.set(-2.5, 3, -1.5); escena.add(cielo);
  const frontal = new T.DirectionalLight(0xfff1e0, 0.55); frontal.position.set(0.5, 1, 4); escena.add(frontal);
  // la luz celeste de los ojos gira con el gadget (siempre delante de la cara)
  const celesteLuz = new T.PointLight(0x6fe3ff, 0.9, 1.6); celesteLuz.position.set(0, 0.4, 1.05); gadget.add(celesteLuz);

  // ---------- tamaño ----------
  function medir() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
    pedirCuadro();
  }
  window.addEventListener('resize', medir);

  // ---------- estado y dibujo ----------
  const estado = { rot: 0, calor: 0 };
  const t0 = performance.now();

  function pedirCuadro() {
    if (!activo || pendiente) return;
    pendiente = true;
    requestAnimationFrame(cuadro);
  }
  // Protección para equipos lentos: si el 3D no llega a ~25 cuadros por
  // segundo, se apaga y queda la imagen de respaldo (el sitio siempre fluido).
  let medidas = [], tPrevio = 0, apagado = false;
  function apagar3D() {
    apagado = true; activo = false;
    caja.classList.remove('con-3d');
    try { renderer.dispose(); } catch (e) {}
  }

  function cuadro(t) {
    pendiente = false;
    if (!activo || apagado) return;
    if (tPrevio && t - tPrevio < 3000) {
      medidas.push(t - tPrevio);
      if (medidas.length >= 20) {
        const prom = medidas.reduce((a, b) => a + b, 0) / medidas.length;
        medidas = [];
        if (prom > 40) { apagar3D(); return; }
      }
    }
    tPrevio = t;
    const s = (t - t0) / 1000;
    // giro del scroll + un vaivén muy suave para que se sienta vivo
    gadget.rotation.y = estado.rot + Math.sin(s * 0.6) * 0.05;
    gadget.rotation.x = 0.04 + Math.sin(s * 0.45) * 0.015;
    // luz: al bajar hacia el planeta gana ámbar y pierde violeta
    planeta.intensity = 0.9 + estado.calor * 1.4;
    hemi.intensity = 0.55 + estado.calor * 0.35;
    cielo.intensity = 1.1 - estado.calor * 0.6;
    const pulso = 0.5 + Math.sin(s * 2.2) * 0.06;
    ojos.forEach((o) => { o.material.opacity = pulso; });
    renderer.render(escena, camara);
    requestAnimationFrame(cuadro); pendiente = true;
  }

  window.superGadget3D = {
    pose(p) { if (p.rot !== undefined) estado.rot = p.rot; if (p.calor !== undefined) estado.calor = p.calor; },
    activo(si) {
      if (apagado || si === activo) return;
      activo = si; tPrevio = 0;
      if (si) { medir(); pedirCuadro(); }
    },
  };
  caja.classList.add('con-3d');
  medir();
})();
