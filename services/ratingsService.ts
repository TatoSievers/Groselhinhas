/// <reference types="vite/client" />

// Cliente da Edge Function `ratings`.
// A chave da OMDb vive no servidor — ver supabase/functions/ratings/index.ts

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export type NotasAgregadas = {
  imdb: number | null;
  rottenTomatoes: number | null;
  metacritic: number | null;
};

/**
 * Busca as notas de vários títulos de uma vez.
 * Devolve um mapa imdbId -> notas. Ids sem resposta simplesmente não aparecem.
 */
export const buscarNotas = async (
  imdbIds: string[]
): Promise<Record<string, NotasAgregadas>> => {
  if (imdbIds.length === 0) return {};

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes. Confira o seu .env');
    return {};
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ imdbIds }),
    });

    if (!response.ok) {
      console.error('ratings respondeu', response.status);
      return {};
    }

    const data = await response.json();
    return data.ratings ?? {};
  } catch (error) {
    console.error('Falha ao buscar notas:', error);
    return {};
  }
};
