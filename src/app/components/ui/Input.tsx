'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps {
  label?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  step?: string;
  className?: string;
  min?: string | number;
  max?: string | number;
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  min,
  max,
  onChange,
  error,
  required = false,
  disabled = false,
  helpText,
  step,
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
      <input
        name={name}
        type={type}
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-colors
          ${error ? 'border-red-500 focus:border-red-500' : 'border-stone-300 focus:border-stone-500'}
          focus:outline-none disabled:bg-stone-50 disabled:cursor-not-allowed`}
      />

      {error ? (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      ) : helpText ? (
        <p className="text-xs text-stone-500">{helpText}</p>
      ) : null}
    </div>
  );
};
