import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
})

export async function generateCompletion(
  prompt: string,
  options?: { model?: string; maxTokens?: number }
) {
  const response = await openai.chat.completions.create({
    model: options?.model || 'gpt-4o-mini',
    max_tokens: options?.maxTokens || 500,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.choices[0]?.message?.content || ''
}
