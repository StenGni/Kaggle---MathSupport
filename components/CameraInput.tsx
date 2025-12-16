
import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface CameraInputProps {
  onFileSelect: (files: FileList) => void;
  multiple?: boolean;
  label?: string;
  compact?: boolean;
  minimal?: boolean;
}

const CameraInput: React.FC<CameraInputProps> = ({ onFileSelect, multiple = false, label = "Take Photo", compact = false, minimal = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default button behavior
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  if (compact) {
    return (
      <div className="inline-block">
        <input
          type="file"
          accept="image/*"
          // Removed capture="environment" to allow User to choose between Camera and Gallery
          multiple={multiple}
          className="hidden"
          ref={inputRef}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={handleClick}
          className="p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors active:scale-95 flex items-center justify-center"
          aria-label="Add photo"
        >
          <Camera size={24} />
        </button>
      </div>
    );
  }

  if (minimal) {
    return (
      <div className="w-full">
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          ref={inputRef}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={handleClick}
          className="w-full flex flex-col items-center justify-center py-16 rounded-3xl border-2 border-dashed border-emerald-900/20 bg-emerald-900/5 hover:bg-emerald-900/10 transition-all active:scale-[0.99] group text-emerald-900"
        >
          <span className="font-bold text-2xl">{label}</span>
          <span className="text-base opacity-60 mt-2 font-medium">{multiple ? 'Upload pages' : 'Tap to start'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        // Removed capture="environment" to allow User to choose between Camera and Gallery
        multiple={multiple}
        className="hidden"
        ref={inputRef}
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-300 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors active:scale-95 group"
      >
        <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
            <Camera className="text-emerald-600 w-8 h-8" />
        </div>
        <span className="font-semibold text-emerald-900">{label}</span>
        <span className="text-sm text-emerald-600 mt-1">{multiple ? 'Upload one or more photos' : 'Tap to capture math problem'}</span>
      </button>
    </div>
  );
};

export default CameraInput;
