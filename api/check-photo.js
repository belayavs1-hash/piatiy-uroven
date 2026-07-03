export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, taskText } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'No image' });

  const prompt = `Ты — Умник, помощник-репетитор для учеников 5 класса.
Задание: ${taskText || 'Задание по математике'}

Посмотри на фото решения ученика и ответь строго в JSON:
{
  "correct": true/false,
  "errors": ["описание ошибки 1", ...] или [],
  "comment": "короткий дружелюбный комментарий для ребёнка (1-2 предложения)",
  "parts_done": ["а", "б", ...] — какие пункты решены правильно (если есть пункты)
}

Если на фото не видно решения или фото нечёткое — верни { "correct": false, "errors": ["Фото нечёткое, не вижу решения"], "comment": "Сфотографируй получше — мне нужно видеть твои записи!", "parts_done": [] }`;

  try {
    const response = await fetch('https://polza.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.POLZA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || 'API error' });

    const text = data.choices?.[0]?.message?.content || '';
    // Извлекаем JSON из ответа
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(200).json({ correct: false, errors: [], comment: text, parts_done: [] });

    const result = JSON.parse(match[0]);
    return res.status(200).json(result);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
