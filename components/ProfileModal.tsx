import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { XMarkIcon, SparklesIcon } from './Icons';
import { useGroselhinhas } from '../hooks/useGroselhinhas';

interface ProfileModalProps {
  onClose: () => void;
  session: any;
  letterboxdUsername: string;
  setLetterboxdUsername: (username: string) => void;
  syncLetterboxd: (username: string) => Promise<string>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
    onClose, 
    session, 
    letterboxdUsername, 
    setLetterboxdUsername,
    syncLetterboxd 
}) => {
  const [localUsername, setLocalUsername] = useState(letterboxdUsername);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    setLocalUsername(letterboxdUsername);
  }, [letterboxdUsername]);

  // Fechar usando Escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!session?.user) return null;
  const user = session.user;
  const avatarUrl = user.user_metadata?.avatar_url;

  const handleSaveAndSync = async () => {
    const trimmedUser = localUsername.trim();
    if (!trimmedUser) {
        setSyncError("Por favor, digite um username válido.");
        return;
    }
    setSyncError(null);
    setSyncMessage(null);
    setIsSyncing(true);

    try {
        // 1. Salvar no Supabase
        const { error } = await supabase
            .from('user_lists')
            .update({ letterboxd_username: trimmedUser })
            .eq('id', user.id);
            
        if (error) throw error;
        
        setLetterboxdUsername(trimmedUser);

        // 2. Chamar sincronização RSS
        const resultMsg = await syncLetterboxd(trimmedUser);
        setSyncMessage(`Sucesso! ${resultMsg}`);
    } catch (err: any) {
        setSyncError(err.message || "Ocorreu um erro ao salvar/sincronizar.");
    } finally {
        setIsSyncing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
        {/* Usamos onClick on the overlay but prevent bubbling from the modal itself */}
        <div className="absolute inset-0" onClick={onClose} />
        
        <div
            className="w-full max-w-md bg-brand-surface rounded-3xl shadow-2xl relative border border-white/10 p-6 sm:p-8 animate-slide-up z-10"
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
                    <img src={avatarUrl} alt="Avatar do Perfil" className="w-20 h-20 rounded-full border-2 border-brand-accent object-cover mb-4 shadow-lg shadow-amber-500/20" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-brand-accent/20 flex items-center justify-center border-2 border-brand-accent text-brand-accent text-3xl font-black mb-4">
                       {user.email?.charAt(0).toUpperCase()}
                    </div>
                )}
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1">Seu Perfil</h2>
                <p className="text-xs font-bold text-brand-accent px-2 py-0.5 rounded-md bg-brand-accent/10">{user.email}</p>
            </div>

            <div className="space-y-6">
                 {/* Letterboxd Integration */}
                 <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                     <div>
                        <h3 className="text-sm font-black text-[#00E054] tracking-widest uppercase mb-1 flex items-center gap-2">
                            Integração Letterboxd
                            <SparklesIcon className="w-4 h-4" />
                        </h3>
                        <p className="text-xs text-gray-400">
                            Preencha seu nome de usuário (ex: <span className="text-white italic">dave</span>) para sincronizar automaticamente seus <strong className="text-gray-300">Assistidos</strong> e <strong className="text-gray-300">Watchlist</strong> públicos.
                        </p>
                     </div>

                     <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 rounded-xl bg-white/5 text-gray-400 text-sm border-r border-white/5 font-mono">
                            letterboxd.com/
                        </span>
                        <input 
                            type="text" 
                            name="letterboxd_username"
                            value={localUsername} 
                            onChange={(e) => setLocalUsername(e.target.value)}
                            placeholder="username"
                            className="bg-brand-background/50 border border-white/10 text-white rounded-xl p-3 flex-1 min-w-0 focus:outline-none focus:border-[#00E054] focus:ring-1 focus:ring-[#00E054] transition-colors"
                        />
                     </div>

                     <button 
                         onClick={handleSaveAndSync}
                         disabled={isSyncing || !localUsername.trim()}
                         className="w-full py-3 rounded-xl bg-[#00E054] hover:bg-[#00E054]/90 text-black font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                     >
                         {isSyncing ? (
                             <>
                               <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                               Sincronizando...
                             </>
                         ) : 'Salvar e Sincronizar'}
                     </button>
                     
                     {syncError && <p className="text-xs text-red-400 mt-2 font-semibold bg-red-500/10 p-2 rounded-lg">{syncError}</p>}
                     {syncMessage && <p className="text-xs text-[#00E054] mt-2 font-semibold bg-[#00E054]/10 p-2 rounded-lg">{syncMessage}</p>}
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
