// El modelo corre en un Web Worker para no bloquear la interfaz.
import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm'

const handler = new WebWorkerMLCEngineHandler()
self.onmessage = (msg: MessageEvent) => handler.onmessage(msg)
