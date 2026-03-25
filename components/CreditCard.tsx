
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
    
    // Safely check for an imdb_id or imdbId property, fallback to search query
    const imdbId = (person as any).imdb_id || (person as any).imdbId;
    const imdbLink = imdbId 
        ? `https://www.imdb.com/name/${imdbId}/` 
        : `https://www.imdb.com/find?q=${encodeURIComponent(person.name)}&s=nm`;
    
    return (
        <a 
            href={imdbLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-shrink-0 w-20 md:w-28 text-center group block"
            title={person.name}
        >
            <div className="w-20 h-28 md:w-28 md:h-40 bg-gray-700 rounded-lg mb-2 overflow-hidden shadow-md transition-transform group-hover:scale-105 border border-transparent group-hover:border-brand-accent/50">
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
                        <UserIcon className="w-8 h-8 md:w-12 md:h-12 text-brand-muted"/>
                    </div>
                )}
            </div>
            <span 
                className="font-bold text-[10px] md:text-sm text-white truncate group-hover:text-brand-accent transition-colors block leading-tight" 
            >
                {person.name}
            </span>
            <p className="text-[9px] md:text-xs text-gray-400 truncate mt-0.5 leading-tight" title={role}>{role}</p>
        </a>
    )
}
