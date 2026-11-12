// Edge Function: busca notas agregadas na OMDb.
//
// A OMDb devolve IMDb, Rotten Tomatoes e Metacritic numa chamada só.
// A chave fica aqui no servidor, nunca no navegador.
//
// Deploy:
//   supabase secrets set OMDB_API_KEY=sua_chave
//   supabase functions deploy ratings

const OMDB_URL = 'https://www.omdbapi.com/';

// A conta gratuita da OMDb permite 1.000 chamadas por dia, e cada título
// custa uma chamada. O teto por requisição evita queimar a cota de uma vez.
const MAX_IDS_POR_CHAMADA = 30;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Notas = {
  imdb: number | null;
  rottenTomatoes: number | null;
  metacritic: number | null;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// A OMDb devolve as notas como texto: "8.8/10", "87%", "74/100".
function extrairNotas(data: any): Notas {
  const lista: Array<{ Source?: string; Value?: string }> = data?.Ratings ?? [];

  const achar = (fonte: string) =>
    lista.find((r) => r.Source === fonte)?.Value ?? null;

  const imdbTexto = data?.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : null;
  const rtTexto = achar('Rotten Tomatoes');
  const mcTexto = data?.Metascore && data.Metascore !== 'N/A' ? data.Metascore : null;

  const numero = (texto: string | null) => {
    if (!texto) return null;
    const n = parseFloat(texto.replace('%', ''));
    return Number.isFinite(n) ? n : null;
  };

  return {
    imdb: numero(imdbTexto),
    rottenTomatoes: numero(rtTexto),
    metacritic: numero(mcTexto),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = Deno.env.get('OMDB_API_KEY');
  if (!apiKey) {
    console.error('OMDB_API_KEY não configurada. Rode: supabase secrets set OMDB_API_KEY=...');
    return json({ error: 'Serviço indisponível' }, 503);
  }

  let imdbIds: unknown;
  try {
    ({ imdbIds } = await req.json());
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  if (!Array.isArray(imdbIds)) {
    return json({ error: 'Campo "imdbIds" deve ser uma lista' }, 400);
  }

  // Só ids no formato do IMDb (tt + dígitos), sem repetição, dentro do teto.
  const ids = [...new Set(imdbIds)]
    .filter((id): id is string => typeof id === 'string' && /^tt\d+$/.test(id))
    .slice(0, MAX_IDS_POR_CHAMADA);

  if (ids.length === 0) return json({ ratings: {} });

  const resultados = await Promise.all(
    ids.map(async (id) => {
      try {
        const url = `${OMDB_URL}?i=${id}&apikey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) return [id, null] as const;

        const data = await res.json();
        if (data?.Response === 'False') {
          // Resposta mais comum aqui: "Daily request limit reached!"
          console.warn(`OMDb recusou ${id}: ${data?.Error}`);
          return [id, null] as const;
        }
        return [id, extrairNotas(data)] as const;
      } catch (e) {
        console.error(`Falha ao buscar ${id}:`, e);
        return [id, null] as const;
      }
    })
  );

  const ratings: Record<string, Notas> = {};
  for (const [id, notas] of resultados) {
    if (notas) ratings[id] = notas;
  }

  return json({ ratings });
});
