import React from 'react';
import { Provider, Genre } from '../types';
import { BookmarkIcon, SlidersHorizontalIcon, FilmIcon, StarIcon, EyeIcon, TagIcon, TvIcon, ChevronDownIcon, NoSymbolIcon } from './Icons';

type FilterButtonProps = {
  onClick: () => void;
  isActive: boolean;
  disabled: boolean;
  children: React.ReactNode;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onClick, isActive, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors w-full
      ${disabled ? 'bg-gray-700 text-gray-500 cursor-not-allowed' :
      isActive ? 'bg-brand-accent text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
  >
    {children}
  </button>
);

const ProviderCheckbox: React.FC<{
  provider: Provider;
  isServiceActive: (id: number) => boolean;
  onToggleService: (id: number) => void;
  isDisabled: boolean;
}> = ({ provider, isServiceActive, onToggleService, isDisabled }) => (
  <label key={provider.provider_id} className="flex items-center space-x-3 cursor-pointer">
    <input
      type="checkbox"
      checked={isServiceActive(provider.provider_id)}
      onChange={() => onToggleService(provider.provider_id)}
      className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-brand-accent focus:ring-brand-accent focus:ring-2 focus:ring-offset-brand-surface disabled:cursor-not-allowed"
      disabled={isDisabled}
    />
    {provider.logo_path && (
      <img src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`} alt="" className="w-6 h-6 rounded-md object-contain" referrerPolicy="no-referrer" />
    )}
    <span className={`text-base ${isDisabled ? 'text-gray-500' : 'text-gray-200'}`}>{provider.provider_name}</span>
  </label>
);


interface FilterPanelProps {
  onToggleService: (providerId: number) => void;
  isServiceActive: (providerId: number) => boolean;
  majorProviders: Provider[];
  otherProviders: Provider[];
  showAllProviders: boolean;
  onToggleShowAllProviders: () => void;
  isWatchlistMode: boolean;
  onToggleWatchlistMode: () => void;
  watchlistCount: number;
  isWatchedMode: boolean;
  onToggleWatchedMode: () => void;
  watchedCount: number;
  isNotInterestedMode: boolean;
  onToggleNotInterestedMode: () => void;
  notInterestedCount: number;
  typeFilter: 'All' | 'Movie' | 'Series';
  onSetTypeFilter: (type: 'All' | 'Movie' | 'Series') => void;
  genres: Genre[];
  activeGenre: number | null;
  onToggleGenre: (genreId: number) => void;
  onClearGenre: () => void;
  minRating: number;
  onSetMinRating: (rating: number) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onToggleService,
  isServiceActive,
  majorProviders,
  otherProviders,
  showAllProviders,
  onToggleShowAllProviders,
  isWatchlistMode,
  onToggleWatchlistMode,
  watchlistCount,
  isWatchedMode,
  onToggleWatchedMode,
  watchedCount,
  isNotInterestedMode,
  onToggleNotInterestedMode,
  notInterestedCount,
  typeFilter,
  onSetTypeFilter,
  genres,
  activeGenre,
  onToggleGenre,
  onClearGenre,
  minRating,
  onSetMinRating,
}) => {
  const isAdvancedFilterDisabled = isWatchlistMode || isWatchedMode || isNotInterestedMode;

  return (
    <div className="bg-brand-surface rounded-lg p-5 flex flex-col gap-5 lg:bg-transparent lg:p-0">
      <div className="flex flex-col gap-3">
        <button
          onClick={onToggleWatchlistMode}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-md font-bold text-lg transition-all duration-200 ${
            isWatchlistMode
              ? 'bg-brand-accent text-white shadow-md shadow-amber-500/20'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          <BookmarkIcon className="w-6 h-6 mr-2" />
          Minha Lista
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-sm font-semibold ${isWatchlistMode ? 'bg-white/20' : 'bg-gray-600'}`}>{watchlistCount}</span>
        </button>
         <button
          onClick={onToggleWatchedMode}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-md font-bold text-lg transition-all duration-200 ${
            isWatchedMode
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          <EyeIcon className="w-6 h-6 mr-2" />
          Assistidos
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-sm font-semibold ${isWatchedMode ? 'bg-white/20' : 'bg-gray-600'}`}>{watchedCount}</span>
        </button>
        <button
          onClick={onToggleNotInterestedMode}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-md font-bold text-lg transition-all duration-200 ${
            isNotInterestedMode
              ? 'bg-red-800 text-white shadow-md shadow-red-500/20'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          <NoSymbolIcon className="w-6 h-6 mr-2" />
          Descartados
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-sm font-semibold ${isNotInterestedMode ? 'bg-white/20' : 'bg-gray-600'}`}>{notInterestedCount}</span>
        </button>
      </div>

      <div className="border-t border-gray-700 pt-5">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center lg:hidden">
          <SlidersHorizontalIcon className="w-5 h-5 mr-2 text-brand-accent" />
          Filtros
        </h3>
        
        <div className="space-y-4">
            <div>
                <label className="text-sm font-semibold text-gray-300 flex items-center mb-2">
                    <FilmIcon className="w-4 h-4 mr-2"/>Tipo
                </label>
                <div className="grid grid-cols-3 gap-2">
                    <FilterButton onClick={() => onSetTypeFilter('All')} isActive={typeFilter === 'All'} disabled={isAdvancedFilterDisabled}>Todos</FilterButton>
                    <FilterButton onClick={() => onSetTypeFilter('Movie')} isActive={typeFilter === 'Movie'} disabled={isAdvancedFilterDisabled}>Filmes</FilterButton>
                    <FilterButton onClick={() => onSetTypeFilter('Series')} isActive={typeFilter === 'Series'} disabled={isAdvancedFilterDisabled}>Séries</FilterButton>
                </div>
            </div>
             <div>
                <label htmlFor="min-rating" className="text-sm font-semibold text-gray-300 flex items-center mb-2">
                    <StarIcon className="w-4 h-4 mr-2"/>Nota Mínima IMDb
                </label>
                <div className="flex items-center gap-3">
                    <input
                        id="min-rating"
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={minRating}
                        onChange={(e) => onSetMinRating(parseFloat(e.target.value))}
                        disabled={isAdvancedFilterDisabled}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-accent disabled:cursor-not-allowed"
                    />
                    <span className={`font-bold text-lg ${isAdvancedFilterDisabled ? 'text-gray-500' : 'text-white'}`}>
                        {minRating.toFixed(1)}
                    </span>
                </div>
            </div>
        </div>
      </div>
       <div className="border-t border-gray-700 pt-5">
        <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none py-2 text-white">
                 <h3 className="text-lg font-semibold flex items-center">
                    <TagIcon className="w-5 h-5 mr-2 text-brand-accent"/>
                    Gêneros
                </h3>
                <ChevronDownIcon className="w-5 h-5 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="flex flex-wrap gap-2 mt-3">
                 <button
                    key="all-genres"
                    onClick={onClearGenre}
                    disabled={isAdvancedFilterDisabled}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                        ${isAdvancedFilterDisabled ? 'bg-gray-600 text-gray-400 cursor-not-allowed' :
                        activeGenre === null ? 'bg-brand-accent text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                >
                    Todos
                </button>
                {genres.map(genre => (
                    <button
                        key={genre.id}
                        onClick={() => onToggleGenre(genre.id)}
                        disabled={isAdvancedFilterDisabled}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                            ${isAdvancedFilterDisabled ? 'bg-gray-600 text-gray-400 cursor-not-allowed' :
                            activeGenre === genre.id ? 'bg-brand-accent text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                    >
                        {genre.name}
                    </button>
                ))}
            </div>
        </details>
      </div>


      <div className="border-t border-gray-700 pt-5">
        <details className="group" open>
            <summary className="flex items-center justify-between cursor-pointer list-none py-2 text-white">
                <h3 className="text-lg font-semibold flex items-center">
                    <TvIcon className="w-5 h-5 mr-2 text-brand-accent" />
                    Meus Streamings
                </h3>
                 <ChevronDownIcon className="w-5 h-5 transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <div className="mt-4">
                 <p className="text-sm text-gray-400 mb-4">Filtre por suas assinaturas.</p>
                <div className="space-y-3">
                  {majorProviders.map((provider) => (
                    <ProviderCheckbox
                        key={provider.provider_id}
                        provider={provider}
                        isServiceActive={isServiceActive}
                        onToggleService={onToggleService}
                        isDisabled={isAdvancedFilterDisabled}
                    />
                  ))}
                </div>
                {otherProviders.length > 0 && (
                  <>
                    <div className={`collapsible-panel ${showAllProviders ? 'open' : ''}`}>
                      <div className="space-y-3 pt-3">
                        {otherProviders.map((provider) => (
                           <ProviderCheckbox
                                key={provider.provider_id}
                                provider={provider}
                                isServiceActive={isServiceActive}
                                onToggleService={onToggleService}
                                isDisabled={isAdvancedFilterDisabled}
                            />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={onToggleShowAllProviders}
                      className="text-brand-accent text-sm font-semibold hover:underline mt-4 w-full text-left pl-1 transition-colors"
                      aria-expanded={showAllProviders}
                    >
                      {showAllProviders ? 'Mostrar menos' : `Mostrar mais ${otherProviders.length} serviços...`}
                    </button>
                  </>
                )}
            </div>
        </details>
      </div>
    </div>
  );
};