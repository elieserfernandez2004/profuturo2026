// Pitch Hack4Edu 2026 · Semilla — genera Semilla_Hack4Edu2026.pptx
const pptxgen = require('pptxgenjs')
const path = require('path')
const { applyTheme } = require(path.join(
  process.env.PPTX_SKILL_DIR,
  'scripts/apply_theme.js',
))

const THEME = {
  name: 'Semilla',
  headFontFace: 'Calibri',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '1E293B', lt1: 'FFFFFF', dk2: '4C2A9E', lt2: 'F0EAFF',
    accent1: '8B5CF6', accent2: '10B981', accent3: 'F59E0B', accent4: '84CC16',
    accent5: 'E11D48', accent6: 'BD7410', hlink: '7141D8', folHlink: '6841CB',
  },
}
const HEX = { violet: '8B5CF6', violetDark: '7141D8', ink: '1E293B', muted: '64748B', line: 'E9E1FA' }

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9' // 10 x 5.625
pres.title = 'Semilla — tutor con IA sin conexión'
pres.author = 'Eliecer Fernandez'
pres.company = 'Hack4Edu 2026'
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace }
const C = pres.SchemeColor

// ── Layouts ──
pres.defineSlideMaster({
  title: 'PORTADA',
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 1.55, w: 6.0, h: 1.2, fontSize: 54, bold: true, color: C.background1, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.6, y: 2.85, w: 5.9, h: 1.0, fontSize: 20, color: C.background2, valign: 'top', align: 'left', margin: 0 }, text: '' } },
  ],
})
pres.defineSlideMaster({
  title: 'CIERRE',
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 1.5, w: 8.8, h: 1.25, fontSize: 36, bold: true, color: C.background1, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.6, y: 2.85, w: 8.8, h: 0.5, fontSize: 18, color: C.background2, valign: 'top', align: 'left', margin: 0 }, text: '' } },
  ],
})
pres.defineSlideMaster({
  title: 'CONTENIDO',
  background: { color: 'FDFBF7' },
  margin: [0.5, 0.5, 0.5, 0.5],
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.32, w: 9.0, h: 0.75, fontSize: 30, bold: true, color: C.text1, valign: 'middle', align: 'left', margin: 0 }, text: '' } },
    { text: { text: '🌱 Semilla · Hack4Edu 2026', options: { x: 0.5, y: 5.22, w: 4, h: 0.25, fontSize: 10, color: C.text2, margin: 0 } } },
  ],
  slideNumber: { x: 9.1, y: 5.22, w: 0.4, h: 0.25, fontSize: 10, color: '7141D8', align: 'right' },
})

// ── Helpers ──
let objN = 0
const nm = (s) => `${s}-${++objN}`
function card(slide, x, y, w, h, fill = C.background1) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.18, fill: { color: fill }, line: { color: HEX.line, width: 1 },
    shadow: { type: 'outer', color: '8B5CF6', opacity: 0.12, blur: 8, offset: 2, angle: 90 },
    objectName: nm('tarjeta'),
  })
}
function iconCircle(slide, emoji, x, y, d = 0.62, fill = C.background2) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: 'none' }, objectName: nm('icono-fondo') })
  slide.addText(emoji, { x, y, w: d, h: d, fontSize: d * 34, align: 'center', valign: 'middle', margin: 0, isTextBox: true, objectName: nm('icono') })
}
function text(slide, t, o) {
  slide.addText(t, { margin: 0, isTextBox: true, valign: 'top', color: C.text1, fontSize: 14, objectName: nm('texto'), ...o })
}

// ═════ 1. Portada ═════
pres.addSection({ title: 'Apertura' })
let s = pres.addSlide({ masterName: 'PORTADA', sectionTitle: 'Apertura' })
s.addText('Semilla', { placeholder: 'title' })
s.addText('Un tutor con IA que vive en el bolsillo.\nSin internet. Sin datos fuera del dispositivo.', { placeholder: 'body' })
text(s, 'Hack4Edu 2026 · Modalidad innovadora', { x: 0.6, y: 4.35, w: 5, h: 0.3, fontSize: 14, color: C.background2 })
;[['Reto 02', 'Aprender sin conexión'], ['Reto 04', 'Tutor sin respuestas'], ['Reto 07', 'IA que explica sus límites'], ['Reto 20', 'Ningún talento invisible']].forEach(([a, b], i) => {
  const y = 0.95 + i * 0.92
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.85, y, w: 2.65, h: 0.78, rectRadius: 0.16, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: nm('reto') })
  text(s, [
    { text: a + '  ·  Reto ProFuturo', options: { fontSize: 11, bold: true, color: C.background2, breakLine: true } },
    { text: b, options: { fontSize: 15, bold: true, color: C.background1 } },
  ], { x: 7.05, y: y + 0.1, w: 2.35, h: 0.6 })
})
iconCircle(s, '🌱', 0.6, 0.55, 0.75, C.accent1)
s.addNotes(`(0:00–0:25) Hola, somos el equipo Semilla. Hoy, millones de niñas y niños estudian donde internet es lento, caro o no existe. Las herramientas de IA educativa que conocemos viven en la nube: sin conexión, no existen. Semilla es un tutor con inteligencia artificial que vive dentro del teléfono o la tablet. Responde a cuatro Retos ProFuturo: aprender sin conexión, un tutor que no da la respuesta, una IA que explica sus límites y que ningún talento pase desapercibido.`)

// ═════ 2. Problema ═════
pres.addSection({ title: 'Problema' })
s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: 'Problema' })
s.addText('La IA de hoy no llega a quien más la necesita', { placeholder: 'title' })
const stats = [
  ['70 %', 'de niñas y niños de 10 años en países de ingresos bajos y medios no comprende un texto simple', 'Banco Mundial, 2022'],
  ['Sin red', 'la IA en la nube no funciona en escuelas rurales, comunidades remotas ni emergencias', 'Barrera n.º 1 según ProFuturo'],
  ['Datos', 'de menores viajan a servidores externos cada vez que preguntan algo a un chatbot', 'Riesgo de privacidad'],
]
stats.forEach(([big, desc, src], i) => {
  const x = 0.5 + i * 3.08
  card(s, x, 1.35, 2.85, 3.45)
  text(s, big, { x: x + 0.25, y: 1.6, w: 2.4, h: 0.9, fontSize: i === 0 ? 54 : 44, bold: true, color: C.accent1, valign: 'middle' })
  text(s, desc, { x: x + 0.25, y: 2.65, w: 2.4, h: 1.5, fontSize: 15 })
  text(s, src, { x: x + 0.25, y: 4.3, w: 2.4, h: 0.3, fontSize: 11, color: HEX.muted, italic: true })
})
s.addNotes(`(0:25–0:50) Según el Banco Mundial, el 70% de los niños de 10 años en países de ingresos bajos y medios no puede comprender un texto simple. La IA podría ayudar, pero los tutores con IA actuales necesitan internet permanente, cuestan por cada consulta y envían los datos de menores a servidores externos. Justo donde más falta hace, no llegan.`)

// ═════ 3. Solución ═════
pres.addSection({ title: 'Solución' })
s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: 'Solución' })
s.addText('Semilla: cuatro respuestas en una sola app', { placeholder: 'title' })
const pillars = [
  ['📶', 'Reto 02 · Sin conexión', ['PWA instalable que funciona en modo avión', 'IA ejecutada en el propio dispositivo', 'Progreso local y sincronización por paquetes o al volver la red']],
  ['💡', 'Reto 04 · Tutor que no da la respuesta', ['Pistas progresivas en 3 niveles, según la edad', 'Detecta errores típicos (p. ej. sumar denominadores)', 'Guardarraíl que bloquea la solución si la IA la da']],
  ['🕵️', 'Reto 07 · IA que explica sus límites', ['Detective de IA: alucinaciones, sesgos y fuentes inventadas', 'Cuándo NO usar IA y cómo proteger tus datos', 'Todo texto de IA va etiquetado']],
  ['🌟', 'Reto 20 · Ningún talento invisible', ['Jardín de talentos: acertijos, inventos, explicaciones', 'Reconocimiento entre pares e intereses', 'Señales para el docente, sin etiquetas ni notas']],
]
pillars.forEach(([ic, title, items], i) => {
  const x = 0.5 + i * 2.29
  card(s, x, 1.3, 2.13, 3.65)
  iconCircle(s, ic, x + 0.2, 1.48, 0.56)
  text(s, title, { x: x + 0.2, y: 2.15, w: 1.8, h: 0.62, fontSize: 14, bold: true, color: C.text2 })
  text(s, items.map((t, j) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: j < items.length - 1 } })), {
    x: x + 0.2, y: 2.82, w: 1.83, h: 2.05, fontSize: 12, paraSpaceAfter: 4,
  })
})
s.addNotes(`(0:50–1:30) Semilla une cuatro retos. Primero, funciona sin conexión: se instala como app web y la IA corre en el propio dispositivo. Segundo, es un tutor que no hace la tarea: da pistas progresivas, detecta errores típicos como sumar los denominadores, y si la IA intenta dar la solución, un filtro la cambia por una pista. Tercero, enseña a usar la IA con pensamiento crítico: con el Detective de IA, niñas y niños descubren alucinaciones, sesgos y fuentes inventadas. Y cuarto, hace visibles talentos que las notas no muestran.`)

// ═════ 4. Cómo funciona ═════
s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: 'Solución' })
s.addText('Cómo funciona en el aula', { placeholder: 'title' })
const steps = [
  ['⬇️', 'Descarga única', 'App y modelo de IA se instalan una vez, con wifi o en la red local de la escuela'],
  ['✈️', 'Modo avión', 'Todo funciona sin internet: lecciones, ejercicios, tutor e IA'],
  ['✍️', 'Practica', 'La corrección es exacta y no depende de la IA'],
  ['💡', 'Pista de IA', 'Te guía con preguntas, nunca con la respuesta'],
  ['📊', 'Docente', 'Ve qué concepto necesita apoyo cada estudiante y sincroniza'],
]
steps.forEach(([ic, t, d], i) => {
  const x = 0.5 + i * 1.84
  card(s, x, 1.45, 1.66, 2.95)
  iconCircle(s, ic, x + 0.52, 1.65)
  text(s, `${i + 1}. ${t}`, { x: x + 0.15, y: 2.45, w: 1.36, h: 0.55, fontSize: 14, bold: true, color: C.text2, align: 'center' })
  text(s, d, { x: x + 0.15, y: 3.05, w: 1.36, h: 1.5, fontSize: 12, align: 'center' })
  if (i < steps.length - 1) text(s, '›', { x: x + 1.64, y: 2.75, w: 0.22, h: 0.4, fontSize: 24, bold: true, color: C.accent1, align: 'center', valign: 'middle' })
})
s.addNotes(`(1:30–2:05) Así se usa: la app y el modelo se descargan una sola vez, con wifi o desde la red local de la escuela. Después, en modo avión, todo sigue funcionando. El estudiante resuelve; la corrección es exacta y no depende de la IA. Si se equivoca, la IA local le da una pista en forma de pregunta. Y la persona docente ve en su panel qué concepto necesita apoyo cada estudiante, y combina los datos de varias tablets sin internet, con un paquete que se comparte por Bluetooth o USB.`)

// ═════ 4b. Reto 20 · Talentos ═════
s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: 'Solución' })
s.addText('Que ningún talento pase desapercibido', { placeholder: 'title' })
card(s, 0.5, 1.3, 4.35, 3.65)
text(s, '🌻 Estudiante: “Mi jardín de talentos”', { x: 0.75, y: 1.45, w: 3.9, h: 0.35, fontSize: 15, bold: true, color: C.text2 })
const acts = [['🧩', 'Acertijos', 'pensamiento lógico y perseverancia'], ['🎨', 'Inventa', 'retos abiertos: creatividad'], ['🗣️', 'Explica', 'con sus palabras: comunicación'], ['🤝', 'Reconoce', 'semillas entre pares: colaboración']]
acts.forEach(([ic, t, d], i) => {
  const y = 1.95 + i * 0.72
  iconCircle(s, ic, 0.75, y, 0.52)
  text(s, [{ text: t, options: { bold: true, breakLine: true } }, { text: d, options: { color: HEX.muted } }], { x: 1.42, y: y + 0.02, w: 3.25, h: 0.55, fontSize: 13 })
})
card(s, 5.1, 1.3, 4.4, 3.65, C.background2)
text(s, '👩‍🏫 Docente: señales, no etiquetas', { x: 5.35, y: 1.45, w: 4.0, h: 0.35, fontSize: 15, bold: true, color: C.text2 })
const principles = [
  'Evidencias en palabras, con su origen: actividad, uso de la app, compañero o docente',
  'Sin puntajes, rankings ni grupos por “capacidad”',
  '“Sin señales” = sin oportunidad aún, no falta de talento',
  'Ideas para personalizar según fortalezas e intereses: decide el docente',
  'La IA local solo ve habilidades e intereses, nunca el nombre',
]
text(s, principles.map((t, j) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: j < principles.length - 1 } })), { x: 5.35, y: 1.95, w: 3.95, h: 2.9, fontSize: 13, paraSpaceAfter: 6 })
s.addNotes(`(2:05–2:45) El Reto 20 nos pide ver más allá de las notas. En Mi jardín de talentos, cada estudiante resuelve acertijos, inventa ideas, explica con sus palabras y regala semillas a compañeros que le ayudaron. Cada actividad genera una evidencia descrita en palabras, nunca una nota. La persona docente ve esas señales con su origen, suma lo que observa en clase y recibe ideas para personalizar. Sin etiquetas, sin rankings y sin decisiones automáticas: si no hay señales, es que aún no hubo oportunidad.`)

// ═════ 5. IA ética ═════
pres.addSection({ title: 'Ética' })
s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: 'Ética' })
s.addText('IA ética y centrada en la infancia', { placeholder: 'title' })
const ethics = [
  ['🔒', 'Privacidad total', 'La IA corre en el dispositivo. Solo apodo y avatar; la familia puede borrarlo todo'],
  ['🛡️', 'Escudo de datos', 'Avisa antes de enviar nombre, teléfono, dirección o escuela'],
  ['🏷️', 'Transparencia', 'Cada respuesta indica si la escribió la IA o un docente'],
  ['🎯', 'Sin hacer la tarea', 'Filtro que detecta y bloquea la solución en la salida de la IA'],
  ['👩‍🏫', 'Persona en el centro', 'Las actividades creadas por IA requieren aprobación docente'],
  ['📘', 'Anclada al currículo', 'La IA solo usa el contenido curado de la lección'],
]
ethics.forEach(([ic, t, d], i) => {
  const col = i % 2, row = Math.floor(i / 2)
  const x = 0.5 + col * 4.55, y = 1.3 + row * 1.25
  card(s, x, y, 4.35, 1.08)
  iconCircle(s, ic, x + 0.2, y + 0.23)
  text(s, t, { x: x + 1.0, y: y + 0.14, w: 3.2, h: 0.32, fontSize: 15, bold: true, color: C.text2 })
  text(s, d, { x: x + 1.0, y: y + 0.47, w: 3.2, h: 0.55, fontSize: 12 })
})
s.addNotes(`(2:45–3:20) La ética no es un añadido, es la arquitectura. Como la IA corre en el dispositivo, los datos de los menores nunca salen. Solo usamos un apodo, y la familia puede borrarlo todo. Si un niño escribe su nombre completo o su teléfono, Semilla lo frena y le explica por qué. Cada respuesta indica si la escribió la IA o un docente. La IA no corrige ni da soluciones, y nada generado por IA llega al estudiante sin revisión docente. Seguimos los principios de UNICEF para una IA centrada en la infancia.`)

// ═════ 6. Tecnología ═════
pres.addSection({ title: 'Tecnología' })
s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: 'Tecnología' })
s.addText('Inclusiva con cualquier dispositivo', { placeholder: 'title' })
card(s, 0.5, 1.3, 4.1, 3.55)
text(s, 'Arquitectura', { x: 0.75, y: 1.45, w: 3.6, h: 0.35, fontSize: 16, bold: true, color: C.text2 })
const stack = [
  ['Vue 3 + Ionic', 'interfaz móvil, PWA instalable'],
  ['Service worker', 'toda la app en caché, modo avión'],
  ['WebLLM + WebGPU', 'LLM en el dispositivo, en un Web Worker'],
  ['IndexedDB', 'progreso y cola de sincronización'],
  ['Paquetes JSON', 'sincronización por Bluetooth o USB'],
]
text(s, stack.map(([a, b], j) => ([
  { text: a, options: { bold: true, color: C.text1 } },
  { text: ' — ' + b, options: { color: C.text1, breakLine: j < stack.length - 1 } },
])).flat(), { x: 0.75, y: 1.9, w: 3.7, h: 2.8, fontSize: 13, paraSpaceAfter: 8 })

const rows = [
  [{ text: 'Dispositivo', options: { bold: true, color: C.background1, fill: { color: C.accent1 } } }, { text: 'Modelo local', options: { bold: true, color: C.background1, fill: { color: C.accent1 } } }, { text: 'Descarga', options: { bold: true, color: C.background1, fill: { color: C.accent1 } } }],
  ['Gama alta (p. ej. S26 Ultra)', 'Llama 3.2 · 3B', '~1,9 GB'],
  ['Gama media', 'Qwen 2.5 · 1.5B', '~1,0 GB'],
  ['Gama baja', 'Qwen 2.5 · 0.5B', '~0,4 GB'],
  ['Sin WebGPU', 'Modo sin IA: pistas docentes', '0 GB'],
]
s.addTable(rows, {
  x: 4.85, y: 1.3, w: 4.65, colW: [1.95, 1.65, 1.05], rowH: 0.42,
  fontSize: 12, color: C.text1, fill: { color: C.background1 }, border: { type: 'solid', pt: 0.75, color: HEX.line },
  valign: 'middle', objectName: nm('tabla-modelos'),
})
text(s, 'Semilla detecta el equipo y elige el modelo. Nadie queda fuera: sin GPU, la app funciona igual con pistas escritas por docentes.', {
  x: 4.85, y: 3.65, w: 4.65, h: 0.75, fontSize: 13, italic: true, color: C.text2,
})
s.addNotes(`(3:20–3:50) Técnicamente es una PWA en Vue e Ionic. El modelo de lenguaje corre en el navegador con WebGPU, gracias a WebLLM. Semilla detecta el dispositivo y elige el modelo: tres mil millones de parámetros en un teléfono de gama alta como el Galaxy S26 Ultra, y modelos más pequeños en equipos modestos. Si no hay GPU, la app funciona igual con pistas escritas por docentes. Nadie queda fuera.`)

// ═════ 7. Impacto y mercado ═════
pres.addSection({ title: 'Impacto' })
s = pres.addSlide({ masterName: 'CONTENIDO', sectionTitle: 'Impacto' })
s.addText('Sostenible, escalable y transferible', { placeholder: 'title' })
const kpis = [['0 €', 'coste por consulta de IA: sin API ni servidores de inferencia'], ['100 %', 'funcional sin conexión, tras una sola descarga'], ['1 base', 'de código para web, Android (APK) y la maleta ProFuturo']]
kpis.forEach(([big, d], i) => {
  const y = 1.3 + i * 1.2
  card(s, 0.5, y, 4.1, 1.05)
  text(s, big, { x: 0.7, y: y + 0.12, w: 1.6, h: 0.8, fontSize: 34, bold: true, color: C.accent2, valign: 'middle' })
  text(s, d, { x: 2.3, y: y + 0.15, w: 2.15, h: 0.8, fontSize: 13, valign: 'middle' })
})
card(s, 4.85, 1.3, 4.65, 3.45, C.background2)
text(s, 'Camino al mercado', { x: 5.1, y: 1.45, w: 4.2, h: 0.35, fontSize: 16, bold: true, color: C.text2 })
const market = [
  'Piloto con ProFuturo en escuelas sin conectividad',
  'Contenido en paquetes JSON: nuevas materias e idiomas (ES · PT · FR · AR)',
  'Sincronización con Moodle (plataforma ProFuturo) vía xAPI',
  'Licencias para ministerios y ONG: contenido, soporte y analítica agregada',
  'Código abierto (MIT) para que otros construyan encima',
]
text(s, market.map((t, j) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < market.length - 1 } })), {
  x: 5.1, y: 1.9, w: 4.2, h: 2.75, fontSize: 13, paraSpaceAfter: 6,
})
s.addNotes(`(3:50–4:30) Es sostenible porque el coste de cada consulta a la IA es cero: no hay API de pago ni servidores de inferencia. Escala porque el contenido son paquetes que cualquier docente o ministerio puede ampliar, en varios idiomas. Y es transferible: proponemos un piloto con ProFuturo en escuelas sin conectividad, sincronizando con su plataforma Moodle, y un modelo de licencias para ministerios y ONG sobre un núcleo de código abierto.`)

// ═════ 8. Cierre ═════
pres.addSection({ title: 'Cierre' })
s = pres.addSlide({ masterName: 'CIERRE', sectionTitle: 'Cierre' })
s.addText('Que el lugar donde naces no decida cuánto aprendes', { placeholder: 'title' })
s.addText('Semilla lleva un tutor con IA, ético y sin conexión, a cada escuela.', { placeholder: 'body' })
const close = [['📶', 'Sin internet'], ['🔒', 'Datos en el dispositivo'], ['💡', 'Pistas, no respuestas'], ['🕵️', 'Pensamiento crítico'], ['🌟', 'Talentos visibles']]
close.forEach(([ic, t], i) => {
  const x = 0.6 + i * 1.78
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 3.85, w: 1.64, h: 0.75, rectRadius: 0.16, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: nm('cierre') })
  text(s, `${ic}  ${t}`, { x: x + 0.08, y: 3.85, w: 1.48, h: 0.75, fontSize: 12, bold: true, color: C.background1, valign: 'middle', align: 'center' })
})
iconCircle(s, '🌱', 0.6, 0.55, 0.75, C.accent1)
s.addNotes(`(4:30–5:00) ProFuturo nació para que el lugar donde nace una niña o un niño no decida sus oportunidades. Semilla lleva esa idea a la era de la IA: un tutor ético, sin conexión, que da pistas y no respuestas, que enseña a pensar críticamente y que hace visible el talento de cada estudiante. Gracias.`)

pres.writeFile({ fileName: 'Semilla_Hack4Edu2026.pptx' }).then(async (f) => {
  await applyTheme(f, THEME)
  console.log('ok', f)
})
