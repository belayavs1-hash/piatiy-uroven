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
      partContext = `\nСЕЙЧАС РЕШАЕМ ПУНКТ: ${task.currentPart}). ВАЖНО: помогай ТОЛЬКО с этим пунктом. Не упоминай другие пункты, не давай примеры из других пунктов. Если ученик написал решение другого пункта — мягко напомни что сейчас нужен пункт ${task.currentPart}).`;
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
1. Ты ОБЪЯСНЯЕШЬ и НАПРАВЛЯЕШЬ — НЕ даёшь готовые ответы. Твоя цель: ученик должен дойти до ответа сам.
2. НИКОГДА не называй правильный ответ напрямую, даже если ученик просит. Вместо этого — задай наводящий вопрос или объясни правило.
3. СНАЧАЛА проверь ответ ученика — сравни с правильным ответом.
4. Правильный ответ — это ПОЛНЫЙ конечный результат. Промежуточные и частичные ответы НЕ засчитываются:
   - Если задание про несколько чисел (например: 12; 30; 32; 48) — нужны ответы для ВСЕХ чисел, не только для одного
   - Если задание на вычисление цепочки — нужен конечный результат (после последнего "="), не промежуточный
   - Если задание на несколько условий (уменьшаемому; нулю) — нужны ВСЕ условия
5. Если ответ ПОЛНЫЙ и правильный — напиши ТОЛЬКО "Правильно! ✅" и похвали одним предложением. НЕ задавай после этого никаких вопросов. НЕ добавляй "Теперь следующий шаг..." или "А теперь...".
6. ВАЖНО: если ты сам задал промежуточный вопрос (сумма цифр, общее количество, первый шаг) — и ученик ответил верно — пиши "Да, верно! Теперь используй это чтобы найти..." БЕЗ "Правильно! ✅" и БЕЗ галочки. Слова "Правильно! ✅" означают что ВСЁ задание решено.
7. Если ответ частичный (одно число из нескольких, одно условие из двух) — скажи "Хорошее начало, но нужно для всех" и задай вопрос. НЕ ставь ✅.
8. Если ошибся — объясни В ЧЁМ ошибка (какое правило нарушено) и задай ОДИН наводящий вопрос без чисел из ответа.
9. НЕ переспрашивай если ответ полный и правильный — засчитывай сразу.
10. Отвечай максимум 2-3 предложения, коротко и ясно.
11. Язык простой, для 10-летнего ребёнка.
12. НЕ используй markdown (**, *, #).
13. НИКОГДА не называй конкретные числа из правильного ответа пока ученик сам не ответил правильно.`
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
