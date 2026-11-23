"""Voz local v1 (Hombre 1, Piper davefx) -> voice.wav + timings.json (0 créditos)."""
import sys, json
sys.path.insert(0, "../../toolkit")
import voces
FR = [
    "Ese menos cuarenta por ciento del Blac Fráidei... puede ser mentira.",
    "Trampa uno: te suben el precio antes, para bajártelo.",
    "Por ley, el tachado debe ser el precio más bajo de los últimos treinta días.",
    "Trampa dos: cuentas atrás y «solo quedan dos». Muchas veces, teatro.",
    "Trampa tres: gastos que aparecen al pagar.",
    "¿Comprarás algo el viernes? Comenta: uno, sí; dos, paso.",
]
ls = float(sys.argv[1]) if len(sys.argv) > 1 else 0.86
voces.make(FR, ".", voz="v1", lead=0.25, gap=0.16, tail=0.9, length_scale=ls)
T = json.load(open("timings.json"))
for s in T["segments"] if isinstance(T, dict) else T: print(round(s["start"],2), round(s["dur"],2), s["text"][:60])
print(T.get("total") if isinstance(T, dict) else "")
