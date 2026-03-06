import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiAnalysisResult, aiAnalysisSchema } from '../schemas/aiSchema';


const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing in .env!");
}
const genAI = new GoogleGenerativeAI(apiKey);
export const analyzeResumeWithAI = async (resumeText: string): Promise<AiAnalysisResult> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json", 
      }
    });
    const prompt = `
      You are an expert HR Recruiter and Resume Analyzer.
      Analyze the following resume text.
      Calculate a 'riskScore' between 0 and 100 representing the risk of rejection 
      (higher score = higher risk of being rejected).
      Provide an array of 3 to 5 'feedback' strings on how to improve the resume.
      
      Resume Text:
      """
      ${resumeText}
      """
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedJson = JSON.parse(responseText);
    const validatedData = aiAnalysisSchema.parse(parsedJson);
    return validatedData;

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw new Error("Failed to analyze resume with AI");
  }
};