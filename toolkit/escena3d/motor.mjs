// motor.mjs — renderiza una escena 3D (HTML + Three.js) fotograma a fotograma con Chrome headless.
//
//   node motor.mjs <escena.html> <salida.mp4> [--fps 30] [--w 1080] [--h 1920]
//   node motor.mjs <escena.html> --stills 0.5,3,8.2 [--out carpeta]    -> PNG de esos instantes (revisión)
//
// La escena debe definir window.DURACION (s), window.listo (true cuando ha cargado) y window.renderAt(t).
// Si junto a la escena hay timings.json, se inyecta como window.TIM antes de cargar.
// Cada fotograma se dibuja de forma determinista para su instante: movimiento perfectamente fluido.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const html = path.resolve(args[0]);
const fps = +opt("--fps", 30), W = +opt("--w", 1080), H = +opt("--h", 1920);
const stills = opt("--stills", null);
const out = stills ? null : path.resolve(args[1]);
const CHROME = process.env.CHROME || "/usr/bin/google-chrome";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--allow-file-access-from-files",
         "--disable-web-security", "--hide-scrollbars", "--font-render-hinting=none"],
});
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warn") console.log("[escena]", m.text()); });
page.on("pageerror", (e) => console.log("[escena error]", e.message));
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
const tim = path.join(path.dirname(html), "timings.json");
if (fs.existsSync(tim)) await page.evaluateOnNewDocument(`window.TIM = ${fs.readFileSync(tim, "utf8")};`);
await page.goto("file://" + html);
await page.waitForFunction("window.listo === true", { timeout: 60000 });
await page.evaluate("document.fonts.ready");
const dur = await page.evaluate("window.DURACION");

if (stills) {
  const dir = path.resolve(opt("--out", path.join(path.dirname(html), "stills")));
  fs.mkdirSync(dir, { recursive: true });
  for (const s of stills.split(",").map(Number)) {
    await page.evaluate((t) => window.renderAt(t), s);
    await page.screenshot({ path: path.join(dir, `t${s.toFixed(2)}.png`) });
  }
  console.log("stills ->", dir);
} else {
  const tmp = out.replace(/\.mp4$/, ".tmp.mp4");
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg",
    "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(fps), tmp],
    { stdio: ["pipe", "inherit", "inherit"] });
  const N = Math.round(dur * fps), t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await page.evaluate((t) => window.renderAt(t), f / fps);
    const buf = await page.screenshot({ type: "jpeg", quality: 92, optimizeForSpeed: true });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 90 === 0) console.log(`fotograma ${f}/${N}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  const code = await new Promise((r) => ff.on("close", r));
  if (code !== 0) { console.error("ffmpeg falló"); process.exit(1); }
  fs.renameSync(tmp, out);
  console.log(`listo: ${out}  ${N} fotogramas en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
await browser.close();
