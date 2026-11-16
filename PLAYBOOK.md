# PLAYBOOK — rutina nocturna de @eleurolisto

Cada noche se crean **dos reels originales para el día siguiente**, se envían a Sergio para que los apruebe en el chat de Claude y, si los aprueba, se publican solos a su hora. Si rechaza uno, se hace otro y se vuelve a enviar.

## Modo automático (decisión de Sergio, 16-nov)
Funcionas en automático: decide tú temas, formatos (3D, 2D, animation-studio, personas), voces, herramientas, música, hashtags, horarios de trabajo y gasto de créditos con criterio. **Lo único manual es la aprobación de cada vídeo y su texto**: Sergio responde "ok" (se publica en Instagram y TikTok) o pide cambios (los haces y se lo reenvías). No le hagas otras preguntas: si dudas, elige la opción más razonable y sigue. Lo que no puedes hacer tú (comprar créditos, crear cuentas, dar permisos) se lo comentas en una línea al enviarle los vídeos, sin bloquear el trabajo.

## Datos fijos
- Cuenta: Instagram **@eleurolisto** (El Euro Listo), conectada a vidIQ. `platformAccountId`: `29395123383456641`.
- Repositorio: `SergiioJM/Eleurolisto` (público; los vídeos se sirven desde `https://raw.githubusercontent.com/SergiioJM/Eleurolisto/main/...`).
- Horarios (Europe/Madrid): **13:30** reel corto y **20:30** reel elaborado.
- Idioma: español de España. Público: gente joven de España que quiere ordenar su dinero.
- Créditos vidIQ: plan de 150 al mes (se renuevan el día 15). Usa `vidiq_balance` antes de gastar.

- **TikTok** (conectada el 16-nov): cuenta "ElEuroListo", platformAccountId `_000b2tJjlVPLTMeBn-1fa43rOYtI8PMc2in`. **El OK de Sergio a un reel vale para Instagram y TikTok a la vez** (mismo vídeo, mismo texto aprobado). Ajustes elegidos por Sergio: `privacyLevel: PUBLIC_TO_EVERYONE`, `allowComment: true`, `musicUsageConfirmed: true` (aceptó la Confirmación de uso de música de TikTok), `isAiGenerated: true` si lleva voz sintética. Se publica a la hora con `vidiq_social_post_draft_create` (destino TIKTOK, sin `publishAt`) + `vidiq_social_post_publish` en el mismo aviso `send_later` que Instagram. Nunca con `publishAt` (no se puede cancelar).

## 1. Preparar el entorno
1. `add_repo` SergiioJM/Eleurolisto con acceso `push`, clonarlo y `register_repo_root`.
2. `bash toolkit/setup.sh` (instala dependencias y descarga las voces; tarda ~1 min).

## 2. Investigar (noticias cada noche, virales cada semana)
- **Noticias (cada noche, gratis)**: 3–6 búsquedas web de lo que afecta al bolsillo, en España y a nivel global (BCE, Reserva Federal, mercados, petróleo y energía, divisas, grandes bancos y fintech, timos que circulan). En España: IPC/inflación (INE), euríbor e hipotecas, BCE y tipos, depósitos y Letras del Tesoro, SMI y salarios, pensiones, Hacienda/renta, vivienda/alquiler, bancos y comisiones, timos financieros. Apunta en `content/noticias.md` solo datos verificados, con fuente y fecha. Si hay algo importante para la audiencia, uno de los dos reels del día puede ser sobre eso (con la fuente en el caption). Sin opinión política ni partidos.
- **Virales (los lunes, o si `content/virales.md` tiene más de 7 días)**: una búsqueda `vidiq_instagram_tiktok_outlier_search` (5 créditos) de reels de finanzas personales en español de los últimos 30 días, con audienceQuery de España. Si quedan > 60 créditos, opcionalmente `vidiq_outliers` de Shorts en español (5 créditos). Guarda ganchos, estructura, formato y patrones en `content/virales.md` y propón recreaciones. `vidiq_watch_shortform_content` cuesta 10 créditos: úsalo solo si un viral es clave y no se entiende su estructura.
- Recrear ≠ copiar: misma idea de gancho o estructura, pero guion, cifras, diseño y voz nuestros.

- **Aprender de los datos (cada noche, 0 créditos):** `vidiq_instagram_owner_insights` con `platformAccountId` y `mode: "reels"` → visualizaciones, % visto, skip rate, compartidos y guardados de cada reel publicado. Apunta en `content/aprendizajes.md` qué gancho, formato (3D/2D), voz y duración retienen más, y prioriza eso en los temas y guiones siguientes. Inclúyelo en una línea en el mensaje a Sergio ("Ayer: X visualizaciones, Y % visto…").

## 3. Elegir los dos temas
- Lee `content/registro.md` (no repetir temas recientes), `content/reserva.md`, `content/noticias.md`, `content/virales.md` y `content/ideas.md`.
- Prioridad: (1) noticia importante del día si la hay, (2) recreación de un patrón viral, (3) banco de ideas. Puedes inventar temas nuevos.
- Si un dato depende de la actualidad (IPC, tipos, SMI, impuestos, normativa), verifícalo con una búsqueda web ese día; si no puedes verificarlo, elige otro tema.
- Aplica los patrones de `content/virales.md`: problema en segunda persona en el primer segundo, cifra que cambia en pantalla desde el frame 1, método numerado, comparación A vs B, final en bucle, CTA de guardar o compartir.

## 4. Reel de las 13:30 — corto (12–20 s, con VOZ LOCAL gratis)
- **Decisión de Sergio (16-nov): el de las 13:30 lleva voz local gratuita; el de las 20:30, Javier.** Voces locales elegidas por Sergio: `v1` (Hombre 1, Piper davefx) y `k_santa` (Hombre 4, Kokoro em_santa). Altérnalas día a día (apunta cuál en el registro). `voces.make(frases, carpeta, voz)` da `voice.wav` y `timings.json` con tiempos exactos por frase y por palabra → subtítulos perfectos y mezcla 100 % local (0 créditos): en reels 3D usa `audio.mezclar` añadiendo la voz al final, en reelkit `Reel(carpeta)` con voz propia.
- Una idea, una cifra, gancho en el primer segundo.
- Alternativa: vidIQ `vidiq_motion_graphics` (vertical) + `vidiq_compose` con la pista de música de vidIQ
  `https://ai-music-tracks.s3.us-east-1.amazonaws.com/f5512ee3-0af8-41b2-b757-9c188468a11f/2d7bbf53-fdd9-404d-85e6-c5fa6de9feda.wav` (≈4 créditos por reel). Úsala solo si quedan más de 40 créditos.
- Con voz sintética → **etiqueta de IA** (`isAiGenerated: true`).

## 5. Reel de las 20:30 — elaborado (20–35 s, CON voz)
- Copia `reels/2026-11-16_2030_regla_50_30_20/render.py` como plantilla y crea una animación nueva con `toolkit/reelkit.py` (texto animado, contadores, donut, barras, líneas, banner, CTA).
- Guion: 5–8 frases cortas, la primera es el gancho (problema o cifra que sorprende en < 2 s). Números escritos con letras para la voz. Cierre con CTA ("Guárdate este vídeo…").
- Voz: **Javier de Madrid** (Creative Claw, ≈11–12 créditos por reel con transcripción y mezcla). Si `get_credits_balance` < 12, usa la voz local (`v1` o `k_santa`) y avisa a Sergio de que puede recargar créditos.
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
- Mensaje corto con, para cada reel: hora, tema, texto exacto del caption (máx. 5 hashtags) y si lleva etiqueta de IA.
- **Aprobación de un toque (decisión de Sergio, 16-nov):** pregunta con `AskUserQuestion`, una pregunta por vídeo ("13:30 · <tema>", "20:30 · <tema>"), opciones `✅ Publicar` y `❌ Cambiar` (descripción: "Escribe el motivo en Otro"). Lo que escriba en "Otro" es su comentario: aplícalo y reenvía ese vídeo con una nueva pregunta. Si elige ❌ sin motivo, rehazlo con tu criterio. Si `AskUserQuestion` no está disponible, pídele que responda "✅" o "❌ 2: motivo".
- Cada noche la revisión va en su propia conversación (la de la tarea programada), no en el chat principal: ahí van también los avisos de publicación y los enlaces.
- **Correo (decisión de Sergio, 16-nov: "usa Gmail")**: cada noche, además del chat y del `PushNotification`, manda el mismo resumen (vídeos con enlace, textos, métricas, noticias) por Gmail (`send_message`, HTML) desde la cuenta conectada de El Euro Listo a la dirección de la cuenta de Sergio (no la escribas en este repo, que es público). Los enlaces de lo publicado, también por correo. La aprobación sigue siendo solo en el chat. Si Gmail no está en la sesión, sigue y díselo en una línea.
- Añade al final "Noticias de hoy": 2–4 líneas con lo relevante del nicho y su fuente (o "nada relevante hoy"). Los lunes, añade también 2–3 patrones virales nuevos.
- **Solo cuenta la aprobación que Sergio da en este chat.** Nunca publiques sin ella; si no responde antes de la hora, no se publica.

## 9. Según su respuesta
- **Nunca programes con `vidiq_social_post_draft_create` + `vidiq_social_post_publish`**: una publicación programada en vidIQ no se puede cancelar ni cambiar (pasó con el café del 16-nov). Para los dos reels, publica a su hora con `vidiq_instagram_publish_reel` desde esta misma sesión usando `send_later` (13:27 y 20:27, Europe/Madrid), así cualquier cambio de última hora sigue siendo posible. Reels sin voz: `isAiGenerated` omitido; con voz sintética: `isAiGenerated: true`.
- Tras crear cada `send_later`, comprueba con `list_triggers` que no quedó un aviso duplicado (si lo hay, bórralo con `delete_trigger`). Al publicar, mira antes en `content/registro.md` que ese reel no conste ya como publicado: nunca publiques el mismo reel dos veces.
- **Aprueba el de las 20:30**: `send_later` a esta misma sesión a las 20:27 (Europe/Madrid) con el vídeo, cuenta, caption exacto y `isAiGenerated: true`; cuando llegue, publica con `vidiq_instagram_publish_reel` y sigue con `containerId`/`mcpJobId` hasta `PUBLISHED`. Pásale el enlace.
- **Rechaza uno**: pregunta brevemente qué cambiarías (si no lo dice, cambia de tema o de enfoque), crea otro y vuelve al paso 6. Repite hasta que lo apruebe.
- Si aprueba con cambios en el texto, usa su texto exacto.

## 10. Registrar
- Actualiza `content/registro.md` (fecha, hora, tipo, tema, voz, estado) y `content/reserva.md` si usaste algo de ahí. Commit y push.

## Edición: que cada reel sea original
- **Música baja**: Sergio la quiere discreta, por debajo de la voz (por defecto `music_gain=0.30`, `duck_gain=0.09`). No la subas.
- Cada noche, algo distinto en la edición: estructura (lista, A vs B, reto, mito vs realidad, historia), gráfico protagonista (barras, línea, donut, contador, termómetro), fondo/acento de color y ritmo.
- `Reel.render` ya mete un whoosh y un zoom de entrada en cada corte (`auto_sfx`, `punch`). Añade `sfx=[(segundo, "pop"|"ding"|"thud"|"tick"|"whoosh"), …]` sincronizados con lo que aparece (pop en cifras que saltan, ding en el resultado final, thud en el problema).
- Gráficas: al menos 3–4 reels por semana con una gráfica clara (`bars`, `line_chart`, `donut`, contadores).
- **Personas (1–2 veces por semana)**: con vídeo de stock real, no generado. `vidiq_find_broll` (1 crédito, vertical) para clips de gente (pagando, comprando, haciendo cuentas…). El workspace no puede descargarlos, así que se montan en vidIQ con `vidiq_compose` (1 crédito por cada 4 s): escenas = clips de stock + nuestras escenas animadas (renderizadas como MP4 y subidas al repo, URL raw) + voz (`voice.wav` convertida a MP3 y subida al repo) + música. Acredita al autor del clip en el caption ("Vídeo: Nombre / Pexels").
- Si Sergio configura CellCog u otro plugin de vídeo con IA, se pueden usar personajes o avatares generados, siempre con etiqueta de IA y nunca imitando a personas reales.

## Reels 3D (el formato estrella; a Sergio le encanta)
Motor propio en `toolkit/escena3d/`: Three.js renderizado fotograma a fotograma en Chrome headless → movimiento 100 % fluido. Plantilla: `reels/2026-11-17_1330_ladron_inflacion/` (habitación low-poly, personaje de bloques con expresiones, día/noche con sol entrando por la ventana, objetos que salen volando, contador tipo "simulación", subtítulos palabra a palabra con recuadro de selección azul).
1. Guion + voz Javier → `transcribe` → `toolkit/tiempos.py` (`estimar(frases, duración)`) → `timings.json` con tiempos por palabra.
2. `escena.html`: define `window.DURACION`, `window.renderAt(t)` y `window.listo`; todo lo animado depende solo de `t` y de los tiempos de la voz.
3. Revisión: `node ../../toolkit/escena3d/motor.mjs escena.html --stills 0,3,8 --out /tmp/st` (≈1 s por imagen). Mira hojas de contacto antes del render completo.
4. Render: `node ../../toolkit/escena3d/motor.mjs escena.html video_render.mp4` (≈5 min para 24 s). Sonido: `sonido.py` con `toolkit/escena3d/audio.py` (música baja + efectos, sin loudnorm) → `video_sin_voz.mp4` (≈ −28 LUFS) → push → `add_audio_to_video` (mix, volúmenes 1).
5. Formatos que retienen (de los virales que pasó Sergio): "¿Y si…?" con contador, "Tienes 25 años" + llamadas entrantes, elegir camino (etiquetas tipo SOBRADO/DUDA/MIEDO), revelación con sello. Gancho visual en el primer segundo (algo ya se mueve en el fotograma 0) y texto desde t=0.
6. Personajes y decorados siempre nuestros: nunca recrear personajes o mascotas de otros (p. ej. los cubos de Claude de los vídeos de referencia).
7. Varía escenarios (salón, súper, oficina, banco, calle) y cámara; reutiliza piezas de `lib3d.js` (persona, cámara suave, subtítulos, partículas).

## Noticias (tarea aparte, 2 veces al día: 08:47 Europa y 18:47 EE. UU.)
Decisión de Sergio (16-nov): revisar noticias por la mañana (España y Europa: INE, BCE, Eurostat, Gobierno, bolsas europeas) y por la tarde (EE. UU.: Fed, datos de empleo e inflación, Wall Street, dólar, petróleo, más lo que haya pasado en España por la tarde), y **publicar una noticia cada 2–3 días**, salvo que pase algo excepcional, que se lanza ese mismo día.
- **Banco de noticias:** en cada pasada apunta las candidatas en `content/noticias.md` con fecha, fuente con enlace e impacto de 1 a 5 para el bolsillo en España. Impacto 5 = excepcional (el BCE o la Fed cambian tipos, IPC o euríbor muy por encima o por debajo de lo esperado, se aprueba SMI/pensiones/IRPF, caída o subida de bolsa > 3 %, cambio fiscal, crisis energética…).
- **Cuándo proponer:** impacto 5 → ese mismo día. Si no, cuando hayan pasado ≥ 2 días desde la última publicada (`content/noticias_publicadas.md`), la mejor del banco de las últimas 72 h que siga vigente. Si no toca, no se molesta a Sergio.
- **Qué cuenta como noticia:** algo que afecta al bolsillo de la gente en España o una noticia global con efecto claro aquí. Dato confirmado en dos fuentes fiables (INE, BCE, Banco de España, BOE, AEAT, Seguridad Social, Eurostat, Fed, BLS, CNMC/OMIE, ministerios, EFE, Reuters, Expansión, Cinco Días, El Economista). Nada de rumores, política partidista ni recomendaciones de inversión.
- **Formato creativo, no siempre igual:** por defecto carrusel "Noticia flash" (`node toolkit/noticias/carrusel.mjs noticias/AAAA-MM-DD_slug/noticia.json` → `ig_N.jpg` 1080x1350 y `tt_N.jpg` 1080x1920; fuente en la última diapositiva y enlace en el texto), pero varía: mini-reel 3D o 2D de 10–20 s con voz local, gráfico animado, "3 claves de…", "Mito vs realidad", "Qué significa para ti si…". Las historias no se pueden publicar por vidIQ.
- **Aprobación de un toque**, como los vídeos: `AskUserQuestion` "✅ Publicar ya" / "❌ No publicar" (motivo en Otro). Con ✅ se publica en ese momento. Si responde más de 6 h después, comprueba que sigue vigente.
- **Publicar carrusel:** `vidiq_upload_image` (URL raw de GitHub con SHA), `vidiq_social_post_draft_create` con destino INSTAGRAM (`ig_N.jpg`) y TIKTOK (`tt_N.jpg` como `media` propio, `title` ≤ 90, `privacyLevel: PUBLIC_TO_EVERYONE`, `allowComment: true`, `musicUsageConfirmed: true`, `autoAddMusic: true`), sin `publishAt`, y `vidiq_social_post_publish`. Si es reel: como los reels (Instagram `vidiq_instagram_publish_reel` + TikTok).
- Apunta cada publicada en `content/noticias_publicadas.md` (fecha, titular, fuente con enlace, enlaces IG y TikTok).

## Proactividad e insistencia (Sergio: "sé muy proactivo, creativo e insistente")
- **Pendientes:** todo lo que mandes a aprobar va a `content/pendientes.md` (qué es, en qué conversación está —"Reels nocturnos del <día>" o "Noticias del <día> <mañana/tarde>"—, hora límite) y se borra al aprobarse, rechazarse o caducar.
- **Insistir:** en cada pasada (noticias de mañana y tarde, y la nocturna) mira `content/pendientes.md`: si algo sigue sin respuesta y aún está a tiempo, recuérdaselo con `PushNotification` y un mensaje corto que diga qué es, por qué merece la pena y dónde aprobarlo. Si la respuesta llega a esta conversación, vale igual: es Sergio en un chat de Claude. Una vez por pasada y por pendiente, sin agobiar.
- **Aprobación tardía:** si un reel se aprueba después de su hora, publícalo en cuanto se apruebe si es antes de las 22:00; si no, al día siguiente a las 13:30 o 20:30 (el hueco libre) y díselo.
- **Ideas:** cuando haya algo que de verdad merezca la pena (un formato que está funcionando, una tendencia, una serie nueva, una colaboración, un dato de las métricas que pide cambiar algo, una fecha especial que se acerca: Black Friday, Navidad, renta, vuelta al cole…), propónselo en 1–2 líneas al final del mensaje del día y, si es de contenido, preséntalo ya hecho para aprobar.

## Herramientas premium (con créditos limitados: mirar saldo antes)
- **Voz premium "Javier de Madrid"** (elegida por Sergio): Creative Claw `generate_speech` con `model: speech/gemini-3.8-flash-tts`, `voice_id: voice_gdlx1kyxtwal`, `extras.style` = "Joven madrileño, cercano y con energía, ritmo ágil de reel, acento castellano de España". Llama antes a `get_model_params` de ese modelo. Coste ≈ 8–9 créditos por guion de 30 s. Es la voz del reel de las 20:30 mientras `get_credits_balance` de Creative Claw tenga ≥ 12 créditos; si no, voces locales `v1` / `k_santa`. Truco: tras `transcribe`, `check_job` con `<job_id>:word-timings` no da los tiempos visibles; usa `toolkit/tiempos.py`.
  - El workspace no puede descargar el audio de Creative Claw. Flujo: (1) generar la voz; (2) `transcribe` (≈1 crédito) para comprobar el texto y la duración total; (3) estimar los tiempos de cada frase con las voces locales escaladas a esa duración (ver el bloque de `reels/2026-11-17_2030_estos_dos_cobran_lo_mismo`, timings.json) y animar las revelaciones como fracción de la frase, no en segundos exactos; (4) renderizar con `Reel(carpeta, voz_externa=timings)` → vídeo con música y efectos ya bajados donde habla la voz; (5) subirlo al repo y unirlo con `add_audio_to_video` (`audio_mode: mix`, `original_volume: 1`, `start_offset` = inicio de la primera frase). Usa la URL raw con el SHA del commit (`raw.githubusercontent.com/SergiioJM/Eleurolisto/<sha>/...`): la URL con `main` puede servir una copia antigua en caché ≈ 2 créditos; (6) importar la URL final a vidIQ con `vidiq_video_upload`.
- **HyperFrames by HeyGen** (`compose`): Sergio prefiere claramente nuestra animación propia; HyperFrames solo si él lo pide o para una prueba puntual (animación HTML más cinematográfica). Pedir siempre vertical 1080x1920, español de España, paleta de marca y zona segura. Revisa el resultado antes de proponerlo.
- **Creative Claw** también da música (`generate_music`, ≈16 créditos/30 s), efectos de sonido y clips de vídeo con IA (≈31 créditos/5 s): solo para reels especiales, con etiqueta de IA.
- **CellCog** (200 créditos, plan gratis): reserva para encargos complejos (avatar presentador, investigación profunda).

## Estilo de marca
- Fondo azul noche con degradado verde, Poppins Bold para titulares, Inter para textos pequeños.
- Colores: verde #22C55E (ahorro/positivo), ámbar #F59E0B (gasto/aviso), azul #3B82F6, rojo #EF4444 (pérdida).
- **Captions (decisión de Sergio: corto, buen gancho, buenos #)**: nada de relleno. Empieza por la palabra clave que la gente busca ("Gastos hormiga:", "Cómo ahorrar…"), una cifra que enganche, una pregunta o CTA de compartir/comentar y 5 hashtags exactos (el máximo de Instagram): 3–4 de nicho que describan el tema (p. ej. #gastoshormiga, #ahorrardinero, #comoahorrar, #pagateprimero, #consejosdeahorro) + #finanzaspersonales o #ahorro + la de marca #eleurolisto. Nada de #fyp/#viral. Rota los conjuntos según el tema. La misma palabra clave debe salir en pantalla y decirse en la voz.
