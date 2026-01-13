import React from 'react';
import { Bars3Icon } from './Icons';
import { SearchBar } from './SearchBar';
import { Movie } from '../types';
import { useAuth } from '../contexts/AuthContext';

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
  const { user, signInWithGoogle, logout } = useAuth();

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

        {/* Logo */}
        <div
          className="hidden sm:flex items-center group cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <h1 className="text-xl font-black tracking-tighter text-white">
            GROSEL<span className="text-brand-accent italic">HINHAS</span>
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <SearchBar {...props} />
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-white/5 pr-4 pl-1 py-1 rounded-full border border-white/5">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-accent text-black flex items-center justify-center font-bold">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <button
                onClick={logout}
                className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors"
                title="Sair"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wide hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
