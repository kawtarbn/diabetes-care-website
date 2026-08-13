const { sendResponse } = require('./_lib');

module.exports = function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const educationContent = [
        {
            id: 1,
            title: 'Understanding Type 2 Diabetes',
            category: 'Basics',
            content: 'Type 2 diabetes is a chronic condition that affects the way your body metabolizes sugar (glucose). With type 2 diabetes, your body either resists the effects of insulin or doesn\'t produce enough insulin to maintain normal glucose levels.',
            readTime: '5 min'
        },
        {
            id: 2,
            title: 'Healthy Eating for Diabetes',
            category: 'Diet',
            content: 'A healthy diet for diabetes includes plenty of vegetables, fruits, and moderate amounts of whole grains and healthy proteins. Focus on foods with a low glycemic index and limit processed foods and sugary beverages.',
            readTime: '7 min'
        },
        {
            id: 3,
            title: 'Monitoring Blood Sugar Levels',
            category: 'Management',
            content: 'Regular blood sugar monitoring helps you understand how food, activity, and medications affect your glucose levels. Keep a log of your readings and discuss patterns with your healthcare provider.',
            readTime: '4 min'
        },
        {
            id: 4,
            title: 'Exercise and Diabetes',
            category: 'Lifestyle',
            content: 'Physical activity helps your body use insulin more efficiently. Aim for at least 150 minutes of moderate-intensity aerobic activity per week, plus muscle-strengthening exercises on 2 or more days a week.',
            readTime: '6 min'
        },
        {
            id: 5,
            title: 'Medication Management',
            category: 'Treatment',
            content: 'Take your diabetes medications exactly as prescribed. Understand what each medication does, potential side effects, and how to manage them. Never skip doses without consulting your doctor.',
            readTime: '5 min'
        }
    ];

    sendResponse(res, 200, educationContent);
};
