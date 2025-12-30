
import React from 'react';
import { Bars3Icon, SearchIcon } from './Icons';
import { SearchBar } from './SearchBar';
import { Movie } from '../types';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Movie[];
  isSearching: boolean;
  onResultClick: (movie: Movie) => void;
  onClear: () => void;
  onToggleMenu: () => void;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <header className="glass-pane sticky top-0 z-40 border-b border-white/5 bg-brand-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu Icon */}
        <button 
          onClick={props.onToggleMenu}
          className="lg:hidden p-2 text-brand-accent hover:bg-white/5 rounded-xl transition-colors"
          aria-label="Abrir filtros"
        >
          <Bars3Icon className="w-7 h-7" />
        </button>

        {/* Logo - Hidden on tiny mobile to save space for search */}
        <div 
          className="hidden sm:flex items-center group cursor-pointer" 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        >
            <h1 className="text-xl font-black tracking-tighter text-white">
            GROSEL<span className="text-brand-accent italic">HINHAS</span>
            </h1>
        </div>

        {/* Search Bar - Responsive */}
        <div className="flex-1 max-w-xl">
            <SearchBar {...props} />
        </div>
      </div>
    </header>
  );
};
