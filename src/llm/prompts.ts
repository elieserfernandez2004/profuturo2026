import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm'
import type { Exercise, Lesson } from '../data/lessons'
import type { AgeGroup } from '../db'

const AGE_STYLE: Record<AgeGroup, string> = {
  '8-10': 'Habla para un niño o niña de 8 a 10 años: frases muy cortas, palabras sencillas, ejemplos con objetos cotidianos.',
  '11-14': 'Habla para un estudiante de 11 a 14 años: claro y directo, puedes usar términos matemáticos básicos.',
}

function lessonContext(lesson: Lesson) {
  return lesson.body.join('\n')
}

/** Tutor socrático: guía con preguntas y pistas; nunca da el resultado final. */
export function hintMessages(opts: {
  lesson: Lesson
  exercise: Exercise
  studentAnswer: string
  hintLevel: number // 1..3
  misconceptionLabel?: string
  ageGroup: AgeGroup
}): ChatCompletionMessageParam[] {
  const { lesson, exercise, studentAnswer, hintLevel, misconceptionLabel, ageGroup } = opts
  const levelDesc = [
    'Pista nivel 1: haz UNA pregunta que le haga pensar en el concepto clave. No menciones números del resultado.',
    'Pista nivel 2: da una pista más concreta sobre el procedimiento, con una pregunta al final.',
    'Pista nivel 3: describe el primer paso del cálculo, pero NO lo completes ni digas el resultado.',
  ][Math.min(hintLevel, 3) - 1]
  return [
    {
      role: 'system',
      content: [
        'Eres "Semilla", un tutor de matemáticas amable para escuelas rurales. Respondes SIEMPRE en español.',
        'REGLA DE ORO: nunca digas la respuesta final del ejercicio ni hagas el cálculo completo. Ayudas a pensar, no haces la tarea.',
        AGE_STYLE[ageGroup],
        'Responde en máximo 3 frases. Usa como única fuente la lección:',
        lessonContext(lesson),
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `Ejercicio: ${exercise.prompt}`,
        `Respuesta del estudiante: "${studentAnswer || '(no respondió)'}" (es incorrecta o pidió ayuda).`,
        misconceptionLabel ? `Posible error detectado: ${misconceptionLabel}.` : '',
        `Pista de referencia del docente: ${exercise.hints[Math.min(hintLevel, 3) - 1]}`,
        levelDesc,
        'Empieza reconociendo el esfuerzo con pocas palabras.',
      ]
        .filter(Boolean)
        .join('\n'),
    },
  ]
}

/** Preguntas libres del estudiante sobre la lección (con límites explícitos). */
export function askMessages(opts: {
  lesson: Lesson
  question: string
  ageGroup: AgeGroup
  history: { role: 'user' | 'assistant'; content: string }[]
}): ChatCompletionMessageParam[] {
  const { lesson, question, ageGroup, history } = opts
  return [
    {
      role: 'system',
      content: [
        'Eres "Semilla", un tutor amable. Respondes SIEMPRE en español.',
        AGE_STYLE[ageGroup],
        'Solo hablas del tema de esta lección. Si te preguntan otra cosa, dilo con amabilidad y sugiere preguntar a su docente.',
        'Si te piden la respuesta de un ejercicio, no la des: responde con una pregunta que ayude a pensar.',
        'Si no estás seguro, dilo claramente: "No estoy seguro, compruébalo con tu docente".',
        'Máximo 4 frases. Lección:',
        lessonContext(lesson),
      ].join('\n'),
    },
    ...history.slice(-4),
    { role: 'user', content: question },
  ]
}

/** Modo docente: genera una actividad para revisar antes de publicar. */
export function activityMessages(lesson: Lesson, level: string, extra: string): ChatCompletionMessageParam[] {
  return [
    {
      role: 'system',
      content:
        'Eres un asistente para docentes de primaria en contextos rurales. Respondes en español, con formato simple de texto (sin tablas).',
    },
    {
      role: 'user',
      content: [
        `Crea una actividad corta sobre "${lesson.title}" para nivel ${level}.`,
        'Incluye: 1) un objetivo en una línea, 2) cinco preguntas numeradas con contexto de la vida en comunidad (mercado, huerta, escuela), 3) las respuestas al final bajo el título "Respuestas".',
        'Usa solo lo que explica esta lección:',
        lessonContext(lesson),
        extra ? `Indicaciones del docente: ${extra}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    },
  ]
}

/** Detective de IA en vivo: el modelo responde una pregunta con respuesta conocida. */
export function factMessages(question: string): ChatCompletionMessageParam[] {
  return [
    { role: 'system', content: 'Responde en español en una sola frase corta.' },
    { role: 'user', content: question },
  ]
}
