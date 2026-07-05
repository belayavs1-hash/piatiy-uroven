module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  try {
    const response = await fetch('https://polza.ai/api/v2/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.POLZA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image',
        prompt: prompt,
        size: '1024x1024',
        response_format: 'url',
        n: 1
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || 'API error', detail: data });

    // async mode — generation took >120s
    if (data.status === 'pending') {
      return res.status(202).json({ pending: true, id: data.id });
    }

    const url = data.data?.[0]?.url;
    if (!url) return res.status(500).json({ error: 'No image in response', detail: data });

    return res.status(200).json({ url });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
