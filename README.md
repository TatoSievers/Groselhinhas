# Groselhinhas

Catálogo de filmes e séries que ordena pelo que **você** considera bom: notas do IMDb e do Rotten Tomatoes combinadas numa régua só, filtrando por gênero e pelos streamings que você assina. Dados do TMDB, listas pessoais no Supabase.

**Stack:** React 19 · TypeScript · Vite 6 · Supabase (auth + banco + edge functions) · TMDB API · OMDb API

---

## Rodando localmente

**Pré-requisitos:** Node.js 20+ e, para mexer nas edge functions, a [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
npm install
cp .env.example .env   # preencha as variáveis
npm run dev            # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Onde pegar |
|---|---|
| `VITE_TMDB_API_KEY` | [TMDB → Settings → API](https://www.themoviedb.org/settings/api) |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |

`OMDB_API_KEY` **não** é variável de ambiente do front. Veja abaixo.

---

## Onde ficam os segredos

Regra única: **tudo com prefixo `VITE_` acaba no bundle que o navegador baixa.** É público. Vale para qualquer pessoa que abra o DevTools.

Por isso:

- `VITE_TMDB_API_KEY` e `VITE_SUPABASE_ANON_KEY` são chaves **de cliente** — nasceram para ser públicas. O que protege o Supabase não é a anon key, é o **Row Level Security** nas tabelas. Se o RLS estiver desligado, a anon key dá leitura e escrita no banco inteiro.
- `OMDB_API_KEY` é chave **de servidor**, com cota diária. Ela vive apenas como secret da edge function:

```bash
supabase secrets set OMDB_API_KEY=sua_chave
supabase functions deploy ratings
```

O front (`services/ratingsService.ts`) chama `POST /functions/v1/ratings` e nunca vê a chave.

---

## Estrutura

```
App.tsx                           # composição da tela, paginação, modais
lib/score.ts                      # A RÉGUA: pesos de público vs crítica. Comece aqui.
hooks/useGroselhinhas.ts          # TODO o estado: fetch TMDB, cache, filtros, busca, listas
services/ratingsService.ts        # cliente da edge function de notas
supabase.ts                       # client do Supabase
supabase/functions/ratings/       # busca IMDb + Rotten Tomatoes na OMDb (Deno, no servidor)
components/                       # UI
types.ts                          # modelos de domínio (Movie, Person, Provider...)
```

## Como a ordenação funciona

1. O TMDB devolve candidatos filtrados por gênero e streaming, ordenados por `vote_average.desc`
2. Cada candidato é enriquecido com IMDb + Rotten Tomatoes pela edge function `ratings`
3. A lista é reordenada por `calcularScore()` — ver `lib/score.ts`

Para mudar o que sobe na lista, mexa só nos `PESOS` em `lib/score.ts`.

**Cota:** a OMDb gasta uma chamada por título e o plano gratuito dá 1.000/dia.
Com 20 cards por página, são ~50 páginas por dia. Se isso apertar, o próximo
passo é cachear as notas numa tabela do Supabase.

## Scripts

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run preview   # serve o build localmente
npm run lint      # checagem de tipos (tsc --noEmit)
```

---

## Dívida técnica conhecida

- `hooks/useGroselhinhas.ts` concentra ~900 linhas: fetch, cache, paginação, busca, filtros e watch providers no mesmo módulo. É o gargalo para qualquer evolução.
- As notas da OMDb não são cacheadas — cada carregamento de página gasta cota.
- Sem testes automatizados.
- Sem ESLint — `npm run lint` só roda o compilador de tipos.
