require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function checkModels() {
  console.log("🔍 Checking available models...");
  
  try {
    const response = await fetch(URL);
    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
    } else {
      console.log("✅ SUCCESS! Here are your available models:");
      // Filter only for models that generate content
      const models = data.models
        .filter(m => m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace("models/", "")); // Clean up the name
        
      console.log(models);
    }
  } catch (error) {
    console.error("❌ Network Error:", error.message);
  }
}

checkModels();