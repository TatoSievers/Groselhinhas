
import React, { useRef, useEffect } from 'react';
import { Movie } from '../types';
import { FilmIcon, SearchIcon, SpinnerIcon, XMarkIcon } from './Icons';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Movie[];
  isSearching: boolean;
  onResultClick: (movie: Movie) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  searchResults,
  isSearching,
  onResultClick,
  onClear,
}) => {
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelectResult = (movie: Movie) => {
    onResultClick(movie);
    setIsFocused(false);
    onClear();
  };


  return (
    <div className="relative" ref={searchContainerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar filmes e séries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full bg-gray-900/70 border border-gray-700 text-white rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-colors"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isSearching ? <SpinnerIcon className="w-5 h-5 text-gray-400"/>
              : searchTerm && (
                <button onClick={onClear} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="w-5 h-5"/>
                </button>
            )}
        </div>
      </div>
      {isFocused && searchTerm && (
        <div className="absolute top-full mt-2 w-full bg-brand-surface rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto scrollbar-thin">
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map((movie) => (
                <li
                  key={movie.id}
                  onClick={() => handleSelectResult(movie)}
                  className="px-4 py-3 flex items-center gap-4 cursor-pointer hover:bg-brand-accent/20 transition-colors"
                >
                    {movie.posterUrl ?
                        <img src={movie.posterUrl} alt={movie.title} className="w-12 h-18 object-cover rounded-md flex-shrink-0" referrerPolicy="no-referrer"/>
                        : <div className="w-12 h-18 bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0"><FilmIcon className="w-6 h-6 text-brand-muted"/></div>
                    }
                  
                  <div>
                    <p className="font-bold text-white">{movie.title}</p>
                    <p className="text-sm text-gray-400">{movie.year} &middot; {movie.type}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : !isSearching && (
            <div className="p-4 text-center text-gray-400">
              Nenhum resultado encontrado para "{searchTerm}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
