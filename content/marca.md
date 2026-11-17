# Marca de @eleurolisto

- **Foto de perfil (elegida por Sergio el 15-nov)**: bombilla con el filamento en forma de € verde neón sobre azul noche.
  - Original (Creative Claw, PNG 2K): https://cdn.creativeclaw.co/u/626ff63d/images/545fbe5f-9dd2-4294-9aba-5736826ca703.png
  - Copia 1080×1080: content/foto_perfil_bombilla.jpg
- **Nombre**: El Euro Listo | Finanzas
- **Categoría**: Educación
- **Bio**:
  Tu sueldo, explicado fácil.
  Ahorro, deudas e inversión en 30 segundos.
  Un reel nuevo cada día · España
  Educativo, no es asesoramiento financiero.
- La bombilla puede usarse como icono de marca en cierres de reels (idea "listo" + €).

## Mascota: LISTO (creada el 17-nov; Sergio: "crea un personaje que sea nuestra seña de identidad, la marca de la página, y que siempre salga en los vídeos; te doy libertad")
- **Qué es**: la bombilla de la foto de perfil hecha personaje. Cristal con el filamento en forma de **€ verde neón**, ojos grandes en el cristal, mejillas rosadas, brazos y piernas de alambre fino, casquillo de rosca plateado y **zapatillas verdes**. Hojas: `content/marca/listo_hoja_2d.png` (2D, expresiones, poses y pixel art) y `content/marca/listo_3d.png` (3D).
- **Nombre**: Listo ("El Euro Listo" → él es el euro listo). Se escribe Listo, sin artículo.
- **Personalidad**: cercano, optimista y un poco pillo; explica fácil y se pone de tu lado. Se enciende (brilla más) cuando hay una buena idea de dinero, se apaga un poco y pone cara de preocupado ante comisiones, deudas o estafas, y celebra cuando alguien ahorra. Nunca vende ni recomienda productos concretos.
- **Firma de cierre**: guiño + mano redonda en alto (sin dedos, Sergio 18-nov) junto al CTA ("Sígueme y sé más listo con tu dinero" o la variante que pida el vídeo).
- **Lo que no cambia nunca**: la silueta de bombilla, el € verde neón, los ojos grandes, el casquillo plateado y las zapatillas verdes. Se adapta al estilo de cada look (plano 2D, 3D, plastilina, low-poly, pixel art, ilustración), pero siempre se reconoce. El brillo es estable: nunca parpadea.
- **Un modelado por tipo de edición** (Sergio, 17-nov): estilos 2D 'vector', 'plano', 'ilustrado', 'boceto', 'neon', 'tropical' (R8, 17-nov) y pixel; estilos 3D 'toon', 'plastilina' y 'lowpoly' (tabla en el PLAYBOOK, hoja en `content/marca/listo_estilos.png`). Cada look nuevo estrena su propio modelado.
- **Código**: `toolkit/mascota/listo2d.js` (canvas 2D: `Listo2D.dibujar` y `Listo2D.pixel`) y `toolkit/mascota/listo3d.js` (Three.js: `crearListo`). Ejemplos: `toolkit/mascota/hoja.html` y `toolkit/mascota/prueba3d.html`.
- **Foto de perfil ELEGIDA por Sergio (18-nov): la 1, Listo clásico saludando** → `content/marca/perfil_listo/perfil_01_clasico_saluda.jpg` (copia en `content/foto_perfil_listo.jpg`).
- **Fotos de perfil con Listo (18-nov, rehechas a petición de Sergio)**: 10 estilos distintos y 10 poses distintas en `content/marca/perfil_listo/` (vista previa en círculo: `vista_previa_10.png`), 1080x1080. `perfil10.html` mide la silueta de Listo y la escala/centra para que quepa ENTERA dentro del círculo del recorte (radio ≤ 460 px de 540; comprobado píxel a píxel). La pone Sergio a mano en IG y TikTok.
- **Accesorios (18-nov)**: gafas de sol, monóculo, chistera, corona, cadena de oro, pajarita, billetes, gorro roto, parche/tirita, bufanda rota, bolsillos vacíos y mosca; modos `vacilon`, `rico`, `millonario` y `arruinado` (hoja: `content/marca/listo_accesorios.png`). Van encima del diseño: el € verde, el casquillo y las zapatillas siempre se ven.
