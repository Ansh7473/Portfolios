// api/openrouter.js — Vercel Serverless Function
// Calls OpenRouter API directly using process.env.OPENROUTER_API_KEY

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
    }

    try {
        const { messages, max_tokens = 512, temperature = 0.7 } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://portfolios-psi-seven.vercel.app',
                'X-Title': 'Ansh Soni Portfolio'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1-0528:free',
                messages,
                max_tokens,
                temperature
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[OpenRouter] API Error:', response.status, errorText);
            return res.status(response.status).json({
                error: `OpenRouter API error: ${response.status}`,
                details: errorText
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (err) {
        console.error('[OpenRouter] Server error:', err);
        return res.status(500).json({ error: 'Internal server error', message: err.message });
    }
}
