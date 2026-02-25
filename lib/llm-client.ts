// lib/llm-client.ts
// B2: Agent Job Safety
//
// Wraps LLM API calls with:
// 1. 30-second timeout (configurable)
// 2. Exponential backoff retry (up to 3 attempts)
// 3. Structured error handling
//
// Usage:
//   import { llmCall } from '@/lib/llm-client'
//   const result = await llmCall({
//     provider: 'openai',
//     body: { model: 'gpt-4', messages: [...] },
//   })

const DEFAULT_TIMEOUT_MS = 30_000
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000

interface LLMCallOptions {
  provider: 'openai' | 'anthropic'
  body: Record<string, any>
  timeoutMs?: number
  maxRetries?: number
  apiKey?: string
}

interface LLMResult {
  ok: boolean
  data?: any
  error?: string
  attempts: number
  durationMs: number
}

const PROVIDER_CONFIG = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    envKey: 'OPENAI_API_KEY',
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    envKey: 'ANTHROPIC_API_KEY',
  },
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500
}

export async function llmCall(options: LLMCallOptions): Promise<LLMResult> {
  const {
    provider,
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = MAX_RETRIES,
    apiKey,
  } = options

  const config = PROVIDER_CONFIG[provider]
  const key = apiKey || process.env[config.envKey]

  if (!key) {
    return { ok: false, error: `Missing API key: ${config.envKey}`, attempts: 0, durationMs: 0 }
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (provider === 'openai') {
    headers['Authorization'] = `Bearer ${key}`
  } else if (provider === 'anthropic') {
    headers['x-api-key'] = key
    headers['anthropic-version'] = '2023-06-01'
  }

  const start = Date.now()
  let lastError = ''

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        config.url,
        { method: 'POST', headers, body: JSON.stringify(body) },
        timeoutMs
      )

      if (response.ok) {
        const data = await response.json()
        return { ok: true, data, attempts: attempt, durationMs: Date.now() - start }
      }

      if (!isRetryable(response.status)) {
        const errorText = await response.text().catch(() => 'Unknown error')
        return {
          ok: false,
          error: `${provider} API error ${response.status}: ${errorText}`,
          attempts: attempt,
          durationMs: Date.now() - start,
        }
      }

      lastError = `${provider} API error ${response.status}`
      console.warn(`[LLM] ${provider} attempt ${attempt}/${maxRetries} failed: ${response.status}. Retrying...`)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        lastError = `${provider} API timeout after ${timeoutMs}ms`
      } else {
        lastError = err.message || 'Network error'
      }
      console.warn(`[LLM] ${provider} attempt ${attempt}/${maxRetries}: ${lastError}. Retrying...`)
    }

    if (attempt < maxRetries) {
      const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1)
      await sleep(backoff + Math.random() * backoff * 0.1)
    }
  }

  console.error(`[LLM] ${provider} failed after ${maxRetries} attempts: ${lastError}`)
  return {
    ok: false,
    error: `${provider} failed after ${maxRetries} attempts: ${lastError}`,
    attempts: maxRetries,
    durationMs: Date.now() - start,
  }
}
