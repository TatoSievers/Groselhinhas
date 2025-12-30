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
    <header className="glass-pane sticky top-0 z-40 border-b border-white/5">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
        <div className="flex items-center group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="bg-brand-accent p-1.5 rounded-lg shadow-lg shadow-amber-500/20 mr-3 group-hover:scale-110 transition-transform">
              <FilmIcon className="w-6 h-6 text-brand-background"/>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
            GROSEL<span className="text-brand-accent italic">HINHAS</span>
            </h1>
        </div>
        <div className="flex-1 max-w-xl">
            <SearchBar {...props} />
        </div>
      </div>
    </header>
  );
};