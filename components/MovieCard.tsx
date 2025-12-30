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
      className={`group relative bg-gray-900 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-accent/10 cursor-pointer ${isInWatchedList ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}>
      
      {/* Poster Image */}
      <div className="aspect-[2/3] overflow-hidden">
        {isImgError || !movie.posterUrl ? (
           <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center text-center p-6">
                <FilmIcon className="w-12 h-12 text-gray-600 mb-3" />
                <span className="text-white font-bold text-lg leading-tight">{movie.title}</span>
            </div>
        ) : (
            <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
                onError={() => setIsImgError(true)}
                loading="lazy"
            />
        )}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 movie-card-gradient flex flex-col justify-end p-5">
        <div className="flex items-center justify-between mb-2">
           <div className="flex gap-1.5">
             {isNewRelease && (
                <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Estreia</span>
             )}
             <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">{movie.type === 'Movie' ? 'Filme' : 'Série'}</span>
           </div>
           {movie.ratings.imdb > 0 && (
              <div className="flex items-center bg-black/40 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                <span className="text-amber-400 font-black text-xs">{movie.ratings.imdb.toFixed(1)}</span>
                <span className="text-white/60 text-[10px] ml-0.5 font-bold">IMDB</span>
              </div>
           )}
        </div>
        
        <h2 className="text-xl font-extrabold text-white leading-tight mb-1 group-hover:text-brand-accent transition-colors">
          {movie.title}
        </h2>
        
        <div className="flex items-center text-gray-400 text-xs font-medium space-x-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
           <span>{movie.year}</span>
           {movie.durationInMinutes > 0 && <span>• {movie.durationInMinutes}min</span>}
        </div>
      </div>

      {/* Quick Actions (Floating on Hover) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={(e) => handleActionClick(e, onToggleWatchlist)}
            className={`p-2.5 rounded-xl backdrop-blur-xl border border-white/10 transition-all hover:scale-110 ${
              isInWatchlist ? 'bg-brand-accent text-brand-background' : 'bg-black/60 text-white hover:bg-brand-accent hover:text-brand-background'
            }`}
          >
            <BookmarkIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => handleActionClick(e, onShareClick)}
            className="p-2.5 rounded-xl backdrop-blur-xl bg-black/60 border border-white/10 text-white hover:bg-white hover:text-black transition-all hover:scale-110"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => handleActionClick(e, onToggleNotInterested)}
            className={`p-2.5 rounded-xl backdrop-blur-xl border border-white/10 transition-all hover:scale-110 ${
              isNotInterested ? 'bg-red-500 text-white' : 'bg-black/60 text-white hover:bg-red-500'
            }`}
          >
            <NoSymbolIcon className="w-5 h-5" />
          </button>
      </div>
    </div>
  );
};