module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { task, messages } = req.body;
  if (!task || !messages) return res.status(400).json({ error: 'Missing task or messages' });

  const partContext = task.currentPart
    ? `\nСЕЙЧАС РЕШАЕМ ПУНКТ: ${task.currentPart}). Помоги ученику решить именно этот пункт задания.`
    : '';

  const systemMsg = {
    role: 'system',
    content: `Ты Умник — репетитор по математике для 5 класса. Помогаешь ученику решить конкретное задание.

ЗАДАНИЕ:
${task.text ? task.text.replace(/<[^>]+>/g, '') : ''}

ПРАВИЛЬНЫЙ ОТВЕТ (не показывай его напрямую): ${task.answer || ''}${partContext}

${task.hints && task.hints.length ? 'ПОДСКАЗКИ (используй по шагам):\n' + task.hints.map((h,i) => (i+1)+') '+h).join('\n') : ''}

ПРАВИЛА РАБОТЫ:
- Веди ученика пошагово, не давай готовый ответ
- Задавай наводящие вопросы — один за раз
- Если ученик написал промежуточный шаг правильно — похвали и веди к следующему
- Если ошибся — объясни где и почему, дай подсказку
- Если написал текст без числа — попроси посчитать и написать число
- Когда ученик напишет правильный ответ — скажи "Правильно! ✅" и объясни решение кратко
- Отвечай коротко: 1-3 предложения максимум
- Пиши на русском, простым языком для 10-11 летнего ребёнка
- НЕ используй markdown (**, *, #) — только обычный текст
- НЕ раскрывай ответ в своих сообщениях`
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
        max_tokens: 300,
        messages: [systemMsg, ...messages]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || 'API error' });

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ reply: text });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
