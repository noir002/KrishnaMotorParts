import React from 'react';

const ProductSpecifications = ({ specifications = {}, compatibility = [] }) => {
  const hasSpecifications = specifications && Object.keys(specifications).length > 0;
  const hasCompatibility = compatibility && compatibility.length > 0;

  if (!hasSpecifications && !hasCompatibility) {
    return (
      <div className="neu-flat p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-600 mb-2">
          info
        </span>
        <p className="text-slate-500 dark:text-slate-400">
          No specifications available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Technical Specifications */}
      {hasSpecifications && (
        <div className="neu-flat p-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">
              engineering
            </span>
            Technical Specifications
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                <span className="text-slate-600 dark:text-slate-300 font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                </span>
                <span className="text-slate-800 dark:text-white font-semibold">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle Compatibility */}
      {hasCompatibility && (
        <div className="neu-flat p-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">
              directions_car
            </span>
            Vehicle Compatibility
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {compatibility.map((vehicle, index) => (
              <div key={index} className="neu-pressed p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary">
                    directions_car
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {vehicle.make}
                  </span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <div>
                    <span className="font-medium">Model:</span> {vehicle.model}
                  </div>
                  {vehicle.year && (
                    <div>
                      <span className="font-medium">Year:</span> {vehicle.year}
                    </div>
                  )}
                  {vehicle.variant && (
                    <div>
                      <span className="font-medium">Variant:</span> {vehicle.variant}
                    </div>
                  )}
                  {vehicle.engine && (
                    <div>
                      <span className="font-medium">Engine:</span> {vehicle.engine}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSpecifications;