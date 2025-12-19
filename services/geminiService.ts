
import { GoogleGenAI, Part, GenerateContentResponse } from '@google/genai';
import { ChatMessage, UploadedFile, AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (file: UploadedFile): Part => {
  return {
    inlineData: {
      mimeType: file.type,
      data: file.content,
    },
  };
};

const parseAnalysis = (text: string): AnalysisResult => {
    const sections: { [key: string]: string } = {};
    const lines = text.split('\n');
    let currentSection: string | null = null;
    
    for (const line of lines) {
        if (line.startsWith('### Patient Summary')) currentSection = 'patientSummary';
        else if (line.startsWith('### Data Analysis')) currentSection = 'dataAnalysis';
        else if (line.startsWith('### Diagnosis')) currentSection = 'diagnosis';
        else if (line.startsWith('### Action Plan')) currentSection = 'actionPlan';
        else if (line.startsWith('### Treatment Strategy')) currentSection = 'treatmentStrategy';
        else if (line.startsWith('### Safety Warning')) currentSection = 'safetyWarning';
        else if (currentSection && line.trim() !== '') {
            sections[currentSection] = (sections[currentSection] || '') + line + '\n';
        }
    }

    return {
        patientSummary: sections.patientSummary?.trim(),
        dataAnalysis: sections.dataAnalysis?.trim(),
        diagnosis: sections.diagnosis?.trim(),
        actionPlan: sections.actionPlan?.trim(),
        treatmentStrategy: sections.treatmentStrategy?.trim(),
        safetyWarning: sections.safetyWarning?.trim(),
        rawText: text,
    };
};


export const generateDiagnostics = async (
  chatHistory: ChatMessage[],
  files: UploadedFile[],
  systemInstruction: string,
): Promise<AnalysisResult> => {
  try {
    const latestUserMessage = chatHistory[chatHistory.length - 1];
    const promptParts: Part[] = [{ text: latestUserMessage.text }];

    if (files && files.length > 0) {
      for (const file of files) {
        promptParts.push(fileToGenerativePart(file));
      }
    }
    
    // Constructing a simplified history for the model
    const contents = chatHistory.map(msg => {
        // We only care about the last message's files for this specific call.
        // History files would be handled differently in a more complex setup.
        if (msg.role === 'user' && msg.text === latestUserMessage.text) {
             return { role: 'user', parts: promptParts };
        }
        return { role: msg.role, parts: [{ text: msg.text }] };
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction,
      }
    });

    if (!response.text) {
      throw new Error('API returned an empty response.');
    }
    
    return parseAnalysis(response.text);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the AI.');
  }
};
