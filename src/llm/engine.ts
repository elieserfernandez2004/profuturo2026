/**
 * Motor de IA local de Semilla.
 *
 * - Detecta qué puede hacer el dispositivo (WebGPU, f16, memoria) y elige un modelo.
 * - Descarga el modelo UNA vez (Cache API) y luego funciona sin internet.
 * - Si no hay WebGPU o el modelo no carga, la app sigue funcionando en "modo sin IA"
 *   (pistas y contenidos pre-escritos), para no dejar a nadie atrás.
 */
import { reactive } from 'vue'
import {
  CreateWebWorkerMLCEngine,
  hasModelInCache,
  deleteModelAllInfoInCache,
  type WebWorkerMLCEngine,
  type ChatCompletionMessageParam,
} from '@mlc-ai/web-llm'

export type Tier = 'alta' | 'media' | 'baja'

export interface ModelOption {
  tier: Tier
  label: string
  base: string // id sin sufijo de cuantización
  sizeMB: number
  note: string
}

export const MODEL_OPTIONS: ModelOption[] = [
  { tier: 'alta', label: 'Llama 3.2 · 3B', base: 'Llama-3.2-3B-Instruct', sizeMB: 1900, note: 'Tablets y móviles de gama alta' },
  { tier: 'media', label: 'Qwen 2.5 · 1.5B', base: 'Qwen2.5-1.5B-Instruct', sizeMB: 1000, note: 'Equilibrio calidad / velocidad' },
  { tier: 'baja', label: 'Qwen 2.5 · 0.5B', base: 'Qwen2.5-0.5B-Instruct', sizeMB: 400, note: 'Equipos modestos' },
]

export type LLMStatus =
  | 'idle' // sin comprobar
  | 'checking'
  | 'not-downloaded' // compatible pero sin modelo descargado
  | 'loading' // descargando o cargando a GPU
  | 'ready'
  | 'unsupported' // sin WebGPU → modo sin IA
  | 'error'

export const llm = reactive({
  status: 'idle' as LLMStatus,
  progress: 0,
  progressText: '',
  modelId: '',
  recommended: 'media' as Tier,
  selectedTier: (localStorageGet('semilla.tier') as Tier | null) ?? null,
  f16: false,
  gpuName: '',
  deviceMemory: 0,
  error: '',
  busy: false,
})

let engine: WebWorkerMLCEngine | null = null

function localStorageGet(k: string): string | null {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
function localStorageSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* modo privado */
  }
}

export function modelIdFor(tier: Tier): string {
  const opt = MODEL_OPTIONS.find((m) => m.tier === tier)!
  return `${opt.base}-${llm.f16 ? 'q4f16_1' : 'q4f32_1'}-MLC`
}

export function currentTier(): Tier {
  return llm.selectedTier ?? llm.recommended
}

/** Detecta capacidades del dispositivo y recomienda un nivel de modelo. */
export async function detectDevice(): Promise<boolean> {
  llm.status = 'checking'
  llm.deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 0
  const gpu = (navigator as unknown as { gpu?: { requestAdapter: (o?: object) => Promise<any> } }).gpu
  if (!gpu) {
    llm.status = 'unsupported'
    return false
  }
  try {
    const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' })
    if (!adapter) {
      llm.status = 'unsupported'
      return false
    }
    llm.f16 = adapter.features?.has?.('shader-f16') ?? false
    const info = adapter.info ?? {}
    llm.gpuName = [info.vendor, info.architecture, info.description].filter(Boolean).join(' ')
    const maxBuf: number = adapter.limits?.maxBufferSize ?? 0
    // heurística sencilla: memoria del equipo + límites de la GPU
    if (llm.deviceMemory >= 8 && maxBuf >= 1024 * 1024 * 1024) llm.recommended = 'alta'
    else if (llm.deviceMemory > 0 && llm.deviceMemory <= 3) llm.recommended = 'baja'
    else llm.recommended = 'media'
    return true
  } catch (e) {
    llm.status = 'unsupported'
    llm.error = String(e)
    return false
  }
}

export async function isCached(tier: Tier = currentTier()): Promise<boolean> {
  try {
    return await hasModelInCache(modelIdFor(tier))
  } catch {
    return false
  }
}

/** Al abrir la app: si el modelo ya está descargado, se carga sin red. */
export async function autoInitLLM() {
  const ok = await detectDevice()
  if (!ok) return
  if (await isCached()) {
    await loadModel()
  } else {
    llm.status = 'not-downloaded'
  }
}

export async function loadModel(tier: Tier = currentTier()) {
  if (llm.status === 'loading') return
  llm.selectedTier = tier
  localStorageSet('semilla.tier', tier)
  const id = modelIdFor(tier)
  llm.status = 'loading'
  llm.progress = 0
  llm.progressText = 'Preparando…'
  llm.error = ''
  try {
    if (engine) {
      await engine.unload()
    } else {
      const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
      engine = await CreateWebWorkerMLCEngine(worker, id, {
        initProgressCallback: (r) => {
          llm.progress = r.progress
          llm.progressText = r.text
        },
      })
      llm.modelId = id
      llm.status = 'ready'
      return
    }
    await engine.reload(id)
    llm.modelId = id
    llm.status = 'ready'
  } catch (e) {
    console.error(e)
    llm.status = 'error'
    llm.error = e instanceof Error ? e.message : String(e)
  }
}

export async function deleteModel(tier: Tier) {
  const id = modelIdFor(tier)
  if (engine && llm.modelId === id) {
    await engine.unload()
    llm.modelId = ''
    llm.status = 'not-downloaded'
  }
  await deleteModelAllInfoInCache(id)
}

export function aiAvailable() {
  return llm.status === 'ready' && !!engine
}

export interface ChatOpts {
  maxTokens?: number
  temperature?: number
  onToken?: (partial: string) => void
}

/** Genera una respuesta (en streaming). Lanza error si no hay modelo listo. */
export async function chat(messages: ChatCompletionMessageParam[], opts: ChatOpts = {}): Promise<string> {
  if (!engine || llm.status !== 'ready') throw new Error('IA no disponible')
  // un único generador a la vez
  while (llm.busy) await new Promise((r) => setTimeout(r, 80))
  llm.busy = true
  try {
    const stream = await engine.chat.completions.create({
      messages,
      stream: true,
      max_tokens: opts.maxTokens ?? 220,
      temperature: opts.temperature ?? 0.4,
    })
    let out = ''
    for await (const chunk of stream) {
      out += chunk.choices[0]?.delta?.content ?? ''
      opts.onToken?.(out)
    }
    return out.trim()
  } finally {
    llm.busy = false
  }
}

export async function interrupt() {
  engine?.interruptGenerate()
}
