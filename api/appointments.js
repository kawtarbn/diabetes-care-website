const { dataStore, authenticateToken, sendResponse } = require('./_lib');

export default async function handler(req, res) {
    const { patientId, doctorId } = req.query;
    
    if (req.method === 'POST') {
        authenticateToken(req, res, () => {
            const { patientId: bodyPatientId, doctorId: bodyDoctorId, date, time, reason } = req.body;
            
            if (req.user.role === 'patient' && req.user.id !== bodyPatientId) {
                return res.status(403).json({ error: 'Access denied' });
            }
            
            const appointments = dataStore.appointments;
            const newAppointment = {
                id: Date.now(),
                patientId: bodyPatientId,
                doctorId: bodyDoctorId || 1,
                date,
                time,
                reason: reason.trim(),
                status: 'scheduled',
                createdAt: new Date().toISOString()
            };
            
            appointments.push(newAppointment);
            sendResponse(res, 201, { message: 'Appointment booked successfully' });
        });
    } else if (req.method === 'GET') {
        authenticateToken(req, res, () => {
            if (patientId) {
                const requestedPatientId = parseInt(patientId);
                if (req.user.role === 'patient' && req.user.id !== requestedPatientId) {
                    return res.status(403).json({ error: 'Access denied' });
                }
                const patientAppointments = dataStore.appointments.filter(a => a.patientId === requestedPatientId);
                sendResponse(res, 200, patientAppointments);
            } else if (doctorId) {
                const requestedDoctorId = parseInt(doctorId);
                if (req.user.role !== 'doctor' || req.user.id !== requestedDoctorId) {
                    return res.status(403).json({ error: 'Access denied' });
                }
                const doctorAppointments = dataStore.appointments.filter(a => a.doctorId === requestedDoctorId);
                sendResponse(res, 200, doctorAppointments);
            } else {
                res.status(400).json({ error: 'patientId or doctorId required' });
            }
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
