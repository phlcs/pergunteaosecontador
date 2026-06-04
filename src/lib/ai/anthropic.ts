import Anthropic from '@anthropic-ai/sdk'
import { validateOutput } from './validate-output'
import type { AiResponse } from './schema'

type HistoryMessage = { role: 'user' | 'assistant'; content: string }

let _client: Anthropic | undefined

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY não está configurado')
    _client = new Anthropic({ apiKey })
  }
  return _client
}

export async function callAnthropic(
  systemPrompt: string,
  history: HistoryMessage[],
  userMessage: string
): Promise<AiResponse> {
  const client = getClient()
  const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5'

  const response = await client.messages.create(
    {
      model,
      max_tokens: 1200,
      temperature: 0.3,
      // System prompt with cache_control — large stable prefix cached across requests
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        ...history.map((h) => ({
          role: h.role,
          content: h.content,
        })),
        { role: 'user' as const, content: userMessage },
      ],
    },
    { timeout: 20000 }
  )

  const textBlock = response.content.find((b) => b.type === 'text')
  const raw = textBlock?.type === 'text' ? textBlock.text : ''

  return validateOutput(raw)
}
