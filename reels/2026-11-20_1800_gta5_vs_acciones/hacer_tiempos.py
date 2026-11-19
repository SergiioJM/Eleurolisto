"""Construye timings.json a partir de las palabras (con tiempos) de la transcripción de ElevenLabs.
Uso: python3 hacer_tiempos.py palabras.json   (lista [{"text"|"w", "start", "end"}])
     python3 hacer_tiempos.py --estimar        (reparte 27,04 s por caracteres: solo para previsualizar)
Las cifras dichas con letras se muestran con números en los subtítulos ("dos mil trece" -> "2013")."""
import json, re, sys, unicodedata

OFFSET = 0.2          # la voz empieza a los 0,2 s del vídeo (add_audio_to_video start_offset)
DUR_VOZ = 27.04
GUION = [
    "¿Y si en vez de comprar GTA cinco en dos mil trece hubieras metido sesenta euros en acciones de Take-Two, la empresa que lo publica?",
    "Hoy tendrías más de ochocientos euros: unas catorce veces más.",
    "Pero ojo: unos meses antes quebró la editora de Saints Row, su gran rival.",
    "A toro pasado, todos somos genios.",
    "Por eso, no te lo juegues todo a una sola empresa.",
    "¿Tú qué habrías elegido: el juego o las acciones?",
]
# fusiones para mostrar (secuencias de palabras habladas -> palabra mostrada)
FUSION = [(["dos", "mil", "trece"], "2013"), (["sesenta", "euros"], "60 €"), (["ochocientos", "euros:"], "800 €:"),
          (["ochocientos", "euros"], "800 €"), (["cinco"], "5"), (["catorce"], "14")]

def norm(w):
    w = unicodedata.normalize("NFD", w.lower()); w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)

def palabras_guion():
    out = []
    for i, s in enumerate(GUION):
        for w in s.split(): out.append((i, w))
    return out

def fusionar(ws):
    out, j = [], 0
    while j < len(ws):
        hecho = False
        for seq, disp in FUSION:
            n = len(seq)
            if [norm(x["w"]) for x in ws[j:j + n]] == [norm(x) for x in seq] and ws[j + n - 1]["w"].endswith(seq[-1][-1]) or \
               [norm(x["w"]) for x in ws[j:j + n]] == [norm(x) for x in seq] and not seq[-1].endswith(":"):
                d = disp
                if ws[j + n - 1]["w"].endswith((",", ":", ".", "?")) and not d.endswith((",", ":", ".", "?")): d += ws[j + n - 1]["w"][-1]
                out.append({"w": d, "start": ws[j]["start"], "end": ws[j + n - 1]["end"]}); j += n; hecho = True; break
        if not hecho: out.append(ws[j]); j += 1
    return out

def construir(tiempos):
    """tiempos: lista de (inicio, fin) para cada palabra del guion (mismo orden)."""
    pg = palabras_guion(); assert len(pg) == len(tiempos), (len(pg), len(tiempos))
    segs = []
    for i in range(len(GUION)):
        ws = [{"w": w, "start": round(a + OFFSET, 3), "end": round(b + OFFSET, 3)} for (k, w), (a, b) in zip(pg, tiempos) if k == i]
        ws = fusionar(ws)
        segs.append({"i": i, "start": ws[0]["start"], "dur": round(ws[-1]["end"] - ws[0]["start"], 3), "text": GUION[i], "words": ws})
    fin = max(b for a, b in tiempos) + OFFSET
    return {"total": round(fin + 1.6, 2), "voz": "ElevenLabs · Juanjo Viral (30jLfQdV8RTduXvosh02), eleven_v4", "offset_voz": OFFSET, "segments": segs}

if __name__ == "__main__":
    if sys.argv[1] == "--estimar":
        pg = palabras_guion(); pesos = [len(w) + 2 + (6 if w[-1] in ",:" else 0) + (10 if w[-1] in ".?" else 0) for _, w in pg]
        tot = sum(pesos); t = 0.05; tiempos = []
        for p in pesos: d = p / tot * (DUR_VOZ - 0.1); tiempos.append((t, t + d * 0.85)); t += d
        tim = construir(tiempos); tim["estimado"] = True
    else:
        raw = json.load(open(sys.argv[1])); raw = [w for w in raw if (w.get("type", "word") == "word")]
        pg = palabras_guion()
        # alinea por posición tras normalizar (Take-Two puede venir en dos palabras, cifras con números...)
        rw = []
        for w in raw:
            txt = w.get("text", w.get("w", "")).strip()
            if not norm(txt): continue
            rw.append((txt, w["start"], w["end"]))
        if len(rw) != len(pg):
            print("AVISO: la transcripción tiene", len(rw), "palabras y el guion", len(pg)); print([x[0] for x in rw])
        tiempos = []; j = 0
        for k, (i, w) in enumerate(pg):
            tiempos.append((rw[min(j, len(rw) - 1)][1], rw[min(j, len(rw) - 1)][2])); j += 1
        tim = construir(tiempos)
        txt_t = " ".join(x[0] for x in rw); print("TRANSCRIPCIÓN:", txt_t)
    json.dump(tim, open("timings.json", "w"), ensure_ascii=False, indent=1)
    print("total", tim["total"], "| segmentos:", [(s["start"], s["dur"]) for s in tim["segments"]])
    print([w["w"] for s in tim["segments"] for w in s["words"]])
