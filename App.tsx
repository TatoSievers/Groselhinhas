import React from 'react';
import { useGroselhinhas } from './hooks/useGroselhinhas';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { MovieCard } from './components/MovieCard';
import { Trending } from './components/Trending';
import { FilmIcon, ViewfinderCircleIcon, EyeIcon, ExclamationTriangleIcon, ChevronLeftIcon, ChevronRightIcon, SlidersHorizontalIcon, XMarkIcon, ArrowPathIcon, NoSymbolIcon } from './components/Icons';
import { MovieCardSkeleton } from './components/MovieCardSkeleton';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { ShareModal } from './components/ShareModal';
import { Movie } from './types';

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
  } = useGroselhinhas();

  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false);
  const [newVersionAvailable, setNewVersionAvailable] = React.useState<string | null>(null);
  const [movieToShare, setMovieToShare] = React.useState<Movie | null>(null);


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
    if (selectedMovie || movieToShare) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedMovie, movieToShare]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center bg-brand-surface rounded-lg p-8">
            <ExclamationTriangleIcon className="w-24 h-24 text-red-500 mb-4"/>
            <h2 className="text-2xl font-bold text-white">Ocorreu um Erro</h2>
            <p className="text-gray-400 mt-2 max-w-md">{error}</p>
        </div>
      );
    }
    
    if (filteredAndSortedMovies.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center bg-brand-surface rounded-lg p-8">
        {isNotInterestedMode ? (
           <>
            <NoSymbolIcon className="w-24 h-24 text-brand-muted mb-4"/>
            <h2 className="text-2xl font-bold text-white">Nenhum Item Descartado</h2>
            <p className="text-gray-400 mt-2 max-w-md">
                Itens que você marcar como "Não tenho interesse" aparecerão aqui. Você pode restaurá-los a qualquer momento.
            </p>
          </>
        ) : isWatchlistMode ? (
          <>
            <ViewfinderCircleIcon className="w-24 h-24 text-brand-muted mb-4"/>
            <h2 className="text-2xl font-bold text-white">Sua Lista está Vazia</h2>
            <p className="text-gray-400 mt-2 max-w-md">
              Adicione filmes e séries à sua lista clicando no ícone de marcador. Eles aparecerão aqui para fácil acesso.
            </p>
          </>
        ) : isWatchedMode ? (
           <>
            <EyeIcon className="w-24 h-24 text-brand-muted mb-4"/>
            <h2 className="text-2xl font-bold text-white">Nenhum Item Assistido</h2>
            <p className="text-gray-400 mt-2 max-w-md">
              Marque os filmes e séries que você já viu clicando no ícone de "check". Eles aparecerão aqui para seu controle.
            </p>
          </>
        ) : (
          <>
            <FilmIcon className="w-24 h-24 text-brand-muted mb-4"/>
            <h2 className="text-2xl font-bold text-white">Nenhum Resultado Encontrado</h2>
            <p className="text-gray-400 mt-2 max-w-md">
              Tente ajustar seus filtros para descobrir mais conteúdo.
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
      onToggleWatchlistMode: () => setIsWatchlistMode(!isWatchlistMode),
      watchlistCount: watchlist.size,
      isWatchedMode,
      onToggleWatchedMode: () => setIsWatchedMode(!isWatchedMode),
      watchedCount: watchedList.size,
      isNotInterestedMode,
      onToggleNotInterestedMode: () => setIsNotInterestedMode(!isNotInterestedMode),
      notInterestedCount: notInterestedList.size,
      typeFilter,
      onSetTypeFilter: setTypeFilter,
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
    <div className="min-h-screen w-full">
      <Header
         searchTerm={searchTerm}
         setSearchTerm={setSearchTerm}
         searchResults={searchResults}
         isSearching={isSearching}
         onResultClick={setSelectedMovie}
         onClear={clearSearch}
      />
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-full lg:w-72 xl:w-80 flex-shrink-0 self-start sticky top-24">
          <FilterPanel {...filterPanelProps} />
        </aside>
        
        <main className="flex-1 min-w-0">
          <div className="mb-6 lg:hidden">
              <button
                onClick={() => setIsFilterPanelOpen(prev => !prev)}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-bold text-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors shadow-md"
                aria-expanded={isFilterPanelOpen}
              >
                {isFilterPanelOpen ? <XMarkIcon className="w-6 h-6 mr-2" /> : <SlidersHorizontalIcon className="w-6 h-6 mr-2" />}
                {isFilterPanelOpen ? 'Ocultar Filtros' : 'Filtros e Opções'}
              </button>
              <div className={`collapsible-panel ${isFilterPanelOpen ? 'open' : ''}`}>
                <div className="pt-4">
                  <FilterPanel {...filterPanelProps} />
                </div>
              </div>
          </div>

          {!isLoading && !error && !isWatchlistMode && !isWatchedMode && !isNotInterestedMode && trendingMovies.length > 0 && searchTerm.length === 0 && (
            <Trending trendingMovies={trendingMovies} onMovieClick={setSelectedMovie} />
          )}
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

       <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Groselhinhas &copy; 2024. Todos os dados são para fins de demonstração.</p>
        <p>Desenvolvido por um engenheiro frontend sênior de classe mundial.</p>
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

      {newVersionAvailable && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-brand-surface rounded-xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-accent/20 mb-5">
                    <ArrowPathIcon className="h-8 w-8 text-brand-accent"/>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Nova Versão Disponível!</h2>
                <p className="text-gray-300 mb-1">Uma atualização foi aplicada para melhorar sua experiência.</p>
                <p className="text-gray-400 text-sm mb-6">Versão: <span className="font-mono bg-brand-background px-1.5 py-0.5 rounded">#{newVersionAvailable}</span></p>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-brand-accent hover:bg-amber-400 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-amber-500/20"
                >
                    Atualizar e Recarregar
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
