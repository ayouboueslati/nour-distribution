import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'default' 
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div className={`bg-white border border-stone-200 rounded-xl ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
};