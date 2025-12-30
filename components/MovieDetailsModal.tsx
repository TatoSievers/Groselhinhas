import React, { useEffect } from 'react';
import { Movie, Provider } from '../types';
import { BookmarkIcon, CheckCircleIcon, ClockIcon, ExternalLinkIcon, FilmIcon, ImdbIcon, PlayIcon, ShareIcon, XMarkIcon } from './Icons';
import { CreditCard } from './CreditCard';

interface ModalProps {
  movie: Movie;
  onClose: () => void;
  onRecommendationClick: (movie: Movie) => void;
  onToggleWatchlist: () => void;
  isInWatchlist: boolean;
  onToggleWatched: () => void;
  isInWatchedList: boolean;
  isFetchingDetails: boolean;
  onShareClick: () => void;
}

const Section: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className }) => (
    <div className={`mt-10 ${className}`}>
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">{title}</h3>
        {children}
    </div>
);

const ProviderIcon: React.FC<{ provider: Provider }> = ({ provider }) => (
  <div className="group flex flex-col items-center p-2 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 hover:scale-105" title={provider.provider_name}>
    <img 
      src={`https://image.tmdb.org/t/p/w185${provider.logo_path}`} 
      alt={provider.provider_name} 
      className="w-12 h-12 rounded-xl object-cover shadow-2xl" 
      referrerPolicy="no-referrer" 
    />
  </div>
);

export const MovieDetailsModal: React.FC<ModalProps> = ({
  movie,
  onClose,
  onRecommendationClick,
  onToggleWatchlist,
  isInWatchlist,
  onToggleWatched,
  isInWatchedList,
  isFetchingDetails,
  onShareClick,
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const openTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(movie.trailerUrl) window.open(movie.trailerUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-brand-background/95 backdrop-blur-xl"></div>
      
      {/* Dynamic Background */}
      {movie.posterUrl && (
        <div className="absolute inset-0 opacity-20 transition-opacity duration-1000">
          <img src={movie.posterUrl} className="w-full h-full object-cover blur-[100px]" alt=""/>
        </div>
      )}

      <div
        className="glass-pane w-full max-w-6xl max-h-full rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden relative shadow-2xl border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-brand-accent hover:text-brand-background transition-all"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Poster Section */}
        <div className="w-full md:w-[400px] flex-shrink-0 relative hidden md:block">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-brand-background/40"></div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 md:p-16 overflow-y-auto scrollbar-thin">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-brand-accent text-brand-background text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{movie.type === 'Movie' ? 'Filme' : 'Série'}</span>
            <span className="text-white/40 text-sm font-bold">{movie.year}</span>
            { movie.durationInMinutes > 0 && <span className="text-white/40 text-sm font-bold">• {movie.durationInMinutes} min</span>}
          </div>

          <h1 className="text-4xl md:text-7xl font-black text-white leading-tight mb-8 tracking-tighter italic">
            {movie.title.toUpperCase()}
          </h1>

          <div className="flex flex-wrap gap-4 mb-10">
              <button
                onClick={openTrailer}
                disabled={!movie.trailerUrl}
                className="flex items-center px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all bg-red-600 hover:bg-red-500 text-white disabled:opacity-20 shadow-xl shadow-red-900/20"
              >
                <PlayIcon className="w-5 h-5 mr-3 fill-current" />
                Trailer
              </button>
              <button
                onClick={onToggleWatchlist}
                className={`flex items-center px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  isInWatchlist ? 'bg-brand-accent text-brand-background' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <BookmarkIcon className="w-5 h-5 mr-3" />
                {isInWatchlist ? 'Salvo' : 'Salvar'}
              </button>
               <button
                onClick={onShareClick}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Compartilhar Arte"
              >
                <ShareIcon className="w-6 h-6" />
              </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <Section title="Sinopse">
                <p className="text-xl text-white/80 leading-relaxed font-medium">{movie.synopsis}</p>
              </Section>

              <Section title="Elenco Principal">
                <div className="flex overflow-x-auto space-x-6 pb-6 scrollbar-thin">
                    {movie.director && <CreditCard person={movie.director} />}
                    {movie.cast.map(person => <CreditCard key={person.id} person={person} />)}
                </div>
              </Section>
            </div>

            <div className="space-y-10">
               {movie.ratings.imdb > 0 && (
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center">
                    <span className="text-6xl font-black text-brand-accent">{movie.ratings.imdb.toFixed(1)}</span>
                    <span className="text-xs font-black text-white/40 tracking-[0.3em] mt-2 uppercase">Nota IMDb</span>
                </div>
              )}

              <Section title="Onde Assistir">
                  <div className="flex flex-wrap gap-4">
                      {movie.availability?.flatrate?.map(p => <ProviderIcon key={p.provider_id} provider={p} />)}
                      {!movie.availability?.flatrate?.length && <span className="text-white/40 font-bold italic">Não disponível em streaming no momento.</span>}
                  </div>
              </Section>
            </div>
          </div>

          <Section title="Recomendações">
              <div className="flex overflow-x-auto space-x-4 pb-6 scrollbar-thin">
                  {movie.recommendations.map(rec => (
                      <div key={rec.id} onClick={() => onRecommendationClick(rec)} className="flex-shrink-0 w-36 group cursor-pointer">
                          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-800 transition-transform group-hover:scale-105">
                              {rec.posterUrl && <img src={rec.posterUrl} alt="" className="w-full h-full object-cover"/>}
                          </div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest mt-3 text-white/40 truncate group-hover:text-brand-accent">{rec.title}</h4>
                      </div>
                  ))}
              </div>
          </Section>
        </div>
      </div>
    </div>
  );
};