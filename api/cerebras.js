export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, max_tokens, temperature, provider = 'cerebras' } = req.body;

    try {
        if (provider === 'cerebras') {
            const CEREBRAS_KEY = process.env.CEREBRAS_API_KEY;
            if (!CEREBRAS_KEY) {
                return res.status(500).json({ error: 'CEREBRAS_API_KEY is not set in Vercel environment.' });
            }

            const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CEREBRAS_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'qwen-3-235b-a22b-instruct-2507', 
                    messages: messages
                })
            });

            if (response.ok) {
                const data = await response.json();
                return res.status(200).json(data);
            } else {
                const errorText = await response.text();
                return res.status(response.status).json({
                    error: 'Cerebras API error',
                    details: errorText
                });
            }

        } else {
            const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
            if (!OPENROUTER_KEY) {
                return res.status(500).json({ error: 'OPENROUTER_API_KEY is not set in Vercel environment.' });
            }
            
            const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENROUTER_KEY}`,
                    'HTTP-Referer': 'https://ansh-soni-portfolio.vercel.app',
                    'X-Title': 'Ansh Portfolio'
                },
                body: JSON.stringify({
                    model: 'openrouter/free',
                    messages: messages,
                    max_tokens: max_tokens || 1500,
                    temperature: temperature || 0.1
                })
            });

            if (orResponse.ok) {
                const orData = await orResponse.json();
                return res.status(200).json(orData);
            } else {
                const orError = await orResponse.text();
                return res.status(orResponse.status).json({
                    error: 'OpenRouter error',
                    details: orError
                });
            }
        }
    } catch (err) {
        console.error('API Error:', err.message);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
}
