// fondo_limpio.mjs <carpeta_reel> <t1,t2,...> — fotogramas 3D sin textos (para el fondo de la portada) en <carpeta>/portada/fondo_<t>.jpg
import fs from "node:fs"; import path from "node:path"; import { createRequire } from "node:module";
const puppeteer = createRequire(path.join(path.dirname(new URL(import.meta.url).pathname), "package.json"))("puppeteer-core");
const dir = path.resolve(process.argv[2]); const ts = process.argv[3].split(",").map(Number);
fs.mkdirSync(dir + "/portada", { recursive: true });
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--allow-file-access-from-files", "--disable-web-security"] });
const p = await b.newPage(); await p.setViewport({ width: 1080, height: 1920 });
if (fs.existsSync(dir + "/timings.json")) await p.evaluateOnNewDocument(`window.TIM = ${fs.readFileSync(dir + "/timings.json", "utf8")};`);
await p.goto("file://" + dir + "/escena.html"); await p.waitForFunction("window.listo===true", { timeout: 60000 });
for (const t of ts) { await p.evaluate((t) => { window.renderAt(t); document.querySelectorAll(".ov").forEach((e) => (e.style.display = "none")); }, t); await p.screenshot({ path: `${dir}/portada/fondo_${t}.jpg`, type: "jpeg", quality: 93 }); }
await b.close(); console.log("fondos ->", dir + "/portada");
