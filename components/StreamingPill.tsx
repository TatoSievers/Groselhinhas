
import React from 'react';

interface StreamingPillProps {
  service: string;
}

export const StreamingPill: React.FC<StreamingPillProps> = ({ service }) => {
  return (
    <div 
      className="bg-gray-700/50 text-gray-300 text-xs font-bold px-3 py-1 rounded-full"
      title={`Disponível no ${service}`}
    >
      {service}
    </div>
  );
};