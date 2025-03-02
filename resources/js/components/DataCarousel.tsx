import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DataCard from './DataCard';

interface CarouselItem {
  title: string;
  value: number;
  change: number;
  changePercent: number;
}

interface DataCarouselProps {
  items: CarouselItem[];
  heading?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  decimalPlaces?: number;
}

const DataCarousel: React.FC<DataCarouselProps> = ({ 
  items, 
  heading = "Latest Data",
  valuePrefix = "",
  valueSuffix = "",
  decimalPlaces = 2
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const visibleItems = 3;
  const totalItems = items.length;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % (totalItems - visibleItems + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [totalItems, visibleItems]);
  
  const goToPrev = () => {
    setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };
  
  const goToNext = () => {
    setActiveIndex((prevIndex) => (
      prevIndex < totalItems - visibleItems ? prevIndex + 1 : prevIndex
    ));
  };

  if (!items.length) {
    return <div className="text-white">No data available</div>;
  }

  return (
    <div className="text-white p-4 rounded-lg mt-4">      
      <div className="relative">
        <div className="flex items-center">
          <button 
            onClick={goToPrev} 
            disabled={activeIndex === 0}
            className={`p-2 rounded-full ${
              activeIndex === 0 ? 'text-gray-600' : 'text-white hover:bg-gray-800'
            }`}
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex-1 overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out" 
              style={{ transform: `translateX(-${activeIndex * (100 / visibleItems)}%)` }}
            >
              {items.map((item, index) => {
                return (
                  <div key={index} className="w-1/3 flex-shrink-0 p-2">
                    <DataCard
                      title={item.title}
                      value={item.value}
                      change={item.change}
                      changePercent={item.changePercent}
                      valuePrefix={valuePrefix}
                      valueSuffix={valueSuffix}
                      decimalPlaces={decimalPlaces}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          <button 
            onClick={goToNext} 
            disabled={activeIndex >= totalItems - visibleItems}
            className={`p-2 rounded-full ${
              activeIndex >= totalItems - visibleItems 
                ? 'text-gray-600' 
                : 'text-white hover:bg-gray-800'
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalItems - visibleItems + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 w-2 mx-1 rounded-full ${
                activeIndex === index ? 'bg-white' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataCarousel;