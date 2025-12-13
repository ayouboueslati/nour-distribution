// frontend/src/components/ui/Textarea.tsx
'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface TextareaProps {
  label?: string;
  name?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  rows = 4,
  required = false,
  error,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-stone-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-colors resize-y
          ${error ? 'border-red-500 focus:border-red-500' : 'border-stone-300 focus:border-stone-500'}
          focus:outline-none disabled:bg-stone-50 disabled:cursor-not-allowed`}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};