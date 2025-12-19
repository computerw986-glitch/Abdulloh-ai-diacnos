
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, UploadedFile } from '../types';
import { PaperclipIcon, SendIcon, UserIcon, XIcon } from './icons';
import FilePreview from './FilePreview';

interface ChatInterfaceProps {
  onSendMessage: (message: string, files: UploadedFile[]) => void;
  chatHistory: ChatMessage[];
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, chatHistory, isLoading }) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles: Promise<UploadedFile>[] = Array.from(selectedFiles).map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Content = (reader.result as string).split(',')[1];
            const previewUrl = URL.createObjectURL(file);
            resolve({ name: file.name, type: file.type, content: base64Content, previewUrl });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newFiles).then(uploadedFiles => {
        setFiles(prev => [...prev, ...uploadedFiles]);
      });
    }
  };

  const handleRemoveFile = (fileName: string) => {
    const fileToRemove = files.find(f => f.name === fileName);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setFiles(prev => prev.filter(file => file.name !== fileName));
  };
  
  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '' && files.length === 0) return;
    onSendMessage(message, files);
    setMessage('');
    // Revoke object URLs after sending to prevent memory leaks
    files.forEach(file => URL.revokeObjectURL(file.previewUrl));
    setFiles([]);
  };

  const MemoizedFilePreview = React.memo(FilePreview);
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`flex items-start gap-3 ${chat.role === 'user' ? 'justify-end' : ''}`}>
            {chat.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold">A</div>
            )}
            <div className={`p-3 rounded-lg max-w-lg ${chat.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{chat.text}</p>
            </div>
             {chat.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold">A</div>
               <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
           </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {files.length > 0 && (
          <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {files.map(file => (
                <MemoizedFilePreview key={file.name} file={file} onRemove={handleRemoveFile} />
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
          <button type="button" onClick={handleTriggerUpload} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <PaperclipIcon className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message or upload a file..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || (message.trim() === '' && files.length === 0)} className="p-2 bg-blue-500 text-white rounded-full disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors">
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
