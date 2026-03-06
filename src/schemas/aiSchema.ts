import { z } from 'zod';

export const aiAnalysisSchema = z.object({
  riskScore: z.number().min(0).max(100), 
  feedback: z.array(z.string()),         
});

export type AiAnalysisResult = z.infer<typeof aiAnalysisSchema>;