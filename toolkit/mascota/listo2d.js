// listo2d.js — LISTO, la mascota de El Euro Listo, en canvas 2D. UN MODELADO POR TIPO DE EDICIÓN (Sergio, 17-nov).
// Uso en cualquier escena HTML/canvas:  <script src="../../toolkit/mascota/listo2d.js"></script>
//   Listo2D.dibujar(ctx, { x, y, s, t, expr, pose, glow, mira, flip, alpha, estilo })
//   x, y   = punto de los PIES (centro, suelo). s = escala (1 ≈ 320 px de alto, de pies a la punta).
//   t      = tiempo en s (parpadeo, balanceo y "temblor" del dibujo a mano, deterministas).
//   expr   = 'normal' | 'feliz' | 'idea' | 'sorpresa' | 'preocupado' | 'guino' | 'habla'
//   pose   = 'reposo' | 'saludo' | 'senala' | 'senalaIzq' | 'pulgar' | 'celebra' | 'piensa' | 'brazosCruzados'
//   estilo = 'vector'   (por defecto: tipografía cinética, interfaz, móviles R4, collage)
//            'plano'    (R1 monigotes: blanco liso, ojos de punto, extremidades gruesas)
//            'ilustrado'(R3 ilustración en plano de corte: colores cálidos apagados, contorno marrón, textura)
//            'boceto'   (dibujado a mano / libreta: trazo de lápiz que tiembla a 8 fps, rotulador verde)
//            'neon'     (terminal de bolsa / datos: solo contornos de neón verde)
//            'tropical' (R8 neón tropical / mundo abierto al atardecer: contorno grueso de cómic, reflejo rosa)
//   Listo2D.pixel(ctx, {…, px}) = versión pixel art (R6). En 3D: toolkit/mascota/listo3d.js (toon, plastilina, lowpoly).
// Identidad (no cambiar en ningún estilo): silueta de bombilla, € verde, ojos grandes, casquillo de rosca, zapatillas verdes.
// El brillo es estable (regla "sin cambios de luz"): glow cambia despacio, nunca parpadea.
(function () {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const BASE = {
    halo: '34,197,94', vidrio: 'rgba(210,255,228,0.16)', sombra: null, borde: '#E8FFF1', bordeW: 6, brilloInt: true,
    euro: '#4ADE80', euroCore: '#DCFCE7', euroW: 11, euroGlow: 1, soportes: 'rgba(221,227,234,0.8)',
    ojo: '#FFFFFF', ojoBorde: '#0E1220', pupila: '#0E1220', ojos: 'grandes', boca: '#0E1220', lengua: '#F87171',
    mejilla: 'rgba(248,113,113,0.35)', reflejo: 'rgba(255,255,255,0.75)', alambre: '#DDE3EA', alambreW: 7,
    mano: '#F1F5F9', manoBorde: '#94A3B8', rosca1: '#D3D8DF', rosca2: '#8E97A5', punta: '#2B2F38',
    zapa: '#22C55E', suela: '#F8FAFC', zapaBorde: null, sombraSuelo: null, textura: false, temblor: 0, soloLinea: false, destello: 'rgba(253,224,71,0.95)',
  };
  const ESTILOS = {
    vector: {},
    plano: { halo: null, vidrio: '#F8FAFC', sombra: '#E2E8F0', borde: '#CBD5E1', bordeW: 3, brilloInt: false, euro: '#22C55E', euroCore: null, euroW: 12, euroGlow: 0,
      soportes: null, ojos: 'punto', mejilla: null, reflejo: null, alambre: '#F8FAFC', alambreW: 13, mano: '#F8FAFC', manoBorde: null,
      rosca1: '#CBD5E1', rosca2: '#94A3B8', sombraSuelo: 'rgba(0,0,0,0.28)' },
    ilustrado: { halo: '255,196,120', vidrio: '#D7EEDC', sombra: '#B7D9C0', borde: '#3B2F2A', bordeW: 4.5, brilloInt: false, euro: '#2FAE5F', euroCore: '#E9FFF0', euroGlow: 0.35,
      soportes: '#5B4A42', ojoBorde: '#3B2F2A', pupila: '#2A211D', boca: '#3B2F2A', mejilla: 'rgba(214,110,90,0.35)', reflejo: 'rgba(255,255,255,0.55)',
      alambre: '#5B4A42', alambreW: 6, mano: '#F3E9DC', manoBorde: '#3B2F2A', rosca1: '#C9C1B6', rosca2: '#968C80', punta: '#3B2F2A',
      zapa: '#3FA866', zapaBorde: '#3B2F2A', sombraSuelo: 'rgba(40,25,15,0.35)', textura: true },
    boceto: { halo: null, vidrio: 'rgba(255,255,255,0.0)', borde: '#1F2937', bordeW: 5, brilloInt: false, euro: '#16A34A', euroCore: null, euroW: 9, euroGlow: 0,
      soportes: '#1F2937', ojo: '#FFFFFF', ojoBorde: '#1F2937', mejilla: 'rgba(239,68,68,0.25)', reflejo: null, alambre: '#1F2937', alambreW: 5,
      mano: '#FFFFFF', manoBorde: '#1F2937', rosca1: '#FFFFFF', rosca2: '#E5E7EB', punta: '#1F2937', zapa: '#22C55E', zapaBorde: '#1F2937', temblor: 2.2 },
    neon: { halo: '34,197,94', vidrio: 'rgba(0,0,0,0)', borde: '#4ADE80', bordeW: 5, brilloInt: false, euro: '#4ADE80', euroCore: '#DCFCE7', euroGlow: 1,
      soportes: '#4ADE80', ojo: 'rgba(0,0,0,0)', ojoBorde: '#4ADE80', pupila: '#4ADE80', boca: '#4ADE80', lengua: '#4ADE80', mejilla: null, reflejo: null,
      alambre: '#4ADE80', alambreW: 5, mano: 'rgba(0,0,0,0)', manoBorde: '#4ADE80', rosca1: 'rgba(0,0,0,0)', rosca2: 'rgba(0,0,0,0)', punta: 'rgba(0,0,0,0)',
      zapa: 'rgba(0,0,0,0)', zapaBorde: '#4ADE80', suela: 'rgba(0,0,0,0)', soloLinea: true },
    // R8 neón tropical / mundo abierto (ambientación de atardecer en una ciudad costera, estilo arte de videojuego):
    // contorno grueso casi negro tipo cómic, cristal con reflejo rosa del atardecer y luz de borde cálida.
    tropical: { halo: '255,120,190', vidrio: 'rgba(255,196,224,0.24)', sombra: null, borde: '#160a22', bordeW: 8, brilloInt: true, euro: '#4ADE80', euroCore: '#ECFFF3', euroGlow: 1.1,
      soportes: 'rgba(255,236,250,0.85)', ojoBorde: '#160a22', pupila: '#160a22', boca: '#160a22', mejilla: 'rgba(255,92,150,0.45)', reflejo: 'rgba(255,226,196,0.9)',
      alambre: '#FFE9F6', alambreW: 8, mano: '#FFF4FA', manoBorde: '#160a22', rosca1: '#E6DDF0', rosca2: '#9C8FB3', punta: '#160a22',
      zapa: '#22C55E', zapaBorde: '#160a22', sombraSuelo: 'rgba(30,0,40,0.35)' },
  };
  let ST = BASE, TT = 0;
  // temblor de dibujo a mano: cambia 8 veces por segundo (como la animación tradicional), siempre igual para el mismo t
  const jit = (i) => { if (!ST.temblor) return 0; const k = Math.floor(TT * 8) * 13.37 + i * 7.13; const v = Math.sin(k) * 43758.5453; return (v - Math.floor(v) - 0.5) * 2 * ST.temblor; };
  function trazar(c, fn) { // en boceto, dos pasadas ligeramente desplazadas
    if (!ST.temblor) { fn(0); return; }
    c.save(); c.translate(jit(1), jit(2)); fn(1); c.restore();
    c.save(); c.globalAlpha *= 0.55; c.translate(jit(3), jit(4)); fn(2); c.restore();
  }
  function neonGlow(c, on) { if (ST.soloLinea && on) { c.shadowColor = 'rgba(74,222,128,0.9)'; c.shadowBlur = 16; } else c.shadowBlur = 0; }

  function bulbPath(c) {
    c.beginPath();
    c.moveTo(-36, 40);
    c.bezierCurveTo(-40, 10, -96, -10, -98, -88);
    c.bezierCurveTo(-100, -150, -52, -190, 0, -190);
    c.bezierCurveTo(52, -190, 100, -150, 98, -88);
    c.bezierCurveTo(96, -10, 40, 10, 36, 40);
    c.closePath();
  }
  function euro(c, glow) {
    c.save(); c.translate(4, -34); c.scale(0.9, 0.9);
    c.lineCap = 'round'; c.lineJoin = 'round';
    const trazo = () => { c.beginPath(); c.arc(4, 0, 32, Math.PI * 0.27, Math.PI * 1.73); c.moveTo(-42, -9); c.lineTo(12, -9); c.moveTo(-42, 9); c.lineTo(8, 9); c.stroke(); };
    if (ST.euroGlow) { c.shadowColor = `rgba(34,197,94,${0.9 * clamp(glow * ST.euroGlow, 0, 1.5)})`; c.shadowBlur = 26 * glow * ST.euroGlow; }
    c.strokeStyle = ST.euro; c.lineWidth = ST.euroW; trazar(c, trazo);
    c.shadowBlur = 0;
    if (ST.euroCore) { c.strokeStyle = ST.euroCore; c.lineWidth = 4; trazo(); }
    if (ST.soportes) {
      c.strokeStyle = ST.soportes; c.lineWidth = 3; neonGlow(c, true);
      c.beginPath(); c.moveTo(-6, 30); c.lineTo(-14, 82); c.moveTo(14, 26); c.lineTo(14, 82); c.stroke(); c.shadowBlur = 0;
    }
    c.restore();
  }
  function ojos(c, expr, t, mira) {
    const parp = (() => { const ph = (t + 0.7) % 3.4; return ph < 0.12 ? Math.sin(ph / 0.12 * Math.PI) : 0; })();
    const mx = (mira ? mira[0] : 0) * 7, my = (mira ? mira[1] : 0) * 6;
    neonGlow(c, true);
    for (const sx of [-1, 1]) {
      const x = sx * 36, y = -132;
      c.save(); c.translate(x, y);
      const arco = (expr === 'feliz') || (expr === 'guino' && sx === 1);
      c.lineCap = 'round';
      if (arco) {
        c.strokeStyle = ST.pupila; c.lineWidth = 8;
        trazar(c, () => { c.beginPath(); c.arc(0, 8, 17, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); });
      } else if (ST.ojos === 'punto') {
        const h = Math.max(2, 12 * (1 - 0.9 * parp)) * (expr === 'sorpresa' ? 1.3 : 1);
        c.fillStyle = ST.pupila; c.beginPath(); c.ellipse(mx * 0.6, my * 0.6, 9, h, 0, 0, 7); c.fill();
      } else {
        const ry = (expr === 'sorpresa' ? 29 : 25) * (1 - 0.9 * parp), rx = expr === 'sorpresa' ? 23 : 21;
        c.fillStyle = ST.ojo; c.strokeStyle = ST.ojoBorde; c.lineWidth = 4;
        trazar(c, () => { c.beginPath(); c.ellipse(0, 0, rx, Math.max(2, ry), 0, 0, 7); c.fill(); c.stroke(); });
        if (ry > 6) {
          const pr = expr === 'sorpresa' ? 8 : 11;
          c.fillStyle = ST.pupila; c.beginPath(); c.arc(mx, my + 2, pr, 0, 7); c.fill();
          if (!ST.soloLinea) { c.fillStyle = '#fff'; c.beginPath(); c.arc(mx + 4, my - 3, 3.6, 0, 7); c.fill(); }
        }
      }
      c.strokeStyle = ST.pupila; c.lineWidth = 6;
      if (expr === 'preocupado') { c.beginPath(); c.moveTo(-16 * sx, -34); c.lineTo(14 * sx, -40); c.stroke(); }
      if (expr === 'idea' || expr === 'sorpresa') { c.beginPath(); c.arc(0, -10, 24, Math.PI * 1.3, Math.PI * 1.7); c.stroke(); }
      c.restore();
    }
    c.shadowBlur = 0;
    if (ST.mejilla) { c.fillStyle = ST.mejilla; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 62, -102, 13, 8, 0, 0, 7); c.fill(); } }
  }
  function boca(c, expr, t) {
    c.save(); c.translate(0, -100); c.scale(0.9, 0.9); c.strokeStyle = ST.boca; c.fillStyle = ST.boca; c.lineWidth = 6; c.lineCap = 'round';
    neonGlow(c, true);
    const relleno = !ST.soloLinea;
    if (expr === 'feliz' || expr === 'idea' || expr === 'guino') {
      c.beginPath(); c.moveTo(-18, -2); c.quadraticCurveTo(0, 26, 18, -2); c.closePath(); relleno ? c.fill() : c.stroke();
      if (relleno) { c.fillStyle = ST.lengua; c.beginPath(); c.ellipse(0, 8, 7, 4, 0, 0, 7); c.fill(); }
    } else if (expr === 'sorpresa') {
      c.beginPath(); c.ellipse(0, 4, 8, 11, 0, 0, 7); relleno ? c.fill() : c.stroke();
    } else if (expr === 'preocupado') {
      c.beginPath(); c.moveTo(-14, 8); c.quadraticCurveTo(0, -4, 14, 8); c.stroke();
    } else if (expr === 'habla') {
      const a = 4 + 8 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3));
      c.beginPath(); c.ellipse(0, 4, 12, a, 0, 0, 7); relleno ? c.fill() : c.stroke();
    } else {
      c.beginPath(); c.moveTo(-13, 0); c.quadraticCurveTo(0, 12, 13, 0); c.stroke();
    }
    c.shadowBlur = 0; c.restore();
  }
  const POSES = {
    reposo: [[-104, -20], [104, -20]], saludo: [[-104, -20], [150, -205]], senala: [[-104, -20], [205, -95]],
    senalaIzq: [[-205, -95], [104, -20]], pulgar: [[-104, -20], [140, -60]], celebra: [[-150, -215], [150, -215]],
    piensa: [[-104, -20], [32, -70]], brazosCruzados: [[55, -20], [-55, -14]],
  };
  function brazo(c, sx, hombro, mano, t, pose, lado) {
    let [hx, hy] = mano;
    if (pose === 'saludo' && lado === 1) { hx += Math.sin(t * 9) * 22; hy += Math.cos(t * 9) * 6; }
    if (pose === 'celebra') hy += Math.sin(t * 7 + lado) * 8;
    if (pose === 'reposo') hy += Math.sin(t * 2.2 + lado) * 3;
    const [ax, ay] = hombro;
    const mx = (ax + hx) / 2 + sx * 18, my = (ay + hy) / 2 + 22;
    neonGlow(c, true);
    if (ST.alambreW > 10 && ST.borde) { // contorno suave para que el brazo blanco se lea sobre fondos claros
      c.strokeStyle = ST.borde; c.lineWidth = ST.alambreW + 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, hx, hy); c.stroke();
    }
    c.strokeStyle = ST.alambre; c.lineWidth = ST.alambreW; c.lineCap = 'round';
    trazar(c, () => { c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, hx, hy); c.stroke(); });
    c.fillStyle = ST.mano; c.strokeStyle = ST.manoBorde || ST.mano; c.lineWidth = 3;
    const r = ST.alambreW > 10 ? 17 : 15;
    if (pose === 'pulgar' && lado === 1) {
      // PULGAR ARRIBA (corregido el 18-nov: el dedo único en el centro parecía un dedo corazón).
      // Puño horizontal con los nudillos marcados y el pulgar saliendo por el LADO, inclinado hacia fuera.
      const k = r / 15;
      c.save(); c.translate(hx, hy); c.scale(k, k);
      const borde = ST.manoBorde || 'rgba(15,20,35,0.55)';
      c.strokeStyle = borde; c.lineWidth = 3;
      c.save(); c.translate(-12, -14); c.rotate(-0.38); // pulgar en el lado izquierdo del puño, hacia arriba y hacia fuera
      c.beginPath(); c.roundRect(-6.5, -26, 13, 30, 6.5); c.fill(); c.stroke(); c.restore();
      c.beginPath(); c.roundRect(-17, -14, 36, 30, 10); c.fill(); c.stroke(); // puño
      c.lineWidth = 2.4; c.lineCap = 'round'; // dedos doblados (líneas de los nudillos)
      for (const y of [-5, 3, 10]) { c.beginPath(); c.moveTo(-8, y); c.lineTo(12, y); c.stroke(); }
      c.restore();
    } else { c.beginPath(); c.arc(hx, hy, r, 0, 7); c.fill(); if (ST.manoBorde) c.stroke(); }
    if ((pose === 'senala' && lado === 1) || (pose === 'senalaIzq' && lado === -1)) {
      c.beginPath(); c.roundRect(hx + (lado === 1 ? 6 : -30), hy - 5, 24, 10, 5); c.fill(); if (ST.manoBorde) c.stroke();
    }
    c.shadowBlur = 0;
  }
  function textura(c) { // motas deterministas dentro del cristal (estilo ilustrado)
    c.save(); c.globalAlpha = 0.18; c.fillStyle = '#5B4A42';
    for (let i = 0; i < 140; i++) { const a = Math.sin(i * 12.9898) * 43758.5453, b = Math.sin(i * 78.233) * 12345.678;
      const x = ((a - Math.floor(a)) - 0.5) * 200, y = -190 + (b - Math.floor(b)) * 230; c.beginPath(); c.arc(x, y, 1.6 + (i % 3), 0, 7); c.fill(); }
    c.restore();
  }

  function dibujar(c, o = {}) {
    const { x = 540, y = 1400, s = 1, t = 0, expr = 'normal', pose = 'reposo', mira = [0, 0], flip = false, alpha = 1, sinPiernas = false, sinHalo = false, opaco = false } = o;
    ST = Object.assign({}, BASE, ESTILOS[o.estilo || 'vector'] || {}); TT = t;
    if (opaco) { ST.vidrio = '#163A31'; ST.brilloInt = false; }
    const glow = o.glow == null ? (expr === 'idea' ? 1.3 : expr === 'preocupado' ? 0.6 : 1) : o.glow;
    const bob = Math.sin(t * 2.4) * 4;
    c.save(); c.globalAlpha = alpha; c.translate(x, y); c.scale(s * (flip ? -1 : 1), s);
    if (ST.halo && !sinHalo) {
      const g = c.createRadialGradient(0, -210, 10, 0, -210, 230);
      g.addColorStop(0, `rgba(${ST.halo},${0.32 * glow})`); g.addColorStop(1, `rgba(${ST.halo},0)`);
      c.fillStyle = g; c.beginPath(); c.arc(0, -210, 230, 0, 7); c.fill();
    }
    if (ST.sombraSuelo) { c.fillStyle = ST.sombraSuelo; c.beginPath(); c.ellipse(0, -2, 70, 12, 0, 0, 7); c.fill(); }
    if (!sinPiernas) {
      for (const sx of [-1, 1]) {
        c.strokeStyle = ST.alambre; c.lineWidth = Math.max(8, ST.alambreW); c.lineCap = 'round'; neonGlow(c, true);
        if (ST.alambreW > 10 && ST.borde) { c.strokeStyle = ST.borde; c.lineWidth = ST.alambreW + 3; c.beginPath(); c.moveTo(sx * 15, -50 + bob * 0.5); c.lineTo(sx * 22, -16); c.stroke(); c.strokeStyle = ST.alambre; c.lineWidth = ST.alambreW; }
        trazar(c, () => { c.beginPath(); c.moveTo(sx * 15, -50 + bob * 0.5); c.lineTo(sx * 22, -16); c.stroke(); });
        c.fillStyle = ST.zapa; c.beginPath(); c.roundRect(sx * 22 - 22 + sx * 6, -22, 44, 20, 10); c.fill();
        if (ST.zapaBorde) { c.strokeStyle = ST.zapaBorde; c.lineWidth = 3; c.stroke(); }
        c.fillStyle = ST.suela; c.fillRect(sx * 22 - 20 + sx * 6, -6, 40, 5);
        c.shadowBlur = 0;
      }
    }
    c.translate(0, -78 + bob);
    const rosca = [[-36, 0, 72, 12], [-34, 12, 68, 11], [-36, 23, 72, 11], [-32, 34, 64, 10]];
    neonGlow(c, true);
    rosca.forEach(([rx, ry, rw, rh], i) => {
      c.fillStyle = i % 2 ? ST.rosca2 : ST.rosca1; c.beginPath(); c.roundRect(rx, ry - 8, rw, rh, 5); c.fill();
      if (ST.soloLinea || ST.temblor || ST.zapaBorde) { c.strokeStyle = ST.soloLinea ? ST.borde : (ST.zapaBorde || ST.borde); c.lineWidth = 2.5; trazar(c, () => { c.beginPath(); c.roundRect(rx, ry - 8, rw, rh, 5); c.stroke(); }); }
    });
    c.fillStyle = ST.punta; c.beginPath(); c.roundRect(-16, 34, 32, 14, 7); c.fill();
    if (ST.soloLinea) { c.strokeStyle = ST.borde; c.lineWidth = 2.5; c.stroke(); }
    c.shadowBlur = 0;
    c.translate(0, -48);
    const P = POSES[pose] || POSES.reposo;
    brazo(c, -1, [-90, -50], P[0], t, pose, -1);
    // cristal
    bulbPath(c); c.fillStyle = ST.vidrio; c.fill();
    c.save(); bulbPath(c); c.clip();
    if (ST.sombra) { c.fillStyle = ST.sombra; c.beginPath(); c.ellipse(70, -60, 80, 160, 0, 0, 7); c.fill(); }
    if (ST.brilloInt) {
      const gi = c.createRadialGradient(0, -60, 10, 0, -60, 150);
      gi.addColorStop(0, `rgba(34,197,94,${0.30 * glow})`); gi.addColorStop(1, 'rgba(34,197,94,0.04)');
      c.fillStyle = gi; c.fillRect(-120, -200, 240, 260);
    }
    if (ST.textura) textura(c);
    euro(c, glow);
    c.restore();
    if (ST.borde) { c.lineWidth = ST.bordeW; c.strokeStyle = ST.borde; neonGlow(c, true); trazar(c, () => { bulbPath(c); c.stroke(); }); c.shadowBlur = 0; }
    if (ST.reflejo) { c.strokeStyle = ST.reflejo; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.arc(0, -96, 72, Math.PI * 1.12, Math.PI * 1.38); c.stroke(); }
    ojos(c, expr, t, mira);
    boca(c, expr, t);
    brazo(c, 1, [90, -50], P[1], t, pose, 1);
    if (expr === 'idea') {
      c.save(); c.translate(0, -120); c.strokeStyle = ST.soloLinea ? ST.borde : ST.destello; c.lineWidth = 7; c.lineCap = 'round'; neonGlow(c, true);
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.42 + Math.sin(t * 1.5) * 0.03; c.beginPath(); c.moveTo(Math.cos(a) * 112, Math.sin(a) * 112); c.lineTo(Math.cos(a) * 140, Math.sin(a) * 140); c.stroke(); }
      c.restore();
    }
    c.restore();
  }
  // Versión pixel art (R6): dibuja a baja resolución y escala sin suavizado.
  function pixel(c, o = {}) {
    const { x = 540, y = 1400, s = 1, px = 6 } = o;
    const W = Math.ceil(420 * s / px), H = Math.ceil(420 * s / px);
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const oc = off.getContext('2d'); oc.imageSmoothingEnabled = false;
    dibujar(oc, Object.assign({}, o, { x: W / 2, y: H - 2, s: s / px, glow: 0.35, sinHalo: true, opaco: true, estilo: 'vector' }));
    const im = oc.getImageData(0, 0, W, H); for (let i = 3; i < im.data.length; i += 4) im.data[i] = im.data[i] > 90 ? 255 : 0; oc.putImageData(im, 0, 0);
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(off, x - W * px / 2, y - H * px, W * px, H * px); c.restore();
  }
  window.Listo2D = { dibujar, pixel, POSES, ESTILOS: Object.keys(ESTILOS).concat(['pixel']) };
})();
