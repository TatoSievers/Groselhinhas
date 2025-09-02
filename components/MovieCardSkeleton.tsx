import React from 'react';

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-surface rounded-lg shadow-lg overflow-hidden animate-pulse">
      <div className="w-full h-96 bg-gray-700"></div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-brand-accent/30">
          <div className="w-1/3">
            <div className="h-8 bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4 mt-2"></div>
          </div>
          <div className="flex flex-wrap justify-center items-start gap-x-4 gap-y-3 pl-2 flex-1">
            <div className="w-20 h-12 bg-gray-700 rounded"></div>
            <div className="w-20 h-12 bg-gray-700 rounded"></div>
            <div className="w-20 h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-700 rounded-full w-20"></div>
          <div className="h-6 bg-gray-700 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
};