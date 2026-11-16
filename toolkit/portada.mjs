// portada.mjs — portada llamativa 1080x1920 para un reel (fondo = un fotograma del vídeo + gancho grande).
//
//   node toolkit/portada.mjs portada.json
//   {"fondo": "frame.jpg", "salida": "portada.jpg", "kicker": "GASTOS HORMIGA",
//    "titulo": "2 € al día = <em>7.300 €</em>", "sub": "en 10 años", "posicion": "abajo"|"centro"}
//
// El texto va dentro de la zona que se ve en la cuadrícula del perfil (recorte 3:4, y 240–1680).
// Sirve para cambiar la portada a mano en Instagram (Editar → Editar portada → Añadir desde el carrete).
// En los reels nuevos la portada va en el fotograma 0 del propio vídeo (vidIQ no permite subir portada aparte).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const here = path.dirname(new URL(import.meta.url).pathname);
const puppeteer = createRequire(path.join(here, "escena3d/package.json"))("puppeteer-core");

const specPath = path.resolve(process.argv[2]);
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const base = path.dirname(specPath);
const fondo = "file://" + path.resolve(base, spec.fondo);
const abajo = (spec.posicion || "abajo") === "abajo";

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#0b1022}
.bg{position:absolute;inset:0;background:url('${fondo}') center/cover}
.sh{position:absolute;inset:0;background:${abajo
  ? "linear-gradient(180deg,rgba(6,8,18,0) 35%,rgba(6,8,18,.82) 62%,rgba(6,8,18,.9) 100%)"
  : "radial-gradient(ellipse 85% 42% at 50% 50%,rgba(6,8,18,.82),rgba(6,8,18,.2) 80%)"}}
.t{position:absolute;left:60px;right:60px;${abajo ? `top:${spec.top || 1040}px` : "top:0;bottom:0"};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.kicker{font:700 40px 'Poppins';letter-spacing:6px;color:#fff;background:#ff4d3d;padding:10px 28px;border-radius:40px;margin-bottom:30px}
h1{margin:0;font:800 132px/0.98 'Inter';color:#fff;letter-spacing:-4px;text-transform:uppercase;text-shadow:0 10px 40px rgba(0,0,0,.7)}
h1 em{font-style:normal;color:#ffc547}
.sub{font:700 56px 'Poppins';color:#fff;margin-top:30px;background:rgba(255,255,255,.14);padding:12px 34px;border-radius:50px}
.marca{position:absolute;left:0;right:0;top:1740px;text-align:center;font:700 34px 'Poppins';color:rgba(255,255,255,.75)}
</style></head><body><div class="bg"></div><div class="sh"></div>
<div class="t">${spec.kicker ? `<div class="kicker">${spec.kicker}</div>` : ""}<h1>${spec.titulo}</h1>${spec.sub ? `<div class="sub">${spec.sub}</div>` : ""}</div>
<div class="marca">@eleurolisto</div></body></html>`;

const browser = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox", "--allow-file-access-from-files", "--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
const tmp = path.join(base, ".portada_tmp.html");
fs.writeFileSync(tmp, html);
await page.goto("file://" + tmp, { waitUntil: "load" });
fs.unlinkSync(tmp);
await page.evaluate("document.fonts.ready");
const out = path.resolve(base, spec.salida || "portada.jpg");
await page.screenshot({ path: out, type: "jpeg", quality: 93 });
await browser.close();
console.log("portada ->", out);
