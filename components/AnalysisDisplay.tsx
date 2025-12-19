
import React from 'react';
import { AnalysisResult } from '../types';
import { StethoscopeIcon, ClipboardListIcon, BeakerIcon, BrainIcon, HeartPulseIcon, ShieldCheckIcon } from './icons';

interface AnalysisDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

const Section: React.FC<{ title: string; content?: string; icon: React.ReactNode }> = ({ title, content, icon }) => {
  if (!content) return null;

  // Simple function to convert **bold** to <strong>bold</strong> for rich text display.
  const createMarkup = (text: string) => {
    const html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: html };
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold flex items-center mb-2 text-blue-600 dark:text-blue-400">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      <div 
        className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
        dangerouslySetInnerHTML={createMarkup(content)}
      />
    </div>
  );
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading && !result) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin border-t-blue-500"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Analyzing Data...</h2>
            <p className="text-gray-500 dark:text-gray-400">Abdulloh AI is reviewing the information. This may take a moment.</p>
        </div>
      );
    }
    
    if (error) {
       return (
        <div className="flex items-center justify-center h-full text-center p-4">
            <div className="max-w-md p-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
                <h2 className="text-xl font-bold text-red-800 dark:text-red-200">Analysis Failed</h2>
                <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
            </div>
        </div>
       );
    }

    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <StethoscopeIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Awaiting Analysis</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">
            Your clinical analysis will appear here once you send your symptoms and medical files for review.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4">
        <Section title="Patient Summary" content={result.patientSummary} icon={<ClipboardListIcon className="w-5 h-5"/>} />
        <Section title="Data Analysis" content={result.dataAnalysis} icon={<BeakerIcon className="w-5 h-5"/>} />
        <Section title="Preliminary Diagnosis" content={result.diagnosis} icon={<BrainIcon className="w-5 h-5"/>} />
        <Section title="Action Plan" content={result.actionPlan} icon={<HeartPulseIcon className="w-5 h-5"/>} />
        <Section title="Treatment Strategy" content={result.treatmentStrategy} icon={<StethoscopeIcon className="w-5 h-5"/>} />
        
        {result.safetyWarning && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded-r-lg">
                <h2 className="text-lg font-semibold flex items-center mb-1 text-yellow-800 dark:text-yellow-200">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span className="ml-2">Safety Warning</span>
                </h2>
                <p className="text-yellow-700 dark:text-yellow-300 font-medium">{result.safetyWarning}</p>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
       <header className="sticky top-0 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clinical Analysis Report</h1>
        </header>
      {renderContent()}
    </div>
  );
};

export default AnalysisDisplay;
