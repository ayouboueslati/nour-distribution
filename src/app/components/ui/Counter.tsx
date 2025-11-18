'use client';

import React, { useState, useEffect } from 'react';

interface SimpleCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const SimpleCounter = ({ end, duration = 2000, suffix = '' }: SimpleCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

export default SimpleCounter;