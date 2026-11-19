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
//   estilo += 'comic' (contorno grueso + trama), 'papel' (recortable con sombra), 'plano_tecnico' (líneas de plano), 'vaporwave'
//   pegatina = { color: '#fff', grosor: 10 } añade contorno de pegatina a CUALQUIER estilo (ideal sobre vídeo real)
//   anim   = 'entrada'|'salto'|'giro'|'baile'|'temblor'|'cohete'|'desinfla'|'rebote'|'asoma'|'mirarAtras' con animT = s desde que empieza
//   dx, dy, sqx, sqy, rot = transformación manual (squash & stretch)
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
    // NUEVOS (laboratorio de estilos, 18-nov: "no tengas miedo a improvisar estilos nuevos")
    comic: { halo: null, vidrio: '#8be3b2', sombra: '#5fcf92', borde: '#111111', bordeW: 9, brilloInt: false, euro: '#0f7a3c', euroCore: '#d9ffe9', euroW: 12, euroGlow: 0,
      soportes: '#111111', ojoBorde: '#111111', pupila: '#111111', boca: '#111111', mejilla: 'rgba(239,68,68,0.55)', reflejo: 'rgba(255,255,255,0.95)',
      alambre: '#111111', alambreW: 7, mano: '#ffffff', manoBorde: '#111111', rosca1: '#e5e7eb', rosca2: '#9ca3af', punta: '#111111', zapa: '#22C55E', zapaBorde: '#111111', trama: true },
    papel: { halo: null, vidrio: '#cdeedb', sombra: '#b3e2c6', borde: null, bordeW: 0, brilloInt: false, euro: '#1f9d55', euroCore: null, euroW: 13, euroGlow: 0,
      soportes: '#7c8a80', ojoBorde: '#2b2b2b', pupila: '#2b2b2b', boca: '#2b2b2b', mejilla: 'rgba(230,110,110,0.45)', reflejo: 'rgba(255,255,255,0.7)',
      alambre: '#efe6d6', alambreW: 9, mano: '#f6efe2', manoBorde: null, rosca1: '#d8d2c8', rosca2: '#b5ab9c', punta: '#5a5148', zapa: '#2fae5f', textura: true, sombraPapel: true },
    plano_tecnico: { halo: '125,211,252', vidrio: 'rgba(0,0,0,0)', borde: '#e0f2fe', bordeW: 4, brilloInt: false, euro: '#e0f2fe', euroCore: null, euroW: 7, euroGlow: 0,
      soportes: '#e0f2fe', ojo: 'rgba(0,0,0,0)', ojoBorde: '#e0f2fe', pupila: '#e0f2fe', boca: '#e0f2fe', lengua: '#e0f2fe', mejilla: null, reflejo: null,
      alambre: '#e0f2fe', alambreW: 4, mano: 'rgba(0,0,0,0)', manoBorde: '#e0f2fe', rosca1: 'rgba(0,0,0,0)', rosca2: 'rgba(0,0,0,0)', punta: 'rgba(0,0,0,0)',
      zapa: 'rgba(0,0,0,0)', zapaBorde: '#e0f2fe', suela: 'rgba(0,0,0,0)', soloLinea: true, sinNeon: true, cotas: true },
    vaporwave: { halo: '255,113,206', vidrio: 'rgba(255,170,230,0.28)', sombra: null, borde: '#fdf4ff', bordeW: 6, brilloInt: true, euro: '#5ef2ff', euroCore: '#f0feff', euroGlow: 1.2,
      soportes: 'rgba(240,254,255,.8)', mejilla: 'rgba(255,113,206,0.5)', reflejo: 'rgba(255,255,255,0.85)', alambre: '#fdf4ff', mano: '#fdf4ff', manoBorde: '#a855f7',
      rosca1: '#e9d5ff', rosca2: '#a78bfa', zapa: '#22C55E', zapaBorde: '#7e22ce' },
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
  const ACCESORIOS = ['gafas', 'monoculo', 'chistera', 'corona', 'cadena', 'pajarita', 'billetes', 'mando', 'gorroRoto', 'parche', 'bufandaRota', 'bolsillos', 'mosca'];
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
  function accMano(c, hx, hy, t) { // billetes en abanico detrás de la mano derecha (y el mando de consola)
    if (ACC.has('mando')) { // NUEVO 19-nov: mando de consola genérico (sin marca), la mano redonda lo sujeta por delante
      const k = kA('mando'); c.save(); c.globalAlpha *= k; c.translate(hx - 6, hy + 22); c.rotate(-0.18 + Math.sin(t * 5) * 0.04); c.scale(0.5 + 0.5 * k, 0.5 + 0.5 * k);
      c.beginPath(); c.moveTo(-64, -22); c.quadraticCurveTo(0, -36, 64, -22); c.quadraticCurveTo(92, -16, 96, 22); c.quadraticCurveTo(98, 50, 74, 50);
      c.quadraticCurveTo(56, 50, 44, 26); c.lineTo(-44, 26); c.quadraticCurveTo(-56, 50, -74, 50); c.quadraticCurveTo(-98, 50, -96, 22); c.quadraticCurveTo(-92, -16, -64, -22); c.closePath();
      relleno(c, '#2b2140'); contorno(c, '#0f0a1a', 4);
      if (!LINEA()) {
        c.fillStyle = '#cfd6e6'; c.fillRect(-66, -6, 30, 10); c.fillRect(-56, -16, 10, 30); // cruceta
        [[50, -10, '#ff3d8b'], [66, 4, '#34e5ff'], [34, 4, '#FFC547'], [50, 18, '#4ADE80']].forEach(([bx, by, col]) => { c.fillStyle = col; c.beginPath(); c.arc(bx, by, 7, 0, 7); c.fill(); });
        c.fillStyle = '#4b3d66'; c.beginPath(); c.arc(-16, 14, 9, 0, 7); c.fill(); c.beginPath(); c.arc(16, 14, 9, 0, 7); c.fill();
      }
      c.restore();
    }
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
  function neonGlow(c, on) { if (ST.soloLinea && !ST.sinNeon && on) { c.shadowColor = 'rgba(74,222,128,0.9)'; c.shadowBlur = 16; } else c.shadowBlur = 0; }

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

  function dibujarBase(c, o = {}) {
    const { x = 540, y = 1400, s = 1, t = 0, expr = 'normal', pose = 'reposo', mira = [0, 0], flip = false, alpha = 1, sinPiernas = false, sinHalo = false, opaco = false } = o;
    ST = Object.assign({}, BASE, ESTILOS[o.estilo || 'vector'] || {}); TT = t;
    ACC = new Set([...(o.modo ? MODOS[o.modo] || [] : []), ...(o.acc || [])]); ACCK = o.accK || {};
    if (opaco) { ST.vidrio = '#163A31'; ST.brilloInt = false; }
    const glow = o.glow == null ? (expr === 'idea' ? 1.3 : expr === 'preocupado' ? 0.6 : 1) : o.glow;
    const bob = Math.sin(t * 2.4) * 4;
    const { dx = 0, dy = 0, sqx = 1, sqy = 1, rot = 0 } = o;
    c.save(); c.globalAlpha = alpha; c.translate(x + dx * s, y + dy * s); if (rot) c.rotate(rot); c.scale(s * (flip ? -1 : 1) * sqx, s * sqy);
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
    if (ST.trama) { c.save(); c.fillStyle = 'rgba(17,17,17,0.16)'; for (let yy = -190; yy < 50; yy += 12) for (let xx = -100 + ((yy / 12) % 2) * 6; xx < 100; xx += 12) { const r = 1.2 + 2.2 * Math.max(0, (xx + yy * 0.3) / 140); c.beginPath(); c.arc(xx, yy, r, 0, 7); c.fill(); } c.restore(); }
    euro(c, glow);
    c.restore();
    if (ST.borde) { c.lineWidth = ST.bordeW; c.strokeStyle = ST.borde; neonGlow(c, true); trazar(c, () => { bulbPath(c); c.stroke(); }); c.shadowBlur = 0; }
    if (ST.cotas) { c.save(); c.strokeStyle = 'rgba(224,242,254,.65)'; c.fillStyle = 'rgba(224,242,254,.85)'; c.lineWidth = 2; c.setLineDash([8, 6]);
      c.beginPath(); c.moveTo(-130, -190); c.lineTo(130, -190); c.moveTo(-130, 40); c.lineTo(130, 40); c.moveTo(0, -230); c.lineTo(0, 60); c.stroke(); c.setLineDash([]);
      c.beginPath(); c.moveTo(140, -190); c.lineTo(140, 40); c.moveTo(132, -190); c.lineTo(148, -190); c.moveTo(132, 40); c.lineTo(148, 40); c.stroke();
      c.font = '600 18px DejaVu Sans Mono, monospace'; c.textAlign = 'left'; c.fillText('h=1€', 150, -70); c.restore(); }
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
  // Envoltorio: añade contorno de PEGATINA (o.pegatina) y la sombra del estilo 'papel', y aplica animaciones (o.anim).
  const _off = [document.createElement('canvas'), document.createElement('canvas')];
  function dibujar(c, o = {}) {
    if (o.anim) { const a = anim(o.anim, o.animT == null ? (o.t || 0) : o.animT); o = Object.assign({}, o, a.trans, a.pose && !o.fijarPose ? { pose: a.pose } : {}, a.expr && !o.fijarExpr ? { expr: a.expr } : {}); }
    const est = Object.assign({}, BASE, ESTILOS[o.estilo || 'vector'] || {});
    const peg = o.pegatina, papel = est.sombraPapel;
    if (!peg && !papel) return dibujarBase(c, o);
    const s = o.s || 1, W = Math.ceil(760 * s), H = Math.ceil(820 * s), fx = W / 2, fy = H - 110 * s;
    const [A, B] = _off; A.width = B.width = W; A.height = B.height = H;
    const a = A.getContext('2d'), b = B.getContext('2d');
    const odx = (o.dx || 0) * s, ody = (o.dy || 0) * s; // el desplazamiento se aplica fuera del lienzo auxiliar (no recorta saltos)
    dibujarBase(a, Object.assign({}, o, { x: fx, y: fy, alpha: 1, sinHalo: true, dx: 0, dy: 0 }));
    if (est.halo && !o.sinHalo) dibujarHalo(c, Object.assign({}, o, { x: o.x + odx, y: o.y + ody }), est);
    const tinte = (col, g) => { b.clearRect(0, 0, W, H); const n = 16; for (let i = 0; i < n; i++) { const ang = i / n * 6.283; b.drawImage(A, Math.cos(ang) * g, Math.sin(ang) * g); } b.globalCompositeOperation = 'source-in'; b.fillStyle = col; b.fillRect(0, 0, W, H); b.globalCompositeOperation = 'source-over'; };
    c.save(); c.globalAlpha = o.alpha == null ? 1 : o.alpha;
    if (papel || peg) { tinte('rgba(0,0,0,0.35)', peg ? (peg.grosor || 10) * s * 0.6 : 2 * s); c.drawImage(B, o.x - fx + odx + 9 * s, o.y - fy + ody + 11 * s); }
    if (peg) { tinte(peg.color || '#ffffff', (peg.grosor || 10) * s); c.drawImage(B, o.x - fx + odx, o.y - fy + ody); }
    c.drawImage(A, o.x - fx + odx, o.y - fy + ody); c.restore();
  }
  function dibujarHalo(c, o, est) { const s = o.s || 1, g = c.createRadialGradient(o.x, o.y - 336 * s, 10, o.x, o.y - 336 * s, 230 * s); g.addColorStop(0, `rgba(${est.halo},0.3)`); g.addColorStop(1, `rgba(${est.halo},0)`); c.fillStyle = g; c.beginPath(); c.arc(o.x, o.y - 336 * s, 230 * s, 0, 7); c.fill(); }

  // ANIMACIONES de Listo (dinamismo con movimiento, nunca con luz): devuelven desplazamiento (en px a escala 1),
  // squash & stretch (sqx, sqy), giro (rot) y, si toca, pose y expresión. u = segundos desde que empieza la animación.
  const ease = (k) => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
  function anim(nombre, u) {
    const T = { dx: 0, dy: 0, sqx: 1, sqy: 1, rot: 0 }; let pose = null, expr = null;
    const sq = (k) => { T.sqy = 1 - k; T.sqx = 1 + k * 0.8; }; // aplastar (k>0) o estirar (k<0)
    if (nombre === 'entrada') { // cae del cielo y rebota al aterrizar
      if (u < 0.32) { const k = u / 0.32; T.dy = -900 * (1 - k * k); sq(-0.18 * k); pose = 'celebra'; expr = 'sorpresa'; }
      else if (u < 0.62) { const k = (u - 0.32) / 0.3; sq(0.28 * Math.sin(k * Math.PI) * (1 - k * 0.5)); T.dy = -40 * Math.max(0, Math.sin((k - 0.45) * Math.PI)); pose = 'brazosAbiertos'; expr = 'feliz'; }
      else { pose = 'saludo'; expr = 'feliz'; } }
    else if (nombre === 'salto') { const p = u % 1.0; // salto con anticipación (en bucle de 1 s)
      if (p < 0.15) sq(0.18 * Math.sin(p / 0.15 * Math.PI / 2));
      else if (p < 0.6) { const k = (p - 0.15) / 0.45; T.dy = -260 * Math.sin(k * Math.PI); sq(-0.14 * Math.sin(k * Math.PI)); pose = 'celebra'; }
      else if (p < 0.75) sq(0.2 * Math.sin((p - 0.6) / 0.15 * Math.PI)); expr = 'feliz'; }
    else if (nombre === 'giro') { const k = ease(Math.min(1, u / 0.7)); T.sqx = Math.cos(k * Math.PI * 2); if (Math.abs(T.sqx) < 0.08) T.sqx = 0.08 * Math.sign(T.sqx || 1); T.dy = -90 * Math.sin(k * Math.PI); pose = 'brazosAbiertos'; expr = 'feliz'; }
    else if (nombre === 'baile') { T.rot = Math.sin(u * 7) * 0.13; T.dx = Math.sin(u * 3.5) * 40; T.dy = -Math.abs(Math.sin(u * 7)) * 30; sq(0.06 * Math.cos(u * 14)); pose = Math.floor(u * 3.5) % 2 ? 'celebra' : 'manosCadera'; expr = 'guino'; }
    else if (nombre === 'temblor') { T.dx = Math.sin(u * 55) * 5; T.rot = Math.sin(u * 47) * 0.02; sq(0.04); pose = 'brazosCruzados'; expr = 'preocupado'; }
    else if (nombre === 'cohete') { // despega hacia arriba (la bolsa sube)
      if (u < 0.25) sq(0.22 * Math.sin(u / 0.25 * Math.PI / 2)); else { const k = u - 0.25; T.dy = -1400 * k * k - 200 * k; sq(-0.25); } pose = 'celebra'; expr = 'sorpresa'; }
    else if (nombre === 'desinfla') { const k = ease(u / 0.8); sq(0.18 * k); T.rot = -0.12 * k; T.dy = 10 * k; pose = 'reposo'; expr = 'preocupado'; }
    else if (nombre === 'rebote') { const p = (u * 2.2) % 1; T.dy = -60 * Math.sin(p * Math.PI); sq(p > 0.88 || p < 0.06 ? 0.08 : -0.03); }
    else if (nombre === 'mirarAtras') { // NUEVO 19-nov: gira la cabeza hacia atrás ("a toro pasado") y vuelve
      const ida = ease(u / 0.35), vuelta = ease((u - 1.3) / 0.4), k = ida * (1 - vuelta);
      T.rot = -0.2 * k; T.dx = -30 * k; T.sqx = 1 - 0.1 * k; T.dy = -12 * Math.sin(Math.min(1, u / 0.35) * Math.PI);
      pose = 'piensa'; expr = u < 1.3 ? 'sorpresa' : 'idea'; }
    else if (nombre === 'asoma') { const k = ease(u / 0.5); T.dx = (1 - k) * -420; T.rot = (1 - k) * -0.5; pose = 'saludo'; expr = 'guino'; }
    return { trans: T, pose, expr };
  }

  function pixel(c, o = {}) {
    // Las animaciones también valen en pixel art: el desplazamiento se aplica fuera del lienzo pequeño (no se recorta).
    if (o.anim) { const a = anim(o.anim, o.animT == null ? (o.t || 0) : o.animT); o = Object.assign({}, o, a.trans, a.pose && !o.fijarPose ? { pose: a.pose } : {}, a.expr && !o.fijarExpr ? { expr: a.expr } : {}, { anim: null }); }
    const { x = 540, y = 1400, s = 1, px = 6, dx = 0, dy = 0 } = o;
    const W = Math.ceil(560 * s / px), H = Math.ceil(520 * s / px);
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const oc = off.getContext('2d'); oc.imageSmoothingEnabled = false;
    dibujar(oc, Object.assign({}, o, { x: W / 2, y: H - 2 - Math.ceil(60 * s / px), s: s / px, glow: 0.35, sinHalo: true, opaco: true, estilo: 'vector', pegatina: null, dx: 0, dy: 0 }));
    const im = oc.getImageData(0, 0, W, H); for (let i = 3; i < im.data.length; i += 4) im.data[i] = im.data[i] > 90 ? 255 : 0; oc.putImageData(im, 0, 0);
    const ox = Math.round(dx * s / px) * px, oy = Math.round(dy * s / px) * px; // se mueve en saltos de píxel
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(off, x - W * px / 2 + ox, y - (H - Math.ceil(60 * s / px)) * px + oy, W * px, H * px); c.restore();
  }

  window.Listo2D = { dibujar, pixel, anim, POSES, ESTILOS: Object.keys(ESTILOS).concat(['pixel']), MODOS, ACCESORIOS, ANIMACIONES: ['entrada', 'salto', 'giro', 'baile', 'temblor', 'cohete', 'desinfla', 'rebote', 'asoma', 'mirarAtras'] };
})();
