import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface DropzoneProps {
  onImageSelect: (file: File) => void;
}

export function Dropzone({ onImageSelect }: DropzoneProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          onImageSelect(file);
        }
      }
    },
    [onImageSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onImageSelect(files[0]);
      }
    },
    [onImageSelect]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-2 border-dashed border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-white/40 transition-colors cursor-pointer bg-white/5 backdrop-blur-sm group"
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        type="file"
        id="file-input"
        className="hidden"
        accept="image/*"
        onChange={handleFileInput}
      />
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
        <Upload className="w-8 h-8 text-white/80" />
      </div>
      <h3 className="text-xl font-medium text-white mb-2">Upload an image</h3>
      <p className="text-white/50 text-sm max-w-xs">
        Drag and drop or click to select an image to extend into a wallpaper
      </p>
    </div>
  );
}
