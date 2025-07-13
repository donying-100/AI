'use client';

import { useState, useRef, useEffect } from 'react';

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getColor = (intensity: number) => {
    if (intensity <= 3) return 'bg-green-400';
    if (intensity <= 5) return 'bg-yellow-400';
    if (intensity <= 7) return 'bg-orange-400';
    if (intensity <= 9) return 'bg-red-400';
    return 'bg-red-600';
  };

  const getEmoji = (intensity: number) => {
    if (intensity <= 2) return '😊';
    if (intensity <= 4) return '🙂';
    if (intensity <= 6) return '😐';
    if (intensity <= 8) return '😠';
    return '🤬';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateValue(e.touches[0].clientX);
  };

  const updateValue = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = Math.round(percentage * 9) + 1; // 1-10
    onChange(newValue);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        updateValue(e.touches[0].clientX);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const percentage = ((value - 1) / 9) * 100;

  return (
    <div className="w-full">
      {/* 滑块轨道 */}
      <div
        ref={sliderRef}
        className="relative h-8 bg-gray-200 rounded-full cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* 进度条 */}
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-200 ${getColor(value)}`}
          style={{ width: `${percentage}%` }}
        />
        
        {/* 滑块手柄 */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 transition-all duration-200 cursor-grab active:cursor-grabbing ${
            isDragging ? 'scale-110' : 'hover:scale-105'
          } ${getColor(value).replace('bg-', 'border-')}`}
          style={{ left: `calc(${percentage}% - 16px)` }}
        >
          <div className="flex items-center justify-center w-full h-full text-xs">
            {getEmoji(value)}
          </div>
        </div>
      </div>

      {/* 刻度标记 */}
      <div className="flex justify-between mt-2 px-1">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i + 1}
            className={`text-xs transition-colors ${
              value === i + 1 ? 'text-green-600 font-bold' : 'text-gray-400'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* 当前值显示 */}
      <div className="text-center mt-2">
        <span className="text-2xl">{getEmoji(value)}</span>
        <span className="ml-2 text-sm text-gray-600">
          {value}/10
        </span>
      </div>
    </div>
  );
}