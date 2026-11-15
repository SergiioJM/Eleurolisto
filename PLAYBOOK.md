# PLAYBOOK — rutina nocturna de @eleurolisto

Cada noche se crean **dos reels originales para el día siguiente**, se envían a Sergio para que los apruebe en el chat de Claude y, si los aprueba, se publican solos a su hora. Si rechaza uno, se hace otro y se vuelve a enviar.

## Datos fijos
- Cuenta: Instagram **@eleurolisto** (El Euro Listo), conectada a vidIQ. `platformAccountId`: `29395123383456641`.
- Repositorio: `SergiioJM/Eleurolisto` (público; los vídeos se sirven desde `https://raw.githubusercontent.com/SergiioJM/Eleurolisto/main/...`).
- Horarios (Europe/Madrid): **13:30** reel corto y **20:30** reel elaborado.
- Idioma: español de España. Público: gente joven de España que quiere ordenar su dinero.
- Créditos vidIQ: plan de 150 al mes (se renuevan el día 15). Usa `vidiq_balance` antes de gastar.

## 1. Preparar el entorno
1. `add_repo` SergiioJM/Eleurolisto con acceso `push`, clonarlo y `register_repo_root`.
2. `bash toolkit/setup.sh` (instala dependencias y descarga las voces; tarda ~1 min).

## 2. Investigar (noticias cada noche, virales cada semana)
- **Noticias (cada noche, gratis)**: 3–5 búsquedas web de lo que afecta al bolsillo en España: IPC/inflación (INE), euríbor e hipotecas, BCE y tipos, depósitos y Letras del Tesoro, SMI y salarios, pensiones, Hacienda/renta, vivienda/alquiler, bancos y comisiones, timos financieros. Apunta en `content/noticias.md` solo datos verificados, con fuente y fecha. Si hay algo importante para la audiencia, uno de los dos reels del día puede ser sobre eso (con la fuente en el caption). Sin opinión política ni partidos.
- **Virales (los lunes, o si `content/virales.md` tiene más de 7 días)**: una búsqueda `vidiq_instagram_tiktok_outlier_search` (5 créditos) de reels de finanzas personales en español de los últimos 30 días, con audienceQuery de España. Si quedan > 60 créditos, opcionalmente `vidiq_outliers` de Shorts en español (5 créditos). Guarda ganchos, estructura, formato y patrones en `content/virales.md` y propón recreaciones. `vidiq_watch_shortform_content` cuesta 10 créditos: úsalo solo si un viral es clave y no se entiende su estructura.
- Recrear ≠ copiar: misma idea de gancho o estructura, pero guion, cifras, diseño y voz nuestros.

## 3. Elegir los dos temas
- Lee `content/registro.md` (no repetir temas recientes), `content/reserva.md`, `content/noticias.md`, `content/virales.md` y `content/ideas.md`.
- Prioridad: (1) noticia importante del día si la hay, (2) recreación de un patrón viral, (3) banco de ideas. Puedes inventar temas nuevos.
- Si un dato depende de la actualidad (IPC, tipos, SMI, impuestos, normativa), verifícalo con una búsqueda web ese día; si no puedes verificarlo, elige otro tema.
- Aplica los patrones de `content/virales.md`: problema en segunda persona en el primer segundo, cifra que cambia en pantalla desde el frame 1, método numerado, comparación A vs B, final en bucle, CTA de guardar o compartir.

## 4. Reel de las 13:30 — corto (8–14 s, SIN voz, solo música)
- Una idea, una cifra, gancho en el primer segundo. Por defecto con reelkit sin voz: `Reel(carpeta, duraciones=[...])` y música propia (gratis).
- Alternativa: vidIQ `vidiq_motion_graphics` (vertical) + `vidiq_compose` con la pista de música de vidIQ
  `https://ai-music-tracks.s3.us-east-1.amazonaws.com/f5512ee3-0af8-41b2-b757-9c188468a11f/2d7bbf53-fdd9-404d-85e6-c5fa6de9feda.wav` (≈4 créditos por reel). Úsala solo si quedan más de 40 créditos.
- Sin voz → sin etiqueta de IA → se programa directamente en vidIQ.

## 5. Reel de las 20:30 — elaborado (20–35 s, CON voz)
- Copia `reels/2026-11-16_2030_regla_50_30_20/render.py` como plantilla y crea una animación nueva con `toolkit/reelkit.py` (texto animado, contadores, donut, barras, líneas, banner, CTA).
- Guion: 5–8 frases cortas, la primera es el gancho (problema o cifra que sorprende en < 2 s). Números escritos con letras para la voz. Cierre con CTA ("Guárdate este vídeo…").
- Voz (`toolkit/voces.py`): `v1` hombre A (la principal), `v2` hombre B, `v3` mujer. Ve alternando según el tono del tema.
- **Lleva etiqueta de IA** (Meta la exige en reels narrados con voz sintética realista): se publica con `vidiq_instagram_publish_reel` e `isAiGenerated: true`.

## 6. Revisar antes de enviar
- `python3 render.py frames` y mira el contact sheet: nada cortado, texto legible, contenido entre y=250 e y=1450.
- Recalcula cada cifra con Python. Formato español (1.500 €, 3,5 %).
- Si hay rentabilidades: "hipotético / no garantizado". Nada de recomendar productos, brokers ni valores concretos; contenido educativo general.

## 7. Publicar los archivos y prepararlos en vidIQ
1. Guarda cada reel en `reels/AAAA-MM-DD_HHMM_slug/` con `render.py`, `video.mp4` e `info.json` (tema, voz, caption, etiqueta_ia, estado).
2. Commit y push a `main`. Comprueba con `curl -sI` que la URL raw del vídeo responde 200.
3. `vidiq_video_upload` con la URL raw → guarda `uploadId` y `videoUrl` en `info.json`.

## 8. Enviar a Sergio para aprobación
- `SendUserFile` (status `proactive`, display `render`) con los dos vídeos.
- Mensaje con, para cada reel: hora, tema, texto exacto del caption (máx. 5 hashtags) y si lleva etiqueta de IA. Pregunta: "¿Los apruebas?".
- Añade al final "Noticias de hoy": 2–4 líneas con lo relevante del nicho y su fuente (o "nada relevante hoy"). Los lunes, añade también 2–3 patrones virales nuevos.
- **Solo cuenta la aprobación que Sergio da en este chat.** Nunca publiques sin ella; si no responde antes de la hora, no se publica.

## 9. Según su respuesta
- **Aprueba el de las 13:30**: `vidiq_social_post_draft_create` (media = uploadId, text = caption, publishAt = AAAA-MM-DDT13:30:00+01:00 en horario de invierno / +02:00 en verano) y `vidiq_social_post_publish`. Avísale de que queda programado y que vidIQ aún no permite cancelarlo.
- **Aprueba el de las 20:30**: `send_later` a esta misma sesión a las 20:27 (Europe/Madrid) con el vídeo, cuenta, caption exacto y `isAiGenerated: true`; cuando llegue, publica con `vidiq_instagram_publish_reel` y sigue con `containerId`/`mcpJobId` hasta `PUBLISHED`. Pásale el enlace.
- **Rechaza uno**: pregunta brevemente qué cambiarías (si no lo dice, cambia de tema o de enfoque), crea otro y vuelve al paso 6. Repite hasta que lo apruebe.
- Si aprueba con cambios en el texto, usa su texto exacto.

## 10. Registrar
- Actualiza `content/registro.md` (fecha, hora, tipo, tema, voz, estado) y `content/reserva.md` si usaste algo de ahí. Commit y push.

## Estilo de marca
- Fondo azul noche con degradado verde, Poppins Bold para titulares, Inter para textos pequeños.
- Colores: verde #22C55E (ahorro/positivo), ámbar #F59E0B (gasto/aviso), azul #3B82F6, rojo #EF4444 (pérdida).
- Captions: frase gancho + 1–2 frases de valor + CTA (guardar/comentar) + 5 hashtags como máximo.
