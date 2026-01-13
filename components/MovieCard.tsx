
import React from 'react';
import { Movie } from '../types';
import { BookmarkIcon, CheckCircleIcon, PlayIcon, FilmIcon, NoSymbolIcon, ShareIcon } from './Icons';

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
  onPlayTrailer: (url: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onToggleWatchlist,
  isInWatchlist,
  onToggleWatched,
  isInWatchedList,
  onClick,
  onToggleNotInterested,
  isNotInterested,
  onShareClick,
  onPlayTrailer
}) => {
  const [isImgError, setIsImgError] = React.useState(false);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const releaseDate = new Date(movie.releaseDate);
  const today = new Date();
  const isNewRelease = movie.type === 'Movie' && releaseDate.getFullYear() === today.getFullYear() && releaseDate.getMonth() >= today.getMonth() - 1;

  const getStatusTag = () => {
    if (isNewRelease) return { text: 'LANÇAMENTO', color: 'bg-red-600', animate: true };
    if (movie.type === 'Series') return { text: 'SÉRIE', color: 'bg-purple-600', animate: false };
    return { text: 'FILME', color: 'bg-blue-600', animate: false };
  };

  const status = getStatusTag();

  return (
    <div
      onClick={onClick}
      className={`group relative bg-gray-900 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-brand-accent/20 cursor-pointer ${isInWatchedList ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}
    >

      {/* Container Principal da Imagem */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {isImgError || !movie.posterUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gray-800">
            <FilmIcon className="w-12 h-12 text-gray-600 mb-3" />
            <span className="text-white font-bold text-lg leading-tight">{movie.title}</span>
          </div>
        ) : (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={() => setIsImgError(true)}
            loading="lazy"
          />
        )}

        {/* 1) Tag Superior Esquerdo com Micro Animação */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-lg ${status.color} text-white`}>
            {status.animate && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            )}
            <span className="text-[10px] font-black uppercase tracking-wider">{status.text}</span>
          </div>
        </div>

        {/* 2) Action Bar Lateral Direita - Sempre Visível ou no Hover (dependendo da preferência, aqui no hover para desktop, sempre no mobile se quiser) */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 translate-x-0 md:translate-x-14 md:group-hover:translate-x-0 transition-transform duration-300 z-20">

          {/* Botão Play (Trailer) */}
          {movie.trailerUrl && (
            <button
              onClick={(e) => handleActionClick(e, () => onPlayTrailer(movie.trailerUrl))}
              className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-brand-accent hover:border-brand-accent hover:text-black transition-all shadow-lg hover:scale-110 flex items-center justify-center" title="Ver Trailer">
              <PlayIcon className="w-5 h-5" />
            </button>
          )}

          {/* Compartilhar */}
          <button
            onClick={(e) => handleActionClick(e, onShareClick)}
            className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white hover:text-black transition-all shadow-lg hover:scale-110" title="Compartilhar">
            <ShareIcon className="w-5 h-5" />
          </button>

          {/* Quero Ver */}
          <button
            onClick={(e) => handleActionClick(e, onToggleWatchlist)}
            className={`p-3 rounded-full backdrop-blur-xl border border-white/20 transition-all shadow-lg hover:scale-110 ${isInWatchlist ? 'bg-brand-accent text-black border-brand-accent' : 'bg-white/10 text-white hover:bg-brand-accent hover:text-black hover:border-brand-accent'
              }`}
            title="Quero Ver"
          >
            <BookmarkIcon className="w-5 h-5" />
          </button>

          {/* Já Vi */}
          <button
            onClick={(e) => handleActionClick(e, onToggleWatched)}
            className={`p-3 rounded-full backdrop-blur-xl border border-white/20 transition-all shadow-lg hover:scale-110 ${isInWatchedList ? 'bg-green-500 text-white border-green-500' : 'bg-white/10 text-white hover:bg-green-500 hover:text-white hover:border-green-500'
              }`}
            title="Já Vi"
          >
            <CheckCircleIcon className="w-5 h-5" />
          </button>

          {/* Não Me Interessa */}
          <button
            onClick={(e) => handleActionClick(e, onToggleNotInterested)}
            className={`p-3 rounded-full backdrop-blur-xl border border-white/20 transition-all shadow-lg hover:scale-110 ${isNotInterested ? 'bg-red-500 text-white border-red-500' : 'bg-white/10 text-white hover:bg-red-500 hover:text-white hover:border-red-500'
              }`}
            title="Não Me Interessa"
          >
            <NoSymbolIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Gradiente Inferior para Texto */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"></div>

        {/* Conteúdo Sobreposto na Imagem (Título) */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
          <h2 className="text-xl font-black text-white leading-tight drop-shadow-md mb-1">{movie.title}</h2>
          <p className="text-xs text-gray-300 font-medium">
            {movie.year}
            {movie.durationInMinutes > 0 && <span> • {movie.durationInMinutes} min</span>}
          </p>
        </div>

      </div>

      {/* 3) Área Inferior: Nota, Resumo e Onde Assistir */}
      <div className="p-4 bg-gray-900 border-t border-white/5">

        {/* Nota IMDb */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded text-yellow-500">
            <span className="font-black text-sm mr-1">{movie.ratings.imdb.toFixed(1)}</span>
            <span className="text-[10px] font-bold uppercase">IMDb</span>
          </div>
          {/* Poderíamos adicionar estrelas aqui se quiséssemos algo mais visual */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
              <div key={star} className={`w-1.5 h-1.5 rounded-full ${movie.ratings.imdb >= star * 2 ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
            ))}
          </div>
        </div>

        {/* Resumo */}
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4 font-medium">
          {movie.synopsis || "Sinopse não disponível."}
        </p>

        {/* Tags de Onde Assistir (Mercado Brasileiro) */}
        <div className="flex flex-wrap gap-2">
          {movie.availability?.flatrate ? (
            movie.availability.flatrate.slice(0, 3).map(provider => (
              <div key={provider.provider_id} className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                <img src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} alt={provider.provider_name} className="w-3 h-3 rounded-full" />
                <span className="text-[9px] font-bold text-gray-300 uppercase">{provider.provider_name}</span>
              </div>
            ))
          ) : (
            <span className="text-[10px] text-gray-600 font-medium italic">Não disponível em streaming</span>
          )}
        </div>

      </div>
    </div>
  );
};
