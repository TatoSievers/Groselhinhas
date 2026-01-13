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
    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all w-full
      ${disabled ? 'opacity-30 cursor-not-allowed' :
        isActive ? 'bg-brand-accent text-brand-background shadow-lg shadow-amber-500/20' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
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
  <label key={provider.provider_id} className={`flex items-center p-2 rounded-xl transition-colors cursor-pointer ${isDisabled ? 'opacity-30' : 'hover:bg-white/5'}`}>
    <input
      type="checkbox"
      checked={isServiceActive(provider.provider_id)}
      onChange={() => onToggleService(provider.provider_id)}
      className="hidden"
      disabled={isDisabled}
    />
    <div className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all mr-3 ${isServiceActive(provider.provider_id) ? 'border-brand-accent scale-110' : 'border-transparent opacity-60'}`}>
      {provider.logo_path && (
        <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      )}
    </div>
    <span className={`text-sm font-semibold ${isServiceActive(provider.provider_id) ? 'text-white' : 'text-gray-400'}`}>{provider.provider_name}</span>
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
    <div className="space-y-6">
      <div className="glass-pane p-4 rounded-3xl space-y-2">
        <button
          onClick={onToggleWatchlistMode}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all ${isWatchlistMode ? 'bg-brand-accent text-brand-background' : 'hover:bg-white/5 text-gray-300'
            }`}
        >
          <div className="flex items-center"><BookmarkIcon className="w-5 h-5 mr-3" /> Minha Lista</div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isWatchlistMode ? 'bg-black/10' : 'bg-white/10'}`}>{watchlistCount}</span>
        </button>
        <button
          onClick={onToggleWatchedMode}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all ${isWatchedMode ? 'bg-emerald-500 text-white' : 'hover:bg-white/5 text-gray-300'
            }`}
        >
          <div className="flex items-center"><EyeIcon className="w-5 h-5 mr-3" /> Assistidos</div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isWatchedMode ? 'bg-black/10' : 'bg-white/10'}`}>{watchedCount}</span>
        </button>
        <button
          onClick={onToggleNotInterestedMode}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all ${isNotInterestedMode ? 'bg-red-500 text-white' : 'hover:bg-white/5 text-gray-300'
            }`}
        >
          <div className="flex items-center"><NoSymbolIcon className="w-5 h-5 mr-3" /> Descartados</div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isNotInterestedMode ? 'bg-black/10' : 'bg-white/10'}`}>{notInterestedCount}</span>
        </button>
      </div>

      <div className="glass-pane p-5 rounded-3xl space-y-6">
        <div>
          <h3 className="text-sm font-black text-white/40 uppercase tracking-widest mb-4">Ajustar busca</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Tipo de Conteúdo</label>
              <div className="grid grid-cols-3 gap-2">
                <FilterButton onClick={() => onSetTypeFilter('All')} isActive={typeFilter === 'All'} disabled={isAdvancedFilterDisabled}>Tudo</FilterButton>
                <FilterButton onClick={() => onSetTypeFilter('Movie')} isActive={typeFilter === 'Movie'} disabled={isAdvancedFilterDisabled}>Filmes</FilterButton>
                <FilterButton onClick={() => onSetTypeFilter('Series')} isActive={typeFilter === 'Series'} disabled={isAdvancedFilterDisabled}>Séries</FilterButton>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">IMDb Mínimo: <span className="text-brand-accent">{minRating.toFixed(1)}</span></label>
              <input
                type="range" min="0" max="10" step="0.1"
                value={minRating}
                onChange={(e) => onSetMinRating(parseFloat(e.target.value))}
                disabled={isAdvancedFilterDisabled}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-accent"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black text-white/40 uppercase tracking-widest mb-4">Gêneros</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => onToggleGenre(genre.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${activeGenre === genre.id
                  ? 'bg-brand-accent text-brand-background border-brand-accent'
                  : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <details className="group" open>
            <summary className="flex items-center justify-between cursor-pointer list-none py-2 text-white/40 uppercase text-xs font-black tracking-widest">
              Meus Streamings
              <ChevronDownIcon className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid grid-cols-1 gap-1 mt-4">
              {majorProviders.map((p) => (
                <ProviderCheckbox key={p.provider_id} provider={p} isServiceActive={isServiceActive} onToggleService={onToggleService} isDisabled={isAdvancedFilterDisabled} />
              ))}
            </div>
            {otherProviders.length > 0 && (
              <button
                onClick={onToggleShowAllProviders}
                className="w-full text-center py-3 text-[10px] font-black uppercase text-brand-accent hover:text-white transition-colors tracking-widest mt-2"
              >
                {showAllProviders ? 'Ver Menos' : `Ver Mais ${otherProviders.length}`}
              </button>
            )}
          </details>
        </div>
      </div>
    </div >
  );
};