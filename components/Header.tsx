
import React from 'react';
import { Bars3Icon, SearchIcon } from './Icons';
import { SearchBar } from './SearchBar';
import { Movie } from '../types';

import { supabase } from '../supabase';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Movie[];
  isSearching: boolean;
  onResultClick: (movie: Movie) => void;
  onClear: () => void;
  onToggleMenu: () => void;
  onProfileClick: () => void;
  session: any;
  onAuthClick: () => void;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-brand-background/95 backdrop-blur-md">
      <div className="container mx-auto px-3 md:px-4 h-16 flex items-center justify-between gap-3">
        {/* Mobile Menu Icon */}
        <button 
          onClick={props.onToggleMenu}
          className="lg:hidden p-2 text-brand-accent hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Abrir filtros"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Logo - Hidden on tiny mobile to save space for search */}
        <div 
          className="hidden sm:flex items-center group cursor-pointer" 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        >
            <h1 className="text-lg md:text-xl font-black tracking-tighter text-white uppercase">
            GROSEL<span className="text-brand-accent italic">HINHAS</span>
            </h1>
        </div>

        {/* Search Bar - Responsive */}
        <div className="flex-1 max-w-xl">
            <SearchBar {...props} />
        </div>

        {/* Auth Button */}
        <div className="flex items-center gap-3">
          {props.session?.user ? (() => {
            const user = props.session.user;
            const avatarUrl = user.user_metadata?.avatar_url;
            const email = user.email;
            return (
              <div 
                className="flex items-center gap-2 cursor-pointer p-1.5 pr-4 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brand-accent/50 transition-all select-none"
                onClick={props.onProfileClick}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-brand-accent object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-accent/20 flex items-center justify-center border border-brand-accent text-brand-accent font-black text-xs">
                     {email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-[10px] sm:text-xs text-white font-bold tracking-wider uppercase">
                  Meu Perfil
                </span>
              </div>
            );
          })() : (
            <button
              onClick={props.onAuthClick}
              className="px-4 py-2 rounded-full bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-brand-background text-xs font-bold uppercase tracking-wider transition-all"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
