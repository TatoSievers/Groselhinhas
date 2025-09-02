
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
    <div className={`mt-8 ${className}`}>
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        {children}
    </div>
);

const ProviderIcon: React.FC<{ provider: Provider }> = ({ provider }) => {
  const imageUrl = `https://image.tmdb.org/t/p/w92${provider.logo_path}`;
  return (
    <div className="flex flex-col items-center text-center w-20" title={provider.provider_name}>
      <img src={imageUrl} alt={provider.provider_name} className="w-14 h-14 rounded-xl object-cover mb-1 shadow-md" referrerPolicy="no-referrer" />
    </div>
  );
};

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
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const openTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(movie.trailerUrl) {
      window.open(movie.trailerUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
 const CreditSkeleton = () => (
    <div className="flex-shrink-0 w-28 text-center animate-pulse">
        <div className="w-28 h-40 bg-gray-700 rounded-lg mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-24 mx-auto mb-1"></div>
        <div className="h-3 bg-gray-700 rounded w-16 mx-auto"></div>
    </div>
 );
 
  const RecommendationSkeleton = () => (
    <div className="flex-shrink-0 w-32 animate-pulse">
        <div className="w-32 h-48 bg-gray-700 rounded-lg"></div>
    </div>
 );

  const hasAvailability = movie.availability?.flatrate?.length || movie.availability?.rent?.length || movie.availability?.buy?.length;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
      <div
        className="bg-brand-surface w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl shadow-black/50 flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 text-gray-300 hover:bg-brand-accent hover:text-white transition-colors"
          aria-label="Fechar modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="w-full md:w-1/3 flex-shrink-0 relative h-64 md:h-auto">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={`Pôster de ${movie.title}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <FilmIcon className="w-16 h-16 text-brand-muted" />
            </div>
          )}
           <div className="absolute inset-0 bg-gradient-to-t from-brand-surface to-transparent md:bg-gradient-to-r"></div>
        </div>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-thin">
          <div className="flex items-start gap-3 mb-2">
            <span className="bg-brand-accent/20 text-brand-accent text-xs font-bold px-2 py-1 rounded">{movie.type === 'Movie' ? 'Filme' : 'Série'}</span>
             { movie.durationInMinutes > 0 && 
                  <span className="bg-gray-700 text-gray-300 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                      <ClockIcon className="w-3 h-3"/>
                      {movie.durationInMinutes} min
                  </span>
                }
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">{movie.title}</h1>
          <p className="text-lg text-gray-400 mb-6">{movie.year}</p>

          <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={openTrailer}
                disabled={!movie.trailerUrl}
                className="flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold transition-colors bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Assistir Trailer
              </button>
               <button
                onClick={onShareClick}
                className="flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold transition-colors bg-gray-700 hover:bg-gray-600 text-gray-200"
              >
                <ShareIcon className="w-5 h-5 mr-2" />
                Compartilhar
              </button>
              <button
                onClick={onToggleWatchlist}
                className={`flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold transition-colors ${
                  isInWatchlist ? 'bg-brand-accent text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                <BookmarkIcon className="w-5 h-5 mr-2" />
                {isInWatchlist ? 'Na Minha Lista' : 'Minha Lista'}
              </button>
              <button
                onClick={onToggleWatched}
                className={`flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold transition-colors ${
                  isInWatchedList ? 'bg-emerald-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                {isInWatchedList ? 'Assistido' : 'Marcar como visto'}
              </button>
          </div>
          
          {movie.ratings.imdb > 0 && (
            <div className="mb-6">
                 <a href={movie.ratings.imdbUrl} target="_blank" rel="noopener noreferrer" title="Ver no IMDb" className="bg-brand-background/50 p-4 rounded-lg text-center transition-colors hover:bg-gray-700/80 group flex flex-col justify-center items-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{movie.ratings.imdb.toFixed(1)}</span>
                    <span className="text-xl font-bold text-gray-400 ml-1">/ 10</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-400 tracking-wider mt-1">AVALIAÇÃO IMDB</p>
                </a>
            </div>
          )}

          <Section title="Sinopse">
            <p className="text-gray-300 text-base leading-relaxed">{movie.synopsis}</p>
          </Section>

          <Section title="Onde Assistir">
              {hasAvailability ? (
                  <div className="space-y-6">
                      {movie.availability?.flatrate && movie.availability.flatrate.length > 0 && (
                          <div>
                              <h4 className="font-semibold text-gray-300 mb-3">Streaming</h4>
                              <div className="flex flex-wrap gap-x-4 gap-y-2">
                                  {movie.availability.flatrate.map(p => <ProviderIcon key={p.provider_id} provider={p} />)}
                              </div>
                          </div>
                      )}
                      {movie.availability?.rent && movie.availability.rent.length > 0 && (
                          <div>
                              <h4 className="font-semibold text-gray-300 mb-3">Alugar</h4>
                              <div className="flex flex-wrap gap-x-4 gap-y-2">
                                  {movie.availability.rent.map(p => <ProviderIcon key={p.provider_id} provider={p} />)}
                              </div>
                          </div>
                      )}
                      {movie.availability?.buy && movie.availability.buy.length > 0 && (
                           <div>
                              <h4 className="font-semibold text-gray-300 mb-3">Comprar</h4>
                              <div className="flex flex-wrap gap-x-4 gap-y-2">
                                  {movie.availability.buy.map(p => <ProviderIcon key={p.provider_id} provider={p} />)}
                              </div>
                          </div>
                      )}
                      {movie.availability?.link && (
                          <a 
                              href={movie.availability.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center mt-4 px-5 py-2.5 rounded-lg font-semibold transition-colors bg-gray-700 hover:bg-gray-600 text-white w-full sm:w-auto"
                              title="Ver opções de streaming em JustWatch.com"
                          >
                              <ExternalLinkIcon className="w-5 h-5 mr-2" />
                              Ver mais opções
                          </a>
                      )}
                  </div>
              ) : (
                  <span className="text-gray-400 text-base">{ movie.inTheaters ? 'Atualmente nos cinemas.' : 'Informação de streaming não disponível.'}</span>
              )}
          </Section>

          <Section title="Elenco Principal">
                <div className="flex overflow-x-auto space-x-4 pb-4 -mx-2 px-2 scrollbar-thin">
                    {isFetchingDetails && movie.cast.length === 0 ? (
                       Array.from({ length: 5 }).map((_, i) => <CreditSkeleton key={i} />)
                    ) : (
                        <>
                            {movie.director && <CreditCard person={movie.director} />}
                            {movie.cast.map(person => <CreditCard key={person.id} person={person} />)}
                        </>
                    )}
                </div>
          </Section>
          
            <Section title="Você também pode gostar">
                <div className="flex overflow-x-auto space-x-4 pb-4 -mx-2 px-2 scrollbar-thin">
                   {isFetchingDetails && movie.recommendations.length === 0 ? (
                       Array.from({ length: 5 }).map((_, i) => <RecommendationSkeleton key={i} />)
                   ) : (
                       movie.recommendations.map(rec => (
                           <div key={rec.id} onClick={() => onRecommendationClick(rec)} className="flex-shrink-0 w-32 group cursor-pointer">
                                <div className="relative rounded-lg overflow-hidden shadow-md transform transition-transform duration-300 group-hover:scale-105 bg-gray-700">
                                    {rec.posterUrl ?
                                        <img src={rec.posterUrl} alt={rec.title} className="w-full h-48 object-cover"/>
                                        : <div className="w-full h-48 flex items-center justify-center"><FilmIcon className="w-8 h-8 text-brand-muted"/></div>
                                    }
                                </div>
                                <h4 className="text-xs text-center font-semibold mt-2 text-gray-300 truncate group-hover:text-white">{rec.title}</h4>
                           </div>
                       ))
                   )}
                </div>
            </Section>
        </div>
      </div>
    </div>
  );
};
