
import React from 'react';
import { FilmIcon } from './Icons';
import { SearchBar } from './SearchBar';
import { Movie } from '../types';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Movie[];
  isSearching: boolean;
  onResultClick: (movie: Movie) => void;
  onClear: () => void;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <header className="bg-brand-surface/80 backdrop-blur-sm sticky top-0 z-30 shadow-lg shadow-black/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center">
            <FilmIcon className="w-8 h-8 text-brand-accent mr-3"/>
            <h1 className="text-3xl font-bold tracking-wider text-white hidden sm:block">
            Grosel<span className="text-brand-accent">hinhas</span>
            </h1>
        </div>
        <div className="flex-1 max-w-lg">
            <SearchBar {...props} />
        </div>
      </div>
    </header>
  );
};
