
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

  const releaseDate = new Date(movie.releaseDate);
  const today = new Date();
  const isNewRelease = movie.type === 'Movie' && releaseDate.getFullYear() === today.getFullYear() && releaseDate.getMonth() >= today.getMonth() - 1;

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-gray-900 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-brand-accent/10 cursor-pointer ${isInWatchedList ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}>
      
      {/* Poster Image - Rollover apenas aqui */}
      <div className="aspect-[2/3] overflow-hidden bg-gray-800">
        {isImgError || !movie.posterUrl ? (
           <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                <FilmIcon className="w-12 h-12 text-gray-600 mb-3" />
                <span className="text-white font-bold text-lg leading-tight">{movie.title}</span>
            </div>
        ) : (
            <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                referrerPolicy="no-referrer"
                onError={() => setIsImgError(true)}
                loading="lazy"
            />
        )}
      </div>

      {/* Overlay de Conteúdo Gradiente */}
      <div className="absolute inset-0 movie-card-gradient flex flex-col justify-end p-3 md:p-5 pointer-events-none">
        <div className="flex items-center justify-between mb-1.5 md:mb-2">
           <div className="flex gap-1">
             {isNewRelease && (
                <span className="bg-amber-400 text-black text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Estreia</span>
             )}
             <span className="bg-white/10 backdrop-blur-md text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{movie.type === 'Movie' ? 'Filme' : 'Série'}</span>
           </div>
           {movie.ratings.imdb > 0 && (
              <div className="flex items-center bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10">
                <span className="text-amber-400 font-black text-[10px] md:text-xs">{movie.ratings.imdb.toFixed(1)}</span>
                <span className="text-white/60 text-[8px] ml-0.5 font-black uppercase tracking-tighter">IMDb</span>
              </div>
           )}
        </div>
        
        <h2 className="text-base md:text-xl font-extrabold text-white leading-tight mb-0.5 md:mb-1 group-hover:text-brand-accent transition-colors line-clamp-2">
          {movie.title}
        </h2>
        
        <div className="flex items-center text-gray-400 text-[10px] md:text-xs font-medium space-x-2 md:space-x-3">
           <span>{movie.year}</span>
           {movie.durationInMinutes > 0 && <span className="hidden xs:inline">• {movie.durationInMinutes}min</span>}
        </div>
      </div>

      {/* Ações Rápidas (Sempre Visíveis em Dispositivos Móveis ou em Hover no Desktop) */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 flex flex-col gap-1.5 md:gap-2 transition-all duration-300">
          <button
            onClick={(e) => handleActionClick(e, onToggleWatchlist)}
            className={`p-2 md:p-2.5 rounded-lg md:rounded-xl backdrop-blur-xl border border-white/10 transition-all hover:scale-110 active:scale-95 ${
              isInWatchlist ? 'bg-white text-black' : 'bg-black/60 text-white hover:bg-white hover:text-black'
            }`}
          >
            <BookmarkIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={(e) => handleActionClick(e, onShareClick)}
            className="p-2 md:p-2.5 rounded-lg md:rounded-xl backdrop-blur-xl bg-black/60 border border-white/10 text-white hover:bg-white hover:text-black transition-all hover:scale-110 active:scale-95"
          >
            <ShareIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={(e) => handleActionClick(e, onToggleNotInterested)}
            className={`p-2 md:p-2.5 rounded-lg md:rounded-xl backdrop-blur-xl border border-white/10 transition-all hover:scale-110 active:scale-95 ${
              isNotInterested ? 'bg-red-500 text-white' : 'bg-black/60 text-white hover:bg-red-500'
            }`}
          >
            <NoSymbolIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
      </div>
    </div>
  );
};
