/**
 * Reto 20 · Que ningún talento pase desapercibido.
 * Actividades cortas, sin respuestas "de examen", para que aparezcan habilidades
 * que las notas no muestran. Producen EVIDENCIAS descritas en palabras, nunca puntajes.
 */
import type { Skill } from '../db'

export const SKILLS: Record<Skill, { label: string; emoji: string; idea: string }> = {
  creatividad: { label: 'Creatividad', emoji: '🎨', idea: 'Proponle retos abiertos con muchas soluciones posibles: inventar, diseñar, contar.' },
  logica: { label: 'Pensamiento lógico', emoji: '🧩', idea: 'Ofrécele acertijos, patrones y problemas de varios pasos como reto extra.' },
  comunicacion: { label: 'Comunicación', emoji: '🗣️', idea: 'Invítale a explicar un tema a sus compañeros o a presentar el trabajo del grupo.' },
  colaboracion: { label: 'Colaboración', emoji: '🤝', idea: 'Dale un rol de apoyo o coordinación en trabajos en equipo.' },
  problemas: { label: 'Resolución de problemas', emoji: '🔧', idea: 'Plantéale problemas de la vida real de su comunidad (huerta, mercado, agua).' },
  critico: { label: 'Pensamiento crítico', emoji: '🔍', idea: 'Pídele que revise fuentes o que detecte errores en textos y respuestas de IA.' },
}

export const INTERESTS = [
  '🌿 Naturaleza', '🎨 Arte y dibujo', '🔢 Números', '📖 Contar historias', '🛠️ Construir cosas',
  '🎵 Música', '⚽ Deporte', '💻 Tecnología', '🐾 Animales', '🤝 Ayudar a otros', '🍲 Cocina', '🌎 Otros lugares',
]

export interface PatternPuzzle {
  id: string
  prompt: string
  options: string[]
  answer: string
  why: string
}

export const PATTERNS: PatternPuzzle[] = [
  { id: 'pt1', prompt: '2, 4, 6, 8, ¿?', options: ['9', '10', '12'], answer: '10', why: 'Va sumando 2 cada vez.' },
  { id: 'pt2', prompt: '🌱 🌿 🌱 🌿 🌱 ¿?', options: ['🌱', '🌿', '🌻'], answer: '🌿', why: 'Se alternan dos figuras.' },
  { id: 'pt3', prompt: '1, 3, 9, 27, ¿?', options: ['54', '81', '30'], answer: '81', why: 'Cada número se multiplica por 3.' },
  { id: 'pt4', prompt: '🔺🔺🔵 🔺🔺🔵 🔺🔺 ¿?', options: ['🔺', '🔵', '🟩'], answer: '🔵', why: 'El grupo “dos triángulos y un círculo” se repite.' },
  { id: 'pt5', prompt: '1, 1, 2, 3, 5, 8, ¿?', options: ['11', '13', '16'], answer: '13', why: 'Cada número es la suma de los dos anteriores.' },
]

export const CREATIVE_PROMPTS = [
  '¿Para qué más podría servir una botella de plástico vacía? Escribe todas las ideas que se te ocurran, una por línea.',
  'Imagina que tu escuela tiene un huerto. ¿Qué inventos harías para cuidarlo? Una idea por línea.',
  '¿Cómo podrías medir el largo de tu aula sin una regla? Escribe varias formas, una por línea.',
]

export const EXPLAIN_PROMPTS = [
  'Explícale a un niño más pequeño qué es una fracción, como si estuvieran comiendo juntos.',
  'Cuenta, con tus palabras, cómo descubrirías si una respuesta de la IA es correcta.',
  'Explica a un amigo cómo calcular cuánta cerca necesita una huerta rectangular.',
]

export const KUDOS_REASONS: { text: string; skill: Skill }[] = [
  { text: 'Me ayudó a entender algo', skill: 'comunicacion' },
  { text: 'Compartió sus ideas con el grupo', skill: 'colaboracion' },
  { text: 'Escuchó a todos', skill: 'colaboracion' },
  { text: 'Tuvo una idea muy original', skill: 'creatividad' },
  { text: 'Encontró cómo resolver el problema', skill: 'problemas' },
  { text: 'Se dio cuenta de un error', skill: 'critico' },
]
