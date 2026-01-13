import React, { useEffect } from 'react';
import { XMarkIcon } from './Icons';

interface TrailerModalProps {
    trailerUrl: string;
    onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ trailerUrl, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Extract video ID from URL
    const getVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getVideoId(trailerUrl);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in bg-black/90 backdrop-blur-md" onClick={onClose}>
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-all border border-white/10"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                {videoId ? (
                    <iframe
                        title="Trailer"
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                ) : (
                    <div className="flex items-center justify-center h-full text-white">
                        <p>Trailer indisponível ou URL inválida.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
