/* ============================================================
   PORTFOLIO — main.js
   ------------------------------------------------------------
   1. Configuración (✏️ lo más fácil de ajustar)
   2. Scroll suave (Lenis) + GSAP
   3. Medidas de cada escena (se recalculan al cambiar el tamaño)
   4. LÍNEA DE TIEMPO: todo el recorrido en un solo timeline
   5. Hilo conductor (chispa + nudos) e índice
   6. Fichas de caso
   7. Encendido de la pantalla y paralaje
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. CONFIGURACIÓN
     ---------------------------------------------------------- */
  // Cuántos "vh" de scroll vale cada unidad de la línea de tiempo.
  // Más alto = recorrido más largo y lento. Más bajo = más rápido.
  const VELOCIDAD = 0.8;

  // Capítulos: rótulo que se ve en el hilo/índice y dónde cae.
  // "t" es un punto de la línea de tiempo (ver sección 4);
  // "el" es un elemento de la página normal (después del escenario).
  const CAPITULOS = [
    { id: 'inicio',        rotulo: 'Inicio',        t: 0 },
    { id: 'sobre-mi',      rotulo: 'Sobre mí',      t: 200 },
    { id: 'ecommerce',     rotulo: 'E-commerce',    t: 395 },
    { id: 'libro',         rotulo: 'Mi libro',      t: 1120 },
    { id: 'investigacion', rotulo: 'Investigación', t: 1310 },
    { id: 'gadget',        rotulo: 'SuperGadget',   t: 1645 },
    { id: 'ilustraciones', rotulo: 'Ilustración',   t: 2170 },
    { id: 'seo',           rotulo: 'SEO',           t: 2675 },
    { id: 'gracias',       rotulo: 'Gracias',       t: 3135 },
  ];

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!window.gsap || !window.ScrollTrigger) {
    document.documentElement.classList.add('sin-js');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ----------------------------------------------------------
     2. SCROLL SUAVE
     ---------------------------------------------------------- */
  let lenis = null;
  if (window.Lenis && !menosMovimiento) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const irA = (y, dur) => {
    if (lenis) lenis.scrollTo(y, { duration: dur || 1.8, easing: (t) => 1 - Math.pow(1 - t, 3) });
    else window.scrollTo({ top: y, behavior: menosMovimiento ? 'auto' : 'smooth' });
  };

  /* ----------------------------------------------------------
     3. MEDIDAS
     ---------------------------------------------------------- */
  const el = {
    escenario: $('#escenario'),
    recorrido: $('#recorrido'),
    escPC: $('.escena--pc'),
    escBiblio: $('.escena--biblio'),
    escPortal: $('.escena--portal'),
    escAtril: $('.escena--atril'),
    escOficina: $('.escena--oficina'),
    mundo: $('#mundo'),
    mundoPista: $('#mundoPista'),
    crt: $('#crt'),
    marcoPC: $('#marcoPC'),
    pcParalaje: $('#pcParalaje'),
    pcImg: $('#pcImg'),
    hero: $('#hero'),
    ventana: $('#ventanaSobreMi'),
    calle: $('#calle'),
    callePista: $('#callePista'),
    capaLejos: $('#capaLejos'),
    capaMedio: $('#capaMedio'),
    biblioEdificio: $('#biblioEdificio'),
    puerta: $('#puerta'),
    biblioCubre: $('#biblioCubre'),
    libro: $('#libro3d'),
    biblioSombra: $('#biblioSombra'),
    panelLibro: $('#panelLibro'),
    investigacion: $('#investigacion'),
    espacio: $('#espacio'),
    espacioFondoCaja: $('#espacio .espacio__fondo'),
    estrellas: $('#espacio .estrellas'),
    espacioFondo: $('#espacioFondo'),
    gadget: $('#gadget3d'),
    gadgetHaz: $('#gadgetHaz'),
    marcoPortal: $('#marcoPortal'),
    iris: $('#iris'),
    irisDentro: $('#irisDentro'),
    portalCubre: $('#portalCubre'),
    portalTexto: $('#portalTexto'),
    gPaneles: $$('.g-panel'),
    lienzo: $('#lienzo'),
    lienzoPortada: $('#lienzoPortada'),
    lienzoPista: $('#lienzoPista'),
    marcoAtril: $('#marcoAtril'),
    atrilTexto: $('#atrilTexto'),
    oficinaCubre: $('#oficinaCubre'),
    escCierre: $('.escena--cierre'),
    pantallaFin: $('#pantallaFin'),
    marcoFin: $('#marcoFin'),
    pcImgFin: $('#pcImgFin'),
    tapaFin: $('#tapaFin'),
    textoFin: $('#textoFin'),
    crtFin: $('#crtFin'),
  };

  // La computadora: la imagen extendida mide 4000 x 2600 px.
  // Centro del recorte de la pantalla: (2000, 1108). Tamaño: 594 x 430.
  const PC = { W: 4000, H: 2600, cx: 2000, cy: 1108, hw: 594, hh: 430, monitor: 771 };

  // Tapa superior (se ve en celulares cuando la imagen no llega arriba)
  const tapa = document.createElement('div');
  tapa.className = 'pc__tapa';
  tapa.setAttribute('aria-hidden', 'true');
  el.pcParalaje.insertBefore(tapa, el.pcImg.closest('picture') || el.pcImg);

  const L = {}; // todas las medidas viven acá

  function offsetEn(nodo, ancestro) {
    let x = 0, y = 0, n = nodo;
    while (n && n !== ancestro) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y };
  }
  function cajaCubre() {
    const W = Math.max(L.vw, L.vh * 16 / 9);
    const H = Math.max(L.vh, L.vw * 9 / 16);
    return { W, H, left: (L.vw - W) / 2, top: (L.vh - H) / 2 };
  }
  // Cuánto hay que agrandar un marco para que su recorte tape toda la pantalla
  function escalaRecorte(hx, hy, hw, hh, extra) {
    const sx = Math.max(hx, L.vw - hx) / (hw / 2);
    const sy = Math.max(hy, L.vh - hy) / (hh / 2);
    return Math.max(sx, sy) * (extra || 1.15);
  }

  function medir() {
    L.vw = window.innerWidth;
    L.vh = window.innerHeight;
    L.movil = L.vw <= 900;
    L.apaisado = L.vw / L.vh > 1.05 && !L.movil;

    /* --- Computadora --- */
    const M = L.apaisado ? Math.min(L.vw * 0.27, L.vh * 0.5) : L.vw * 0.8;
    const s = Math.max(M / PC.monitor, L.vw / PC.W, L.apaisado ? L.vh / PC.H : 0);
    const obX = L.apaisado ? L.vw * 0.7 : L.vw * 0.5;
    const obY = L.apaisado ? L.vh * 0.5 : L.vh * 0.64;
    const iw = PC.W * s, ih = PC.H * s;
    const left = clamp(obX - PC.cx * s, L.vw - iw, 0);
    const top = L.apaisado ? clamp(obY - PC.cy * s, L.vh - ih, 0) : Math.min(obY - PC.cy * s, Math.max(0, L.vh * 0.6));
    Object.assign(el.pcImg.style, { width: iw + 'px', left: left + 'px', top: top + 'px' });
    // La tapa cubre solo el hueco entre el borde superior de la pantalla y la imagen
    // (en pantallas anchas la imagen ya cubre todo: mide 0). Antes medía 3000 px fijos
    // y agrandaba la capa de la computadora casi al triple.
    const altoTapa = Math.max(0, Math.ceil(top)) + (top > 0 ? 2 : 0);
    Object.assign(tapa.style, { width: iw + 'px', left: left + 'px', top: (top - altoTapa + 2) + 'px', height: altoTapa + 'px', display: altoTapa ? '' : 'none' });
    Object.assign(el.pcImgFin.style, { width: iw + 'px', left: left + 'px', top: top + 'px' });
    Object.assign(el.tapaFin.style, { width: iw + 'px', left: left + 'px', top: (top - altoTapa + 2) + 'px', height: altoTapa + 'px', display: altoTapa ? '' : 'none' });
    L.pc = { hx: left + PC.cx * s, hy: top + PC.cy * s, hw: PC.hw * s, hh: PC.hh * s };
    L.pc.w0 = Math.max(L.pc.hw / L.vw, L.pc.hh / L.vh) * 1.03;
    L.pc.S = Math.max(escalaRecorte(L.pc.hx, L.pc.hy, L.pc.hw, L.pc.hh, 1.08), 1.02 / L.pc.w0);

    /* --- Calle: fin del recorrido horizontal (biblioteca centrada) --- */
    const b = el.biblioEdificio;
    if (L.movil) {
      // Celular: la calle es una columna que sube (el dedo y el contenido van en la
      // misma dirección). Termina con la biblioteca apoyada sobre la vereda.
      L.finCalle = 0;
      const baseVereda = el.calle.offsetHeight - L.vh * 0.12;
      L.finCalleY = -(el.callePista.offsetTop + b.offsetTop + b.offsetHeight - baseVereda);
    } else {
      L.finCalle = -(b.offsetLeft + b.offsetWidth / 2 - L.vw / 2);
      L.finCalleY = 0;
    }
    const p = offsetEn(el.puerta, el.calle);
    L.puerta = {
      x: p.x + el.puerta.offsetWidth / 2 + L.finCalle,
      y: p.y + el.puerta.offsetHeight / 2 + L.finCalleY,
      w: el.puerta.offsetWidth,
      h: el.puerta.offsetHeight,
    };
    // Zoom moderado: agrandar la calle muchas veces obliga al navegador a redibujarla
    // enorme (era lo que trababa al volver). La biblioteca aparece con un fundido.
    L.puerta.S = 2.6;

    /* --- Iris (círculo que abre el portal) --- */
    L.D = Math.ceil(Math.hypot(L.vw, L.vh)) + 4;
    Object.assign(el.iris.style, { width: L.D + 'px', height: L.D + 'px', marginLeft: -L.D / 2 + 'px', marginTop: -L.D / 2 + 'px' });
    Object.assign(el.irisDentro.style, { width: L.vw + 'px', height: L.vh + 'px', left: (L.D - L.vw) / 2 + 'px', top: (L.D - L.vh) / 2 + 'px' });

    /* --- Portal (recorte circular) --- */
    const c = cajaCubre();
    // recorte circular de portal-nave.webp: centro (49,95%, 49,4%), radio 21,34% del ancho
    const r = 0.2134 * c.W;
    L.portal = { hx: c.left + c.W * 0.4995, hy: c.top + c.H * 0.494, r };
    L.portal.S = Math.hypot(L.vw / 2, L.vh / 2) / r * 1.04;

    /* --- Atril (recorte del lienzo) --- */
    L.atril = {
      hx: c.left + c.W * 0.5084,
      hy: c.top + c.H * 0.4395,
      hw: c.W * 0.2703,
      hh: c.H * 0.5707,
    };
    L.atril.w0 = Math.max(L.atril.hw / L.vw, L.atril.hh / L.vh) * 1.03;
    L.atril.S = Math.max(escalaRecorte(L.atril.hx, L.atril.hy, L.atril.hw, L.atril.hh, 1.05), 1.02 / L.atril.w0);

    L.finLienzo = -(el.lienzoPista.scrollWidth - L.vw);

    /* --- Centrados en porcentaje (GSAP los recalcula siempre; no usar
       la propiedad CSS "translate" en elementos que anima GSAP) --- */
    const m = L.movil;
    gsap.set(el.gadget, { xPercent: -50, yPercent: -50 });
    gsap.set(el.ventana, { xPercent: m ? -50 : -45, yPercent: m ? -50 : -52 });
    gsap.set([el.hero, el.textoFin, el.panelLibro, el.investigacion, '#panelSeo', '#seoVidrio', el.atrilTexto, el.gPaneles], { yPercent: m ? 0 : -50 });

    /* --- Largo total del scroll --- */
    L.px = VELOCIDAD * L.vh / 100; // px de scroll por unidad
    el.recorrido.style.height = (DURACION * L.px + L.vh) + 'px';
  }

  /* ----------------------------------------------------------
     Zooms "a través de un recorte": el marco crece de forma
     exponencial (se siente a velocidad constante) y lo que hay
     adentro crece con él hasta llenar la pantalla.
     ---------------------------------------------------------- */
  const estado = { pc: 0, puerta: 0, portal: 0, atril: 0, iris: 0, fin: 1 };

  // Al volver un zoom a reposo, pedirle al navegador que redibuje la capa desde
  // cero: tras agrandarla mucho, puede quedar con bloques sin pintar (se ve el fondo).
  function redibujarCapa(nodo) {
    nodo.style.willChange = 'auto';
    requestAnimationFrame(() => requestAnimationFrame(() => { nodo.style.willChange = ''; }));
  }
  const enReposo = {};
  function reposo(clave, p, nodos) {
    const quieto = p <= 0.0001;
    if (quieto && !enReposo[clave]) nodos.forEach(redibujarCapa);
    enReposo[clave] = quieto;
  }

  const ultimo = {};
  const cambio = (k, v) => { if (ultimo[k] === v) return false; ultimo[k] = v; return true; };

  function pintarPC() {
    const g = L.pc, p = estado.pc;
    if (!cambio('pc', p)) return;
    const S = Math.pow(g.S, p);
    gsap.set(el.marcoPC, { scale: S, transformOrigin: `${g.hx}px ${g.hy}px` });
    const w = Math.min(1, g.w0 * S);
    const q = (w - g.w0) / (1 - g.w0);
    gsap.set(el.mundo, { x: (g.hx - L.vw / 2) * (1 - q), y: (g.hy - L.vh / 2) * (1 - q), scale: w });
    el.crt.style.opacity = String(1 - q);
    el.marcoPC.style.visibility = p >= 0.999 ? 'hidden' : '';
    reposo('pc', p, [el.marcoPC]);
    el.crt.style.display = q >= 0.999 ? 'none' : '';
  }

  function pintarPuerta() {
    const g = L.puerta, p = estado.puerta;
    if (!cambio('puerta', p)) return;
    const S = Math.pow(g.S, p);
    gsap.set(el.calle, { scale: p >= 0.999 ? 1 : S, transformOrigin: `${g.x}px ${g.y}px` });
    reposo('puerta', p, [el.calle]);
    gsap.set(el.biblioCubre, { scale: 1.35 - 0.35 * p });
    gsap.set(el.escBiblio, { autoAlpha: clamp((p - 0.25) / 0.6, 0, 1) });
  }

  function pintarPortal() {
    const g = L.portal, p = estado.portal;
    if (!cambio('portal', p)) return;
    const S = Math.pow(g.S, p);
    gsap.set(el.marcoPortal, { scale: S, transformOrigin: `${g.hx}px ${g.hy}px` });
    // el espacio siempre cubre la pantalla; crece menos que el portal (profundidad)
    // solo el fondo (y las estrellas) crece: el gadget y las tarjetas quedan a escala 1,
    // así en celular las tarjetas de abajo no se salen de la pantalla
    gsap.set([el.espacioFondoCaja, el.estrellas], { scale: 1 + 0.12 * p, transformOrigin: '50% 50%' });
    gsap.set(el.gadget, { scale: 0.6 + 0.4 * p }); // el gadget se acerca al cruzar el portal
    el.marcoPortal.style.visibility = p >= 0.999 ? 'hidden' : '';
    reposo('portal', p, [el.marcoPortal]);
  }

  function pintarAtril() {
    const g = L.atril, p = estado.atril;
    if (!cambio('atril', p)) return;
    const S = Math.pow(g.S, p);
    gsap.set(el.marcoAtril, { scale: S, transformOrigin: `${g.hx}px ${g.hy}px` });
    const w = Math.min(1, g.w0 * S);
    const q = (w - g.w0) / (1 - g.w0);
    gsap.set(el.lienzo, { x: (g.hx - L.vw / 2) * (1 - q), y: (g.hy - L.vh / 2) * (1 - q), scale: w });
    el.marcoAtril.style.visibility = p >= 0.999 ? 'hidden' : '';
    reposo('atril', p, [el.marcoAtril]);
  }

  function pintarIris() {
    const p = estado.iris;
    if (!cambio('iris', p)) return;
    const s = Math.max(0.002, p);
    gsap.set(el.iris, { scale: s });
    gsap.set(el.irisDentro, { scale: 1 / s });
  }

  // Cierre: lo mismo que la entrada a la computadora, pero al revés (fin va de 1 a 0)
  function pintarFin() {
    const g = L.pc, p = estado.fin;
    if (!cambio('fin', p)) return;
    const S = Math.pow(g.S, p);
    gsap.set(el.marcoFin, { scale: S, transformOrigin: `${g.hx}px ${g.hy}px` });
    const w = Math.min(1, g.w0 * S);
    const q = (w - g.w0) / (1 - g.w0);
    gsap.set(el.pantallaFin, { x: (g.hx - L.vw / 2) * (1 - q), y: (g.hy - L.vh / 2) * (1 - q), scale: w });
    el.crtFin.style.opacity = String(1 - q);
    el.marcoFin.style.visibility = p >= 0.999 ? 'hidden' : '';
    reposo('fin', p, [el.marcoFin]);
  }

  function pintarTodo() { for (const k in ultimo) delete ultimo[k]; pintarPC(); pintarPuerta(); pintarPortal(); pintarAtril(); pintarIris(); pintarFin(); }

  /* ----------------------------------------------------------
     4. LÍNEA DE TIEMPO
     Los números son "unidades" (1 unidad = VELOCIDAD vh de scroll).
     Leé cada bloque como: desde cuándo, cuánto dura, qué pasa.
     ---------------------------------------------------------- */
  const DURACION = 3175;
  const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true });
  const zoom = (clave, pintar) => ({ [clave]: 1, onUpdate: pintar });

  // ---- 0 a 175: entrar a la pantalla
  tl.to(el.hero, { autoAlpha: 0, y: -40, duration: 40 }, 25);
  tl.to(estado, { ...zoom('pc', pintarPC), duration: 150, ease: 'power1.in' }, 25);

  // ---- 175 a 250: sobre mí (la ventana queda quieta un rato)
  tl.fromTo(el.ventana, { scale: 0.96 }, { scale: 1, duration: 60, ease: 'power2.out' }, 170);

  // ---- 250 a 370: bajar del cielo a la ciudad
  tl.to(el.mundoPista, { yPercent: -50, duration: 120, ease: 'power2.inOut' }, 250);
  tl.to(el.ventana, { y: () => -L.vh * 0.25, duration: 120, ease: 'power2.inOut' }, 250);
  tl.to('.nube--a', { y: () => -L.vh * 0.35, duration: 120 }, 250);
  tl.to('.nube--b', { y: () => -L.vh * 0.2, duration: 120 }, 250);

  // ---- 370 a 855: la calle e-commerce en horizontal
  // en escritorio la calle avanza de costado; en celular sube (ver medir())
  tl.to(el.callePista, { x: () => L.finCalle, y: () => L.finCalleY, duration: 485 }, 370);
  // la ciudad de fondo acompaña con un paralaje suave (en celular, un leve desplazamiento lateral)
  tl.to(el.capaMedio, { x: () => (L.movil ? L.finCalleY * 0.08 : L.finCalle * 0.35), duration: 485 }, 370);
  tl.to(el.capaLejos, { x: () => (L.movil ? L.finCalleY * 0.03 : L.finCalle * 0.12), duration: 485 }, 370);

  // ---- 855 a 975: entrar por la puerta de la biblioteca
  tl.to(estado, { ...zoom('puerta', pintarPuerta), duration: 120, ease: 'power1.in' }, 855);
  tl.set(el.escPC, { autoAlpha: 0 }, 975);

  // Profundidad en la biblioteca: los libros de adelante se acercan más que la
  // estantería del fondo (parallax), así se leen como una capa delante.
  tl.fromTo(['#biblioCubre .cubre__img--frente', '.libros-sombra'], { scale: 1.12, yPercent: 3 }, { scale: 1, yPercent: 1.2, transformOrigin: '50% 100%', duration: 550 }, 855);
  tl.fromTo('#biblioCubre .cubre__img:not(.cubre__img--frente)', { scale: 1 }, { scale: 1.05, transformOrigin: '50% 60%', duration: 550 }, 855);

  // ---- 975 a 1205: el libro gira y aparece su panel
  tl.fromTo(el.libro, { rotateY: 90 }, { rotateY: 0, duration: 110, ease: 'power2.inOut' }, 965);
  tl.fromTo(el.libro, { y: 0 }, { y: () => -L.vh * 0.02, duration: 110, ease: 'sine.inOut' }, 965);
  tl.to(el.biblioSombra, { opacity: 1, duration: 50 }, 1065);
  tl.fromTo(el.panelLibro, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 50, ease: 'power2.out' }, 1070);

  // ---- 1205 a 1405: casos de investigación (el panel del libro se da vuelta
  //      y en su lugar aparece el de investigación; la biblioteca sigue iluminada)
  tl.to(el.panelLibro, { autoAlpha: 0, rotateY: -12, x: -30, duration: 35, ease: 'power2.in' }, 1205);
  tl.fromTo(el.investigacion, { autoAlpha: 0, x: 40, rotateY: 12 }, { autoAlpha: 1, x: 0, rotateY: 0, duration: 45, ease: 'power2.out' }, 1230);
  tl.fromTo('.ficha', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 35, stagger: 10, ease: 'power2.out' }, 1245);

  // ---- 1405 a 1475: se abre el portal (iris circular)
  tl.set(el.escPortal, { autoAlpha: 1 }, 1405);
  tl.to(estado, { iris: 1, onUpdate: pintarIris, duration: 70, ease: 'power1.inOut' }, 1405);
  tl.set(el.escBiblio, { autoAlpha: 0 }, 1475);

  // ---- 1505 a 1615: zoom a través del portal al espacio
  tl.to(el.portalTexto, { autoAlpha: 0, duration: 35 }, 1505);
  tl.to(estado, { ...zoom('portal', pintarPortal), duration: 110, ease: 'power1.in' }, 1505);

  // ---- 1615 a 2085: SuperGadget (cinco paneles, uno por vez)
  // bajamos despacio por la misma imagen mientras pasan los paneles
  tl.to(el.espacioFondo, { yPercent: -20, duration: 470 }, 1615);
  // Estado del gadget 3D (lo lee js/gadget3d.js)
  const g3 = { rot: 0, calor: 0 };
  const GIROS = [-0.45, -1.57, -3.5, -5.6, -6.283]; // radianes: 3/4, lente a la derecha, vuelta y de frente
  const poseG3 = () => { if (window.superGadget3D) window.superGadget3D.pose(g3); };
  el.gPaneles.forEach((panel, i) => {
    const t0 = 1615 + i * 90;
    const izq = panel.dataset.lado === 'izq';
    const ultimo = i === el.gPaneles.length - 1;
    tl.fromTo(panel, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 25, ease: 'power2.out' }, t0);
    // Gadget 3D: gira sobre su eje de panel en panel (en "La idea y la función"
    // muestra el lente del proyector hacia el panel) y se calienta al bajar al planeta
    tl.to(g3, { rot: GIROS[i], calor: i / (el.gPaneles.length - 1), duration: 45, ease: 'power2.inOut', onUpdate: poseG3 }, t0 - 12);
    tl.to(el.gadget, {
      // cerca del panel, para que formen un grupo (y no quede un hueco en el medio)
      x: () => (L.movil ? 0 : (izq ? 1 : -1) * L.vw * 0.13),
      y: () => (L.movil ? -L.vh * 0.02 : (i % 2 ? -1 : 1) * L.vh * 0.03),
      duration: 40, ease: 'power2.inOut',
    }, t0 - 10);
    if (!ultimo) tl.to(panel, { autoAlpha: 0, y: -30, duration: 20, ease: 'power2.in' }, t0 + 70);
  });
  // el haz del proyector acompaña el panel de "la función"
  tl.fromTo(el.gadgetHaz, { opacity: 0, scaleX: 0.3 }, { opacity: 1, scaleX: 1, duration: 25 }, 1710);
  tl.to(el.gadgetHaz, { opacity: 0, duration: 20 }, 1775);
  tl.to(el.gPaneles[el.gPaneles.length - 1], { autoAlpha: 0, duration: 20 }, 2070);

  // ---- 2075 a 2155: el atril sube como una ola
  tl.set(el.escAtril, { autoAlpha: 1 }, 2075);
  tl.fromTo(el.escAtril, { yPercent: 100 }, { yPercent: 0, duration: 80, ease: 'power2.inOut' }, 2075);
  tl.set(el.escPortal, { autoAlpha: 0 }, 2155);

  // ---- 2235 a 2345: zoom dentro del lienzo
  tl.to(el.atrilTexto, { autoAlpha: 0, x: -30, duration: 35 }, 2235);
  tl.to(estado, { ...zoom('atril', pintarAtril), duration: 110, ease: 'power1.in' }, 2235);

  // ---- 2350 a 2530: galería horizontal dentro del lienzo
  tl.to(el.lienzoPista, { x: () => L.finLienzo, duration: 180 }, 2350);
  tl.to(el.lienzoPortada, { autoAlpha: 0, scale: 0.94, duration: 50 }, 2350);

  // ---- 2535 a 2895: la oficina de noche, el SEO y el cierre
  tl.set(el.escOficina, { autoAlpha: 1 }, 2535);
  tl.fromTo(el.escOficina, { yPercent: 100 }, { yPercent: 0, duration: 80, ease: 'power2.inOut' }, 2535);
  tl.fromTo(el.oficinaCubre, { scale: 1 }, { scale: 1.08, transformOrigin: '53% 42%', duration: 360 }, 2535);
  // la ciudad avanza menos que la oficina: así se lee lejos (parallax)
  tl.fromTo('#ventanaNoche', { scale: 1.06, y: 0 }, { scale: 0.98, y: () => -L.vh * 0.02, duration: 360 }, 2535);
  tl.fromTo('#panelSeo', { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 45, ease: 'power2.out' }, 2605);
  // resultados de SEO: tarjetas de vidrio, números que cuentan y barras que crecen
  tl.fromTo('#seoVidrio', { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 45, ease: 'power2.out' }, 2630);
  tl.fromTo('#seoVidrio .cristal', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 30, stagger: 6, ease: 'power2.out' }, 2635);
  $$('#seoVidrio .cristal__num').forEach((n) => {
    const hasta = Number(n.dataset.hasta), de8 = n.dataset.formato === 'de8', c = { v: 0 };
    tl.to(c, { v: hasta, duration: 60, ease: 'power2.out', onUpdate: () => {
      const v = Math.round(c.v);
      n.innerHTML = de8 ? v + ' <small>de 8</small>' : (n.dataset.formato === 'porcentaje' ? v + ' %' : '+' + v + ' %');
    } }, 2650);
  });
  tl.fromTo('#seoVidrio .barras i', { scaleX: 0 }, { scaleX: 1, duration: 50, stagger: 4, ease: 'power2.out' }, 2665);
  tl.set(el.escAtril, { autoAlpha: 0 }, 2615);
  // ---- 2895 a 3175: cierre. Aparece una pantalla ("gracias.txt") y la cámara
  //      se aleja hasta volver a ver la computadora del principio
  tl.set(el.escCierre, { autoAlpha: 1 }, 2895);
  tl.fromTo(el.escCierre, { opacity: 0 }, { opacity: 1, duration: 40, immediateRender: false }, 2895);
  tl.set(el.escOficina, { autoAlpha: 0 }, 2935);
  tl.to(estado, { fin: 0, onUpdate: pintarFin, duration: 150, ease: 'power2.inOut' }, 2945);
  tl.fromTo(el.textoFin, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 40, ease: 'power2.out' }, 3065);
  tl.to({}, { duration: 0 }, DURACION);

  // estado inicial de las escenas que se abren con máscara
  gsap.set(el.gadgetHaz, { opacity: 0 });

  medir();
  pintarTodo();

  ScrollTrigger.create({
    animation: tl,
    trigger: el.recorrido,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true, // Lenis ya suaviza: un solo suavizado = ida y vuelta igual de fluidas
    invalidateOnRefresh: true,
  });
  ScrollTrigger.addEventListener('refreshInit', medir);
  ScrollTrigger.addEventListener('refresh', () => { pintarTodo(); armarHilo(); });

  // Posición de scroll de un capítulo
  function yCapitulo(cap) {
    if (cap.el) {
      const n = $(cap.el);
      return n ? n.getBoundingClientRect().top + window.scrollY - (cap.id === 'historia' ? 0 : 80) : 0;
    }
    return cap.t * L.px;
  }

  /* ----------------------------------------------------------
     5. HILO CONDUCTOR + ÍNDICE
     ---------------------------------------------------------- */
  const hilo = $('.hilo');
  const hiloFondo = $('.hilo__fondo');
  const hiloTrazo = $('.hilo__trazo');
  const hiloSvg = $('.hilo__svg');
  const chispa = $('.hilo__chispa');
  const rotulo = $('.hilo__rotulo');
  const nudosCaja = $('.hilo__nudos');
  let largoHilo = 0, fracCapitulos = [], timerRotulo = 0;

  CAPITULOS.forEach((cap) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hilo__nudo';
    b.dataset.ir = cap.id;
    b.dataset.rotulo = cap.rotulo;
    b.setAttribute('aria-label', 'Ir a ' + cap.rotulo);
    nudosCaja.appendChild(b);

    const li = document.createElement('li');
    li.innerHTML = `<button type="button" data-ir="${cap.id}">${cap.rotulo}</button>`;
    $('.indice__lista').appendChild(li);
  });
  const nudos = $$('.hilo__nudo');

  function maxScroll() { return Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }

  function armarHilo() {
    const h = hilo.clientHeight;
    hiloSvg.setAttribute('viewBox', `0 0 24 ${h}`);
    let d = 'M12 0';
    for (let y = 8; y <= h; y += 8) d += ` L${(12 + 4.5 * Math.sin(y / 55)).toFixed(2)} ${y}`;
    hiloFondo.setAttribute('d', d);
    hiloTrazo.setAttribute('d', d);
    largoHilo = hiloTrazo.getTotalLength();
    hiloTrazo.style.strokeDasharray = `${largoHilo} ${largoHilo}`;
    const max = maxScroll();
    fracCapitulos = CAPITULOS.map((c) => clamp(yCapitulo(c) / max, 0, 1));
    nudos.forEach((n, i) => {
      const pt = hiloTrazo.getPointAtLength(fracCapitulos[i] * largoHilo);
      n.style.left = pt.x + 'px';
      n.style.top = pt.y + 'px';
    });
    actualizarHilo();
  }

  function actualizarHilo() {
    if (window.superGadget3D) window.superGadget3D.activo(el.escPortal.style.visibility === 'inherit');
    const f = clamp(window.scrollY / maxScroll(), 0, 1);
    hiloTrazo.style.strokeDashoffset = String(largoHilo * (1 - f));
    const pt = hiloTrazo.getPointAtLength(f * largoHilo);
    chispa.style.transform = `translate(${pt.x - 12}px, ${pt.y}px)`;
    let actual = 0;
    fracCapitulos.forEach((fc, i) => { if (f + 0.002 >= fc) actual = i; });
    nudos.forEach((n, i) => n.classList.toggle('pasado', i <= actual));
    const texto = CAPITULOS[actual].rotulo;
    if (rotulo.textContent !== texto) {
      // el rótulo aparece al cambiar de capítulo y se esconde solo
      rotulo.textContent = texto;
      rotulo.classList.add('visible');
      clearTimeout(timerRotulo);
      timerRotulo = setTimeout(() => rotulo.classList.remove('visible'), 1800);
    }
    rotulo.style.transform = `translateY(${pt.y}px)`;
  }
  if (lenis) lenis.on('scroll', actualizarHilo);
  else window.addEventListener('scroll', actualizarHilo, { passive: true });


  // Botones y links con data-ir="capitulo"
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ir]');
    if (!b) return;
    const cap = CAPITULOS.find((c) => c.id === b.dataset.ir);
    if (!cap) return;
    e.preventDefault();
    if (!elCaso.hidden) cerrarCaso(true);
    cerrarIndice();
    const y = yCapitulo(cap);
    const dist = Math.abs(y - window.scrollY) / L.vh;
    irA(y, clamp(0.8 + dist * 0.12, 1, 3.2));
  });

  // Índice (menú en celulares)
  const botonIndice = $('.barra__menu');
  const indice = $('#indice');
  function cerrarIndice() { indice.hidden = true; botonIndice.setAttribute('aria-expanded', 'false'); }
  botonIndice.addEventListener('click', () => {
    const abrir = indice.hidden;
    indice.hidden = !abrir;
    botonIndice.setAttribute('aria-expanded', String(abrir));
  });

  /* ----------------------------------------------------------
     6. FICHAS DE CASO
     ---------------------------------------------------------- */
  const elCaso = $('#caso');
  const hoja = $('.caso__hoja', elCaso);
  const fondoCaso = $('.caso__fondo', elCaso);
  const contenido = $('#casoContenido');
  const btnAnt = $('#casoAnterior');
  const btnSig = $('#casoSiguiente');
  let casoActual = null, disparador = null;

  function grupoDe(id) {
    const t = $('#caso-' + id);
    const g = t && t.dataset.grupo;
    return g ? $$(`template[data-grupo="${g}"]`).map((x) => x.id.replace('caso-', '')) : [id];
  }

  function cargarCaso(id) {
    const t = $('#caso-' + id);
    if (!t) return false;
    contenido.innerHTML = '';
    contenido.appendChild(t.content.cloneNode(true));
    casoActual = id;
    const g = grupoDe(id);
    const hay = g.length > 1;
    btnAnt.hidden = btnSig.hidden = !hay;
    hoja.scrollTop = 0;
    return true;
  }

  function abrirCaso(id, origen) {
    if (!cargarCaso(id)) return;
    disparador = origen || document.activeElement;
    elCaso.hidden = false;
    if (lenis) lenis.stop();
    document.documentElement.style.overflow = 'hidden';
    gsap.fromTo(fondoCaso, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(hoja, { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: 'expo.out' });
    $('[data-cerrar].tecla', elCaso).focus();
  }

  function cerrarCaso(rapido) {
    const fin = () => {
      elCaso.hidden = true;
      document.documentElement.style.overflow = '';
      if (lenis) lenis.start();
      if (disparador && disparador.focus && !rapido) disparador.focus({ preventScroll: true });
    };
    if (rapido) { fin(); return; }
    gsap.to(fondoCaso, { opacity: 0, duration: 0.35 });
    gsap.to(hoja, { xPercent: 100, duration: 0.45, ease: 'power3.in', onComplete: fin });
  }

  function moverCaso(paso) {
    const g = grupoDe(casoActual);
    const i = (g.indexOf(casoActual) + paso + g.length) % g.length;
    gsap.to(contenido, {
      opacity: 0, x: -20 * paso, duration: 0.2, onComplete: () => {
        cargarCaso(g[i]);
        gsap.fromTo(contenido, { opacity: 0, x: 20 * paso }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' });
      },
    });
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-caso]');
    if (b) { e.preventDefault(); abrirCaso(b.dataset.caso, b); return; }
    if (e.target.closest('[data-cerrar]')) cerrarCaso();
  });
  btnAnt.addEventListener('click', () => moverCaso(-1));
  btnSig.addEventListener('click', () => moverCaso(1));

  document.addEventListener('keydown', (e) => {
    if (elCaso.hidden) {
      if (e.key === 'Escape') cerrarIndice();
      return;
    }
    if (e.key === 'Escape') { cerrarCaso(); return; }
    if (e.key === 'Tab') { // mantiene el foco dentro de la ficha
      const f = $$('button, a[href], [tabindex]:not([tabindex="-1"])', hoja).filter((n) => !n.hidden && n.offsetParent !== null);
      if (!f.length) return;
      const primero = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }
  });

  /* ----------------------------------------------------------
     6c. MAPA ILUSTRADO INTERACTIVO (dentro de la ficha del mapa)
     Tocar un pin agranda la región desde ese punto; se puede pasar
     de región en región y volver al mapa.
     ---------------------------------------------------------- */
  let mapaActual = -1;
  function mapaPartes() {
    const cont = $('#casoContenido [data-mapa]');
    if (!cont) return null;
    return { cont, pines: $$('.mapa__pin', cont), zoom: $('.mapa__zoom', cont), det: $('.mapa__detalle', cont), tit: $('.mapa__titulo', cont) };
  }
  function mapaMostrar(n, desdePin) {
    const m = mapaPartes(); if (!m) return;
    const total = m.pines.length;
    n = (n + total) % total;
    const pin = m.pines[n];
    mapaActual = n;
    m.det.src = pin.dataset.img; m.det.alt = 'Detalle del mapa: ' + pin.dataset.nombre;
    m.tit.textContent = pin.dataset.nombre;
    const abierto = !m.zoom.hidden;
    m.zoom.hidden = false;
    if (!abierto || desdePin) {
      // la región crece desde la posición de su pin
      gsap.fromTo(m.zoom, { opacity: 0, scale: 0.12, transformOrigin: pin.style.left + ' ' + pin.style.top },
        { opacity: 1, scale: 1, duration: menosMovimiento ? 0 : 0.55, ease: 'expo.out' });
    } else {
      gsap.fromTo(m.det, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
    $('[data-mapa-volver]', m.zoom).focus({ preventScroll: true });
  }
  function mapaCerrar() {
    const m = mapaPartes(); if (!m || m.zoom.hidden) return false;
    const pin = m.pines[mapaActual] || m.pines[0];
    gsap.to(m.zoom, { opacity: 0, scale: 0.12, transformOrigin: pin.style.left + ' ' + pin.style.top, duration: menosMovimiento ? 0 : 0.4, ease: 'power2.in',
      onComplete: () => { m.zoom.hidden = true; gsap.set(m.zoom, { clearProps: 'all' }); pin.focus({ preventScroll: true }); } });
    return true;
  }
  document.addEventListener('click', (e) => {
    const pin = e.target.closest('.mapa__pin');
    if (pin) { mapaMostrar(Number(pin.dataset.region), true); return; }
    if (e.target.closest('[data-mapa-volver]')) { mapaCerrar(); return; }
    const paso = e.target.closest('[data-mapa-paso]');
    if (paso) mapaMostrar(mapaActual + Number(paso.dataset.mapaPaso));
  });
  // teclado: Escape vuelve al mapa (antes de cerrar la ficha) y las flechas cambian de región
  document.addEventListener('keydown', (e) => {
    const m = mapaPartes(); if (!m || m.zoom.hidden) return;
    if (e.key === 'Escape') { e.stopImmediatePropagation(); mapaCerrar(); }
    else if (e.key === 'ArrowRight') mapaMostrar(mapaActual + 1);
    else if (e.key === 'ArrowLeft') mapaMostrar(mapaActual - 1);
  }, true);

  /* ----------------------------------------------------------
     7. DETALLES: encendido y paralaje
     ---------------------------------------------------------- */
  // Decodificar todas las imágenes de escena al inicio: así no hay un
  // "salto" la primera vez que aparece cada escena (ni al volver atrás).
  $$('.escenario img').forEach((im) => { if (im.decode) im.decode().catch(() => {}); });

  // Encendido del monitor (el único momento que se mueve solo)
  const encendido = $('#encendido');
  const lineasHero = $$('.hero .linea');
  if (menosMovimiento) {
    encendido.remove();
  } else {
    gsap.set(lineasHero, { autoAlpha: 0, y: 26 });
    const intro = gsap.timeline({ delay: 0.35 });
    intro
      .to('#encendido span', { scaleX: 1, duration: 0.45, ease: 'expo.out' })
      .to('#encendido span', { scaleY: 60, opacity: 0, duration: 0.35, ease: 'power2.in' }, '+=0.05')
      .to(encendido, { opacity: 0, duration: 0.5, onComplete: () => encendido.remove() }, '-=0.15')
      .to(lineasHero, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'expo.out' }, '-=0.6');
  }

  // Paralaje suave con el mouse en la portada
  if (!menosMovimiento && window.matchMedia('(hover: hover)').matches) {
    const px = gsap.quickTo(el.pcParalaje, 'x', { duration: 1.2, ease: 'power3.out' });
    const py = gsap.quickTo(el.pcParalaje, 'y', { duration: 1.2, ease: 'power3.out' });
    let enPortada = true;
    window.addEventListener('mousemove', (e) => {
      if (estado.pc < 0.02) {
        enPortada = true;
        px(((e.clientX / L.vw) - 0.5) * -18);
        py(((e.clientY / L.vh) - 0.5) * -12);
      } else if (enPortada) { enPortada = false; px(0); py(0); }
    }, { passive: true });
  }

  // Parallax con el mouse en la biblioteca: los libros de adelante se mueven
  // más que la estantería, como capas a distinta distancia
  if (!menosMovimiento && window.matchMedia('(hover: hover)').matches) {
    const fr = $('#biblioCubre .cubre__img--frente');
    const fo = $('#biblioCubre .cubre__img:not(.cubre__img--frente)');
    const lb = $('.libro3d-escena');
    const q = [gsap.quickTo(fr, 'x', { duration: 1, ease: 'power3.out' }), gsap.quickTo(fo, 'x', { duration: 1, ease: 'power3.out' }), gsap.quickTo(lb, 'x', { duration: 1, ease: 'power3.out' })];
    window.addEventListener('mousemove', (e) => {
      if (el.escBiblio.style.visibility !== 'inherit') return; // solo con la biblioteca a la vista
      const d = (e.clientX / L.vw) - 0.5;
      q[0](d * -26); q[1](d * -6); q[2](d * -14);
    }, { passive: true });
  }


  // Medidor de rendimiento: abrí el sitio con "?medir" al final de la dirección
  if (/[?&]medir/.test(location.search)) {
    const m = document.createElement('div');
    m.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:300;background:rgba(20,10,6,.88);color:#F4E9D6;font:600 13px/1.4 system-ui,sans-serif;padding:.6rem .8rem;border-radius:10px;pointer-events:none;white-space:pre';
    document.body.appendChild(m);
    let cuadros = 0, t0 = performance.now();
    (function contar(t) {
      cuadros++;
      if (t - t0 > 1000) {
        m.textContent = 'Cuadros por segundo: ' + Math.round(cuadros * 1000 / (t - t0));
        cuadros = 0; t0 = t;
      }
      requestAnimationFrame(contar);
    })(t0);
  }

  // Gadget 3D: se carga después de la página para no demorar el inicio
  window.addEventListener('load', () => {
    const cargar = (src) => new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = mal; document.body.appendChild(s); });
    cargar('js/vendor/three.min.js').then(() => cargar('js/gadget3d.js')).then(() => {
      if (window.superGadget3D) { window.superGadget3D.pose(g3); actualizarHilo(); }
    }).catch(() => {});
  });

  // Recalcular cuando cargan fuentes e imágenes (cambian medidas)
  const refrescar = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refrescar);
  window.addEventListener('load', refrescar);
  armarHilo();
})();
