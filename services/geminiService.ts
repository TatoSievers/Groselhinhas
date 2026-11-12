/// <reference types="vite/client" />

// A chave do Gemini NÃO vive mais aqui.
// Este módulo só fala com a Edge Function `gemini-chat` do Supabase,
// que guarda a chave no servidor. Ver supabase/functions/gemini-chat/index.ts

const FALLBACK = '{"message": "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.", "recommendations": []}';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const chatWithAssistant = async (message: string, history: any[]): Promise<string> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes. Confira o seu .env');
    return FALLBACK;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gemini-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      console.error('gemini-chat respondeu', response.status);
      return FALLBACK;
    }

    const data = await response.json();
    return data.text || FALLBACK;
  } catch (error) {
    console.error('Error chatting with assistant:', error);
    return FALLBACK;
  }
};
