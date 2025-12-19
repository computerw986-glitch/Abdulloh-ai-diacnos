
export interface UploadedFile {
  name: string;
  type: string;
  content: string; // base64 encoded content
  previewUrl: string; // For image previews using object URL
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  files?: UploadedFile[];
}

export interface AnalysisResult {
  patientSummary?: string;
  dataAnalysis?: string;

  diagnosis?: string;
  actionPlan?: string;
  treatmentStrategy?: string;
  safetyWarning?: string;
  rawText: string;
}
