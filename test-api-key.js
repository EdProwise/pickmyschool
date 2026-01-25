const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function testApiKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Testing API key starting with:', apiKey.substring(0, 5));
    
    try {
        const genAI = new GoogleGenAI({ apiKey });
        const model = 'gemini-1.5-flash';
        console.log(`Testing model: ${model}`);
        
        const response = await genAI.models.generateContent({
            model: model,
            contents: 'Hello, are you working?'
        });
        
        console.log('Response:', response.text);
        console.log('✅ API Key is working with gemini-1.5-flash');
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.status) console.error('Status:', error.status);
    }
}

testApiKey();
