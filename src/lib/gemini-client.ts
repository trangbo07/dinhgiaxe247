const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const GEMINI_API_VERSION =
  process.env.GEMINI_API_VERSION ||
  (GEMINI_MODEL.includes('preview') || GEMINI_MODEL.includes('3.1') ? 'v1beta' : 'v1')

export function isGeminiConfigured() {
  return Boolean(GEMINI_API_KEY)
}

export async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('Chưa cấu hình GEMINI_API_KEY')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
