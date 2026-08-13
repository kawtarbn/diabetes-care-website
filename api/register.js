const Joi = require('joi');
const { dataStore, generateToken, hashPassword, sendResponse } = require('./_lib');

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
    role: Joi.string().valid('patient', 'doctor').default('patient')
});

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, email, password, role } = value;

        if (dataStore.users.find(u => u.email === email)) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = {
            id: Date.now(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role,
            isVerified: false,
            createdAt: new Date().toISOString()
        };

        dataStore.users.push(newUser);

        const token = generateToken(newUser);

        sendResponse(res, 201, {
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
