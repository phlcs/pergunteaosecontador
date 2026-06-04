import { GoogleGenAI } from '@google/genai'
import { validateOutput } from './validate-output'
import type { AiResponse } from './schema'

type HistoryMessage = { role: 'user' | 'assistant'; content: string }

let _client: GoogleGenAI | undefined

function getClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) throw new Error('GOOGLE_API_KEY não está configurado')
    _client = new GoogleGenAI({ apiKey })
  }
  return _client
}

export async function callGemini(
  systemPrompt: string,
  history: HistoryMessage[],
  userMessage: string
): Promise<AiResponse> {
  const client = getClient()
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  const contents = [
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ]

  const generatePromise = client.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 1200,
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  })

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Gemini request timed out after 20s')), 20000)
  )

  const response = await Promise.race([generatePromise, timeoutPromise])
  const raw = response.text ?? ''

  return validateOutput(raw)
}
