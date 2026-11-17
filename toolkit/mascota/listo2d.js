// listo2d.js — LISTO, la mascota de El Euro Listo, dibujado en canvas 2D (vector plano).
// Uso en cualquier escena HTML/canvas:  <script src="../../toolkit/mascota/listo2d.js"></script>
//   Listo2D.dibujar(ctx, { x, y, s, t, expr, pose, glow, mira, flip, alpha, sinPiernas })
//   x, y   = punto de los PIES (centro, suelo). s = escala (1 ≈ 320 px de alto, de pies a la punta de la bombilla).
//   t      = tiempo en s (parpadeo y balanceo deterministas).
//   expr   = 'normal' | 'feliz' | 'idea' | 'sorpresa' | 'preocupado' | 'guino' | 'habla'
//   pose   = 'reposo' | 'saludo' | 'senala' | 'senalaIzq' | 'pulgar' | 'celebra' | 'piensa' | 'brazosCruzados'
//   glow   = 0..1.5 intensidad del brillo verde (SIEMPRE estable: cambia despacio, nunca parpadea).
//   mira   = [-1..1, -1..1] dirección de las pupilas. flip = true lo refleja en horizontal.
// Identidad (no cambiar): bombilla de cristal con el filamento en forma de € verde neón (= foto de perfil),
// ojos grandes en el cristal, brazos de alambre fino, casquillo de rosca plateado y zapatillas verdes.
(function () {
  const COL = {
    neon: '#4ADE80', neonCore: '#DCFCE7', glow: '34,197,94', vidrio: 'rgba(210,255,228,0.16)', borde: '#E8FFF1',
    alambre: '#DDE3EA', rosca1: '#D3D8DF', rosca2: '#8E97A5', punta: '#2B2F38', ojo: '#FFFFFF', pupila: '#0E1220',
    zapa: '#22C55E', suela: '#F8FAFC', boca: '#0E1220', lengua: '#F87171', mejilla: 'rgba(248,113,113,0.35)',
  };
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  function bulbPath(c) { // silueta del cristal (origen en el centro del cuello, y hacia arriba negativo)
    c.beginPath();
    c.moveTo(-36, 40);
    c.bezierCurveTo(-40, 10, -96, -10, -98, -88);
    c.bezierCurveTo(-100, -150, -52, -190, 0, -190);
    c.bezierCurveTo(52, -190, 100, -150, 98, -88);
    c.bezierCurveTo(96, -10, 40, 10, 36, 40);
    c.closePath();
  }
  function euro(c, glow) { // filamento en forma de €, centrado en (4,-40)
    c.save(); c.translate(4, -34); c.scale(0.9, 0.9);
    c.lineCap = 'round'; c.lineJoin = 'round';
    const trazo = () => { c.beginPath(); c.arc(4, 0, 32, Math.PI * 0.27, Math.PI * 1.73); c.moveTo(-42, -9); c.lineTo(12, -9); c.moveTo(-42, 9); c.lineTo(8, 9); c.stroke(); };
    c.shadowColor = `rgba(${COL.glow},${0.9 * clamp(glow, 0, 1.5)})`; c.shadowBlur = 26 * glow;
    c.strokeStyle = COL.neon; c.lineWidth = 11; trazo();
    c.shadowBlur = 0; c.strokeStyle = COL.neonCore; c.lineWidth = 4; trazo();
    // soportes del filamento hasta el cuello
    c.strokeStyle = 'rgba(221,227,234,0.8)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-6, 30); c.lineTo(-14, 82); c.moveTo(14, 26); c.lineTo(14, 82); c.stroke();
    c.restore();
  }
  function ojos(c, expr, t, mira) {
    const parp = (() => { const ph = (t + 0.7) % 3.4; return ph < 0.12 ? Math.sin(ph / 0.12 * Math.PI) : 0; })();
    const mx = (mira ? mira[0] : 0) * 7, my = (mira ? mira[1] : 0) * 6;
    for (const sx of [-1, 1]) {
      const x = sx * 36, y = -132;
      c.save(); c.translate(x, y);
      const arco = (expr === 'feliz') || (expr === 'guino' && sx === 1);
      if (arco) { // ojo cerrado sonriente ^
        c.strokeStyle = COL.pupila; c.lineWidth = 8; c.lineCap = 'round';
        c.beginPath(); c.arc(0, 8, 17, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      } else {
        const ry = (expr === 'sorpresa' ? 29 : 25) * (1 - 0.9 * parp), rx = expr === 'sorpresa' ? 23 : 21;
        c.fillStyle = COL.ojo; c.strokeStyle = COL.pupila; c.lineWidth = 4;
        c.beginPath(); c.ellipse(0, 0, rx, Math.max(2, ry), 0, 0, 7); c.fill(); c.stroke();
        if (ry > 6) {
          const pr = expr === 'sorpresa' ? 8 : 11;
          c.fillStyle = COL.pupila; c.beginPath(); c.arc(mx, my + 2, pr, 0, 7); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(mx + 4, my - 3, 3.6, 0, 7); c.fill();
        }
      }
      if (expr === 'preocupado') { // cejas caídas hacia fuera
        c.strokeStyle = COL.pupila; c.lineWidth = 6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-16 * sx, -34); c.lineTo(14 * sx, -40); c.stroke();
      }
      if (expr === 'idea' || expr === 'sorpresa') {
        c.strokeStyle = COL.pupila; c.lineWidth = 6; c.lineCap = 'round';
        c.beginPath(); c.arc(0, -10, 24, Math.PI * 1.3, Math.PI * 1.7); c.stroke();
      }
      c.restore();
    }
    // mejillas
    c.fillStyle = COL.mejilla;
    for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 62, -102, 13, 8, 0, 0, 7); c.fill(); }
  }
  function boca(c, expr, t) {
    c.save(); c.translate(0, -100); c.scale(0.9, 0.9); c.strokeStyle = COL.boca; c.fillStyle = COL.boca; c.lineWidth = 6; c.lineCap = 'round';
    if (expr === 'feliz' || expr === 'idea' || expr === 'guino') {
      c.beginPath(); c.moveTo(-18, -2); c.quadraticCurveTo(0, 26, 18, -2); c.closePath(); c.fill();
      c.fillStyle = COL.lengua; c.beginPath(); c.ellipse(0, 8, 7, 4, 0, 0, 7); c.fill();
    } else if (expr === 'sorpresa') {
      c.beginPath(); c.ellipse(0, 4, 8, 11, 0, 0, 7); c.fill();
    } else if (expr === 'preocupado') {
      c.beginPath(); c.moveTo(-14, 8); c.quadraticCurveTo(0, -4, 14, 8); c.stroke();
    } else if (expr === 'habla') {
      const a = 4 + 8 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3));
      c.beginPath(); c.ellipse(0, 4, 12, a, 0, 0, 7); c.fill();
    } else {
      c.beginPath(); c.moveTo(-13, 0); c.quadraticCurveTo(0, 12, 13, 0); c.stroke();
    }
    c.restore();
  }
  // brazos de alambre: hombro en el lateral del cristal; mano = bolita
  const POSES = {
    reposo: [[-104, -20], [104, -20]],
    saludo: [[-104, -20], [150, -205]],
    senala: [[-104, -20], [205, -95]],
    senalaIzq: [[-205, -95], [104, -20]],
    pulgar: [[-104, -20], [140, -60]],
    celebra: [[-150, -215], [150, -215]],
    piensa: [[-104, -20], [32, -70]],
    brazosCruzados: [[55, -20], [-55, -14]],
  };
  function brazo(c, sx, hombro, mano, t, pose, lado) {
    let [hx, hy] = mano;
    if (pose === 'saludo' && lado === 1) { hx += Math.sin(t * 9) * 22; hy += Math.cos(t * 9) * 6; }
    if (pose === 'celebra') hy += Math.sin(t * 7 + lado) * 8;
    if (pose === 'reposo') hy += Math.sin(t * 2.2 + lado) * 3;
    const [ax, ay] = hombro;
    const mx = (ax + hx) / 2 + sx * 18, my = (ay + hy) / 2 + 22; // codo suave
    c.strokeStyle = COL.alambre; c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, hx, hy); c.stroke();
    c.fillStyle = '#F1F5F9'; c.strokeStyle = '#94A3B8'; c.lineWidth = 3;
    c.beginPath(); c.arc(hx, hy, 15, 0, 7); c.fill(); c.stroke();
    if (pose === 'pulgar' && lado === 1) { c.fillStyle = '#F1F5F9'; c.beginPath(); c.roundRect(hx - 5, hy - 34, 11, 24, 6); c.fill(); c.stroke(); }
    if ((pose === 'senala' && lado === 1) || (pose === 'senalaIzq' && lado === -1)) {
      c.beginPath(); c.roundRect(hx + (lado === 1 ? 6 : -30), hy - 5, 24, 10, 5); c.fill(); c.stroke();
    }
  }

  function dibujar(c, o = {}) {
    const { x = 540, y = 1400, s = 1, t = 0, expr = 'normal', pose = 'reposo', mira = [0, 0], flip = false, alpha = 1, sinPiernas = false, sinHalo = false, opaco = false } = o;
    let glow = o.glow == null ? (expr === 'idea' ? 1.3 : expr === 'preocupado' ? 0.6 : 1) : o.glow;
    const bob = Math.sin(t * 2.4) * 4;
    c.save(); c.globalAlpha = alpha; c.translate(x, y); c.scale(s * (flip ? -1 : 1), s);
    // halo verde estable
    const g = c.createRadialGradient(0, -210, 10, 0, -210, 230);
    g.addColorStop(0, `rgba(${COL.glow},${0.32 * glow})`); g.addColorStop(1, `rgba(${COL.glow},0)`);
    if (!sinHalo) { c.fillStyle = g; c.beginPath(); c.arc(0, -210, 230, 0, 7); c.fill(); }
    // piernas y zapatillas
    if (!sinPiernas) {
      c.strokeStyle = COL.alambre; c.lineWidth = 8; c.lineCap = 'round';
      for (const sx of [-1, 1]) {
        c.beginPath(); c.moveTo(sx * 15, -50 + bob * 0.5); c.lineTo(sx * 22, -16); c.stroke();
        c.fillStyle = COL.zapa; c.beginPath(); c.roundRect(sx * 22 - 22 + sx * 6, -22, 44, 20, 10); c.fill();
        c.fillStyle = COL.suela; c.fillRect(sx * 22 - 20 + sx * 6, -6, 40, 5);
      }
    }
    c.translate(0, -78 + bob); // sistema del cuerpo: origen en la base del cristal (cuello)
    // casquillo de rosca
    const rosca = [[-36, 0, 72, 12], [-34, 12, 68, 11], [-36, 23, 72, 11], [-32, 34, 64, 10]];
    rosca.forEach(([rx, ry, rw, rh], i) => { c.fillStyle = i % 2 ? COL.rosca2 : COL.rosca1; c.beginPath(); c.roundRect(rx, ry - 8, rw, rh, 5); c.fill(); });
    c.fillStyle = COL.punta; c.beginPath(); c.roundRect(-16, 34, 32, 14, 7); c.fill();
    c.translate(0, -48);
    // brazos detrás del cristal (el izquierdo) y delante (el derecho) para dar volumen
    const P = POSES[pose] || POSES.reposo;
    brazo(c, -1, [-90, -50], P[0], t, pose, -1);
    // cristal
    bulbPath(c);
    c.fillStyle = opaco ? '#163A31' : COL.vidrio; c.fill();
    c.save(); bulbPath(c); c.clip();
    const gi = c.createRadialGradient(0, -60, 10, 0, -60, 150);
    gi.addColorStop(0, `rgba(${COL.glow},${0.30 * glow})`); gi.addColorStop(1, `rgba(${COL.glow},0.04)`);
    if (!opaco) { c.fillStyle = gi; c.fillRect(-120, -200, 240, 260); }
    euro(c, glow);
    c.restore();
    c.lineWidth = 6; c.strokeStyle = COL.borde; bulbPath(c); c.stroke();
    // reflejo
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 8; c.lineCap = 'round';
    c.beginPath(); c.arc(0, -96, 72, Math.PI * 1.12, Math.PI * 1.38); c.stroke();
    // cara
    ojos(c, expr, t, mira);
    boca(c, expr, t);
    brazo(c, 1, [90, -50], P[1], t, pose, 1);
    if (expr === 'idea') { // destellos fijos alrededor (sin parpadeo: solo giran despacio)
      c.save(); c.translate(0, -120); c.strokeStyle = `rgba(253,224,71,0.95)`; c.lineWidth = 7; c.lineCap = 'round';
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.42 + Math.sin(t * 1.5) * 0.03; c.beginPath(); c.moveTo(Math.cos(a) * 112, Math.sin(a) * 112); c.lineTo(Math.cos(a) * 140, Math.sin(a) * 140); c.stroke(); }
      c.restore();
    }
    c.restore();
  }
  // Versión pixel art (para el look R6): dibuja a baja resolución y escala sin suavizado.
  function pixel(c, o = {}) {
    const { x = 540, y = 1400, s = 1, px = 6 } = o;
    const W = Math.ceil(420 * s / px), H = Math.ceil(420 * s / px);
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const oc = off.getContext('2d'); oc.imageSmoothingEnabled = false;
    dibujar(oc, Object.assign({}, o, { x: W / 2, y: H - 2, s: s / px * 1.0, glow: 0.35, sinHalo: true, opaco: true }));
    // cuantiza alfa para bordes duros
    const im = oc.getImageData(0, 0, W, H); for (let i = 3; i < im.data.length; i += 4) im.data[i] = im.data[i] > 90 ? 255 : 0; oc.putImageData(im, 0, 0);
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(off, x - W * px / 2, y - H * px, W * px, H * px); c.restore();
  }
  window.Listo2D = { dibujar, pixel, POSES, COL };
})();
