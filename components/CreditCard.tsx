
import React from 'react';
import { Person } from '../types';
import { UserIcon } from './Icons';

interface CreditCardProps {
    person: Person;
}

export const CreditCard: React.FC<CreditCardProps> = ({ person }) => {
    const [isImgError, setIsImgError] = React.useState(false);

    const role = person.job || person.character;
    const imageUrl = person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : null;
    
    return (
        <div className="flex-shrink-0 w-28 text-center">
            <div className="w-28 h-40 bg-gray-700 rounded-lg mb-2 overflow-hidden shadow-md">
                {imageUrl && !isImgError ? (
                    <img 
                        src={imageUrl} 
                        alt={person.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => setIsImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-brand-muted"/>
                    </div>
                )}
            </div>
            <p className="font-bold text-sm text-white truncate" title={person.name}>{person.name}</p>
            <p className="text-xs text-gray-400 truncate" title={role}>{role}</p>
        </div>
    )
}
