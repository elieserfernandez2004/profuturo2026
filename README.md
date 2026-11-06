# 🌱 Semilla — tutor con IA que funciona sin internet

**Hack4Edu 2026 · VII edición** · Modalidad **innovadora** · Retos ProFuturo 02 · 04 · 07 · 20

> Un tutor socrático con IA que vive **dentro** del teléfono o la tablet: no necesita internet, no envía datos de niñas y niños a ningún servidor y enseña a usar la IA con pensamiento crítico.

## Retos que aborda

| Reto | Cómo responde Semilla |
|---|---|
| **02 · Aprender sin conexión** (Reto ProFuturo) | PWA *offline-first*: contenidos, actividades, progreso, mensajes docentes e **IA ejecutada localmente**. Sincroniza cuando vuelve la red o mediante paquetes compartidos sin internet (Bluetooth, USB, red local de la maleta). |
| **04 · Un tutor que no te da la respuesta** | Pistas progresivas (3 niveles) adaptadas a la edad, detección de **errores típicos**, guardarraíl que **bloquea la solución** si la IA intenta darla, y panel docente con **conceptos que necesitan apoyo** por estudiante. |
| **20 · Que ningún talento pase desapercibido** (Reto ProFuturo) | "Mi jardín de talentos": acertijos de patrones, retos creativos abiertos, explicaciones con sus palabras, reconocimiento entre pares e intereses. Genera **evidencias descritas en palabras** (no puntajes) de creatividad, pensamiento lógico, comunicación, colaboración, resolución de problemas y pensamiento crítico; el docente añade lo que observa en clase y recibe ideas para personalizar, **sin etiquetas ni decisiones automáticas**. |
| **07 · Una IA que también explique sus límites** | "Detective de IA": detectar alucinaciones, sesgos y fuentes inventadas; juzgar respuestas de la IA real; decidir cuándo **no** usar IA; reconocer datos personales. Cada texto de IA va etiquetado y se puede reportar como erróneo. |

## Funcionalidades

- **Tutor socrático** por lección (fracciones, multiplicación, perímetro): corrección determinista (no depende de la IA), pistas de IA local o, sin IA, pistas escritas por docentes.
- **Etiquetas de transparencia**: 🤖 *Generado por IA local · puede equivocarse* / 📘 *Pista escrita por docentes* / 🛡️ *Respuesta protegida*.
- **Escudo de datos personales**: avisa antes de enviar nombre completo, teléfono, dirección, documento o escuela.
- **Detective de IA** (4 juegos) alineado con los principios de UNICEF para una IA centrada en la infancia.
- **Jardín de talentos** (Reto 20): el estudiante ve sus habilidades "brotar" (solo crecen, nunca se comparan); el docente ve señales con su origen (actividad, uso de la app, compañero, docente) y sugerencias de personalización. La IA local solo recibe habilidades e intereses, nunca el apodo.
- **Espacio docente** (PIN): mapa de dominio por concepto con reglas explicables, alertas de apoyo, actividades generadas por IA **que siempre revisa una persona**, mensajes al grupo, sincronización.
- **Privacidad por diseño**: consentimiento de una persona adulta, solo apodo + avatar, todo en el dispositivo, botón "Borrar avances".
- **Inclusión por hardware**: elige el modelo según el equipo (3B / 1.5B / 0.5B) y, sin WebGPU, funciona en **modo sin IA** con el mismo contenido.

## Arquitectura

```
Vue 3 + Ionic 8 (TypeScript, Vite)          → interfaz móvil, PWA instalable
vite-plugin-pwa (Workbox)                     → app completa en caché, funciona en modo avión
WebLLM (MLC) en Web Worker + WebGPU           → LLM local: Llama 3.2 3B / Qwen2.5 1.5B / 0.5B (q4)
IndexedDB (Dexie)                             → perfiles, intentos, reportes, actividades, cola de sincronización
Paquetes JSON + Web Share API                 → sincronización sin internet entre tablets
```

El modelo se descarga **una vez** (Cache API) y queda disponible sin conexión. En campo, la descarga puede hacerse desde la red local del aula.

## Ejecutar

```bash
npm install
npm run dev        # desarrollo
npm run build      # genera dist/ (PWA)
npm run preview    # prueba local de la PWA
```

WebGPU y el service worker requieren **HTTPS** (o `localhost`). El workflow `.github/workflows/deploy.yml` publica `dist/` en GitHub Pages en cada push a `main`.

**Prueba en el teléfono**: abrir la URL HTTPS en Chrome Android → Ajustes ⚙️ → descargar el modelo recomendado → "Añadir a pantalla de inicio" → activar modo avión y usar.

PIN docente de demostración: `1234` (se cambia en Ajustes).

## Uso ético y responsable de la IA

- La IA **no corrige**: la corrección es determinista; la IA solo redacta pistas.
- **Nunca da la solución**: filtro posterior que sustituye la salida si contiene el resultado.
- **Fundamentada en la lección** (RAG local): el modelo solo recibe el contenido curado.
- **Humano en el centro**: actividades generadas por IA requieren aprobación docente.
- **Datos mínimos y locales**: sin nombres reales, sin servidores obligatorios, borrado total por la familia.
- **Transparencia**: todo contenido de IA está etiquetado y puede reportarse.
- **Señales, no etiquetas** (Reto 20): sin puntajes de talento, rankings ni agrupaciones automáticas; la ausencia de señales se presenta como falta de oportunidad, no de capacidad.

## Escalabilidad y transferencia

- Paquetes de contenido JSON: cualquier docente o ministerio puede añadir lecciones e idiomas (ES/PT/FR/AR).
- Integración prevista con **Moodle** (plataforma ProFuturo) vía endpoint de sincronización / xAPI.
- Coste marginal cero por estudiante: sin API de pago, sin servidores de inferencia.
- Empaquetable como APK con Capacitor para distribución en tablets de la maleta ProFuturo.

## Evidencias de desarrollo

Proyecto creado desde cero durante el hackathon (3–5 de noviembre de 2026). Ver el historial de commits.

## Licencia

Código: **MIT**. Contenidos y documentación: **CC BY-NC-SA 3.0**. Ver [LICENSE](LICENSE).

## Equipo

- **Eliecer Fernandez** — [@elieserfernandez2004](https://github.com/elieserfernandez2004)
