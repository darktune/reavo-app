import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

function getGenAI() {
  if (!genAI) {
    const key = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Missing Gemini API Key");
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

export const aiProvider = {
  // Now accepts an array of model names for MeshLLM-style fallback routing
  async generateResponse(modelNames, systemPrompt, userPrompt, maxTokens) {
    const ai = getGenAI();
    
    // Ensure backwards compatibility if a single string is passed
    const models = Array.isArray(modelNames) ? modelNames : [modelNames];

    for (let i = 0; i < models.length; i++) {
      const currentModelName = models[i];
      console.log(`[AI Routing] Attempting mesh node: ${currentModelName}`);
      
      const model = ai.getGenerativeModel({
        model: currentModelName,
        systemInstruction: systemPrompt,
        generationConfig: {
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
        }
      });

      try {
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        let text = response.text();
        
        // Gemini might return markdown JSON block, clean it up
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        console.log(`[AI Routing] Node ${currentModelName} succeeded.`);
        return JSON.parse(text);
        
      } catch (error) {
        console.error(`[AI Routing Error] Node ${currentModelName} failed:`, error.message);
        // If there are more models in the mesh, the loop continues to the next one
        if (i < models.length - 1) {
          console.log(`[AI Routing] Rerouting to fallback node: ${models[i+1]}...`);
        }
      }
    }

    // If ALL models in the mesh failed, return the fallback UI message
    console.error("[AI Routing Critical] All nodes in the mesh failed.");
    return { 
      intent: "ERROR", 
      message: "I am having trouble connecting to my brain right now. Please try again.",
      products: [],
      actions: []
    };
  }
};
