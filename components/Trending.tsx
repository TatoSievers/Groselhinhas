
import React from 'react';
import { Movie } from '../types';
import { FilmIcon, StarIcon } from './Icons';

interface TrendingProps {
  trendingMovies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const TrendingCard: React.FC<{ movie: Movie; onClick: () => void; }> = ({ movie, onClick }) => {
  const [isImgError, setIsImgError] = React.useState(false);

  return (
    <div onClick={onClick} className="block flex-shrink-0 w-48 group cursor-pointer">
      <div className="relative rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 group-hover:scale-105 bg-gray-700">
        {isImgError || !movie.posterUrl ? (
          <div className="w-full h-72 flex flex-col items-center justify-center text-center p-2">
            <FilmIcon className="w-12 h-12 text-brand-muted mb-2" />
            <span className="text-white font-bold text-sm">{movie.title}</span>
          </div>
        ) : (
          <>
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              className="w-full h-72 object-cover"
              referrerPolicy="no-referrer"
              onError={() => setIsImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-3 w-full">
              <h3 className="text-white font-bold truncate">{movie.title}</h3>
              {movie.ratings.imdb > 0 && (
                <div className="flex items-center text-sm text-yellow-400 font-bold">
                    <StarIcon className="w-4 h-4 mr-1 fill-current"/>
                    {movie.ratings.imdb.toFixed(1)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};


export const Trending: React.FC<TrendingProps> = ({ trendingMovies, onMovieClick }) => {
  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold text-white mb-4 pl-1">Tendências da Semana</h2>
      <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 scrollbar-thin">
        {trendingMovies.map((movie) => (
          <TrendingCard movie={movie} key={movie.id} onClick={() => onMovieClick(movie)} />
        ))}
        <div className="flex-shrink-0 w-1"></div>
      </div>
    </div>
  );
};