import mongoose, { Schema, Document } from 'mongoose';
export interface IResumeAnalysis extends Document {
  userId: string;       
  resumeText: string;   
  riskScore: number;    
  feedback: string[];   
  createdAt: Date;
}
const ResumeAnalysisSchema: Schema = new Schema(
  {
    userId: { 
      type: String, 
      required: true 
    },
    resumeText: { 
      type: String, 
      required: true 
    },
    riskScore: { 
      type: Number, 
      required: true 
    },
    feedback: { 
      type: [String], 
      default:[] 
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model<IResumeAnalysis>('ResumeAnalysis', ResumeAnalysisSchema);