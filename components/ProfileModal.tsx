import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { XMarkIcon, SparklesIcon, FileIcon, ExclamationTriangleIcon } from './Icons';

interface ProfileModalProps {
  onClose: () => void;
  session: any;
  importLetterboxdCSV: (file: File, type: 'watched' | 'watchlist', onProgress: (current: number, total: number) => void) => Promise<{ imported: number, notFound: number }>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
    onClose, 
    session, 
    importLetterboxdCSV 
}) => {
  const [importingType, setImportingType] = useState<'watched' | 'watchlist' | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [summary, setSummary] = useState<{ imported: number, notFound: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fechar usando Escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!session?.user) return null;
  const user = session.user;
  const avatarUrl = user.user_metadata?.avatar_url;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'watched' | 'watchlist') => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate filename
      if (!file.name.toLowerCase().endsWith('.csv')) {
          setError("Por favor, selecione um arquivo .csv válido.");
          return;
      }

      setError(null);
      setSummary(null);
      setImportingType(type);
      setProgress({ current: 0, total: 0 });

      try {
          const result = await importLetterboxdCSV(file, type, (current, total) => {
              setProgress({ current, total });
          });
          setSummary(result);
      } catch (err: any) {
          setError(err.message || "Erro ao processar o arquivo.");
      } finally {
          setImportingType(null);
      }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
        <div className="absolute inset-0" onClick={onClose} />
        
        <div
            className="w-full max-w-lg bg-brand-surface rounded-3xl shadow-2xl relative border border-white/10 p-6 sm:p-8 animate-slide-up z-10 max-h-[90vh] overflow-y-auto no-scrollbar"
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-gray-300 hover:bg-white hover:text-black transition-colors"
                title="Fechar"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center mb-6">
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-brand-accent object-cover mb-4" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-brand-accent/20 flex items-center justify-center border-2 border-brand-accent text-brand-accent text-3xl font-black mb-4">
                       {user.email?.charAt(0).toUpperCase()}
                    </div>
                )}
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1">Seu Perfil</h2>
                <p className="text-xs font-bold text-brand-accent px-2 py-0.5 rounded-md bg-brand-accent/10">{user.email}</p>
            </div>

            <div className="space-y-6">
                 <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                     <div>
                        <h3 className="text-sm font-black text-[#00E054] tracking-widest uppercase mb-3 flex items-center gap-2">
                            Importar do Letterboxd
                            <SparklesIcon className="w-4 h-4" />
                        </h3>
                        
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                            <h4 className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-wider mb-2">
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                Por que preciso exportar um arquivo?
                            </h4>
                            <p className="text-[11px] text-gray-300 leading-relaxed">
                                O Letterboxd utiliza o Cloudflare para proteger seus dados, o que impede que aplicativos externos acessem suas listas automaticamente. Por isso, a importação é feita via arquivo CSV — o método oficial e seguro fornecido pelo próprio Letterboxd. Seus dados nunca são enviados para nenhum servidor: tudo acontece direto no seu navegador.
                            </p>
                        </div>

                        <div className="space-y-3 mb-6">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Como importar:</h4>
                            <ol className="text-[11px] text-gray-400 space-y-2 list-decimal list-inside">
                                <li>Acesse <a href="https://letterboxd.com/settings/data/" target="_blank" rel="noreferrer" className="text-brand-accent underline">letterboxd.com/settings/data</a> enquanto estiver logado</li>
                                <li>Clique em <strong className="text-gray-200">"Export Your Data"</strong> e aguarde o e-mail</li>
                                <li>Baixe o arquivo ZIP e descompacte</li>
                                <li>Importe os arquivos <strong className="text-gray-200">"watched.csv"</strong> e <strong className="text-gray-200">"watchlist.csv"</strong> aqui abaixo</li>
                            </ol>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="relative">
                                <input 
                                    type="file" 
                                    id="watched-csv" 
                                    accept=".csv"
                                    onChange={(e) => handleFileChange(e, 'watched')}
                                    className="hidden"
                                    disabled={!!importingType}
                                />
                                <label 
                                    htmlFor="watched-csv"
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${importingType === 'watched' ? 'border-[#00E054] bg-[#00E054]/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                                >
                                    <FileIcon className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-[10px] font-black uppercase text-center text-white">Importar Filmes Assistidos</span>
                                </label>
                            </div>

                            <div className="relative">
                                <input 
                                    type="file" 
                                    id="watchlist-csv" 
                                    accept=".csv"
                                    onChange={(e) => handleFileChange(e, 'watchlist')}
                                    className="hidden"
                                    disabled={!!importingType}
                                />
                                <label 
                                    htmlFor="watchlist-csv"
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${importingType === 'watchlist' ? 'border-[#00E054] bg-[#00E054]/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                                >
                                    <FileIcon className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-[10px] font-black uppercase text-center text-white">Importar Watchlist</span>
                                </label>
                            </div>
                        </div>

                        {importingType && (
                            <div className="mt-4 p-4 bg-white/5 rounded-xl text-center">
                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-white mb-2">
                                    <div className="w-3 h-3 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                                    Importando ({importingType === 'watched' ? 'Assistidos' : 'Watchlist'})...
                                </div>
                                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-brand-accent transition-all duration-300" 
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 font-mono">{progress.current} / {progress.total}</p>
                            </div>
                        )}

                        {summary && (
                            <div className="mt-4 p-4 bg-[#00E054]/10 border border-[#00E054]/20 rounded-xl text-center">
                                <p className="text-xs font-black text-[#00E054] uppercase tracking-wide">
                                    ✅ {summary.imported} filmes importados, {summary.notFound} não encontrados
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                <p className="text-xs font-bold text-red-500">{error}</p>
                            </div>
                        )}
                     </div>
                 </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-white/5 text-center">
                <button
                  onClick={() => { onClose(); supabase.auth.signOut(); }}
                  className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
                >
                  Fazer Logout
                </button>
            </div>
        </div>
    </div>
  );
};
