import React, { useState } from 'react';

const ImageGallery = ({ images = [], productName = '' }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="neu-flat aspect-square flex items-center justify-center bg-white dark:bg-slate-800">
        <div className="text-center">
          <span className="material-symbols-outlined text-8xl text-slate-400 dark:text-slate-600 mb-4">
            auto_parts
          </span>
          <p className="text-slate-500 dark:text-slate-400">No image available</p>
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="neu-flat overflow-hidden relative group">
        <div 
          className={`aspect-square cursor-zoom-in transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={selectedImage}
            alt={`${productName} - Image ${selectedImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          {isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(prev => 
                  prev === 0 ? images.length - 1 : prev - 1
                );
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <span className="material-symbols-outlined">
                chevron_left
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(prev => 
                  prev === images.length - 1 ? 0 : prev + 1
                );
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <span className="material-symbols-outlined">
                chevron_right
              </span>
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImageIndex === index
                  ? 'border-primary shadow-lg'
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <img
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;