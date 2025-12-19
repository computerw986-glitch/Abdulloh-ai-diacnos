
import React, { useState, useCallback } from 'react';
import { ChatMessage, UploadedFile, AnalysisResult } from './types';
import { generateDiagnostics } from './services/geminiService';
import { SYSTEM_INSTRUCTION } from './constants';
import ChatInterface from './components/ChatInterface';
import AnalysisDisplay from './components/AnalysisDisplay';
import { AbdullohAiIcon } from './components/icons';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Assalomu alaykum! Men Abdulloh AI, sizning shaxsiy tibbiy yordamchingizman. Sog'lig'ingiz haqida qayg'uryapsizmi? Iltimos, belgilaringizni tasvirlab bering va mavjud bo'lsa, tibbiy hujjatlaringizni yuklang.",
    },
  ]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = useCallback(async (message: string, files: UploadedFile[]) => {
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { role: 'user', text: message, files };
    const newChatHistory = [...chatHistory, userMessage];
    setChatHistory(newChatHistory);

    try {
      // We only pass the relevant history to the API, not the initial greeting
      const historyForApi = newChatHistory.slice(1);
      
      const result = await generateDiagnostics(historyForApi, files, SYSTEM_INSTRUCTION);
      
      const modelResponse: ChatMessage = { role: 'model', text: result.rawText };
      setChatHistory(prev => [...prev, modelResponse]);
      setAnalysisResult(result);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Error: ${errorMessage}. Please check your API key and network connection.`);
      const errorResponse: ChatMessage = { role: 'model', text: `Kechirasiz, xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring. (Error: ${errorMessage})` };
      setChatHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [chatHistory]);

  return (
    <div className="flex h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <main className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Left Side: Chat Interface */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <AbdullohAiIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Abdulloh AI</h1>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </header>
          <ChatInterface onSendMessage={handleSendMessage} chatHistory={chatHistory} isLoading={isLoading} />
        </div>

        {/* Right Side: Analysis Display */}
        <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col h-full">
          <AnalysisDisplay result={analysisResult} isLoading={isLoading} error={error} />
        </div>
      </main>
    </div>
  );
};

export default App;
