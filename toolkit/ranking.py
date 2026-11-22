"""Ranking de TODOS los vídeos de @eleurolisto (IG + TikTok) -> content/ranking.md.
Uso: python3 toolkit/ranking.py   (lee content/metricas.json, que actualiza la tarea nocturna cada noche)

Puntuaciones (0–100, comparables entre vídeos):
  GANCHO     = 100 − skip de Instagram (cuánta gente NO pasa el vídeo en los primeros segundos)
  RETENCIÓN  = % visto de media en Instagram (tope 100)
  ALCANCE    = vistas IG + TikTok, en escala logarítmica respecto al mejor vídeo
  INTERACCIÓN= (likes + comentarios×3 + compartidos×5 + guardados×4) / vistas totales × 1.000, respecto al mejor
  TOTAL      = 0,35·GANCHO + 0,20·RETENCIÓN + 0,30·ALCANCE + 0,15·INTERACCIÓN
Los comentarios, compartidos y guardados pesan más porque son lo que más empuja al algoritmo y trae seguidores."""
import json, math, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(R, "content", "metricas.json")))
V = D["videos"]
def g(x, k): return (x or {}).get(k) or 0
for v in V:
    ig, tt = v.get("ig", {}), v.get("tt", {})
    v["vistas"] = g(ig, "vistas") + g(tt, "vistas")
    v["inter_bruto"] = sum(g(ig, k) * w + g(tt, k) * w for k, w in (("likes", 1), ("coment", 3), ("comp", 5), ("guard", 4)))
    v["coment_tot"] = g(ig, "coment") + g(tt, "coment"); v["comp_tot"] = g(ig, "comp") + g(tt, "comp"); v["guard_tot"] = g(ig, "guard") + g(tt, "guard")
mx_v = max(v["vistas"] for v in V) or 1
mx_i = max((v["inter_bruto"] / max(v["vistas"], 1)) for v in V) or 1
for v in V:
    ig = v.get("ig", {})
    v["s_gancho"] = 100 - (ig.get("skip") if ig.get("skip") is not None else 50)
    v["s_ret"] = min(100, ig.get("visto") or 0)
    v["s_alc"] = 100 * math.log10(1 + v["vistas"]) / math.log10(1 + mx_v)
    v["s_int"] = 100 * (v["inter_bruto"] / max(v["vistas"], 1)) / mx_i
    v["total"] = 0.35 * v["s_gancho"] + 0.20 * v["s_ret"] + 0.30 * v["s_alc"] + 0.15 * v["s_int"]
orden = sorted(V, key=lambda v: -v["total"])
f = lambda x: f"{x:.0f}"
L = [f"# Ranking de vídeos — @eleurolisto", "", f"Actualizado: {D.get('actualizado','')}. Generado con `python3 toolkit/ranking.py` desde `content/metricas.json` (no editar a mano).", ""]
c = D.get("cuenta", {})
L += [f"**Cuenta:** IG {c.get('ig_seguidores','?')} seguidores" + (f" · TikTok {c['tt_seguidores']} seguidores" if c.get("tt_seguidores") else "") +
      (f" · IG 14 días: alcance {c['ig_5dias']['alcance']}, vistas {c['ig_5dias']['vistas']}, visitas al perfil {c['ig_5dias']['visitas_perfil']}, interacciones {c['ig_5dias']['interacciones']}" if c.get("ig_5dias") else ""), ""]
L += ["| # | Fecha | Tema | Look | Voz | Gancho (0–3 s) | Vistas IG+TT | GANCHO | RETENC. | ALCANCE | INTERAC. | **TOTAL** |", "|---|---|---|---|---|---|---|---|---|---|---|---|"]
for i, v in enumerate(orden, 1):
    L.append(f"| {i} | {v['fecha'][5:]} {v['hora']} | {v['tema']} | {v['look']} | {v['voz']} | {v['gancho']} | {g(v.get('ig'),'vistas')}+{g(v.get('tt'),'vistas')} | {f(v['s_gancho'])} | {f(v['s_ret'])} | {f(v['s_alc'])} | {f(v['s_int'])} | **{f(v['total'])}** |")
def media(clave, filtro):
    xs = [v[clave] for v in V if filtro(v)]; return (sum(xs) / len(xs), len(xs)) if xs else (None, 0)
L += ["", "## Comparativas automáticas (media de la puntuación TOTAL)", ""]
grupos = {
    "Voz premium (Javier/ElevenLabs) vs local": [("premium", lambda v: not v["voz"].startswith("local")), ("local", lambda v: v["voz"].startswith("local"))],
    "3D vs 2D": [("3D", lambda v: "3D" in v["look"]), ("2D/otros", lambda v: "3D" not in v["look"])],
    "Gancho en pregunta (¿…?) vs afirmación": [("pregunta", lambda v: "¿" in v["gancho"]), ("afirmación", lambda v: "¿" not in v["gancho"])],
    "Ahorro básico vs resto de pilares": [("ahorro", lambda v: v["pilar"] == "Ahorro"), ("resto", lambda v: v["pilar"] != "Ahorro")],
    "13:30 vs 20:30 vs especiales": [("13:30", lambda v: v["hora"] == "13:30"), ("20:30", lambda v: v["hora"] == "20:30"), ("otras horas", lambda v: v["hora"] not in ("13:30", "20:30"))],
}
for t, gs in grupos.items():
    partes = []
    for nombre, fil in gs:
        m, n = media("total", fil)
        if n: partes.append(f"{nombre}: {m:.0f} (n={n})")
    L.append(f"- **{t}:** " + " · ".join(partes))
L += ["", f"- Comentarios totales: {sum(v['coment_tot'] for v in V)} · compartidos: {sum(v['comp_tot'] for v in V)} · guardados: {sum(v['guard_tot'] for v in V)} en {len(V)} vídeos.", ""]
if D.get("posts"):
    L += ["## Posts de imágenes (carruseles)", "", "| Post | Tipo | Vistas IG | Alcance IG | Vistas TikTok |", "|---|---|---|---|---|"]
    for p in D["posts"]:
        L.append(f"| {p['tema']} | {p['tipo']} | {g(p.get('ig'),'vistas')} | {g(p.get('ig'),'alcance')} | {g(p.get('tt'),'vistas')} |")
open(os.path.join(R, "content", "ranking.md"), "w").write("\n".join(L) + "\n")
print("\n".join(L[:len(orden) + 8]))
