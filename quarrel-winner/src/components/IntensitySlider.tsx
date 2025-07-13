'use client'

interface IntensitySliderProps {
  value: number
  onChange: (value: number) => void
}

export default function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const getIntensityLabel = (val: number) => {
    if (val <= 2) return '温和'
    if (val <= 4) return '普通'
    if (val <= 6) return '强烈'
    if (val <= 8) return '激烈'
    return '核弹级'
  }

  const getIntensityColor = (val: number) => {
    if (val <= 2) return 'text-green-600'
    if (val <= 4) return 'text-blue-600'
    if (val <= 6) return 'text-yellow-600'
    if (val <= 8) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        语气强烈程度: <span className={`font-bold ${getIntensityColor(value)}`}>
          {value} - {getIntensityLabel(value)}
        </span>
      </label>
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, 
              #07c160 0%, 
              #07c160 ${(value - 1) * 11.11}%, 
              #ff6b6b ${(value - 1) * 11.11}%, 
              #ff6b6b 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>😊 温和</span>
          <span>💥 核弹级</span>
        </div>
      </div>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #07c160;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #07c160;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}