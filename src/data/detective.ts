/**
 * Contenido del "Detective de IA" (Reto 07): aprender haciendo a detectar
 * alucinaciones, sesgos, contenido generado, datos personales y cuándo NO usar IA.
 * Inspirado en los principios de UNICEF para una IA centrada en la infancia.
 */

export interface TruthItem {
  id: string
  claim: string // lo que "dijo una IA"
  truth: boolean
  kind: 'alucinación' | 'sesgo' | 'correcto' | 'fuente inventada'
  why: string
}

export const TRUTH_ITEMS: TruthItem[] = [
  { id: 't1', claim: '2/7 + 3/7 = 5/14', truth: false, kind: 'alucinación', why: 'Sumó también los denominadores. Lo correcto es 5/7. Las IA a veces se equivocan con mucha seguridad.' },
  { id: 't2', claim: 'Un cuadrado de 5 cm de lado tiene un perímetro de 20 cm.', truth: true, kind: 'correcto', why: '4 × 5 = 20. ¡Esta vez la IA acertó! Pero siempre conviene comprobar.' },
  { id: 't3', claim: 'A los niños se les dan mejor las matemáticas que a las niñas.', truth: false, kind: 'sesgo', why: 'Es un estereotipo falso. Las IA aprenden de textos de personas y pueden repetir prejuicios. Todas y todos podemos aprender matemáticas.' },
  { id: 't4', claim: 'Según un estudio de la Universidad de los Andes de 2021, el 97% de los niños aprende mejor con IA.', truth: false, kind: 'fuente inventada', why: 'La IA puede inventar estudios, fechas y porcentajes que suenan reales. Si no puedes ver la fuente, no lo des por cierto.' },
  { id: 't5', claim: '7 × 0 = 7', truth: false, kind: 'alucinación', why: 'Cualquier número multiplicado por 0 da 0. Comprueba con la lección.' },
  { id: 't6', claim: '1/2 y 4/8 representan la misma cantidad.', truth: true, kind: 'correcto', why: 'Son fracciones equivalentes: 1×4 / 2×4 = 4/8.' },
  { id: 't7', claim: 'Las personas del campo no necesitan aprender tecnología.', truth: false, kind: 'sesgo', why: 'Es un prejuicio. La tecnología puede servir a cualquier comunidad. Detectar estos mensajes es pensar críticamente.' },
  { id: 't8', claim: 'El perímetro de un rectángulo de 8 m por 3 m es 24 m.', truth: false, kind: 'alucinación', why: 'Eso es el área (8 × 3). El perímetro es 8 + 3 + 8 + 3 = 22 m.' },
]

export interface UseAiItem {
  id: string
  situation: string
  good: boolean // ¿es buena idea usar IA?
  why: string
}

export const USE_AI_ITEMS: UseAiItem[] = [
  { id: 'u1', situation: 'Quiero que la IA me dé pistas para entender cómo sumar fracciones.', good: true, why: 'Usar la IA para entender (y no para copiar) es un buen uso.' },
  { id: 'u2', situation: 'Quiero que la IA haga mi tarea completa para entregarla.', good: false, why: 'Si la IA lo hace por ti, tu cerebro no aprende. Además, no es honesto.' },
  { id: 'u3', situation: 'Me siento muy triste y no sé con quién hablar.', good: false, why: 'Para emociones fuertes, busca a una persona adulta de confianza. La IA no reemplaza a las personas.' },
  { id: 'u4', situation: 'Quiero practicar ejercicios extra de multiplicación.', good: true, why: 'Practicar con ayuda es un gran uso, siempre comprobando los resultados.' },
  { id: 'u5', situation: 'Me duele mucho el estómago: le pregunto a la IA qué medicina tomar.', good: false, why: 'Para temas de salud, habla con un adulto o un profesional. La IA puede equivocarse y es peligroso.' },
  { id: 'u6', situation: 'Quiero ideas para un cuento sobre mi comunidad y luego escribirlo yo.', good: true, why: 'Pedir ideas está bien si luego el trabajo creativo es tuyo.' },
]

export interface DataItem {
  id: string
  message: string
  personal: boolean
  why: string
}

export const DATA_ITEMS: DataItem[] = [
  { id: 'd1', message: '¿Cómo se suman fracciones con distinto denominador?', personal: false, why: 'Es una pregunta sobre el tema. No revela nada de ti.' },
  { id: 'd2', message: 'Me llamo Lucía Quispe Mamani y vivo en la calle Los Pinos 123.', personal: true, why: 'Nombre completo y dirección: nunca los compartas con una IA ni con desconocidos.' },
  { id: 'd3', message: 'Mi número es 0991234567, ¿me ayudas?', personal: true, why: 'Un teléfono es un dato personal. No hace falta para aprender.' },
  { id: 'd4', message: 'No entiendo por qué 1/2 es igual a 2/4.', personal: false, why: 'Perfecto: preguntas sobre lo que quieres aprender.' },
  { id: 'd5', message: 'Mi escuela es la Unidad Educativa San José, en el barrio Centro.', personal: true, why: 'Tu escuela y tu barrio permiten ubicarte. Mejor no compartirlos.' },
]
