const { sendResponse } = require('./_lib');

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    sendResponse(res, 200, {
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
}
