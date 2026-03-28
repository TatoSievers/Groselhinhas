
import React, { useEffect, useState } from 'react';
import { Movie, Provider } from '../types';
import { BookmarkIcon, PlayIcon, ShareIcon, NoSymbolIcon, EyeIcon, Bars3Icon, XMarkIcon, ClockIcon, SparklesIcon, MusicClefIcon, CheckCircleIcon, ArrowLeftIcon } from './Icons';
import { CreditCard } from './CreditCard';

interface ModalProps {
  movie: Movie;
  onClose: () => void;
  onRecommendationClick: (movie: Movie) => void;
  onToggleWatchlist: () => void;
  isInWatchlist: boolean;
  onToggleWatched: () => void;
  isInWatchedList: boolean;
  isNotInterested: boolean;
  onToggleNotInterested: () => void;
  isFetchingDetails: boolean;
  onShareClick: () => void;
}

const ProviderIcon: React.FC<{ provider: Provider }> = ({ provider }) => (
  <div className="flex items-center p-2 rounded-xl bg-white/5 border border-white/10" title={provider.provider_name}>
    <img 
      src={`https://image.tmdb.org/t/p/w185${provider.logo_path}`} 
      alt={provider.provider_name} 
      className="w-10 h-10 rounded-lg object-cover" 
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
  isNotInterested,
  onToggleNotInterested,
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
      className="fixed inset-0 z-[60] flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Fundo ultra escuro imersivo */}
      <div className="absolute inset-0 bg-[#030712]/98 backdrop-blur-3xl"></div>
      
      <div
        className="w-full h-full md:max-w-2xl md:h-[95vh] md:rounded-[2.5rem] bg-[#030712] flex flex-col overflow-hidden relative shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header de Controle Superior */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6">
             <button onClick={onClose} className="p-2 rounded-full bg-black/40 backdrop-blur-xl text-white border border-white/10 hover:bg-white hover:text-black transition-all">
                <ArrowLeftIcon className="w-6 h-6" />
             </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
            {/* ÁREA DO POSTER - FIEL À REFERÊNCIA */}
            <div className="relative w-full aspect-[4/5] flex-shrink-0">
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                />
                
                {/* Overlay Gradiente Inferior para o Título */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/20 to-transparent"></div>

                {/* BOTÕES DE AÇÃO FLUTUANTES (STACK VERTICAL À DIREITA) */}
                <div className="absolute top-12 right-6 flex flex-col gap-4 items-center">
                    <button 
                        onClick={openTrailer} 
                        disabled={!movie.trailerUrl}
                        className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl text-white border border-white/10 active:scale-90 transition-all disabled:opacity-20"
                    >
                        <PlayIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://open.spotify.com/search/${encodeURIComponent(movie.title + ' soundtrack')}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl text-white border border-white/10 active:scale-90 transition-all"
                    >
                        <MusicClefIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={onShareClick}
                        className="p-3.5 rounded-full bg-black/40 backdrop-blur-xl text-white border border-white/10 active:scale-90 transition-all"
                    >
                        <ShareIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={onToggleWatchlist}
                        className={`p-3.5 rounded-full backdrop-blur-xl border border-white/10 active:scale-90 transition-all ${isInWatchlist ? 'bg-white text-black' : 'bg-black/40 text-white'}`}
                    >
                        <BookmarkIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={onToggleWatched}
                        className={`p-3.5 rounded-full backdrop-blur-xl border border-white/10 active:scale-90 transition-all ${isInWatchedList ? 'bg-emerald-500 text-white' : 'bg-black/40 text-white'}`}
                    >
                        <CheckCircleIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={onToggleNotInterested}
                        className={`p-3.5 rounded-full backdrop-blur-xl border border-white/10 active:scale-90 transition-all ${isNotInterested ? 'bg-red-500 text-white' : 'bg-black/40 text-white'}`}
                    >
                        <NoSymbolIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* TEXTO DO POSTER (TÍTULO E ANO) */}
                <div className="absolute bottom-6 left-8 right-8">
                    <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">
                        {movie.type === 'Movie' ? 'Filme' : 'Série'}
                    </p>
                    <h2 className="text-4xl font-black text-white tracking-tighter leading-none">
                        {movie.title} ({movie.year})
                    </h2>
                </div>
            </div>

            {/* ÁREA DE CONTEÚDO (SCROLL) */}
            <div className="px-8 pb-20 space-y-12 bg-[#030712]">
                
                {/* BLOCO DE NOTA IMDB - IGUAL À IMAGEM */}
                <div className="pt-10 flex flex-col items-center">
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-7xl font-black text-white tracking-tighter">
                            {movie.ratings.imdb > 0 ? movie.ratings.imdb.toFixed(1) : 'N/A'}
                        </span>
                        <span className="text-3xl font-bold text-white/30">/ 10</span>
                    </div>
                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] mt-3">AVALIAÇÃO IMDB</p>
                    
                {/* Divisor Sutil */}
                    <div className="w-full max-w-[200px] h-[1px] bg-white/10 mt-12"></div>
                </div>

                {/* SINOPSE */}
                <div className="animate-fade-in-up">
                    <p className="text-xl text-white/80 leading-relaxed font-medium">
                        {movie.synopsis}
                    </p>
                </div>

                {/* ONDE ASSISTIR - ESTILIZADO */}
                <div className="space-y-6 pt-4 border-t border-white/5">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">ONDE ASSISTIR</h3>
                    <div className="flex flex-wrap gap-4">
                        {movie.availability?.flatrate && movie.availability.flatrate.length > 0 ? (
                            movie.availability.flatrate.map(p => <ProviderIcon key={p.provider_id} provider={p} />)
                        ) : (
                            <p className="text-lg font-semibold text-white/40 italic">Em breve nos streamings.</p>
                        )}
                    </div>
                </div>

                {/* TRILHA SONORA */}
                <div className="space-y-6 pt-4 border-t border-white/5">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">TRILHA SONORA</h3>
                    <a 
                        href={`https://open.spotify.com/search/${encodeURIComponent(movie.title + ' soundtrack')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954] hover:text-black font-black uppercase tracking-wider transition-all"
                    >
                        <MusicClefIcon className="w-5 h-5" />
                        Buscar no Spotify
                    </a>
                </div>

                {/* ELENCO */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">ELENCO PRINCIPAL</h3>
                    <div className="flex overflow-x-auto space-x-6 pb-2 no-scrollbar">
                        {movie.director && <CreditCard person={movie.director} />}
                        {movie.cast.slice(0, 10).map(person => <CreditCard key={person.id} person={person} />)}
                    </div>
                </div>

                {/* RECOMENDAÇÕES */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">VOCÊ TAMBÉM PODE GOSTAR</h3>
                    <div className="flex overflow-x-auto space-x-4 pb-4 no-scrollbar">
                        {movie.recommendations.map(rec => (
                            <div 
                                key={rec.id} 
                                onClick={() => onRecommendationClick(rec)} 
                                className="flex-shrink-0 w-32 group cursor-pointer"
                            >
                                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/5 transition-transform group-hover:scale-105">
                                    {rec.posterUrl && <img src={rec.posterUrl} alt="" className="w-full h-full object-cover"/>}
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest mt-3 text-white/20 truncate group-hover:text-white transition-colors">{rec.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
