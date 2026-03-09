import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { Task } from "../types";

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export async function generateTaskContent(task: Task, inputs: Record<string, string>) {
  const model = "gemini-3-flash-preview";
  
  let prompt = `Rol: ${task.role}\nInstrucción: ${task.instruction}\n\nReglas:\n${task.rules.map(r => `- ${r}`).join("\n")}\n\n`;
  
  Object.entries(inputs).forEach(([key, value]) => {
    const field = task.fields.find(f => f.name === key);
    if (field) {
      prompt += `${field.label}: ${value}\n`;
    }
  });

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });

    const text = response.text;
    
    // Track usage in background
    fetch("/api/track-usage", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: task.title })
    }).catch(console.error);

    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
