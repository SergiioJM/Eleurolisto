// lib3d.js — piezas reutilizables para los reels 3D de El Euro Listo (Three.js, estilo low-poly cálido).
import * as THREE from "three";

// ---------- tiempo y suavizado ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const prog = (t, a, d) => clamp((t - a) / d);
export const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeOut = (k) => 1 - Math.pow(1 - k, 3);
export const easeIn = (k) => k * k * k;
export const easeBack = (k, s = 1.7) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
export const smooth = (k) => k * k * (3 - 2 * k);
export const v3 = (a) => new THREE.Vector3(...a);
export const fmtEur = (v) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";

// Cámara: fotogramas clave {t, p:[x,y,z], m:[x,y,z] (a dónde mira), fov}; tramos suavizados + filtro gaussiano
// para que no haya paradas bruscas: el movimiento resulta continuo y "de cine".
export function camaraSuave(keys, ventana = 0.35) {
  const raw = (t) => {
    if (t <= keys[0].t) return keys[0];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t <= b.t) {
        const k = easeInOut((t - a.t) / (b.t - a.t));
        return { p: a.p.map((v, j) => lerp(v, b.p[j], k)), m: a.m.map((v, j) => lerp(v, b.m[j], k)), fov: lerp(a.fov, b.fov, k) };
      }
    }
    return keys[keys.length - 1];
  };
  return (t) => {
    let p = [0, 0, 0], m = [0, 0, 0], fov = 0, wsum = 0;
    for (let i = -6; i <= 6; i++) {
      const dt = (i / 6) * ventana, w = Math.exp(-((i / 6) ** 2) * 3);
      const r = raw(t + dt);
      for (let j = 0; j < 3; j++) { p[j] += r.p[j] * w; m[j] += r.m[j] * w; }
      fov += r.fov * w; wsum += w;
    }
    return { p: p.map((v) => v / wsum), m: m.map((v) => v / wsum), fov: fov / wsum };
  };
}

// ---------- geometría low-poly ----------
const _mats = new Map();
export function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!_mats.has(key)) _mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0, flatShading: true, ...o }));
  return _mats.get(key);
}
export function malla(geo, color, pos = [0, 0, 0], o = {}) {
  const m = new THREE.Mesh(geo, color instanceof THREE.Material ? color : mat(color, o));
  m.position.set(...pos);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
export const caja = (w, h, d, color, pos, o) => malla(new THREE.BoxGeometry(w, h, d), color, pos, o);
export const cil = (rt, rb, h, color, pos, seg = 10, o) => malla(new THREE.CylinderGeometry(rt, rb, h, seg), color, pos, o);
export const bola = (r, color, pos, det = 1, o) => malla(new THREE.IcosahedronGeometry(r, det), color, pos, o);

// Textura de suelo de tablones
export function texturaTablones(base = "#9a5a3a", n = 8) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  const col = new THREE.Color(base);
  for (let i = 0; i < n; i++) {
    const k = 0.9 + ((i * 37) % 7) * 0.025;
    g.fillStyle = `rgb(${col.r * 255 * k},${col.g * 255 * k},${col.b * 255 * k})`;
    g.fillRect(0, (i * 512) / n, 512, 512 / n);
    g.fillStyle = "rgba(0,0,0,0.18)";
    g.fillRect(0, (i * 512) / n, 512, 3);
    g.fillRect(((i * 211) % 512), (i * 512) / n, 3, 512 / n);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ---------- personaje de bloques ----------
// Devuelve {root, cuerpo, cabeza, brazoI, brazoD, piernaI, piernaD}. Pivotes en hombros/caderas/cuello.
export function persona({ chaqueta = 0xd39b2f, pantalon = 0x2e3a55, piel = 0xc98a5e, pelo = 0x3b2416, zapatos = 0x1f1f24 } = {}) {
  const root = new THREE.Group();
  const cuerpo = new THREE.Group();
  root.add(cuerpo);
  const pierna = (x) => {
    const g = new THREE.Group();
    g.position.set(x, 0.86, 0);
    g.add(caja(0.17, 0.8, 0.19, pantalon, [0, -0.4, 0]));
    g.add(caja(0.19, 0.08, 0.27, zapatos, [0, -0.82, 0.04]));
    cuerpo.add(g);
    return g;
  };
  const piernaI = pierna(-0.11), piernaD = pierna(0.11);
  const torso = new THREE.Group();
  torso.position.set(0, 0.86, 0);
  cuerpo.add(torso);
  torso.add(caja(0.52, 0.66, 0.3, chaqueta, [0, 0.33, 0]));
  torso.add(caja(0.2, 0.08, 0.31, 0xf1e6d0, [0, 0.62, 0.01])); // cuello de camisa
  const brazo = (x) => {
    const g = new THREE.Group();
    g.position.set(x, 0.6, 0);
    g.add(caja(0.14, 0.58, 0.16, chaqueta, [0, -0.27, 0]));
    g.add(caja(0.12, 0.13, 0.13, piel, [0, -0.6, 0]));
    torso.add(g);
    return g;
  };
  const brazoI = brazo(-0.34), brazoD = brazo(0.34);
  const cabeza = new THREE.Group();
  cabeza.position.set(0, 0.7, 0);
  torso.add(cabeza);
  cabeza.add(caja(0.12, 0.08, 0.12, piel, [0, 0.03, 0]));
  cabeza.add(caja(0.34, 0.36, 0.32, piel, [0, 0.24, 0]));
  cabeza.add(caja(0.36, 0.12, 0.34, pelo, [0, 0.44, -0.01]));
  cabeza.add(caja(0.36, 0.24, 0.08, pelo, [0, 0.33, -0.15]));
  const ojoMat = mat(0x141414);
  for (const x of [-0.08, 0.08]) cabeza.add(caja(0.045, 0.06, 0.02, ojoMat, [x, 0.26, 0.165]));
  const boca = caja(0.09, 0.025, 0.02, 0x7a3b2a, [0, 0.15, 0.165]);
  cabeza.add(boca);
  const cejas = [-0.08, 0.08].map((x) => { const c = caja(0.075, 0.018, 0.02, pelo, [x, 0.335, 0.166]); cabeza.add(c); return c; });
  return { root, cuerpo, torso, cabeza, boca, cejas, brazoI, brazoD, piernaI, piernaD };
}

// Gira la cabeza (en local) hacia un punto del mundo, con límites
export function mirarA(p, objetivo, k = 1) {
  const cab = p.cabeza;
  const w = new THREE.Vector3();
  cab.getWorldPosition(w);
  const d = objetivo.clone().sub(w);
  const yawMundo = Math.atan2(d.x, d.z);
  const rootYaw = p.root.rotation.y;
  let yaw = yawMundo - rootYaw;
  yaw = Math.atan2(Math.sin(yaw), Math.cos(yaw));
  const pitch = -Math.atan2(d.y, Math.hypot(d.x, d.z));
  cab.rotation.y = lerp(cab.rotation.y, clamp(yaw, -1.2, 1.2), k);
  cab.rotation.x = lerp(cab.rotation.x, clamp(pitch, -0.6, 0.5), k);
}

// ---------- partículas "puf" ----------
export function puf(escena, n = 12, color = 0xfff4dc) {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
  const dirs = [];
  for (let i = 0; i < n; i++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035 + (i % 3) * 0.012, 0), m);
    g.add(s);
    const a = (i / n) * Math.PI * 2;
    dirs.push(new THREE.Vector3(Math.cos(a), 0.35 + (i % 4) * 0.25, Math.sin(a)));
  }
  g.visible = false;
  escena.add(g);
  return (t, t0, pos) => {
    const k = (t - t0) / 0.55;
    g.visible = k >= 0 && k <= 1;
    if (!g.visible) return;
    g.position.copy(pos);
    m.opacity = 1 - easeIn(k);
    g.children.forEach((s, i) => s.position.copy(dirs[i]).multiplyScalar(0.05 + easeOut(k) * 0.35));
  };
}

// ---------- subtítulos palabra a palabra con selección "de editor" ----------
// tim: TIM (segments[].words). sust: [{de:["diez","mil","euros"], a:"10.000 €"}]. clave: palabras en ámbar.
export function subtitulos(el, tim, { sust = [], clave = [], maxPal = 4, maxCar = 20 } = {}) {
  const limpio = (w) => w.toLowerCase().replace(/[¿¡…\.,\?\!:]/g, "");
  const tokens = [];
  for (const s of tim.segments) {
    const ws = s.words;
    for (let i = 0; i < ws.length; i++) {
      let hecho = false;
      for (const r of sust) {
        const n = r.de.length;
        if (ws.slice(i, i + n).map((w) => limpio(w.w)).join(" ") === r.de.join(" ")) {
          const fin = ws[i + n - 1].w.match(/[…\.,\?\!:]+$/);
          tokens.push({ w: r.a + (fin ? fin[0] : ""), start: ws[i].start, end: ws[i + n - 1].end, fin: i + n - 1 === ws.length - 1 });
          i += n - 1;
          hecho = true;
          break;
        }
      }
      if (!hecho) tokens.push({ w: ws[i].w, start: ws[i].start, end: ws[i].end, fin: i === ws.length - 1 });
    }
  }
  if (tokens.length && tokens[0].start < 0.3) tokens[0].start = 0;
  const chunks = [];
  let cur = [];
  const cierra = () => { if (cur.length) chunks.push(cur); cur = []; };
  for (const tk of tokens) {
    const len = cur.map((x) => x.w).join(" ").length + tk.w.length + 1;
    if (cur.length >= maxPal || (cur.length && len > maxCar)) cierra();
    cur.push(tk);
    if (tk.fin || /[…\.\?\!,:]$/.test(tk.w)) cierra();
  }
  cierra();
  chunks.forEach((c, i) => { c.a = i === 0 ? -0.5 : c[0].start - 0.04; c.b = i < chunks.length - 1 ? Math.min(chunks[i + 1][0].start - 0.04, c[c.length - 1].end + 0.9) : c[c.length - 1].end + 1.2; });
  const esClave = (w) => clave.some((k) => limpio(w).startsWith(k));
  return (t) => {
    const c = chunks.find((c) => t >= c.a && t < c.b);
    if (!c) { el.innerHTML = ""; return; }
    const kin = easeOut(prog(t, c.a, 0.18));
    el.style.transform = `translateY(${(1 - kin) * 24}px) scale(${0.94 + 0.06 * kin})`;
    el.style.opacity = kin;
    el.innerHTML = c.map((tk, i) => {
      const activa = t >= tk.start - 0.03 && (t < tk.end + 0.05 || (i === c.length - 1));
      const dicha = t >= tk.start - 0.03;
      const cls = ["w", dicha ? "dicha" : "", activa && dicha ? "on" : "", esClave(tk.w) ? "clave" : ""].join(" ");
      const asas = activa && dicha ? '<i class="h a"></i><i class="h b"></i><i class="h c"></i><i class="h d"></i>' : "";
      return `<span class="${cls}">${tk.w}${asas}</span>`;
    }).join(" ");
  };
}

export const CSS_BASE = `
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#000;font-family:'Poppins',sans-serif}
canvas{position:absolute;inset:0}
.ov{position:absolute;pointer-events:none}
#subs{left:60px;right:60px;top:255px;text-align:center;font-weight:700;font-size:74px;line-height:1.22;color:#fff;
  text-shadow:0 4px 18px rgba(0,0,0,.55),0 2px 4px rgba(0,0,0,.5);letter-spacing:-0.5px}
#subs .w{position:relative;display:inline-block;opacity:0;padding:0 8px;margin:4px 0}
#subs .w.dicha{opacity:.72}
#subs .w.on{opacity:1;outline:4px solid #4d8dff;outline-offset:2px;border-radius:3px;background:rgba(40,80,170,.22)}
#subs .w.clave.dicha{color:#ffc547}
#subs .h{position:absolute;width:14px;height:14px;background:#fff;border:3px solid #4d8dff;border-radius:50%}
#subs .h.a{left:-9px;top:-9px}#subs .h.b{right:-9px;top:-9px}#subs .h.c{left:-9px;bottom:-9px}#subs .h.d{right:-9px;bottom:-9px}
`;
