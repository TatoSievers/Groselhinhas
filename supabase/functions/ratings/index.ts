// Edge Function: busca notas agregadas na OMDb.
//
// A OMDb devolve IMDb, Rotten Tomatoes e Metacritic numa chamada só.
// A chave fica aqui no servidor, nunca no navegador.
//
// Deploy:
//   supabase secrets set OMDB_API_KEY=sua_chave
//   supabase functions deploy ratings

// HTTP, nao HTTPS, de proposito: a OMDb reserva SSL para contas pagas e
// responde 302 redirecionando HTTPS -> HTTP. O Deno recusa seguir um
// redirecionamento que rebaixa o protocolo, entao a chamada morria em
// silencio. A chave trafega em claro, o que e aceitavel aqui: e uma chave
// gratuita de notas publicas de filme, usada de servidor para servidor.
const OMDB_URL = 'http://www.omdbapi.com/';

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
        if (!res.ok) {
          const corpo = await res.text().catch(() => '');
          const motivo = `HTTP ${res.status} ${res.statusText} ${corpo.slice(0, 200)}`.trim();
          console.error(`OMDb falhou em ${id}: ${motivo}`);
          return [id, null, motivo] as const;
        }

        const data = await res.json();
        if (data?.Response === 'False') {
          // Resposta mais comum aqui: "Daily request limit reached!"
          const motivo = String(data?.Error ?? 'recusado sem motivo');
          console.warn(`OMDb recusou ${id}: ${motivo}`);
          return [id, null, motivo] as const;
        }
        return [id, extrairNotas(data), null] as const;
      } catch (e) {
        const motivo = e instanceof Error ? e.message : String(e);
        console.error(`Falha ao buscar ${id}: ${motivo}`);
        return [id, null, motivo] as const;
      }
    })
  );

  const ratings: Record<string, Notas> = {};
  const problemas: string[] = [];
  for (const [id, notas, motivo] of resultados) {
    if (notas) ratings[id] = notas;
    else if (motivo) problemas.push(`${id}: ${motivo}`);
  }

  // Quando nada volta, o motivo vai junto na resposta em vez de ficar so no
  // log. Assim o painel de Test do Supabase ja mostra o que deu errado.
  if (Object.keys(ratings).length === 0 && problemas.length > 0) {
    return json({ ratings, debug: problemas });
  }

  return json({ ratings });
});
