// listo3d.js — LISTO, la mascota de El Euro Listo, en 3D (Three.js) para escena3d. UN MODELADO POR TIPO DE EDICIÓN.
// import { crearListo } from "../../toolkit/mascota/listo3d.js";
//   const L = crearListo({ estilo, escala });  escena.add(L.root);  L.root.position.set(x, 0, z);   // pies en y = 0
//   en renderAt(t):  L.actualizar(t, { expr, pose, glow, mira:[x,y] });
//   estilo: 'toon'       (por defecto · R2 "Tienes X años": cristal transparente, ojos grandes brillantes, suave)
//           'plastilina' (R5: todo mate y opaco tipo plastilina, € en relieve en el frente, ojos negros ovalados)
//           'lowpoly'    (R7 simulación low-poly: facetas planas, € y ojos de bloques, como persona() de lib3d)
//   expr: 'normal' | 'feliz' | 'idea' | 'sorpresa' | 'preocupado' | 'habla' | 'guino'
//   anim: 'entrada'|'salto'|'giro'|'baile'|'temblor'|'cohete'|'desinfla'|'rebote'|'asoma' (+ animT = s desde que empieza): mismas animaciones que en 2D
//   acc: ['gafas','monoculo','chistera','corona','cadena','pajarita','billetes','gorroRoto','parche','bufandaRota','bolsillos','mosca'], modo: 'vacilon'|'rico'|'millonario'|'arruinado', accK: { gafas: 0..1 }
//   pose: 'reposo' | 'saludo' | 'senala' | 'senalaIzq' | 'pulgar' | 'celebra' | 'piensa' | 'abrazo' | 'brazosCruzados' | 'telefono' (mira el móvil con una gráfica)
// Mide ~3,1 unidades (pies → punta). El brillo es estable: glow cambia despacio, nunca parpadea.
// Para un look NUEVO: añade aquí (o en listo2d.js) un estilo que siga la estética de ese look sin cambiar la identidad.
import * as THREE from "three";

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

function texturaHalo() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 2, 64, 64, 64);
  g.addColorStop(0, "rgba(74,222,128,0.9)"); g.addColorStop(0.35, "rgba(34,197,94,0.35)"); g.addColorStop(1, "rgba(34,197,94,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// Animaciones (las mismas que en listo2d.js): devuelven dx, dy (en px de Listo a escala 1 ≈ 320 px de alto), sqx, sqy, rot,
// giroY (vuelta real en 3D) y, si toca, pose y expresión.
const easeA = (k) => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
export function animListo(nombre, u) {
  const T = { dx: 0, dy: 0, sqx: 1, sqy: 1, rot: 0, giroY: 0 }; let pose = null, expr = null;
  const sq = (k) => { T.sqy = 1 - k; T.sqx = 1 + k * 0.8; };
  if (nombre === "entrada") { if (u < 0.32) { const k = u / 0.32; T.dy = -900 * (1 - k * k); sq(-0.18 * k); pose = "celebra"; expr = "sorpresa"; }
    else if (u < 0.62) { const k = (u - 0.32) / 0.3; sq(0.28 * Math.sin(k * Math.PI) * (1 - k * 0.5)); T.dy = -40 * Math.max(0, Math.sin((k - 0.45) * Math.PI)); pose = "abrazo"; expr = "feliz"; }
    else { pose = "saludo"; expr = "feliz"; } }
  else if (nombre === "salto") { const p = u % 1.0; if (p < 0.15) sq(0.18 * Math.sin(p / 0.15 * Math.PI / 2)); else if (p < 0.6) { const k = (p - 0.15) / 0.45; T.dy = -260 * Math.sin(k * Math.PI); sq(-0.14 * Math.sin(k * Math.PI)); pose = "celebra"; } else if (p < 0.75) sq(0.2 * Math.sin((p - 0.6) / 0.15 * Math.PI)); expr = "feliz"; }
  else if (nombre === "giro") { const k = easeA(Math.min(1, u / 0.7)); T.giroY = k * Math.PI * 2; T.dy = -90 * Math.sin(k * Math.PI); pose = "abrazo"; expr = "feliz"; }
  else if (nombre === "baile") { T.rot = Math.sin(u * 7) * 0.13; T.dx = Math.sin(u * 3.5) * 40; T.dy = -Math.abs(Math.sin(u * 7)) * 30; sq(0.06 * Math.cos(u * 14)); pose = Math.floor(u * 3.5) % 2 ? "celebra" : "saludo"; expr = "guino"; }
  else if (nombre === "temblor") { T.dx = Math.sin(u * 55) * 5; T.rot = Math.sin(u * 47) * 0.02; sq(0.04); pose = "brazosCruzados"; expr = "preocupado"; }
  else if (nombre === "cohete") { if (u < 0.25) sq(0.22 * Math.sin(u / 0.25 * Math.PI / 2)); else { const k = u - 0.25; T.dy = -1400 * k * k - 200 * k; sq(-0.25); } pose = "celebra"; expr = "sorpresa"; }
  else if (nombre === "desinfla") { const k = easeA(u / 0.8); sq(0.18 * k); T.rot = -0.12 * k; T.dy = 10 * k; pose = "reposo"; expr = "preocupado"; }
  else if (nombre === "rebote") { const p = (u * 2.2) % 1; T.dy = -60 * Math.sin(p * Math.PI); sq(p > 0.88 || p < 0.06 ? 0.08 : -0.03); }
  else if (nombre === "asoma") { const k = easeA(u / 0.5); T.dx = (1 - k) * -420; T.rot = (1 - k) * -0.5; pose = "saludo"; expr = "guino"; }
  return { trans: T, pose, expr };
}

export function crearListo({ estilo = "toon", escala = 1, luz = true } = {}) {
  const LP = estilo === "lowpoly", CL = estilo === "plastilina";
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: CL ? 0.95 : 0.5, metalness: 0, flatShading: LP, ...o });
  const root = new THREE.Group();
  const cuerpo = new THREE.Group(); cuerpo.position.y = 1.05; root.add(cuerpo);
  root.scale.setScalar(escala);
  const M = {
    vidrio: CL ? std(0xbfeccb) : new THREE.MeshStandardMaterial({ color: 0xd2ffe3, transparent: true, opacity: LP ? 0.2 : 0.11, roughness: 0.05, metalness: 0.1,
      emissive: 0x22c55e, emissiveIntensity: LP ? 0.15 : 0.06, depthWrite: false, side: THREE.DoubleSide, flatShading: LP }),
    borde: new THREE.MeshBasicMaterial({ color: 0xe8fff1, transparent: true, opacity: 0.4, side: THREE.BackSide, depthWrite: false }),
    neon: CL ? std(0x16a34a) : new THREE.MeshBasicMaterial({ color: 0x5dff98, toneMapped: false }),
    rosca1: CL ? std(0xc9ced6) : std(0xd3d8df, { metalness: LP ? 0.1 : 0.35, roughness: 0.4 }),
    rosca2: CL ? std(0x9aa3b0) : std(0x8e97a5, { metalness: LP ? 0.1 : 0.35, roughness: 0.45 }),
    punta: std(0x2b2f38), alambre: CL ? std(0xe5e7eb) : std(0xdde3ea, { metalness: LP ? 0 : 0.4, roughness: 0.35 }),
    mano: std(0xf1f5f9), zapa: std(0x22c55e), suela: std(0xf8fafc),
    blanco: std(0xffffff, { roughness: 0.3 }), negro: std(0x0e1220, { roughness: CL ? 0.25 : 0.3 }),
    mejilla: new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: CL ? 0.5 : 0.35, depthWrite: false }),
  };
  // --- cuerpo de bombilla (torno) ---
  const perfil = [[0.36, 0], [0.37, 0.12], [0.5, 0.32], [0.78, 0.62], [0.95, 0.98], [0.98, 1.3], [0.9, 1.6], [0.68, 1.84], [0.36, 1.97], [0.001, 2.0]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const geoV = new THREE.LatheGeometry(perfil, LP ? 8 : CL ? 40 : 48);
  if (CL) { // pequeñas irregularidades "hechas a mano"
    const p = geoV.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + 0.012 * Math.sin(x * 9 + y * 7) * Math.cos(z * 8 - y * 5); p.setXYZ(i, x * n, y, z * n); }
    geoV.computeVertexNormals();
  }
  const vidrio = new THREE.Mesh(geoV, M.vidrio); vidrio.renderOrder = 2; cuerpo.add(vidrio);
  if (!CL) { const borde = new THREE.Mesh(geoV, M.borde); borde.scale.set(1.025, 1.012, 1.025); borde.renderOrder = 1; cuerpo.add(borde); }
  // --- € ---
  const fil = new THREE.Group(); cuerpo.add(fil);
  if (LP) { // € de bloques
    fil.position.set(0.03, 0.98, 0);
    for (let i = 0; i < 7; i++) { const a = Math.PI * (0.32 + 1.36 * i / 6);
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.09), M.neon); b.position.set(Math.cos(a) * 0.3 + 0.03, Math.sin(a) * 0.3, 0); b.rotation.z = a; fil.add(b); }
    for (const y of [-0.085, 0.085]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.07), M.neon); b.position.set(-0.14, y, 0); fil.add(b); }
  } else {
    fil.position.set(CL ? 0.02 : 0.03, CL ? 0.7 : 0.98, CL ? 0.86 : 0);
    if (CL) { fil.scale.setScalar(0.72); fil.rotation.x = -0.25; }
    const pts = []; for (let i = 0; i <= 40; i++) { const a = Math.PI * (0.27 + 1.46 * i / 40); pts.push(new THREE.Vector3(Math.cos(a) * 0.3 + 0.03, Math.sin(a) * 0.3, 0)); }
    const rT = CL ? 0.05 : 0.035;
    fil.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, rT, 8), M.neon));
    for (const [y, w] of [[-0.085, 0.48], [0.085, 0.44]]) {
      const b = new THREE.Mesh(new THREE.CapsuleGeometry(rT, w, 4, 8), M.neon); b.rotation.z = Math.PI / 2; b.position.set(-0.12 - (0.48 - w) / 2, y, 0); fil.add(b);
    }
  }
  if (!CL) for (const x of [-0.06, 0.12]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.62, LP ? 4 : 6), M.alambre); s.position.set(x, -0.6, 0); fil.add(s); }
  let halo = null, luzP = null;
  if (!CL) { halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaHalo(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.set(LP ? 3 : 3.6, LP ? 3 : 3.6, 1); halo.position.set(0, 1.15, 0); cuerpo.add(halo); }
  if (luz && !CL) { luzP = new THREE.PointLight(0x4ade80, 2.2, 7, 1.6); luzP.position.set(0, 1.05, 0.2); cuerpo.add(luzP); }
  // --- casquillo ---
  const seg = LP ? 8 : 32;
  [[0.37, M.rosca1], [0.34, M.rosca2], [0.37, M.rosca1], [0.33, M.rosca2]].forEach(([r, m], i) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.12, seg), m); c.position.y = -0.06 - i * 0.12; cuerpo.add(c);
  });
  const punta = new THREE.Mesh(LP ? new THREE.CylinderGeometry(0.17, 0.08, 0.14, 8) : new THREE.SphereGeometry(0.17, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.punta);
  punta.position.y = LP ? -0.53 : -0.48; cuerpo.add(punta);
  // --- cara ---
  const cara = new THREE.Group(); cuerpo.add(cara);
  const ojos = [-1, 1].map((sx) => {
    const g = new THREE.Group(); g.position.set(sx * 0.33, 1.47, 0.93); g.rotation.y = sx * 0.36;
    let blanco, pupila, brillo;
    if (LP) { blanco = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.29, 0.06), M.blanco); blanco.position.z = 0.03; pupila = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.04), M.negro); pupila.position.z = 0.08; brillo = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.02), M.blanco); brillo.position.set(0.025, 0.03, 0.07); }
    else if (CL) { blanco = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 4), M.blanco); blanco.visible = false; pupila = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.12, 6, 12), M.negro); pupila.scale.z = 0.5; pupila.position.z = 0.02; brillo = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), M.blanco); brillo.position.set(0.025, 0.07, 0.06); }
    else { blanco = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), M.blanco); blanco.scale.set(1, 1.18, 0.45); pupila = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 12), M.negro); pupila.position.z = 0.07; brillo = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), M.blanco); brillo.position.set(0.035, 0.04, 0.13); }
    const arco = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.026, LP ? 3 : 8, LP ? 5 : 20, Math.PI * 0.8), M.negro); arco.rotation.z = Math.PI * 0.1; arco.position.z = 0.06;
    g.add(blanco, pupila, brillo, arco); cara.add(g);
    const mej = new THREE.Mesh(LP ? new THREE.PlaneGeometry(0.2, 0.1) : new THREE.CircleGeometry(0.09, 20), M.mejilla); if (!LP) mej.scale.set(1.3, 0.75, 1);
    mej.position.set(sx * 0.6, 1.24, 0.8); mej.rotation.y = sx * 0.62; cara.add(mej);
    return { g, blanco, pupila, brillo, arco };
  });
  const sonrisa = new THREE.Mesh(new THREE.TorusGeometry(0.12, LP ? 0.035 : 0.028, LP ? 3 : 8, LP ? 5 : 24, Math.PI), M.negro);
  sonrisa.position.set(0, 1.25, 1.0); sonrisa.rotation.z = Math.PI; cara.add(sonrisa);
  const bocaO = new THREE.Mesh(LP ? new THREE.BoxGeometry(0.13, 0.13, 0.05) : new THREE.SphereGeometry(0.075, 16, 12), M.negro);
  bocaO.position.set(0, 1.23, 0.99); cara.add(bocaO);
  const destellos = new THREE.Group(); cuerpo.add(destellos);
  for (let i = 0; i < 5; i++) {
    const r = new THREE.Mesh(LP ? new THREE.BoxGeometry(0.06, 0.28, 0.06) : new THREE.CylinderGeometry(0.03, 0.03, 0.28, 6), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
    const a = Math.PI / 2 + (i - 2) * 0.42; r.position.set(Math.cos(a) * 1.35, 1.1 + Math.sin(a) * 1.35, 0); r.rotation.z = a - Math.PI / 2; destellos.add(r);
  }
  // --- piernas y zapatillas ---
  for (const sx of [-1, 1]) {
    const p = new THREE.Mesh(LP ? new THREE.BoxGeometry(0.09, 0.5, 0.09) : new THREE.CylinderGeometry(CL ? 0.06 : 0.045, CL ? 0.06 : 0.045, 0.5, 8), M.alambre); p.position.set(sx * 0.16, -0.75, 0); cuerpo.add(p);
    const z = LP ? new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.42), M.zapa) : new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.22, 4, 12), M.zapa);
    if (!LP) z.rotation.x = Math.PI / 2; z.position.set(sx * 0.18, -1.0, 0.08); cuerpo.add(z);
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.44), M.suela); s.position.set(sx * 0.18, -1.1, 0.08); cuerpo.add(s);
  }
  // --- ACCESORIOS (Sergio, 18-nov): gafas, lujo o ropa de ruina, encima del diseño (el €, el casquillo y las zapatillas se ven) ---
  const MODOS = { vacilon: ["gafas", "cadena"], rico: ["chistera", "monoculo", "pajarita"], millonario: ["corona", "gafas", "cadena", "billetes"], arruinado: ["gorroRoto", "parche", "bufandaRota", "bolsillos", "mosca"] };
  const oro = std(0xf5b700, { metalness: CL ? 0 : 0.7, roughness: CL ? 0.9 : 0.3 }), negroM = std(0x0b0f17, { roughness: 0.25, metalness: 0.2 });
  const A = {};
  const mk = (n) => { const g = new THREE.Group(); g.visible = false; cuerpo.add(g); A[n] = g; return g; };
  { const g = mk("gafas"); // gafas de sol
    for (const sx of [-1, 1]) { const l = new THREE.Mesh(LP ? new THREE.BoxGeometry(0.42, 0.3, 0.06) : new THREE.CapsuleGeometry(0.15, 0.17, 6, 16), negroM); if (!LP) { l.rotation.z = Math.PI / 2; l.scale.set(1.0, 1, 0.3); }
      l.position.set(sx * 0.34, 1.49, 1.04); l.rotation.y = sx * 0.36; g.add(l);
      const pat = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.55, 6), negroM); pat.rotation.z = Math.PI / 2; pat.rotation.y = sx * 1.1; pat.position.set(sx * 0.68, 1.52, 0.62); g.add(pat);
      const br = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.14), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })); br.position.set(sx * 0.34 - 0.09, 1.53, 1.1); br.rotation.set(0, sx * 0.36, 0.6); g.add(br); }
    const puente = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 6), negroM); puente.rotation.z = Math.PI / 2; puente.position.set(0, 1.53, 1.1); g.add(puente); }
  { const g = mk("monoculo"); const r = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.022, 8, 28), oro); r.position.set(0.33, 1.47, 1.02); r.rotation.y = 0.36; g.add(r);
    const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0.5, 1.4, 0.98), new THREE.Vector3(0.7, 1.0, 0.95), new THREE.Vector3(0.55, 0.6, 0.85)), 12, 0.01, 5), oro); g.add(c); }
  { const g = mk("chistera"); g.position.set(0, 1.97, 0); g.rotation.z = -0.12;
    const ala = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.05, LP ? 8 : 40), negroM); g.add(ala);
    const copa = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.75, LP ? 8 : 40), negroM); copa.position.y = 0.4; g.add(copa);
    const cinta = new THREE.Mesh(new THREE.CylinderGeometry(0.445, 0.445, 0.14, LP ? 8 : 40), std(0xb91c1c)); cinta.position.y = 0.12; g.add(cinta); }
  { const g = mk("corona"); g.position.set(0, 1.9, 0); g.rotation.z = 0.06;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, LP ? 8 : 40, 1, true), oro); base.position.y = 0.1; base.material.side = THREE.DoubleSide; g.add(base);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const p = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, LP ? 4 : 10), oro); p.position.set(Math.cos(a) * 0.48, 0.34, Math.sin(a) * 0.48); g.add(p);
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), std([0xef4444, 0x22c55e, 0x3b82f6][i % 3])); gem.position.set(Math.cos(a) * 0.51, 0.1, Math.sin(a) * 0.51); g.add(gem); } }
  { const g = mk("cadena"); const t = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.035, 8, 40), oro); t.position.set(0, -0.12, 0.08); t.rotation.x = 1.15; g.add(t);
    const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.11), std(0xbff3ff, { metalness: 0.3, roughness: 0.05 })); d.position.set(0, -0.36, 0.5); g.add(d); }
  { const g = mk("pajarita"); g.position.set(0, 0.04, 0.4);
    for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.26, LP ? 4 : 12), std(0xdc2626)); c.rotation.z = sx * Math.PI / 2; c.position.x = sx * 0.13; g.add(c); }
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), std(0x991b1b)); g.add(n); }
  { const g = mk("billetes"); for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.42, 0.01), std(i % 2 ? 0x22c55e : 0x16a34a)); b.position.set(0, 0.2, -0.02 * i); b.rotation.z = -0.6 + i * 0.32; b.geometry.translate(0, 0.0, 0); g.add(b); } }
  { const g = mk("gorroRoto"); g.position.set(0, 1.62, 0);
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.82, LP ? 8 : 32, LP ? 5 : 16, 0, Math.PI * 2, 0, Math.PI / 2), std(0x7a6a58, { roughness: 1 })); d.scale.set(1, 0.72, 1); g.add(d);
    const banda = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 8, 40), std(0x5f5142, { roughness: 1 })); banda.rotation.x = Math.PI / 2; g.add(banda);
    const pom = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), std(0xcbbfa8, { roughness: 1, flatShading: true })); pom.position.y = 0.62; g.add(pom);
    for (const [x, y, z] of [[-0.35, 0.35, 0.62], [0.42, 0.25, 0.6]]) { const h = new THREE.Mesh(new THREE.CircleGeometry(0.07, 10), std(0x2a2118)); h.position.set(x, y, z); h.lookAt(x * 3, y * 3, z * 3); g.add(h); } }
  { const g = mk("parche"); const pa = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.24), std(0xd6b98c, { side: THREE.DoubleSide })); pa.position.set(-0.62, 1.05, 0.74); pa.lookAt(-1.5, 1.2, 1.8); g.add(pa);
    const ti = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.1), std(0xf2c9a0, { side: THREE.DoubleSide })); ti.position.set(0.58, 1.12, 0.8); ti.lookAt(1.4, 1.3, 2); ti.rotateZ(-0.5); g.add(ti); }
  { const g = mk("bufandaRota"); const t = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.09, 8, 32), std(0x9f2d2d, { roughness: 1 })); t.position.y = 0.05; t.rotation.x = Math.PI / 2; g.add(t);
    const cola = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.05), std(0x8c2626, { roughness: 1 })); cola.position.set(0.28, -0.2, 0.38); cola.rotation.z = 0.25; g.add(cola); }
  { const g = mk("bolsillos"); for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.04), std(0xf8fafc)); b.position.set(sx * 0.42, -0.28, 0.12); b.rotation.z = sx * 0.4; g.add(b); } }
  { const g = mk("mosca"); const cu = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), std(0x111111)); g.add(cu);
    for (const sx of [-1, 1]) { const ala = new THREE.Mesh(new THREE.CircleGeometry(0.06, 10), new THREE.MeshBasicMaterial({ color: 0xdcebff, transparent: true, opacity: 0.8, side: THREE.DoubleSide })); ala.position.set(sx * 0.05, 0.05, 0); ala.name = "ala"; g.add(ala); } }
  // --- brazos (se regeneran cada fotograma) ---
  const POSES = {
    reposo: [[-1.1, 0.25, 0.2], [1.1, 0.25, 0.2]], saludo: [[-1.1, 0.25, 0.2], [1.45, 2.05, 0.3]],
    senala: [[-1.1, 0.25, 0.2], [2.0, 1.15, 0.5]], senalaIzq: [[-2.0, 1.15, 0.5], [1.1, 0.25, 0.2]],
    pulgar: [[-1.1, 0.25, 0.2], [1.3, 0.9, 0.6]], celebra: [[-1.5, 2.2, 0.2], [1.5, 2.2, 0.2]], piensa: [[-1.1, 0.25, 0.2], [0.35, 1.05, 1.0]],
    abrazo: [[-2.0, 1.05, 0.35], [2.0, 1.05, 0.35]], brazosCruzados: [[0.5, 0.45, 1.2], [-0.5, 0.52, 1.25]], telefono: [[-1.1, 0.25, 0.2], [0.95, 1.12, 1.15]],
  };
  // teléfono (pose 'telefono': Listo hablando por el móvil)
  const movil = new THREE.Group(); cuerpo.add(movil); movil.visible = false;
  { const caja = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.68, 0.07), std(0x111827)); movil.add(caja);
    const pant = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.6), new THREE.MeshBasicMaterial({ color: 0x4ade80 })); pant.position.z = 0.037; movil.add(pant);
    const barra = (w, y) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.06), new THREE.MeshBasicMaterial({ color: 0x14532d })); b.position.set(-0.1 + w / 2, y, 0.039); movil.add(b); };
    barra(0.12, -0.15); barra(0.2, -0.02); barra(0.26, 0.12); } // gráfica de barras que sube en la pantalla
  const brazos = [-1, 1].map(() => {
    const m = new THREE.Mesh(new THREE.BufferGeometry(), M.alambre); cuerpo.add(m);
    const h = new THREE.Mesh(LP ? new THREE.BoxGeometry(0.19, 0.19, 0.19) : new THREE.SphereGeometry(CL ? 0.13 : 0.11, 16, 12), M.mano); cuerpo.add(h);
    return { m, h };
  });
  function actualizar(t, opts = {}) {
    let { expr = "normal", pose = "reposo", glow, mira = [0, 0], acc = [], modo = null, accK = {}, anim = null, animT = null } = opts;
    let TR = { dx: 0, dy: 0, sqx: 1, sqy: 1, rot: 0, giroY: 0 };
    if (anim) { const a = animListo(anim, animT == null ? t : animT); TR = a.trans; if (a.pose && !opts.fijarPose) pose = a.pose; if (a.expr && !opts.fijarExpr) expr = a.expr; }
    const ACC = new Set([...(modo ? MODOS[modo] || [] : []), ...acc]);
    for (const n in A) { A[n].visible = ACC.has(n); const k = accK[n] == null ? 1 : Math.max(0, Math.min(1, accK[n])); A[n].userData.k = k; }
    if (A.mosca.visible) { A.mosca.position.set(1.15 + Math.sin(t * 6.3) * 0.3, 2.35 + Math.sin(t * 9.7) * 0.18, 0.4); A.mosca.children.forEach((c) => { if (c.name === "ala") c.scale.y = 0.3 + 0.7 * Math.abs(Math.sin(t * 38)); }); }
    for (const n of ["gafas", "chistera", "corona", "gorroRoto"]) if (A[n].visible) A[n].position.y = (n === "gafas" ? 0 : n === "chistera" ? 1.97 : n === "corona" ? 1.9 : 1.62) + (1 - A[n].userData.k) * 0.8;
    const gl = glow == null ? (expr === "idea" ? 1.35 : expr === "preocupado" ? 0.6 : 1) : glow;
    // animación: px de Listo 2D → unidades 3D (≈ 3,1 u / 320 px); squash con el pivote en los pies
    const KP = 3.1 / 320;
    cuerpo.scale.set(TR.sqx, TR.sqy, TR.sqx);
    cuerpo.position.set(TR.dx * KP, 1.1 * TR.sqy - 0.05 + Math.sin(t * 2.4) * 0.03 - TR.dy * KP, 0);
    cuerpo.rotation.set(0, TR.giroY, -TR.rot);
    if (!CL) { M.vidrio.emissiveIntensity = (LP ? 0.15 : 0.06) * gl; halo.material.opacity = clamp(0.55 * gl, 0, 1); M.neon.color.setHex(gl > 1.1 ? 0xb9ffd2 : 0x5dff98); }
    else M.neon.color.setHex(gl > 1.1 ? 0x22c55e : 0x16a34a);
    if (luzP) luzP.intensity = 2.2 * gl;
    destellos.visible = expr === "idea"; destellos.rotation.z = Math.sin(t * 1.5) * 0.03;
    const ph = (t + 0.7) % 3.4, parp = ph < 0.12 ? Math.sin(ph / 0.12 * Math.PI) : 0;
    ojos.forEach((o, i) => {
      const cerrado = expr === "feliz" || (expr === "guino" && i === 1);
      const sy = (expr === "sorpresa" ? 1.2 : 1) * (1 - 0.9 * parp);
      o.blanco.visible = !cerrado && !CL; o.arco.visible = cerrado; o.pupila.visible = o.brillo.visible = !cerrado && sy > 0.3;
      o.g.scale.set(1, cerrado ? 1 : Math.max(0.08, sy), 1);
      o.pupila.position.x = mira[0] * 0.05; o.pupila.position.y = mira[1] * 0.05; if (LP) o.pupila.position.z = 0.08;
      o.pupila.scale.setScalar(expr === "sorpresa" && !CL ? 0.75 : 1); if (CL) o.pupila.scale.z = 0.5;
    });
    const abierta = expr === "sorpresa" || expr === "habla";
    sonrisa.visible = !abierta; bocaO.visible = abierta;
    sonrisa.rotation.z = expr === "preocupado" ? 0 : Math.PI;
    sonrisa.position.y = expr === "preocupado" ? 1.17 : 1.25;
    sonrisa.scale.setScalar(expr === "feliz" || expr === "idea" ? 1.35 : 1);
    if (expr === "habla") bocaO.scale.set(1, 0.5 + 1.1 * Math.abs(Math.sin(t * 13)), LP ? 1 : 0.4); else bocaO.scale.set(1, LP ? 1 : 1.3, LP ? 1 : 0.4);
    const P = POSES[pose] || POSES.reposo;
    movil.visible = pose === "telefono"; if (movil.visible) { movil.position.set(0.95, 1.45, 1.15); movil.rotation.set(-0.15, -0.35, 0.12); }
    brazos.forEach((b, i) => {
      const sx = i === 0 ? -1 : 1;
      const a = new THREE.Vector3(sx * 0.9, 0.95, 0), h = new THREE.Vector3(...P[i]);
      if (pose === "saludo" && sx === 1) { h.x += Math.sin(t * 9) * 0.22; h.y += Math.cos(t * 9) * 0.05; }
      if (pose === "celebra") h.y += Math.sin(t * 7 + i) * 0.08;
      if (pose === "reposo") h.y += Math.sin(t * 2.2 + i) * 0.03;
      const mid = a.clone().add(h).multiplyScalar(0.5).add(new THREE.Vector3(sx * (pose === "brazosCruzados" ? 0.35 : 0.18), -0.2, pose === "brazosCruzados" ? 0.75 : 0.1));
      b.m.geometry.dispose();
      b.m.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, h), LP ? 3 : 16, LP ? 0.05 : CL ? 0.05 : 0.035, LP ? 4 : 8);
      b.h.position.copy(h);
      if (sx === 1 && A.billetes.visible) A.billetes.position.copy(h);
    });
  }
  actualizar(0);
  return { root, cuerpo, actualizar, POSES, estilo, MODOS, accesorios: Object.keys(A), ANIMACIONES: ["entrada", "salto", "giro", "baile", "temblor", "cohete", "desinfla", "rebote", "asoma"] };
}
