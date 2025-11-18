'use client';

import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-stone-50 border-b border-stone-200">
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-stone-100">
    {children}
  </tbody>
);

export const TableRow: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string 
}> = ({ children, onClick, className = '' }) => (
  <tr 
    onClick={onClick}
    className={`transition-colors ${onClick ? 'cursor-pointer hover:bg-stone-50' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <th className={`px-4 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <td className={`px-4 py-4 text-sm text-stone-700 ${className}`}>
    {children}
  </td>
);