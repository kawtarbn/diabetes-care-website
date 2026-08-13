const { dataStore, authenticateToken, sendResponse } = require('./_lib');

module.exports = async function handler(req, res) {
    const { userId } = req.query;
    
    if (req.method === 'POST') {
        authenticateToken(req, res, () => {
            const { userId: bodyUserId, mealType, food, calories, carbs, bloodSugarAfter } = req.body;
            
            if (req.user.id !== bodyUserId) {
                return res.status(403).json({ error: 'Access denied' });
            }
            
            const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
            if (!validMealTypes.includes(mealType)) {
                return res.status(400).json({ error: 'Invalid meal type' });
            }
            
            const meals = dataStore.meals;
            const newMeal = {
                id: Date.now(),
                userId: bodyUserId,
                mealType,
                food: food.trim(),
                calories: parseInt(calories) || 0,
                carbs: parseInt(carbs) || 0,
                bloodSugarAfter: bloodSugarAfter ? parseInt(bloodSugarAfter) : null,
                date: new Date().toISOString()
            };
            
            meals.push(newMeal);
            sendResponse(res, 201, { message: 'Meal logged successfully' });
        });
    } else if (req.method === 'GET') {
        authenticateToken(req, res, () => {
            const requestedUserId = parseInt(userId);
            
            if (req.user.role === 'patient' && req.user.id !== requestedUserId) {
                return res.status(403).json({ error: 'Access denied' });
            }
            
            const userMeals = dataStore.meals.filter(m => m.userId === requestedUserId);
            sendResponse(res, 200, userMeals);
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
