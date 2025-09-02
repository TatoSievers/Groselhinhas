
import React from 'react';
import { Movie } from '../types';
import { BookmarkIcon, ImdbIcon, CheckCircleIcon, ClockIcon, PlayIcon, FilmIcon, NoSymbolIcon, ShareIcon } from './Icons';
import { StreamingPill } from './StreamingPill';

interface MovieCardProps {
  movie: Movie;
  onToggleWatchlist: () => void;
  isInWatchlist: boolean;
  onToggleWatched: () => void;
  isInWatchedList: boolean;
  onClick: () => void;
  onToggleNotInterested: () => void;
  isNotInterested: boolean;
  onShareClick: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onToggleWatchlist, isInWatchlist, onToggleWatched, isInWatchedList, onClick, onToggleNotInterested, isNotInterested, onShareClick }) => {
  const [isImgError, setIsImgError] = React.useState(false);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const openTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(movie.trailerUrl) {
      window.open(movie.trailerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const releaseDate = new Date(movie.releaseDate);
  const today = new Date();
  const isNewRelease = movie.type === 'Movie' && releaseDate.getFullYear() === today.getFullYear() && releaseDate.getMonth() === today.getMonth();
  const showNewEpisodesBadge = movie.status === 'new_episodes';

  const badge = isNewRelease ? { text: 'Lançamento', color: 'bg-pink-600' } :
                showNewEpisodesBadge ? { text: 'Novos Eps', color: 'bg-teal-500' } :
                null;

  return (
    <div 
      id={`movie-${movie.id}`} 
      onClick={onClick}
      className={`bg-brand-surface rounded-lg shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/50 cursor-pointer ${isInWatchedList ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}>
      <div className="relative">
        {isImgError || !movie.posterUrl ? (
           <div className="w-full h-96 bg-gray-700 flex flex-col items-center justify-center text-center p-4">
                <FilmIcon className="w-16 h-16 text-brand-muted mb-2" />
                <span className="text-gray-400 text-sm">Não foi possível carregar o pôster</span>
                <span className="text-white font-bold mt-1">{movie.title}</span>
            </div>
        ) : (
            <img 
                src={movie.posterUrl} 
                alt={`Pôster de ${movie.title}`} 
                className="w-full h-96 object-cover"
                referrerPolicy="no-referrer"
                onError={() => setIsImgError(true)}
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        
        {badge && (
            <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg animate-pulse ${badge.color}`}>
                {badge.text}
            </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={openTrailer}
              disabled={!movie.trailerUrl}
              className="p-2 rounded-full bg-black/50 text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Assistir ao trailer"
              title="Assistir ao trailer"
            >
              <PlayIcon className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => handleActionClick(e, onShareClick)}
              className="p-2 rounded-full bg-black/50 text-gray-300 hover:bg-sky-500 hover:text-white transition-colors duration-200"
              aria-label="Compartilhar"
              title="Compartilhar"
            >
              <ShareIcon className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => handleActionClick(e, onToggleWatchlist)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isInWatchlist ? 'bg-brand-accent text-white' : 'bg-black/50 text-gray-300 hover:bg-brand-accent hover:text-white'
              }`}
              aria-label={isInWatchlist ? 'Remover da lista' : 'Adicionar à lista'}
              title={isInWatchlist ? 'Remover da lista' : 'Adicionar à lista'}
            >
              <BookmarkIcon className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => handleActionClick(e, onToggleWatched)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isInWatchedList ? 'bg-amber-400 text-black' : 'bg-black/50 text-gray-300 hover:bg-amber-400 hover:text-black'
              }`}
              aria-label={isInWatchedList ? 'Desmarcar como assistido' : 'Marcar como assistido'}
              title={isInWatchedList ? 'Desmarcar como assistido' : 'Marcar como assistido'}
            >
              <CheckCircleIcon className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => handleActionClick(e, onToggleNotInterested)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isNotInterested ? 'bg-red-800 text-white' : 'bg-black/50 text-gray-300 hover:bg-gray-500 hover:text-white'
              }`}
              aria-label={isNotInterested ? 'Restaurar interesse' : 'Não tenho interesse'}
              title={isNotInterested ? 'Restaurar interesse' : 'Não tenho interesse'}
            >
              <NoSymbolIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="absolute bottom-0 left-0 p-4 w-full">
            <div className="flex items-center gap-2">
                <span className="bg-black/50 text-gray-300 text-xs font-semibold px-2 py-1 rounded">{movie.type === 'Movie' ? 'Filme' : 'Série'}</span>
                { movie.durationInMinutes > 0 && 
                  <span className="bg-black/50 text-gray-300 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                      <ClockIcon className="w-3 h-3"/>
                      {movie.durationInMinutes} min
                  </span>
                }
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">{movie.title} ({movie.year})</h2>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
         {movie.ratings.imdb > 0 && (
            <div className="flex justify-center items-center mb-4 pb-4 border-b-2 border-brand-accent/30">
                <div className="flex flex-col items-center">
                    <div className="flex items-baseline">
                        <span className="text-4xl font-black text-white">{movie.ratings.imdb.toFixed(1)}</span>
                        <span className="text-xl font-bold text-gray-400 ml-1">/ 10</span>
                    </div>
                    <div className="text-xs font-semibold tracking-wider text-gray-400 mt-1">AVALIAÇÃO IMDB</div>
                </div>
            </div>
         )}

        <p className="text-gray-300 text-sm mb-4 flex-grow">{movie.synopsis}</p>
        
        <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">ONDE ASSISTIR</h4>
            <div className="flex flex-wrap gap-2">
                {movie.availability?.flatrate && movie.availability.flatrate.length > 0 ? (
                     movie.availability.flatrate.map((provider) => (
                        <StreamingPill key={provider.provider_id} service={provider.provider_name} />
                    ))
                ) : (
                    <span className="text-gray-400 text-sm">{ movie.inTheaters ? 'Atualmente nos cinemas.' : 'Em breve nos streamings.'}</span>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
