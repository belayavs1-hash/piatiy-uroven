module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { task, messages } = req.body;
  if (!task || !messages) return res.status(400).json({ error: 'Missing task or messages' });

  // For sub-parts like а1, а2... extract which numbered value we're checking
  let partContext = '';
  let subValueHint = '';
  if (task.currentPart) {
    const subMatch = task.currentPart.match(/^([а-яё])([1-9])$/u);
    if (subMatch) {
      const letter = subMatch[1];
      const num = parseInt(subMatch[2]);
      partContext = `\nСЕЙЧАС РЕШАЕМ ПУНКТ: ${letter}), значение ${num}.`;
      // Extract the Nth value from the answer for this letter-part
      const answerSection = (task.answer || '').match(new RegExp(letter + '\\)([^;а-яё]+(?:;[^;а-яё]+){0,20})'));
      if (answerSection) {
        const values = answerSection[1].split(';').map(v => v.trim()).filter(Boolean);
        const val = values[num - 1];
        if (val) subValueHint = `\nПРАВИЛЬНЫЙ ОТВЕТ ДЛЯ ЭТОГО ЗНАЧЕНИЯ: ${val}`;
      }
    } else {
      partContext = `\nСЕЙЧАС РЕШАЕМ ПУНКТ: ${task.currentPart}). Помоги ученику решить именно этот пункт задания.`;
    }
  }

  const systemMsg = {
    role: 'system',
    content: `Ты Умник — дружелюбный помощник по математике для ученика 5 класса (учебник Виленкина). Твоя главная задача — ПРОВЕРИТЬ ответ ученика и помочь если он ошибся.

ЗАДАНИЕ:
${task.text ? task.text.replace(/<[^>]+>/g, '') : ''}

ПРАВИЛЬНЫЙ ОТВЕТ (только для твоей проверки — НЕ показывай ученику): ${task.answer || ''}${partContext}${subValueHint}

${task.hints && task.hints.length ? 'ПОДСКАЗКИ (только для твоей проверки — НЕ зачитывай их дословно):\n' + task.hints.filter(h=>typeof h==='string').map((h,i) => (i+1)+') '+h).join('\n') : ''}

РИСУНКИ: Вставляй тег [РИСУНОК: название] для геометрических фигур.
Доступные: острый угол, прямой угол, тупой угол, развёрнутый угол, отрезок, луч, прямая, треугольник, квадрат.
Пример: "Прямой угол [РИСУНОК: прямой угол]"

ГЛАВНЫЕ ПРАВИЛА:
1. СНАЧАЛА проверь ответ ученика — сравни с правильным ответом
2. Если ответ правильный или близкий по смыслу — сразу скажи "Правильно! ✅" и похвали
3. Если частично правильный — скажи что верно, и задай ОДИН вопрос по оставшейся части
4. Если ошибся — дай ОДИН наводящий вопрос (не объясняй, не давай числа, не пересказывай подсказки)
5. НЕ задавай вопросы типа "как ты это определил?" — просто прими правильный ответ
6. НЕ переспрашивай если ответ правильный — засчитывай сразу
7. Отвечай максимум 2-3 предложения, коротко и ясно
8. Язык простой, для 10-летнего ребёнка
9. НЕ используй markdown (**, *, #)
10. НИКОГДА не называй конкретные числа из ответа пока ученик сам не ответил правильно
11. При подсказке: задай вопрос "Что нужно сделать чтобы перевести Х в У?" — без чисел и без формул`
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
