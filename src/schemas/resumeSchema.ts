import { z } from 'zod';

export const analyzeResumeSchema = z.object({
  body: z.object({
    resumeText: z.string().min(50, "Resume text is too short. Please provide more details."),
  })
});