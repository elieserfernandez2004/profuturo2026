/**
 * Paquete de contenido local (demo: matemáticas de primaria).
 * Todo el contenido vive en el dispositivo y sirve de "fuente de verdad" para la IA:
 * el tutor solo habla sobre lo que está aquí (RAG local), lo que reduce alucinaciones.
 */

export interface Misconception {
  /** respuestas incorrectas típicas que delatan este error */
  answers: string[]
  label: string
  /** pista específica para ese error (sin dar la solución) */
  hint: string
}

export interface Exercise {
  id: string
  concept: string
  prompt: string
  answer: string // número o fracción "a/b"
  /** pistas pre-escritas, de menos a más ayuda (modo sin IA y respaldo del guardarraíl) */
  hints: [string, string, string]
  misconceptions?: Misconception[]
  /** explicación completa, solo si el estudiante agotó las pistas y la pide */
  solution: string
}

export interface Fact {
  q: string
  a: string
}

export interface Lesson {
  id: string
  title: string
  emoji: string
  grade: string
  concepts: Record<string, string>
  body: string[] // párrafos de la lección (fuente para la IA)
  exercises: Exercise[]
  /** hechos verificables para el juego "Detective de IA" */
  facts: Fact[]
}

export const LESSONS: Lesson[] = [
  {
    id: 'fracciones',
    title: 'Fracciones: partes de un todo',
    emoji: '🍕',
    grade: '4.º grado',
    concepts: {
      'frac-concepto': 'Qué es una fracción',
      'frac-equiv': 'Fracciones equivalentes',
      'frac-suma': 'Suma con igual denominador',
    },
    body: [
      'Una fracción representa partes de un todo. Se escribe con dos números: el numerador (arriba) dice cuántas partes tomamos y el denominador (abajo) dice en cuántas partes iguales se dividió el todo.',
      'Ejemplo: si una pizza se corta en 8 trozos iguales y te comes 3, comiste 3/8 de la pizza.',
      'Dos fracciones son equivalentes si representan la misma cantidad. Se obtienen multiplicando o dividiendo el numerador y el denominador por el mismo número. Por ejemplo, 1/2 = 2/4 = 4/8.',
      'Para sumar fracciones con el mismo denominador, se suman los numeradores y se deja el mismo denominador. Ejemplo: 2/7 + 3/7 = 5/7. ¡El denominador no se suma!',
    ],
    exercises: [
      {
        id: 'f1',
        concept: 'frac-concepto',
        prompt: 'Un pan se corta en 6 partes iguales y Ana se come 2. ¿Qué fracción del pan se comió? (escribe como a/b)',
        answer: '2/6',
        hints: [
          '¿En cuántas partes iguales se dividió el pan? Ese número va abajo.',
          'El número de arriba indica cuántas partes se comió Ana.',
          'Arriba van las partes que se comió y abajo el total de partes: ?/6',
        ],
        misconceptions: [
          { answers: ['6/2', '3'], label: 'Invierte numerador y denominador', hint: 'Revisa: ¿cuál número dice el total de partes? Ese va abajo, en el denominador.' },
          { answers: ['2/4', '4/6'], label: 'Cuenta las partes que sobran', hint: 'Fíjate: la pregunta es sobre lo que se comió, no lo que quedó.' },
        ],
        solution: 'El pan tiene 6 partes (denominador) y Ana se comió 2 (numerador): 2/6, que es equivalente a 1/3.',
      },
      {
        id: 'f2',
        concept: 'frac-equiv',
        prompt: 'Completa la fracción equivalente: 1/2 = ?/8. ¿Cuál es el numerador?',
        answer: '4',
        hints: [
          '¿Por qué número multiplicas 2 para obtener 8?',
          'Lo que hagas abajo tienes que hacerlo también arriba.',
          'Si 2 × 4 = 8, entonces el numerador 1 también se multiplica por ese mismo número.',
        ],
        misconceptions: [
          { answers: ['7'], label: 'Suma en lugar de multiplicar', hint: 'Para fracciones equivalentes no sumamos: multiplicamos arriba y abajo por el mismo número.' },
          { answers: ['2', '1'], label: 'No aplica la misma operación arriba', hint: 'Si el denominador cambió, el numerador también debe cambiar de la misma forma.' },
        ],
        solution: '2 × 4 = 8, así que 1 × 4 = 4. Por eso 1/2 = 4/8.',
      },
      {
        id: 'f3',
        concept: 'frac-suma',
        prompt: 'Calcula: 2/9 + 5/9 (escribe como a/b)',
        answer: '7/9',
        hints: [
          'Los denominadores son iguales. ¿Qué pasa con el denominador cuando sumas?',
          'Solo se suman los números de arriba.',
          'Suma 2 + 5 y conserva el 9 abajo.',
        ],
        misconceptions: [
          { answers: ['7/18'], label: 'Suma también los denominadores', hint: 'Cuidado: el denominador dice el tamaño de las partes. Si sumas partes del mismo tamaño, el tamaño no cambia.' },
        ],
        solution: '2/9 + 5/9 = (2 + 5)/9 = 7/9.',
      },
      {
        id: 'f4',
        concept: 'frac-suma',
        prompt: 'Luis pintó 3/10 de una pared por la mañana y 4/10 por la tarde. ¿Qué fracción pintó en total? (a/b)',
        answer: '7/10',
        hints: [
          '¿Qué operación necesitas para saber el total del día?',
          'Las dos fracciones tienen el mismo denominador.',
          'Suma los numeradores 3 + 4 y deja el denominador 10.',
        ],
        misconceptions: [
          { answers: ['7/20'], label: 'Suma también los denominadores', hint: 'La pared sigue dividida en 10 partes; solo cambia cuántas pintó.' },
          { answers: ['1/10'], label: 'Resta en lugar de sumar', hint: 'Pregunta por el total: ¿juntamos o quitamos?' },
        ],
        solution: '3/10 + 4/10 = 7/10 de la pared.',
      },
    ],
    facts: [
      { q: '¿Cuánto es 2/7 + 3/7?', a: '5/7' },
      { q: '¿Es 1/2 equivalente a 3/6?', a: 'Sí, 1/2 = 3/6' },
      { q: 'En la fracción 3/8, ¿cuál es el denominador?', a: '8' },
      { q: '¿Cuánto es 1/4 + 1/4?', a: '2/4, que es igual a 1/2' },
    ],
  },
  {
    id: 'multiplicacion',
    title: 'Multiplicación para resolver problemas',
    emoji: '🧺',
    grade: '3.º grado',
    concepts: {
      'mult-grupos': 'Multiplicar como grupos iguales',
      'mult-problemas': 'Problemas de multiplicación',
    },
    body: [
      'Multiplicar es sumar varias veces el mismo número. 4 × 3 significa 4 grupos de 3 objetos: 3 + 3 + 3 + 3 = 12.',
      'El orden de los factores no cambia el resultado: 4 × 3 = 3 × 4 = 12 (propiedad conmutativa).',
      'Para resolver un problema, identifica cuántos grupos hay y cuántos objetos tiene cada grupo. Luego multiplica.',
      'Cualquier número multiplicado por 0 da 0, y multiplicado por 1 da el mismo número.',
    ],
    exercises: [
      {
        id: 'm1',
        concept: 'mult-grupos',
        prompt: 'Hay 5 canastas con 6 mangos cada una. ¿Cuántos mangos hay en total?',
        answer: '30',
        hints: [
          '¿Cuántos grupos (canastas) hay? ¿Cuántos mangos tiene cada grupo?',
          'Puedes sumar 6 cinco veces, o usar una multiplicación.',
          'Calcula 5 × 6.',
        ],
        misconceptions: [
          { answers: ['11'], label: 'Suma en lugar de multiplicar', hint: 'Sumaste 5 + 6. Pero hay 5 canastas, y cada una tiene 6. ¿Cuántas veces se repite el 6?' },
        ],
        solution: '5 canastas × 6 mangos = 30 mangos.',
      },
      {
        id: 'm2',
        concept: 'mult-problemas',
        prompt: 'Un cuaderno cuesta 3 monedas. ¿Cuánto cuestan 8 cuadernos?',
        answer: '24',
        hints: [
          'Cada cuaderno cuesta lo mismo. ¿Cuántas veces pagas 3 monedas?',
          'Es como sumar 3 ocho veces.',
          'Calcula 8 × 3.',
        ],
        misconceptions: [
          { answers: ['11'], label: 'Suma en lugar de multiplicar', hint: 'Si compras 8 cuadernos, pagas 3 monedas por cada uno, no una sola vez.' },
          { answers: ['21', '27'], label: 'Error en la tabla del 3', hint: 'Revisa la tabla del 3 contando de 3 en 3: 3, 6, 9…' },
        ],
        solution: '8 × 3 = 24 monedas.',
      },
      {
        id: 'm3',
        concept: 'mult-grupos',
        prompt: '¿Cuánto es 7 × 0?',
        answer: '0',
        hints: [
          'Piensa: 7 grupos que no tienen nada adentro.',
          'Si cada grupo tiene 0 objetos, ¿cuántos objetos hay en total?',
          'Recuerda la regla de multiplicar por 0 en la lección.',
        ],
        misconceptions: [
          { answers: ['7'], label: 'Confunde ×0 con ×1', hint: 'Multiplicar por 1 deja el número igual, pero aquí multiplicamos por 0. ¿Qué hay en 7 cajas vacías?' },
        ],
        solution: 'Cualquier número por 0 da 0: 7 × 0 = 0.',
      },
    ],
    facts: [
      { q: '¿Cuánto es 6 × 7?', a: '42' },
      { q: '¿Cuánto es 9 × 0?', a: '0' },
      { q: '¿Es 4 × 3 igual a 3 × 4?', a: 'Sí, ambos dan 12' },
      { q: '¿Cuánto es 8 × 8?', a: '64' },
    ],
  },
  {
    id: 'perimetro',
    title: 'Perímetro de figuras',
    emoji: '📐',
    grade: '4.º grado',
    concepts: {
      'per-concepto': 'Qué es el perímetro',
      'per-rect': 'Perímetro de rectángulos',
    },
    body: [
      'El perímetro es la medida del contorno (borde) de una figura. Se calcula sumando las longitudes de todos sus lados.',
      'Un rectángulo tiene dos lados largos iguales y dos lados cortos iguales. Su perímetro es: largo + ancho + largo + ancho, o 2 × (largo + ancho).',
      'Un cuadrado tiene 4 lados iguales, así que su perímetro es 4 × lado.',
      'No confundas perímetro (el borde) con área (lo que hay dentro).',
    ],
    exercises: [
      {
        id: 'p1',
        concept: 'per-rect',
        prompt: 'Una huerta rectangular mide 8 m de largo y 3 m de ancho. ¿Cuántos metros de cerca se necesitan para rodearla?',
        answer: '22',
        hints: [
          'La cerca rodea el borde: ¿cuántos lados tiene un rectángulo?',
          'Suma los cuatro lados: dos de 8 m y dos de 3 m.',
          'Calcula 8 + 3 + 8 + 3.',
        ],
        misconceptions: [
          { answers: ['24'], label: 'Calcula el área en vez del perímetro', hint: 'Multiplicaste largo × ancho: eso es lo de adentro (área). La cerca va por el borde.' },
          { answers: ['11'], label: 'Suma solo dos lados', hint: 'Sumaste un largo y un ancho. ¿Cuántos lados tiene la huerta en total?' },
        ],
        solution: '8 + 3 + 8 + 3 = 22 m, o 2 × (8 + 3) = 22 m.',
      },
      {
        id: 'p2',
        concept: 'per-concepto',
        prompt: 'Un cuadrado tiene lados de 5 cm. ¿Cuál es su perímetro en cm?',
        answer: '20',
        hints: [
          '¿Cuántos lados tiene un cuadrado y cómo son entre sí?',
          'Los 4 lados miden lo mismo.',
          'Calcula 4 × 5.',
        ],
        misconceptions: [
          { answers: ['25'], label: 'Calcula el área en vez del perímetro', hint: '5 × 5 es el área. El perímetro es el borde: suma los lados.' },
          { answers: ['10'], label: 'Suma solo dos lados', hint: 'Un cuadrado tiene más de dos lados. ¿Cuántos?' },
        ],
        solution: '4 lados × 5 cm = 20 cm.',
      },
    ],
    facts: [
      { q: '¿Cuál es el perímetro de un cuadrado de lado 3 cm?', a: '12 cm' },
      { q: '¿Perímetro y área son lo mismo?', a: 'No: el perímetro es el borde, el área es lo de adentro' },
      { q: '¿Cuál es el perímetro de un rectángulo de 4 cm por 2 cm?', a: '12 cm' },
    ],
  },
]

export function getLesson(id: string) {
  return LESSONS.find((l) => l.id === id)
}

export function allConcepts(): { id: string; label: string; lesson: string }[] {
  return LESSONS.flatMap((l) => Object.entries(l.concepts).map(([id, label]) => ({ id, label, lesson: l.title })))
}

/** Convierte "3/4", "0,75", " 22 m" → número. */
export function parseValue(s: string): number | null {
  const t = s.trim().toLowerCase().replace(',', '.').replace(/[a-z²\s]+$/g, '').trim()
  const frac = t.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/)
  if (frac) {
    const d = parseFloat(frac[2])
    return d === 0 ? null : parseFloat(frac[1]) / d
  }
  const n = Number(t)
  return t !== '' && Number.isFinite(n) ? n : null
}

export function normalizeAnswer(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, '').replace(',', '.')
}

/** La corrección es determinista (no depende de la IA). */
export function isCorrect(ex: Exercise, input: string): boolean {
  const a = parseValue(ex.answer)
  const b = parseValue(input)
  if (a === null || b === null) return normalizeAnswer(ex.answer) === normalizeAnswer(input)
  return Math.abs(a - b) < 1e-9
}

export function findMisconception(ex: Exercise, input: string): Misconception | undefined {
  const n = normalizeAnswer(input)
  return ex.misconceptions?.find((m) => m.answers.some((a) => normalizeAnswer(a) === n))
}
