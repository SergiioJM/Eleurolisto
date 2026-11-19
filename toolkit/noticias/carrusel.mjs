// carrusel.mjs — genera las imágenes de una "Noticia flash" de El Euro Listo a partir de un JSON.
//
//   node toolkit/noticias/carrusel.mjs noticias/AAAA-MM-DD_slug/noticia.json
//
// Salida junto al JSON: ig_1.jpg… (1080x1350, feed de Instagram) y tt_1.jpg… (1080x1920, fotos de TikTok).
// Tipos de diapositiva: portada {etiqueta, titular, bajada}, cifra {cifra, texto, nota, cifraTam?}, puntos {titulo, puntos[]},
// cierre {titulo, puntos[], cta}, mito {mito, realidad, nota} (tarjeta roja tachada + tarjeta verde). En los textos, <em>…</em> resalta en ámbar.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(path.resolve(path.dirname(new URL(import.meta.url).pathname), "../escena3d/package.json"));
const puppeteer = require("puppeteer-core");

const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const outDir = path.dirname(path.resolve(process.argv[2]));
const N = spec.slides.length;

const css = (W, H) => `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:'Poppins',sans-serif;color:#fff;background:#0d1326;position:relative}
.bg{position:absolute;inset:0;background:
  radial-gradient(1200px 700px at 85% -10%, rgba(77,141,255,.28), transparent 60%),
  radial-gradient(900px 600px at -10% 110%, rgba(255,197,71,.16), transparent 60%),
  linear-gradient(180deg,#111a33,#0b1022)}
.grid{position:absolute;inset:0;opacity:.07;background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);background-size:60px 60px}
.wrap{position:absolute;left:84px;right:84px;top:${H > 1500 ? 300 : 96}px;bottom:${H > 1500 ? 380 : 96}px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:auto}
.tag{font:700 30px 'Poppins';letter-spacing:3px;padding:12px 26px;border-radius:40px;background:#ff4d3d;color:#fff;display:flex;align-items:center;gap:12px}
.tag i{width:14px;height:14px;border-radius:50%;background:#fff;display:inline-block}
.num{font:600 28px 'DejaVu Sans Mono',monospace;color:rgba(255,255,255,.55)}
em{font-style:normal;color:#ffc547}
h1{font:800 92px/1.06 'Poppins';letter-spacing:-2px;margin:40px 0 30px}
h2{font:800 66px/1.1 'Poppins';letter-spacing:-1px;margin-bottom:40px}
.bajada{font:500 42px/1.35 'Poppins';color:#d6def5}
.cifra{font:800 230px/1 'Poppins';letter-spacing:-6px;color:#ffc547;margin:20px 0 26px}
.texto{font:600 50px/1.3 'Poppins'}
.nota{font:500 34px/1.4 'Poppins';color:#aab5d6;margin-top:28px}
ul{list-style:none;display:flex;flex-direction:column;gap:34px}
li{display:flex;gap:26px;font:600 44px/1.3 'Poppins'}
li b{flex:none;width:64px;height:64px;border-radius:18px;background:#4d8dff;color:#fff;font:800 36px/64px 'Poppins';text-align:center}
.cta{margin-top:50px;display:inline-flex;align-self:flex-start;gap:16px;align-items:center;font:700 42px 'Poppins';color:#14181f;background:#ffc547;padding:20px 38px;border-radius:60px}
.pie{display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:40px;border-top:2px solid rgba(255,255,255,.12)}
.marca{font:700 36px 'Poppins'}
.marca span{color:#ffc547}
.fuente{font:500 28px/1.35 'Poppins';color:#aab5d6;text-align:right;max-width:62%}
.flecha{font:700 30px 'Poppins';color:#ffc547}
.mv{display:flex;flex-direction:column;gap:${H > 1500 ? 44 : 30}px}
.mv .card{border-radius:34px;padding:${H > 1500 ? "40px 44px" : "30px 40px"};position:relative}
.mv .mito{background:rgba(239,68,68,.12);border:3px solid rgba(239,68,68,.55)}
.mv .real{background:rgba(34,197,94,.13);border:3px solid rgba(34,197,94,.6)}
.mv .lab{display:inline-flex;align-items:center;gap:14px;font:800 32px 'Poppins';letter-spacing:3px;padding:8px 22px;border-radius:30px;margin-bottom:${H > 1500 ? 22 : 16}px}
.mv .mito .lab{background:#ef4444;color:#fff}
.mv .real .lab{background:#22c55e;color:#0b1022}
.mv .mito p{font:600 ${H > 1500 ? 46 : 42}px/1.3 'Poppins';color:#f3c4c4;text-decoration:line-through;text-decoration-color:rgba(239,68,68,.85);text-decoration-thickness:4px}
.mv .real p{font:600 ${H > 1500 ? 48 : 43}px/1.3 'Poppins'}
.mv .real small{display:block;font:500 ${H > 1500 ? 32 : 30}px/1.4 'Poppins';color:#aab5d6;margin-top:16px}
`;

function cuerpo(s, i) {
  const n = `<div class="num">${i + 1}/${N}</div>`;
  const tag = `<div class="tag"><i></i>${s.etiqueta || spec.etiqueta || "ÚLTIMA HORA"}</div>`;
  let mid = "";
  if (s.tipo === "portada") mid = `<h1>${s.titular}</h1><div class="bajada">${s.bajada || ""}</div>`;
  if (s.tipo === "cifra") mid = `<div class="cifra"${s.cifraTam ? ` style="font-size:${s.cifraTam}px"` : ""}>${s.cifra}</div><div class="texto">${s.texto}</div>${s.nota ? `<div class="nota">${s.nota}</div>` : ""}`;
  if (s.tipo === "mito")
    mid = `<div class="mv"><div class="card mito"><div class="lab">✕ MITO</div><p>${s.mito}</p></div>` +
      `<div class="card real"><div class="lab">✓ REALIDAD</div><p>${s.realidad}</p>${s.nota ? `<small>${s.nota}</small>` : ""}</div></div>`;
  if (s.tipo === "puntos" || s.tipo === "cierre")
    mid = `<h2>${s.titulo}</h2><ul>${(s.puntos || []).map((p, k) => `<li><b>${k + 1}</b><span>${p}</span></li>`).join("")}</ul>` +
      (s.cta ? `<div class="cta">${s.cta}</div>` : "");
  const derecha = i === N - 1 ? `<div class="fuente">Fuente: ${spec.fuente}<br>${spec.fecha}</div>` : `<div class="flecha">Desliza →</div>`;
  return `<div class="bg"></div><div class="grid"></div><div class="wrap">
    <div class="top">${tag}${n}</div><div style="margin:auto 0">${mid}</div>
    <div class="pie"><div class="marca">@eleuro<span>listo</span></div>${derecha}</div></div>`;
}

const browser = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox", "--hide-scrollbars"] });
const page = await browser.newPage();
for (const [pref, W, H] of [["ig", 1080, 1350], ["tt", 1080, 1920]]) {
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  for (let i = 0; i < N; i++) {
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css(W, H)}</style></head><body>${cuerpo(spec.slides[i], i)}</body></html>`);
    await page.evaluate("document.fonts.ready");
    await page.screenshot({ path: path.join(outDir, `${pref}_${i + 1}.jpg`), type: "jpeg", quality: 92 });
  }
}
await browser.close();
console.log(`listo: ${N} diapositivas x2 formatos en ${outDir}`);
