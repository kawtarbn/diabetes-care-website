const { dataStore, authenticateToken, sendResponse } = require('./_lib');

export default async function handler(req, res) {
    const { userId } = req.query;
    
    if (req.method === 'POST') {
        authenticateToken(req, res, async () => {
            const { userId: bodyUserId, diabetesType, bloodSugarTarget, medications, notes } = req.body;
            
            if (req.user.id !== bodyUserId && req.user.role !== 'doctor') {
                return res.status(403).json({ error: 'Access denied' });
            }
            
            const patients = dataStore.patients;
            const existingIndex = patients.findIndex(p => p.userId === bodyUserId);
            const profileData = {
                userId: bodyUserId,
                diabetesType,
                bloodSugarTarget,
                medications: medications?.trim() || '',
                notes: notes?.trim() || '',
                updatedAt: new Date().toISOString()
            };
            
            if (existingIndex >= 0) {
                patients[existingIndex] = { ...patients[existingIndex], ...profileData };
            } else {
                profileData.createdAt = new Date().toISOString();
                patients.push(profileData);
            }
            
            sendResponse(res, 200, { message: 'Profile saved successfully' });
        });
    } else if (req.method === 'GET') {
        authenticateToken(req, res, () => {
            const requestedUserId = parseInt(userId);
            
            if (req.user.role === 'patient' && req.user.id !== requestedUserId) {
                return res.status(403).json({ error: 'Access denied' });
            }
            
            const profile = dataStore.patients.find(p => p.userId === requestedUserId);
            sendResponse(res, 200, profile || null);
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
