import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { analyzeResumeWithAI } from '../services/aiService';
import ResumeAnalysis from '../models/ResumeAnalysis';

export const analyzeResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const { resumeText } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const aiResult = await analyzeResumeWithAI(resumeText);
    const newAnalysis = new ResumeAnalysis({
      userId,
      resumeText,
      riskScore: aiResult.riskScore,
      feedback: aiResult.feedback,
    });
    await newAnalysis.save();
    res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      data: newAnalysis,
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ success: false, message: "Server Error during analysis" });
  }
};

export const getPremiumTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    
    res.status(200).json({
      success: true,
      message: "Welcome to the VIP Lounge!",
      data:[
        { id: 1, name: "Harvard Executive Template", type: "Tech" },
        { id: 2, name: "Silicon Valley Startup Template", type: "Creative" },
      ]
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getResumeHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const history = await ResumeAnalysis.find({ userId }).sort({ createdAt: 'asc' });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("History Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server Error fetching history" });
  }
};