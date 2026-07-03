module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, taskText, correctAnswers } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'No image' });

  const answersBlock = correctAnswers
    ? `ЭТАЛОННЫЕ ОТВЕТЫ (истина в последней инстанции):\n${correctAnswers}`
    : '';

  const prompt = `Ты строгий математический проверщик. Твоя задача — сравнить ответы ученика с эталоном ТОЧНО, по числам.

Задание: ${taskText || 'Задание по математике'}

${answersBlock}

Правила проверки:
1. Для каждого пункта найди число которое написал ученик на фото
2. Сравни его с эталонным числом ТОЧНО (30 ≠ 47, 5 ≠ 38)
3. Если число совпадает — пункт верный, если нет — ошибка
4. correct: true ТОЛЬКО если ВСЕ пункты верны

Ответь строго в JSON без лишнего текста:
{
  "correct": true или false,
  "errors": ["г) написано 30, должно быть 47", "д) написано ..."],
  "comment": "1-2 предложения для ребёнка, дружелюбно",
  "parts_done": ["а", "б", "в"] — только пункты где число совпало точно с эталоном
}

Если фото нечёткое и числа не видно — верни {"correct":false,"errors":["Фото нечёткое"],"comment":"Сфотографируй получше!","parts_done":[]}`;

  try {
    const response = await fetch('https://polza.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.POLZA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4.5',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || 'API error' });

    const text = data.choices?.[0]?.message?.content || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(200).json({ correct: false, errors: [], comment: text, parts_done: [] });

    return res.status(200).json(JSON.parse(match[0]));

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
