const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is required in .env file');
  process.exit(1);
}

// Initialize with API version beta to access newer models
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize the Gemini 2.5 Flash model (fast and cost-effective)
const model = genAI.getGenerativeModel({
  model: 'models/gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  }
});

console.log('🤖 Gemini AI initialized successfully with gemini-2.5-flash');

module.exports = { model, genAI };