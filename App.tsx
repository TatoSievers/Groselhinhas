
import React from 'react';
import { useGroselhinhas } from './hooks/useGroselhinhas';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { MovieCard } from './components/MovieCard';
import { Trending } from './components/Trending';
import { FilmIcon, ViewfinderCircleIcon, EyeIcon, ExclamationTriangleIcon, ChevronLeftIcon, ChevronRightIcon, SlidersHorizontalIcon, XMarkIcon, ArrowPathIcon, NoSymbolIcon, BookmarkIcon } from './components/Icons';
import { MovieCardSkeleton } from './components/MovieCardSkeleton';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';
import { ChatAssistant } from './components/ChatAssistant';
import { Movie } from './types';
import { supabase } from './supabase';

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  
  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
    window.scrollTo(0, 0);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPages = Math.floor(maxPagesToShow / 2);
    
    let startPage = Math.max(1, currentPage - halfPages);
    let endPage = Math.min(totalPages, currentPage + halfPages);

    if (currentPage - halfPages < 1) {
      endPage = Math.min(totalPages, maxPagesToShow);
    }
    if (currentPage + halfPages > totalPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    if (startPage > 1) {
        pageNumbers.push(<button key={1} onClick={() => handlePageClick(1)} className="px-4 py-2 mx-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">1</button>);
        if (startPage > 2) {
            pageNumbers.push(<span key="start-ellipsis" className="px-4 py-2 mx-1 text-gray-400">...</span>);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`px-4 py-2 mx-1 rounded-md transition-colors ${
            i === currentPage ? 'bg-brand-accent text-white font-bold' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }

     if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
             pageNumbers.push(<span key="end-ellipsis" className="px-4 py-2 mx-1 text-gray-400">...</span>);
        }
        pageNumbers.push(<button key={totalPages} onClick={() => handlePageClick(totalPages)} className="px-4 py-2 mx-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">{totalPages}</button>);
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center py-6 text-white">
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-4 py-2 mx-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5 mr-1" />
        Anterior
      </button>
      <div className="hidden md:flex">{renderPageNumbers()}</div>
       <div className="flex md:hidden">
         <span className="px-4 py-2 mx-1 text-gray-400">{`Página ${currentPage} de ${totalPages}`}</span>
      </div>
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-4 py-2 mx-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Próxima
        <ChevronRightIcon className="w-5 h-5 ml-1" />
      </button>
    </div>
  );
};


const App: React.FC = () => {
  const {
    filteredAndSortedMovies,
    toggleServiceFilter,
    watchlist,
    toggleWatchlist,
    watchedList,
    toggleWatched,
    isWatchlistMode,
    setIsWatchlistMode,
    isWatchedMode,
    setIsWatchedMode,
    typeFilter,
    setTypeFilter,
    trendingMovies,
    isLoading,
    error,
    selectedMovie,
    setSelectedMovie,
    isFetchingDetails,
    genres,
    activeGenre,
    toggleGenreFilter,
    clearGenreFilter,
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    clearSearch,
    searchMovieByTitle,
    currentPage,
    totalPages,
    setCurrentPage,
    minRating,
    setMinRating,
    toggleNotInterested,
    notInterestedList,
    isNotInterestedMode,
    setIsNotInterestedMode,
    majorProviders,
    otherProviders,
    showAllProviders,
    setShowAllProviders,
    isServiceActive,
    session,
  } = useGroselhinhas();

  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [showSaveFavoritesPopup, setShowSaveFavoritesPopup] = React.useState(false);
  const [newVersionAvailable, setNewVersionAvailable] = React.useState<string | null>(null);
  const [movieToShare, setMovieToShare] = React.useState<Movie | null>(null);

  const prevListSizes = React.useRef({ watchlist: 0, watched: 0, notInterested: 0 });

  React.useEffect(() => {
    if (!session?.user) {
      const addedToWatchlist = watchlist.size > prevListSizes.current.watchlist;
      const addedToWatched = watchedList.size > prevListSizes.current.watched;
      const addedToNotInterested = notInterestedList.size > prevListSizes.current.notInterested;

      if (addedToWatchlist || addedToWatched || addedToNotInterested) {
        setShowSaveFavoritesPopup(true);
      }
    }
    prevListSizes.current = {
      watchlist: watchlist.size,
      watched: watchedList.size,
      notInterested: notInterestedList.size,
    };
  }, [watchlist.size, watchedList.size, notInterestedList.size, session?.user]);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (window.location.pathname === '/auth/callback') {
    React.useEffect(() => {
      const checkSession = async () => {
        const { data } = await supabase.auth.getSession();

        // Popup flow: signal the opener and close this window
        if (data.session && window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
          window.close();
          return;
        }

        // Direct redirect flow: wait for sign-in and navigate home
        if (!window.opener) {
          if (data.session) {
            window.location.replace('/');
            return;
          }
          supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
              window.location.replace('/');
            }
          });
          return;
        }

        // Popup flow without a session yet: wait for it
        supabase.auth.onAuthStateChange((event) => {
          if (event === 'SIGNED_IN') {
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.replace('/');
            }
          }
        });
      };
      checkSession();
    }, []);

    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold tracking-widest uppercase text-sm">Autenticando...</p>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    const initialVersionMeta = document.querySelector('meta[name="app-version"]');
    const initialVersion = initialVersionMeta ? initialVersionMeta.getAttribute('content') : null;

    if (!initialVersion) return;

    const checkForUpdates = async () => {
      try {
        const response = await fetch('/index.html', {
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache', 'Expires': '0' },
        });
        const text = await response.text();
        const match = text.match(/<meta name="app-version" content="([^"]+)"/);
        const latestVersion = match ? match[1] : null;

        if (latestVersion && latestVersion !== initialVersion) {
          setNewVersionAvailable(latestVersion);
          clearInterval(intervalId);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      } catch (error) {
        console.error('Failed to check for new version:', error);
      }
    };

    const intervalId = setInterval(checkForUpdates, 1000 * 60 * 5); // Check every 5 minutes

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  React.useEffect(() => {
    if (selectedMovie || movieToShare || isFilterPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedMovie, movieToShare, isFilterPanelOpen]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center bg-brand-surface rounded-3xl p-8">
            <ExclamationTriangleIcon className="w-20 h-20 text-red-500 mb-4"/>
            <h2 className="text-xl font-bold text-white">Ops! Erro de conexão</h2>
            <p className="text-gray-400 mt-2 max-w-md text-sm">{error}</p>
        </div>
      );
    }
    
    if (filteredAndSortedMovies.length > 0) {
      return (
        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-6">
          {filteredAndSortedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => setSelectedMovie(movie)}
              onToggleWatchlist={() => toggleWatchlist(movie.id)}
              isInWatchlist={watchlist.has(movie.id)}
              onToggleWatched={() => toggleWatched(movie.id)}
              isInWatchedList={watchedList.has(movie.id)}
              onToggleNotInterested={() => toggleNotInterested(movie.id)}
              isNotInterested={notInterestedList.has(movie.id)}
              onShareClick={() => setMovieToShare(movie)}
            />
          ))}
        </div>
      );
    }

    // Empty states
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center bg-brand-surface/30 border border-white/5 rounded-3xl p-8">
        {isNotInterestedMode ? (
           <>
            <NoSymbolIcon className="w-20 h-20 text-brand-muted mb-4"/>
            <h2 className="text-xl font-bold text-white">Nada descartado</h2>
            <p className="text-gray-400 mt-2 max-w-md text-sm">
                Filmes que você marcar como "não interessa" ficarão aqui.
            </p>
          </>
        ) : isWatchlistMode ? (
          <>
            <BookmarkIcon className="w-20 h-20 text-brand-muted mb-4"/>
            <h2 className="text-xl font-bold text-white">Sua lista está vazia</h2>
            <p className="text-gray-400 mt-2 max-w-md text-sm">
              Salve filmes e séries para assistir mais tarde clicando no ícone de marcador.
            </p>
          </>
        ) : isWatchedMode ? (
           <>
            <EyeIcon className="w-20 h-20 text-brand-muted mb-4"/>
            <h2 className="text-xl font-bold text-white">Nenhum assistido</h2>
            <p className="text-gray-400 mt-2 max-w-md text-sm">
              Marque o que você já viu para organizar sua biblioteca.
            </p>
          </>
        ) : (
          <>
            <FilmIcon className="w-20 h-20 text-brand-muted mb-4"/>
            <h2 className="text-xl font-bold text-white">Nenhum resultado</h2>
            <p className="text-gray-400 mt-2 max-w-md text-sm">
              Tente mudar os filtros ou streamings.
            </p>
          </>
        )}
      </div>
    );
  };

  const filterPanelProps = {
      onToggleService: toggleServiceFilter,
      isServiceActive: isServiceActive,
      isWatchlistMode,
      onToggleWatchlistMode: () => { setIsWatchlistMode(!isWatchlistMode); setIsFilterPanelOpen(false); },
      watchlistCount: watchlist.size,
      isWatchedMode,
      onToggleWatchedMode: () => { setIsWatchedMode(!isWatchedMode); setIsFilterPanelOpen(false); },
      watchedCount: watchedList.size,
      isNotInterestedMode,
      onToggleNotInterestedMode: () => { setIsNotInterestedMode(!isNotInterestedMode); setIsFilterPanelOpen(false); },
      notInterestedCount: notInterestedList.size,
      typeFilter,
      onSetTypeFilter: (t: any) => { setTypeFilter(t); setIsFilterPanelOpen(false); },
      genres,
      activeGenre,
      onToggleGenre: toggleGenreFilter,
      onClearGenre: clearGenreFilter,
      minRating,
      onSetMinRating: setMinRating,
      majorProviders,
      otherProviders,
      showAllProviders,
      onToggleShowAllProviders: () => setShowAllProviders(prev => !prev),
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-brand-background">
      <Header
         searchTerm={searchTerm}
         setSearchTerm={setSearchTerm}
         searchResults={searchResults}
         isSearching={isSearching}
         onResultClick={setSelectedMovie}
         onClear={clearSearch}
         onToggleMenu={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
         session={session}
         onAuthClick={() => setIsAuthModalOpen(true)}
      />
      
      {/* Mobile Quick Navigation Strip - More Compact */}
      <div className="lg:hidden sticky top-16 z-30 bg-brand-background/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none no-scrollbar">
          <button 
            onClick={() => { setIsWatchlistMode(false); setIsWatchedMode(false); setIsNotInterestedMode(false); }}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${!isWatchlistMode && !isWatchedMode && !isNotInterestedMode ? 'bg-brand-accent text-brand-background shadow-lg shadow-amber-500/20 scale-105' : 'bg-white/5 text-gray-400'}`}
          >
            Explorar
          </button>
          <button 
            onClick={() => setIsWatchlistMode(true)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${isWatchlistMode ? 'bg-brand-accent text-brand-background shadow-lg shadow-amber-500/20 scale-105' : 'bg-white/5 text-gray-400'}`}
          >
            Lista
          </button>
          <button 
             onClick={() => setTypeFilter('Movie')}
             className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${typeFilter === 'Movie' && !isWatchlistMode && !isWatchedMode ? 'bg-white text-black scale-105' : 'bg-white/5 text-gray-400'}`}
          >
            Filmes
          </button>
          <button 
             onClick={() => setTypeFilter('Series')}
             className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${typeFilter === 'Series' && !isWatchlistMode && !isWatchedMode ? 'bg-white text-black scale-105' : 'bg-white/5 text-gray-400'}`}
          >
            Séries
          </button>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-full lg:w-72 xl:w-80 flex-shrink-0 self-start sticky top-24">
          <FilterPanel {...filterPanelProps} />
        </aside>
        
        <main className="flex-1 min-w-0">
          <div className="mb-4 md:mb-6 flex items-center justify-between">
              <h2 className="text-xl md:text-3xl font-black italic tracking-tighter text-white uppercase">
                {isWatchlistMode ? 'Minha Lista' : isWatchedMode ? 'Assistidos' : isNotInterestedMode ? 'Descartados' : 'Lançamentos'}
              </h2>
              {(isWatchlistMode || isWatchedMode || isNotInterestedMode) && (
                <span className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full border border-brand-accent/20">
                  {isWatchlistMode ? watchlist.size : isWatchedMode ? watchedList.size : notInterestedList.size} itens
                </span>
              )}
          </div>

          {renderContent()}
        </main>
      </div>

       {(!isLoading && !error && !isWatchlistMode && !isWatchedMode && !isNotInterestedMode && filteredAndSortedMovies.length > 0 && totalPages > 1) && (
        <div className="container mx-auto px-4 pb-8">
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {isFilterPanelOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden flex flex-col justify-end animate-fade-in">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsFilterPanelOpen(false)}></div>
           <div className="relative glass-pane w-full max-h-[90vh] rounded-t-[2.5rem] overflow-hidden flex flex-col animate-slide-up bg-brand-background">
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                  <h3 className="text-2xl font-black italic text-white tracking-tighter">FILTROS</h3>
                  <button onClick={() => setIsFilterPanelOpen(false)} className="p-2 rounded-full bg-white/10 text-white"><XMarkIcon className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 pb-12 scrollbar-none no-scrollbar">
                  <FilterPanel {...filterPanelProps} />
              </div>
           </div>
        </div>
      )}

       <footer className="text-center py-10 text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">
        <p>Groselhinhas &copy; 2024. Curadoria Premium.</p>
      </footer>

      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onRecommendationClick={setSelectedMovie}
          isInWatchlist={watchlist.has(selectedMovie.id)}
          onToggleWatchlist={() => toggleWatchlist(selectedMovie.id)}
          isInWatchedList={watchedList.has(selectedMovie.id)}
          onToggleWatched={() => toggleWatched(selectedMovie.id)}
          isNotInterested={notInterestedList.has(selectedMovie.id)}
          onToggleNotInterested={() => toggleNotInterested(selectedMovie.id)}
          isFetchingDetails={isFetchingDetails}
          onShareClick={() => setMovieToShare(selectedMovie)}
        />
      )}
      
      {movieToShare && (
        <ShareModal
          movie={movieToShare}
          onClose={() => setMovieToShare(null)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}

      {newVersionAvailable && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-brand-surface rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all animate-fade-in-up border border-white/10">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-accent/20 mb-5">
                    <ArrowPathIcon className="h-8 w-8 text-brand-accent"/>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Nova Versão Disponível!</h2>
                <p className="text-gray-300 mb-1">Uma atualização foi aplicada para melhorar sua experiência.</p>
                <p className="text-gray-400 text-sm mb-6">Versão: <span className="font-mono bg-brand-background px-1.5 py-0.5 rounded">#{newVersionAvailable}</span></p>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-brand-accent hover:bg-amber-400 text-brand-background font-black py-4 px-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                    ATUALIZAR AGORA
                </button>
            </div>
        </div>
      )}

      {showSaveFavoritesPopup && !session?.user && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowSaveFavoritesPopup(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-gray-300 hover:bg-white hover:text-black transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-2">Salve seus favoritos</h3>
            <p className="text-gray-400 mb-6">Crie uma conta para sincronizar sua lista de filmes e séries em qualquer dispositivo. É rápido e gratuito!</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowSaveFavoritesPopup(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-brand-accent text-brand-background font-black uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
              >
                Criar Conta / Entrar
              </button>
              <button
                onClick={() => setShowSaveFavoritesPopup(false)}
                className="w-full py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatAssistant 
        onMovieClick={setSelectedMovie} 
        searchMovieByTitle={searchMovieByTitle} 
      />
    </div>
  );
};

export default App;
