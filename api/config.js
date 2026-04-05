export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    // Securely deliver the environment variable to the frontend so it isn't hardcoded in GitHub
    res.status(200).json({
        cerebrasKey: process.env.CEREBRAS_API_KEY || ''
    });
}
