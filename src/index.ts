import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import prisma from './config/db';
import connectMongo from './config/mongoDb';
import ResumeAnalysis from './models/ResumeAnalysis';
import authRoutes from './routes/authRoutes';
import resumeRoutes from './routes/resumeRoutes';
import paymentRoutes from './routes/paymentRoutes';
import { analyzeResumeWithAI } from './services/aiService';
dotenv.config();

const app: Application = express();

const port: number | string = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
connectMongo();

app.get('/', (req: Request, res: Response) => {
  
  res.send({
    success: true,
    message: "AI Resume Analyzer API is running!",
  });
});


app.use('/api/auth', authRoutes); 
app.use('/api/resume', resumeRoutes);
app.use('/api/payment', paymentRoutes);

app.post('/test-ai', async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body;
    
    if (!resumeText) {
      res.status(400).json({ success: false, message: "Please provide resumeText" });
      return;
    }

    console.log("Sending to Gemini AI...");
    const aiResult = await analyzeResumeWithAI(resumeText);
    res.status(200).json({
      success: true,
      data: aiResult
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "AI Test Failed" });
  }
});

app.post('/test-user', async (req: Request, res: Response) => {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: `test${Date.now()}@example.com`, 
        password: "hashed_password_placeholder", 
      }
    });
    res.status(201).json({
      success: true,
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Database error" });
  }
});

app.post('/test-dual-db', async (req: Request, res: Response) => {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: `hybrid${Date.now()}@example.com`,
        password: "secure_password",
      }
    });
    const newAnalysis = new ResumeAnalysis({
      userId: newUser.id, 
      resumeText: "Experienced React developer looking for a job...",
      riskScore: 42,
      feedback:["Add more TypeScript experience", "Include formatting"]
    });

    await newAnalysis.save();
    res.status(201).json({
      success: true,
      message: "Data saved in BOTH Postgres and MongoDB!",
      postgresData: newUser,
      mongoData: newAnalysis
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Dual-Database error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running strictly on http://localhost:${port}`);
});