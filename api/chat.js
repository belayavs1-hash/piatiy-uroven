module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !messages.length) return res.status(400).json({ error: 'No messages' });

  const systemMsg = {
    role: 'system',
    content: `Ты Умник — дружелюбный помощник для школьников 5 класса. Помогаешь с математикой, другими предметами, подготовкой к олимпиадам, написанием сообщений и докладов.

Правила:
- Объясняй просто и понятно, как для 10-11 летнего ребёнка
- Используй примеры и аналогии из жизни
- Если задача по математике — покажи решение по шагам
- Если просят написать сообщение или доклад — напиши готовый текст
- Будь добрым и поддерживающим, хвали за старание
- Отвечай на русском языке
- Не пиши слишком длинно — кратко и по делу`
  };

  try {
    const response = await fetch('https://polza.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.POLZA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4.5',
        max_tokens: 1500,
        messages: [systemMsg, ...messages]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || 'API error', detail: data });

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ reply: text });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
