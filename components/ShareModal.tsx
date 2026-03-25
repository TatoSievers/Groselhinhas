import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Movie } from '../types';
import { SpinnerIcon, XMarkIcon } from './Icons';

interface ShareModalProps {
  movie: Movie;
  onClose: () => void;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
};

export const ShareModal: React.FC<ShareModalProps> = ({ movie, onClose }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageBlobRef = useRef<Blob | null>(null);
  
  const [canShare, setCanShare] = useState(false);
  const [canCopy, setCanCopy] = useState(false);

  useEffect(() => {
    setCanShare(!!navigator.share);
    setCanCopy(!!navigator.clipboard && 'write' in navigator.clipboard);
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const generateImage = useCallback(async (currentReview: string, currentRating: number) => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const posterUrl = movie.posterUrl ? movie.posterUrl.replace('/w500/', '/w780/') : null;

    const splitTextIntoLines = (
        context: CanvasRenderingContext2D,
        text: string,
        maxWidth: number
    ): string[] => {
        const words = text.split(' ');
        if (words.length === 0 || text === '') return [];
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = context.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };


    try {
        const posterImg = posterUrl ? await loadImage(posterUrl) : null;
        
        // --- 1. Draw Base & Blurred Background ---
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, W, H);

        if (posterImg) {
            ctx.save();
            ctx.filter = 'blur(25px) brightness(0.5)';
            const hRatio = W / posterImg.width;
            const vRatio = H / posterImg.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerX = (W - posterImg.width * ratio) / 2;
            const centerY = (H - posterImg.height * ratio) / 2;
            ctx.drawImage(posterImg, 0, 0, posterImg.width, posterImg.height, centerX, centerY, posterImg.width * ratio, posterImg.height * ratio);
            ctx.restore();
        }

        let currentY = 150;

        // --- 2. Draw Title ---
        ctx.font = 'bold 80px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        
        const titleLines = splitTextIntoLines(ctx, movie.title, W - 120);
        titleLines.forEach((line) => {
            ctx.fillText(line, W / 2, currentY);
            currentY += 90;
        });
        currentY += 60;

        // --- 3. Draw Providers ---
        const providers = movie.availability?.flatrate?.slice(0, 4) || [];
        const providerLogos = await Promise.all(providers.map(async (p) => {
            if (p.logo_path) {
                try {
                   return await loadImage(`https://image.tmdb.org/t/p/w185${p.logo_path}`);
                } catch(e) {}
            }
            return null;
        }));
        
        const validLogos = providerLogos.filter(l => l !== null) as HTMLImageElement[];
        if (validLogos.length > 0) {
            const logoSize = 80;
            const spacing = 20;
            const totalWidth = (validLogos.length * logoSize) + ((validLogos.length - 1) * spacing);
            let startX = (W - totalWidth) / 2;
            
            validLogos.forEach(logo => {
                ctx.save();
                // Add soft shadow and rounded corners effect for the logos
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 10;
                ctx.drawImage(logo, startX, currentY, logoSize, logoSize);
                ctx.restore();
                startX += logoSize + spacing;
            });
            currentY += logoSize + 60;
        }

        // --- 3.5. Draw Rating ---
        if (currentRating > 0) {
            ctx.textBaseline = 'bottom';
            const ratingString = currentRating.toFixed(1);
            
            // Measure widths
            ctx.font = 'bold 120px sans-serif';
            const ratingWidth = ctx.measureText(ratingString).width;
            
            ctx.font = 'bold 50px sans-serif';
            const slashTen = '/ 10';
            const slashTenWidth = ctx.measureText(slashTen).width;
            
            const spacing = 15;
            const totalRatingWidth = ratingWidth + spacing + slashTenWidth;
            let currentX = (W - totalRatingWidth) / 2;
            
            ctx.textAlign = 'left';

            // Draw Rating number
            ctx.font = 'bold 120px sans-serif';
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(ratingString, currentX, currentY + 120);
            currentX += ratingWidth + spacing;
            
            // Draw '/ 10'
            ctx.font = 'bold 50px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(slashTen, currentX, currentY + 120);
            
            ctx.textAlign = 'center'; // Reset
            ctx.textBaseline = 'alphabetic'; // Reset
            currentY += 150;
        } else {
            currentY += 20;
        }

        // --- 4. Calculate Text & Poster Dimensions ---
        let textBlockHeight = 0;
        let reviewLines: string[] = [];
        const textPadding = 60;
        const textMaxWidth = W - 200;
        const lineHeight = 70;
        const footerHeight = 180;
        
        if (currentReview.trim()) {
            ctx.font = '55px sans-serif';
            reviewLines = splitTextIntoLines(ctx, currentReview.trim(), textMaxWidth);
            textBlockHeight = (reviewLines.length * lineHeight) + textPadding;
        }

        // --- 5. Draw Poster (Dynamically Sized) ---
        let posterH = 0;
        const posterY = currentY;
        
        if (posterImg) {
            const availableHeight = H - currentY - textBlockHeight - footerHeight - 80; // 80 for padding
            const posterMaxWidth = W - 160;
            const posterRatio = posterImg.width / posterImg.height;

            let posterW = posterMaxWidth;
            posterH = posterW / posterRatio;

            if (posterH > availableHeight) {
                posterH = availableHeight;
                posterW = posterH * posterRatio;
            }
            posterH = Math.max(300, posterH);

            const posterX = (W - posterW) / 2;
            
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 50;
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
            ctx.drawImage(posterImg, posterX, posterY, posterW, posterH);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 4;
            ctx.strokeRect(posterX, posterY, posterW, posterH);
            ctx.restore();
        } else {
            posterH = Math.min(400, H - currentY - textBlockHeight - footerHeight - 80);
        }

        // --- 6. Draw Review Text ---
        if (currentReview.trim()) {
            const boxHeightWithPadding = textBlockHeight;
            const boxWidth = textMaxWidth + textPadding * 1.5;
            const boxX = (W - boxWidth) / 2;

            // Vertically center the text block between the poster and the footer
            const posterBottom = posterY + posterH;
            const footerTop = H - footerHeight;
            const spaceBetween = footerTop - posterBottom;
            const boxY = posterBottom + (spaceBetween - boxHeightWithPadding) / 2;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            
            const radius = 30;
            ctx.beginPath();
            ctx.moveTo(boxX + radius, boxY);
            ctx.lineTo(boxX + boxWidth - radius, boxY);
            ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
            ctx.lineTo(boxX + boxWidth, boxY + boxHeightWithPadding - radius);
            ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeightWithPadding, boxX + boxWidth - radius, boxY + boxHeightWithPadding);
            ctx.lineTo(boxX + radius, boxY + boxHeightWithPadding);
            ctx.quadraticCurveTo(boxX, boxY + boxHeightWithPadding, boxX, boxY + boxHeightWithPadding - radius);
            ctx.lineTo(boxX, boxY + radius);
            ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.textAlign = 'center';
            const textStartY = boxY + (boxHeightWithPadding - (reviewLines.length - 1) * lineHeight) / 2;
            reviewLines.forEach((line, index) => {
                ctx.fillText(line, W / 2, textStartY + (index * lineHeight));
            });
        }
        
        // --- 7. Draw Footer ---
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        const footerText = "CRIADO E COMPARTILHADO PELO GROSELHINHAS, SEU NOVO APP DE FILMES E SÉRIES.";
        const footerLines = splitTextIntoLines(ctx, footerText, W - 160);
        
        const footerLineHeight = 45;
        const totalFooterTextHeight = footerLines.length * footerLineHeight;
        const footerCenterY = H - (footerHeight / 2) - 20; // Move up a bit for better balance
        let startFooterY = footerCenterY - (totalFooterTextHeight / 2) + (footerLineHeight / 2);

        footerLines.forEach((line, index) => {
            const y = startFooterY + (index * footerLineHeight);
            const words = line.split(' ');
            const totalLineWidth = ctx.measureText(line).width;
            let currentX = (W - totalLineWidth) / 2;
            
            ctx.textAlign = 'left'; // Align word by word
            words.forEach(word => {
                const wordWithSpace = word + ' ';
                const wordWidth = ctx.measureText(wordWithSpace).width;
                if (word.includes('GROSELHINHAS')) {
                    ctx.fillStyle = '#f59e0b';
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                }
                ctx.fillText(wordWithSpace, currentX, y);
                currentX += wordWidth;
            });
        });
        ctx.textAlign = 'center'; // Reset alignment

        // --- 8. Finalize ---
        canvas.toBlob((blob) => {
            if (blob) {
                if (generatedImage) URL.revokeObjectURL(generatedImage);
                imageBlobRef.current = blob;
                const url = URL.createObjectURL(blob);
                setGeneratedImage(url);
            }
        }, 'image/png', 0.95);

    } catch (error) {
        console.error("Failed to load images for canvas", error);
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, W, H);
        ctx.font = '40px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText("Erro ao gerar imagem", W/2, H/2);
    } finally {
        setIsGenerating(false);
    }
  }, [movie, generatedImage]);

  useEffect(() => {
    const timer = setTimeout(() => {
        generateImage(reviewText, rating);
    }, 250);
    return () => clearTimeout(timer);
  }, [reviewText, rating, generateImage]);
  
  const handleShare = async () => {
     if (!imageBlobRef.current || !canShare) return;
     const file = new File([imageBlobRef.current], `${movie.title.toLowerCase().replace(/ /g, '_')}_groselhinhas.png`, { type: 'image/png' });
     try {
        await navigator.share({
            files: [file],
            title: `Minha opinião sobre ${movie.title}`,
        });
    } catch (error) {
        if ((error as Error).name !== 'AbortError') {
           console.error('Error sharing:', error);
           setStatusMessage('Ocorreu um erro ao compartilhar.');
           setTimeout(() => setStatusMessage(''), 3000);
        }
    }
  };
  
  const handleDownload = () => {
      if (!generatedImage) return;
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `${movie.title.toLowerCase().replace(/ /g, '_')}_groselhinhas.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleCopy = async () => {
      if (!imageBlobRef.current || !canCopy) return;
      try {
        await navigator.clipboard.write([ new ClipboardItem({ 'image/png': imageBlobRef.current }) ]);
        setStatusMessage('Imagem copiada!');
        setTimeout(() => setStatusMessage(''), 2000);
      } catch (error) {
        setStatusMessage('Falha ao copiar.');
        setTimeout(() => setStatusMessage(''), 2000);
        console.error('Failed to copy image:', error);
      }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-brand-surface w-full max-w-xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 text-gray-300 hover:bg-brand-accent hover:text-white transition-colors"
          aria-label="Fechar modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto scrollbar-thin">
            {/* 1. Editing Module */}
            <div>
                <h2 className="text-3xl font-bold text-white">Compartilhar Indicação</h2>
                <p className="text-gray-400 mt-1">Sua opinião sobre: <span className="text-amber-400 font-semibold">{movie.title}</span></p>
            </div>
            
            <div className="space-y-5 my-6">
                <div>
                    <label htmlFor="rating-slider" className="text-sm font-semibold text-gray-300 flex items-center mb-2">
                        Sua nota (0 = sem nota)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            id="rating-slider"
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={rating}
                            onChange={(e) => setRating(parseFloat(e.target.value))}
                            className="w-full h-2 bg-brand-background/50 rounded-lg appearance-none cursor-pointer accent-brand-accent styled-slider"
                        />
                        <span className="font-bold text-xl text-white w-16 text-center bg-brand-background/50 py-1 rounded-md">
                            {rating > 0 ? rating.toFixed(1) : '-'}
                        </span>
                    </div>
                </div>
                 <div>
                    <label htmlFor="review-text" className="text-sm font-semibold text-gray-300 flex items-center mb-2">Sua opinião (opcional)</label>
                    <textarea
                        id="review-text"
                        rows={4}
                        maxLength={300}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Escreva um breve comentário..."
                        className="w-full bg-brand-background/50 border border-gray-600 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-colors resize-none"
                    />
                     <p className="text-xs text-right text-gray-500 mt-1">{reviewText.length} / 300</p>
                </div>
            </div>

            {/* 2. Image Preview (Arte Montada) */}
            <div className="w-full bg-brand-background flex items-center justify-center p-4 relative rounded-lg">
                 <canvas ref={canvasRef} className="hidden"></canvas>
                 {isGenerating && (!generatedImage) && (
                    <div className="flex flex-col items-center text-gray-400 h-96 justify-center">
                        <SpinnerIcon className="w-16 h-16 text-brand-accent"/>
                        <p className="mt-4">Gerando prévia...</p>
                    </div>
                 )}
                 {generatedImage && (
                     <img src={generatedImage} alt="Prévia da imagem de compartilhamento" className="w-full max-w-[270px] h-auto object-contain rounded-lg shadow-2xl shadow-black/50" style={{aspectRatio: '1080 / 1920'}}/>
                 )}
                 {isGenerating && generatedImage && <div className="absolute top-6 left-6"><SpinnerIcon className="w-8 h-8 text-white/80" /></div>}
            </div>

            {/* 3. CTAs */}
            <div className="flex flex-col gap-3 pt-6 mt-6 border-t border-gray-700/50">
                {canShare ? (
                    <button onClick={handleShare} disabled={isGenerating && !generatedImage} className="w-full bg-brand-accent hover:bg-amber-400 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        Compartilhar...
                    </button>
                ) : (
                   <div className="text-center text-sm text-gray-500 p-2 bg-gray-700/50 rounded-md">O compartilhamento nativo não é suportado neste navegador. Use as opções abaixo.</div>
                )}
                <button onClick={handleDownload} disabled={isGenerating && !generatedImage} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Baixar Imagem
                </button>
                {canCopy && (
                     <button onClick={handleCopy} disabled={isGenerating && !generatedImage} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {statusMessage || 'Copiar Imagem'}
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
