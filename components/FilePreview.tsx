
import React from 'react';
import { UploadedFile } from '../types';
import { XIcon, FileIcon } from './icons';

interface FilePreviewProps {
  file: UploadedFile;
  onRemove: (fileName: string) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  return (
    <div className="relative group w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex items-center justify-center">
      {file.type.startsWith('image/') ? (
        <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
      ) : (
        <div className="text-center p-1">
          <FileIcon className="w-8 h-8 mx-auto text-gray-500 dark:text-gray-400" />
          <p className="text-xs truncate text-gray-600 dark:text-gray-300">{file.name}</p>
        </div>
      )}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-colors flex items-center justify-center">
        <button 
          onClick={() => onRemove(file.name)} 
          className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Remove ${file.name}`}
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FilePreview;
