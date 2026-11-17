// listo3d.js — LISTO, la mascota de El Euro Listo, en 3D (Three.js) para escena3d.
// import { crearListo } from "../../toolkit/mascota/listo3d.js";   (añade "listo3d" al importmap si prefieres)
//   const L = crearListo({ escala: 1 });  escena.add(L.root);  L.root.position.set(x, 0, z);   // pies en y = 0
//   en renderAt(t):  L.actualizar(t, { expr, pose, glow, mira:[x,y] });
//   expr: 'normal' | 'feliz' | 'idea' | 'sorpresa' | 'preocupado' | 'habla' | 'guino'
//   pose: 'reposo' | 'saludo' | 'senala' | 'senalaIzq' | 'pulgar' | 'celebra' | 'piensa'
// Mide ~3,1 unidades de alto (pies → punta). El brillo es estable: glow cambia despacio, nunca parpadea.
import * as THREE from "three";

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

function texturaHalo() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d").createRadialGradient(64, 64, 2, 64, 64, 64);
  g.addColorStop(0, "rgba(74,222,128,0.9)"); g.addColorStop(0.35, "rgba(34,197,94,0.35)"); g.addColorStop(1, "rgba(34,197,94,0)");
  const x = c.getContext("2d"); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function crearListo({ escala = 1, luz = true } = {}) {
  const root = new THREE.Group();
  const cuerpo = new THREE.Group(); cuerpo.position.y = 1.05; root.add(cuerpo);
  root.scale.setScalar(escala);
  const M = {
    vidrio: new THREE.MeshStandardMaterial({ color: 0xd2ffe3, transparent: true, opacity: 0.11, roughness: 0.05, metalness: 0.1,
      emissive: 0x22c55e, emissiveIntensity: 0.06, depthWrite: false, side: THREE.DoubleSide }),
    borde: new THREE.MeshBasicMaterial({ color: 0xe8fff1, transparent: true, opacity: 0.4, side: THREE.BackSide, depthWrite: false }),
    neon: new THREE.MeshBasicMaterial({ color: 0x5dff98, toneMapped: false }),
    rosca1: new THREE.MeshStandardMaterial({ color: 0xd3d8df, metalness: 0.35, roughness: 0.35 }),
    rosca2: new THREE.MeshStandardMaterial({ color: 0x8e97a5, metalness: 0.35, roughness: 0.4 }),
    punta: new THREE.MeshStandardMaterial({ color: 0x2b2f38, roughness: 0.6 }),
    alambre: new THREE.MeshStandardMaterial({ color: 0xdde3ea, metalness: 0.4, roughness: 0.35 }),
    mano: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 }),
    zapa: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.55 }),
    suela: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 }),
    blanco: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }),
    negro: new THREE.MeshStandardMaterial({ color: 0x0e1220, roughness: 0.3 }),
    mejilla: new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.35, depthWrite: false }),
  };
  // --- cristal (torno) ---
  const perfil = [[0.36, 0], [0.37, 0.12], [0.5, 0.32], [0.78, 0.62], [0.95, 0.98], [0.98, 1.3], [0.9, 1.6], [0.68, 1.84], [0.36, 1.97], [0.001, 2.0]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const geoV = new THREE.LatheGeometry(perfil, 48);
  const vidrio = new THREE.Mesh(geoV, M.vidrio); vidrio.renderOrder = 2;
  const borde = new THREE.Mesh(geoV, M.borde); borde.scale.set(1.025, 1.012, 1.025); borde.renderOrder = 1;
  cuerpo.add(borde, vidrio);
  // --- filamento € ---
  const fil = new THREE.Group(); fil.position.set(0.03, 0.98, 0); cuerpo.add(fil);
  const pts = []; for (let i = 0; i <= 40; i++) { const a = Math.PI * (0.27 + 1.46 * i / 40); pts.push(new THREE.Vector3(Math.cos(a) * 0.3 + 0.03, Math.sin(a) * 0.3, 0)); }
  fil.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.035, 8), M.neon));
  for (const [y, w] of [[-0.085, 0.48], [0.085, 0.44]]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, w, 8), M.neon); b.rotation.z = Math.PI / 2; b.position.set(-0.12 + (0.48 - w) / -2, y, 0); fil.add(b);
  }
  for (const x of [-0.06, 0.12]) { // soportes
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.62, 6), M.alambre); s.position.set(x, -0.6, 0); fil.add(s);
  }
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaHalo(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(3.6, 3.6, 1); halo.position.set(0, 1.15, 0); cuerpo.add(halo);
  let luzP = null;
  if (luz) { luzP = new THREE.PointLight(0x4ade80, 2.2, 7, 1.6); luzP.position.set(0, 1.05, 0.2); cuerpo.add(luzP); }
  // --- casquillo ---
  [[0.37, M.rosca1], [0.34, M.rosca2], [0.37, M.rosca1], [0.33, M.rosca2]].forEach(([r, m], i) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.12, 32), m); c.position.y = -0.06 - i * 0.12; cuerpo.add(c);
  });
  const punta = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.punta); punta.position.y = -0.48; cuerpo.add(punta);
  // --- cara ---
  const cara = new THREE.Group(); cuerpo.add(cara);
  const ojos = [-1, 1].map((sx) => {
    const g = new THREE.Group(); g.position.set(sx * 0.33, 1.47, 0.93); g.rotation.y = sx * 0.36;
    const blanco = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), M.blanco); blanco.scale.set(1, 1.18, 0.45);
    const pupila = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 12), M.negro); pupila.position.z = 0.07;
    const brillo = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), M.blanco); brillo.position.set(0.035, 0.04, 0.13);
    const arco = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.026, 8, 20, Math.PI * 0.8), M.negro); arco.rotation.z = Math.PI * 0.1; arco.position.z = 0.06;
    g.add(blanco, pupila, brillo, arco); cara.add(g);
    const mej = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), M.mejilla); mej.scale.set(1.3, 0.75, 1);
    mej.position.set(sx * 0.6, 1.24, 0.8); mej.rotation.y = sx * 0.62; cara.add(mej);
    return { g, blanco, pupila, brillo, arco };
  });
  const sonrisa = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.028, 8, 24, Math.PI), M.negro);
  sonrisa.position.set(0, 1.25, 1.0); sonrisa.rotation.z = Math.PI; cara.add(sonrisa);
  const bocaO = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), M.negro); bocaO.scale.set(1, 1.3, 0.4); bocaO.position.set(0, 1.23, 0.99); cara.add(bocaO);
  const destellos = new THREE.Group(); cuerpo.add(destellos);
  for (let i = 0; i < 5; i++) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 6), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
    const a = Math.PI / 2 + (i - 2) * 0.42; r.position.set(Math.cos(a) * 1.35, 1.1 + Math.sin(a) * 1.35, 0); r.rotation.z = a - Math.PI / 2; destellos.add(r);
  }
  // --- piernas y zapatillas ---
  for (const sx of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 8), M.alambre); p.position.set(sx * 0.16, -0.75, 0); cuerpo.add(p);
    const z = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.22, 4, 12), M.zapa); z.rotation.x = Math.PI / 2; z.position.set(sx * 0.18, -1.0, 0.08); cuerpo.add(z);
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.44), M.suela); s.position.set(sx * 0.18, -1.1, 0.08); cuerpo.add(s);
  }
  // --- brazos de alambre (se regeneran cada fotograma) ---
  const POSES = {
    reposo: [[-1.1, 0.25, 0.2], [1.1, 0.25, 0.2]], saludo: [[-1.1, 0.25, 0.2], [1.45, 2.05, 0.3]],
    senala: [[-1.1, 0.25, 0.2], [2.0, 1.15, 0.5]], senalaIzq: [[-2.0, 1.15, 0.5], [1.1, 0.25, 0.2]],
    pulgar: [[-1.1, 0.25, 0.2], [1.3, 0.9, 0.6]], celebra: [[-1.5, 2.2, 0.2], [1.5, 2.2, 0.2]], piensa: [[-1.1, 0.25, 0.2], [0.35, 1.05, 1.0]],
  };
  const brazos = [-1, 1].map(() => {
    const m = new THREE.Mesh(new THREE.BufferGeometry(), M.alambre); cuerpo.add(m);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), M.mano); cuerpo.add(h);
    return { m, h };
  });
  function actualizar(t, { expr = "normal", pose = "reposo", glow, mira = [0, 0] } = {}) {
    const gl = glow == null ? (expr === "idea" ? 1.35 : expr === "preocupado" ? 0.6 : 1) : glow;
    cuerpo.position.y = 1.05 + Math.sin(t * 2.4) * 0.03;
    M.vidrio.emissiveIntensity = 0.15 * gl; halo.material.opacity = clamp(0.55 * gl, 0, 1); if (luzP) luzP.intensity = 2.2 * gl;
    M.neon.color.setHex(gl > 1.1 ? 0xb9ffd2 : 0x5dff98);
    destellos.visible = expr === "idea"; destellos.rotation.z = Math.sin(t * 1.5) * 0.03;
    const ph = (t + 0.7) % 3.4, parp = ph < 0.12 ? Math.sin(ph / 0.12 * Math.PI) : 0;
    ojos.forEach((o, i) => {
      const cerrado = expr === "feliz" || (expr === "guino" && i === 1);
      const sy = cerrado ? 0.25 : (expr === "sorpresa" ? 1.2 : 1) * (1 - 0.9 * parp);
      o.blanco.visible = !cerrado; o.arco.visible = cerrado;
      o.g.scale.set(1, cerrado ? 1 : Math.max(0.08, sy), 1);
      o.pupila.position.set(mira[0] * 0.05, mira[1] * 0.05, 0.07); o.pupila.scale.setScalar(expr === "sorpresa" ? 0.75 : 1);
      o.pupila.visible = o.brillo.visible = !cerrado && sy > 0.3;
    });
    const abierta = expr === "sorpresa" || expr === "habla";
    sonrisa.visible = !abierta; bocaO.visible = abierta;
    sonrisa.rotation.z = expr === "preocupado" ? 0 : Math.PI;
    sonrisa.position.y = expr === "preocupado" ? 1.17 : 1.25;
    sonrisa.scale.setScalar(expr === "feliz" || expr === "idea" ? 1.35 : 1);
    if (expr === "habla") bocaO.scale.set(1, 0.5 + 1.1 * Math.abs(Math.sin(t * 13)), 0.4); else bocaO.scale.set(1, 1.3, 0.4);
    const P = POSES[pose] || POSES.reposo;
    brazos.forEach((b, i) => {
      const sx = i === 0 ? -1 : 1;
      const a = new THREE.Vector3(sx * 0.9, 0.95, 0);
      const h = new THREE.Vector3(...P[i]);
      if (pose === "saludo" && sx === 1) { h.x += Math.sin(t * 9) * 0.22; h.y += Math.cos(t * 9) * 0.05; }
      if (pose === "celebra") h.y += Math.sin(t * 7 + i) * 0.08;
      if (pose === "reposo") h.y += Math.sin(t * 2.2 + i) * 0.03;
      const mid = a.clone().add(h).multiplyScalar(0.5).add(new THREE.Vector3(sx * 0.18, -0.2, 0.1));
      b.m.geometry.dispose();
      b.m.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, h), 16, 0.035, 6);
      b.h.position.copy(h);
    });
  }
  actualizar(0);
  return { root, cuerpo, actualizar, POSES };
}
