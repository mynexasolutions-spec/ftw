import React from 'react'

export default function Loader({ size = 'medium', className = '' }) {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  }

  const logoSizes = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  const ringBorders = {
    small: 'border-2',
    medium: 'border-[3px]',
    large: 'border-4'
  }

  const selectedSize = sizeClasses[size] || sizeClasses.medium
  const selectedLogoSize = logoSizes[size] || logoSizes.medium
  const selectedRingBorder = ringBorders[size] || ringBorders.medium

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${selectedSize} flex items-center justify-center`}>
        {/* Spinning Outer Ring */}
        <div className={`absolute inset-0 ${selectedRingBorder} border-purple-500/10 border-t-purple-600 rounded-full animate-spin`} />
        
        {/* Pulsing FTW Logo in center */}
        <div className={`relative z-10 ${selectedLogoSize} rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm p-0.5 animate-pulse`}>
          <img 
            src="/images/ftw-logo.webp" 
            alt="FTW" 
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback text if logo image is missing
              e.target.style.display = 'none';
              const textNode = document.createElement('span');
              textNode.className = 'text-[8px] font-black text-purple-600 font-mono';
              textNode.innerText = 'FTW';
              e.target.parentNode.appendChild(textNode);
            }}
          />
        </div>
      </div>
    </div>
  )
}
