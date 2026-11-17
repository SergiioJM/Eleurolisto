// listo2d.js — LISTO, la mascota de El Euro Listo, en canvas 2D. UN MODELADO POR TIPO DE EDICIÓN (Sergio, 17-nov).
// Uso en cualquier escena HTML/canvas:  <script src="../../toolkit/mascota/listo2d.js"></script>
//   Listo2D.dibujar(ctx, { x, y, s, t, expr, pose, glow, mira, flip, alpha, estilo })
//   x, y   = punto de los PIES (centro, suelo). s = escala (1 ≈ 320 px de alto, de pies a la punta).
//   t      = tiempo en s (parpadeo, balanceo y "temblor" del dibujo a mano, deterministas).
//   expr   = 'normal' | 'feliz' | 'idea' | 'sorpresa' | 'preocupado' | 'guino' | 'habla'
//   pose   = 'reposo' | 'saludo' | 'senala' | 'senalaIzq' | 'pulgar' | 'celebra' | 'piensa' | 'brazosCruzados'
//            | 'manosCadera' (en jarras) | 'brazosAbiertos' | 'moneda' (enseña una moneda de 1 €)
//   estilo = 'vector'   (por defecto: tipografía cinética, interfaz, móviles R4, collage)
//            'plano'    (R1 monigotes: blanco liso, ojos de punto, extremidades gruesas)
//            'ilustrado'(R3 ilustración en plano de corte: colores cálidos apagados, contorno marrón, textura)
//            'boceto'   (dibujado a mano / libreta: trazo de lápiz que tiembla a 8 fps, rotulador verde)
//            'neon'     (terminal de bolsa / datos: solo contornos de neón verde)
//            'tropical' (R8 neón tropical / mundo abierto al atardecer: contorno grueso de cómic, reflejo rosa)
//   acc    = ['gafas','monoculo','chistera','corona','cadena','pajarita','billetes','gorroRoto','parche','bufandaRota','bolsillos','mosca']
//   modo   = 'vacilon' | 'rico' | 'millonario' | 'arruinado' (atajos de acc). accK = { gafas: 0..1 } anima la entrada.
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
  let ST = BASE, TT = 0, ACC = new Set(), ACCK = {};
  // ACCESORIOS (Sergio, 18-nov: "gafas de sol en modo vacileta, algo de lujo si hablas de riqueza o ropa mala si hablas
  // de estar arruinado"). Se ponen ENCIMA del diseño: el € verde, los ojos (salvo con gafas), el casquillo y las
  // zapatillas siguen visibles. Manos siempre redondas, sin dedos.
  const MODOS = {
    vacilon: ['gafas', 'cadena'],
    rico: ['chistera', 'monoculo', 'pajarita'],
    millonario: ['corona', 'gafas', 'cadena', 'billetes'],
    arruinado: ['gorroRoto', 'parche', 'bufandaRota', 'bolsillos', 'mosca'],
  };
  const ACCESORIOS = ['gafas', 'monoculo', 'chistera', 'corona', 'cadena', 'pajarita', 'billetes', 'gorroRoto', 'parche', 'bufandaRota', 'bolsillos', 'mosca'];
  const kA = (n) => (ACCK[n] == null ? 1 : Math.max(0, Math.min(1, ACCK[n]))); // progreso de entrada (0..1) de cada accesorio
  const LINEA = () => ST.soloLinea;
  function relleno(c, col) { if (LINEA()) { c.strokeStyle = ST.borde; c.lineWidth = 3; c.stroke(); } else { c.fillStyle = col; c.fill(); } }
  function contorno(c, col = '#1a1410', w = 3) { if (LINEA()) return; c.strokeStyle = ST.temblor ? '#1F2937' : col; c.lineWidth = w; c.stroke(); }
  function accCabeza(c, t) { // se dibuja después de la cara
    if (ACC.has('gorroRoto')) { const k = kA('gorroRoto'); c.save(); c.globalAlpha *= k; c.translate(0, -(1 - k) * 60);
      c.beginPath(); c.moveTo(-74, -160); c.bezierCurveTo(-80, -262, 80, -262, 74, -160); c.closePath(); relleno(c, '#7a6a58'); contorno(c);
      if (!LINEA()) { c.fillStyle = '#5b4d3f'; c.beginPath(); c.ellipse(-30, -196, 9, 6, 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(34, -184, 7, 5, -0.2, 0, 7); c.fill();
        c.fillStyle = '#a08a6a'; c.beginPath(); c.rect(8, -226, 26, 22); c.fill(); c.strokeStyle = '#3d3226'; c.lineWidth = 2; c.setLineDash([4, 4]); c.stroke(); c.setLineDash([]); }
      c.beginPath(); c.roundRect(-80, -172, 160, 22, 8); relleno(c, '#5f5142'); contorno(c);
      c.strokeStyle = LINEA() ? ST.borde : '#cbbfa8'; c.lineWidth = 3; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; c.beginPath(); c.moveTo(0, -236); c.lineTo(Math.cos(a) * 17, -236 + Math.sin(a) * 17); c.stroke(); }
      c.restore(); }
    if (ACC.has('chistera')) { const k = kA('chistera'); c.save(); c.globalAlpha *= k; c.translate(0, -186 - (1 - k) * 80); c.rotate(-0.12);
      c.beginPath(); c.roundRect(-50, -118, 100, 118, 8); relleno(c, '#16161c'); contorno(c, '#000');
      if (!LINEA()) { c.fillStyle = '#b91c1c'; c.fillRect(-50, -30, 100, 18); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-34, -104); c.lineTo(-34, -40); c.stroke(); }
      c.beginPath(); c.ellipse(0, 0, 84, 14, 0, 0, 7); relleno(c, '#0f0f14'); contorno(c, '#000'); c.restore(); }
    if (ACC.has('corona')) { const k = kA('corona'); c.save(); c.globalAlpha *= k; c.translate(0, -178 - (1 - k) * 80); c.rotate(0.06);
      c.beginPath(); c.moveTo(-62, 0); c.lineTo(-62, -30); c.lineTo(-56, -78); c.lineTo(-34, -40); c.lineTo(-16, -86); c.lineTo(0, -44); c.lineTo(16, -86); c.lineTo(34, -40); c.lineTo(56, -78); c.lineTo(62, -30); c.lineTo(62, 0); c.closePath();
      relleno(c, '#F5B700'); contorno(c, '#92400E');
      if (!LINEA()) { [[-40, -14, '#ef4444'], [0, -14, '#22c55e'], [40, -14, '#3b82f6']].forEach(([x, y, col]) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill(); });
        c.fillStyle = '#fff6c2'; [[-56, -80], [-16, -88], [16, -88], [56, -80]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); }); }
      c.restore(); }
    if (ACC.has('gafas')) { const k = kA('gafas'); c.save(); c.globalAlpha *= k; c.translate(0, -(1 - k) * 90);
      c.strokeStyle = LINEA() ? ST.borde : '#07090d'; c.lineWidth = 6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-72, -138); c.lineTo(-96, -148); c.moveTo(72, -138); c.lineTo(96, -148); c.moveTo(-8, -136); c.quadraticCurveTo(0, -142, 8, -136); c.stroke();
      for (const sx of [-1, 1]) { c.beginPath(); c.roundRect(sx * 40 - 33, -154, 66, 44, [10, 10, 18, 18]); relleno(c, '#0b0f17'); if (!LINEA()) { c.strokeStyle = '#000'; c.lineWidth = 4; c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 5; c.beginPath(); c.moveTo(sx * 40 - 20, -128); c.lineTo(sx * 40 - 8, -146); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(sx * 40 - 6, -126); c.lineTo(sx * 40 + 2, -138); c.stroke(); } }
      c.restore(); }
    if (ACC.has('monoculo')) { const k = kA('monoculo'); c.save(); c.globalAlpha *= k;
      c.strokeStyle = LINEA() ? ST.borde : '#F59E0B'; c.lineWidth = 6; c.beginPath(); c.arc(36, -132, 31, 0, 7); c.stroke();
      if (!LINEA()) { c.fillStyle = 'rgba(200,230,255,.18)'; c.fill(); } c.lineWidth = 2.5; c.beginPath(); c.moveTo(64, -118); c.quadraticCurveTo(84, -80, 70, -38); c.stroke(); c.restore(); }
    if (ACC.has('parche')) { const k = kA('parche'); c.save(); c.globalAlpha *= k;
      c.save(); c.translate(-64, -86); c.rotate(0.22); c.beginPath(); c.roundRect(-22, -18, 44, 36, 4); relleno(c, '#d6b98c'); contorno(c, '#6b4f2a');
      if (!LINEA()) { c.strokeStyle = '#6b4f2a'; c.lineWidth = 2; c.setLineDash([4, 4]); c.strokeRect(-16, -12, 32, 24); c.setLineDash([]); } c.restore();
      c.strokeStyle = LINEA() ? ST.borde : 'rgba(30,25,20,.75)'; c.lineWidth = 3; c.lineJoin = 'round'; c.beginPath(); c.moveTo(78, -150); c.lineTo(64, -140); c.lineTo(72, -128); c.lineTo(58, -114); c.moveTo(64, -140); c.lineTo(50, -146); c.stroke();
      c.save(); c.translate(60, -78); c.rotate(-0.5); c.beginPath(); c.roundRect(-28, -9, 56, 18, 9); relleno(c, '#f2c9a0'); contorno(c, '#b07a52', 2);
      if (!LINEA()) { c.fillStyle = '#e0a97c'; c.fillRect(-9, -7, 18, 14); } c.restore(); c.restore(); }
    if (ACC.has('mosca')) { const k = kA('mosca'); c.save(); c.globalAlpha *= k; const mx = 108 + Math.sin(t * 6.3) * 32, my = -222 + Math.sin(t * 9.7) * 20;
      c.strokeStyle = LINEA() ? ST.borde : 'rgba(30,30,30,.35)'; c.lineWidth = 2; c.setLineDash([3, 6]); c.beginPath(); c.arc(108, -222, 30, 0.3, 2.5); c.stroke(); c.setLineDash([]);
      c.translate(mx, my); const ala = 0.35 + 0.65 * Math.abs(Math.sin(t * 38)); c.fillStyle = LINEA() ? 'rgba(0,0,0,0)' : 'rgba(220,235,255,.85)';
      c.beginPath(); c.ellipse(-5, -7, 7, 4 * ala + 1, -0.6, 0, 7); c.fill(); c.beginPath(); c.ellipse(5, -7, 7, 4 * ala + 1, 0.6, 0, 7); c.fill();
      c.beginPath(); c.ellipse(0, 0, 7, 5, 0, 0, 7); relleno(c, '#111'); c.restore(); }
  }
  function accCuello(c, t) { // collar, pajarita, bufanda y bolsillos (encima del casquillo)
    if (ACC.has('bolsillos')) { const k = kA('bolsillos'); c.save(); c.globalAlpha *= k;
      for (const sx of [-1, 1]) { c.save(); c.translate(sx * 44, 58); c.rotate(sx * 0.35 + Math.sin(t * 3 + sx) * 0.06); c.beginPath(); c.moveTo(-12, 0); c.lineTo(12, 0); c.quadraticCurveTo(14, 30, 0, 36); c.quadraticCurveTo(-14, 30, -12, 0); c.closePath(); relleno(c, '#f8fafc'); contorno(c, '#94a3b8', 2.5); c.restore(); }
      c.restore(); }
    if (ACC.has('bufandaRota')) { const k = kA('bufandaRota'); c.save(); c.globalAlpha *= k;
      c.beginPath(); c.roundRect(-46, 30, 92, 24, 10); relleno(c, '#9f2d2d'); contorno(c, '#4a1414');
      c.beginPath(); c.moveTo(22, 46); c.lineTo(40, 46); c.lineTo(58, 116); c.lineTo(50, 108); c.lineTo(46, 120); c.lineTo(38, 110); c.lineTo(32, 118); c.closePath(); relleno(c, '#8c2626'); contorno(c, '#4a1414');
      if (!LINEA()) { c.fillStyle = '#2a0a0a'; [[-24, 40], [4, 44], [44, 82]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 5, 3.5, 0, 0, 7); c.fill(); }); c.strokeStyle = '#d97b7b'; c.lineWidth = 2; for (let x = -38; x < 40; x += 12) { c.beginPath(); c.moveTo(x, 33); c.lineTo(x + 4, 51); c.stroke(); } }
      c.restore(); }
    if (ACC.has('pajarita')) { const k = kA('pajarita'); c.save(); c.globalAlpha *= k; c.translate(0, 46); c.scale(0.4 + 0.6 * k, 0.4 + 0.6 * k);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-34, -16); c.lineTo(-34, 16); c.closePath(); c.moveTo(0, 0); c.lineTo(34, -16); c.lineTo(34, 16); c.closePath(); relleno(c, '#dc2626'); contorno(c, '#450a0a');
      c.beginPath(); c.roundRect(-8, -8, 16, 16, 4); relleno(c, '#991b1b'); contorno(c, '#450a0a'); c.restore(); }
    if (ACC.has('cadena')) { const k = kA('cadena'); c.save(); c.globalAlpha *= k;
      c.strokeStyle = LINEA() ? ST.borde : '#F5B700'; c.lineWidth = 3;
      for (let i = 0; i <= 14; i++) { const u = i / 14, x = -40 + 80 * u, y = 44 + Math.sin(u * Math.PI) * 50; c.beginPath(); c.ellipse(x, y, 6, 4, Math.cos(u * Math.PI) * 0.9, 0, 7); c.stroke(); }
      c.translate(0, 108); c.rotate(Math.sin(t * 2.2) * 0.12); c.beginPath(); c.moveTo(0, -16); c.lineTo(15, 0); c.lineTo(0, 18); c.lineTo(-15, 0); c.closePath(); relleno(c, '#bff3ff'); contorno(c, '#0e7490', 2.5);
      if (!LINEA()) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(-5, -4); c.lineTo(0, -10); c.stroke(); } c.restore(); }
  }
  function accMano(c, hx, hy, t) { // billetes en abanico detrás de la mano derecha
    if (!ACC.has('billetes')) return; const k = kA('billetes'); c.save(); c.globalAlpha *= k; c.translate(hx, hy);
    for (let i = 0; i < 4; i++) { c.save(); c.rotate(-0.7 + i * 0.32 + Math.sin(t * 3) * 0.03); c.beginPath(); c.roundRect(-14, -78, 30, 64, 4); relleno(c, i % 2 ? '#22c55e' : '#16a34a'); contorno(c, '#14532d', 2.5);
      if (!LINEA()) { c.fillStyle = '#dcfce7'; c.font = '800 20px Poppins, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('€', 1, -46); } c.restore(); }
    c.restore();
  }
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
    senalaIzq: [[-205, -95], [104, -20]], pulgar: [[-104, -20], [150, -120]], celebra: [[-150, -215], [150, -215]],
    piensa: [[-104, -20], [32, -70]], brazosCruzados: [[55, -20], [-55, -14]],
    manosCadera: [[-74, -12], [74, -12]], brazosAbiertos: [[-215, -75], [215, -75]], moneda: [[-104, -20], [165, -165]],
  };
  function brazo(c, sx, hombro, mano, t, pose, lado) {
    let [hx, hy] = mano;
    if (pose === 'saludo' && lado === 1) { hx += Math.sin(t * 9) * 22; hy += Math.cos(t * 9) * 6; }
    if (pose === 'celebra') hy += Math.sin(t * 7 + lado) * 8;
    if (pose === 'reposo') hy += Math.sin(t * 2.2 + lado) * 3;
    const [ax, ay] = hombro;
    const jarras = pose === 'manosCadera';
    const mx = (ax + hx) / 2 + sx * (jarras ? 78 : 18), my = (ay + hy) / 2 + (jarras ? -4 : 22);
    neonGlow(c, true);
    if (ST.alambreW > 10 && ST.borde) { // contorno suave para que el brazo blanco se lea sobre fondos claros
      c.strokeStyle = ST.borde; c.lineWidth = ST.alambreW + 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, hx, hy); c.stroke();
    }
    c.strokeStyle = ST.alambre; c.lineWidth = ST.alambreW; c.lineCap = 'round';
    trazar(c, () => { c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, hx, hy); c.stroke(); });
    c.fillStyle = ST.mano; c.strokeStyle = ST.manoBorde || ST.mano; c.lineWidth = 3;
    const r = ST.alambreW > 10 ? 17 : 15;
    // MANOS SIEMPRE REDONDAS, SIN DEDOS (Sergio, 18-nov: "evita los dedos en el vídeo, solo con las manos en forma de
    // círculo queda bien"). La pose 'pulgar' es ahora la mano redonda en alto junto a la cara (firma) y 'senala' es el
    // brazo estirado: nunca se dibuja un dedo (ni pulgar ni índice).
    if (lado === 1) accMano(c, hx, hy, TT);
    const rr = pose === 'pulgar' && lado === 1 ? r * 1.15 : r;
    c.beginPath(); c.arc(hx, hy, rr, 0, 7); c.fill(); if (ST.manoBorde) c.stroke();
    if (pose === 'moneda' && lado === 1) { // enseña una moneda de 1 € grande en la mano
      c.save(); c.translate(hx + 6, hy - 46); c.shadowBlur = 0;
      c.fillStyle = '#B45309'; c.beginPath(); c.arc(0, 5, 44, 0, 7); c.fill();
      c.fillStyle = '#F59E0B'; c.beginPath(); c.arc(0, 0, 44, 0, 7); c.fill();
      c.strokeStyle = '#FCD34D'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 33, 0, 7); c.stroke();
      if (ST.manoBorde || ST.borde) { c.strokeStyle = ST.manoBorde || ST.borde; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 44, 0, 7); c.stroke(); }
      c.fillStyle = '#92400E'; c.font = '800 46px Poppins, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('€', 0, 3);
      c.restore();
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
    ACC = new Set([...(o.modo ? MODOS[o.modo] || [] : []), ...(o.acc || [])]); ACCK = o.accK || {};
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
    accCuello(c, t);
    accCabeza(c, t);
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
  window.Listo2D = { dibujar, pixel, POSES, ESTILOS: Object.keys(ESTILOS).concat(['pixel']), MODOS, ACCESORIOS };
})();
