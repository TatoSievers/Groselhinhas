# Groselhinhas

Catálogo de filmes e séries com dados do TMDB, lista pessoal salva no Supabase e um assistente de recomendação com Gemini.

**Stack:** React 19 · TypeScript · Vite 6 · Supabase (auth + banco + edge functions) · TMDB API · Gemini

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

`GEMINI_API_KEY` **não** é variável de ambiente do front. Veja abaixo.

---

## Onde ficam os segredos

Regra única: **tudo com prefixo `VITE_` acaba no bundle que o navegador baixa.** É público. Vale para qualquer pessoa que abra o DevTools.

Por isso:

- `VITE_TMDB_API_KEY` e `VITE_SUPABASE_ANON_KEY` são chaves **de cliente** — nasceram para ser públicas. O que protege o Supabase não é a anon key, é o **Row Level Security** nas tabelas. Se o RLS estiver desligado, a anon key dá leitura e escrita no banco inteiro.
- `GEMINI_API_KEY` é chave **de servidor** e é faturada por uso. Ela vive apenas como secret da edge function:

```bash
supabase secrets set GEMINI_API_KEY=sua_chave
supabase functions deploy gemini-chat
```

O front (`services/geminiService.ts`) chama `POST /functions/v1/gemini-chat` e nunca vê a chave.

---

## Estrutura

```
App.tsx                           # composição da tela, paginação, modais
hooks/useGroselhinhas.ts          # TODO o estado: fetch TMDB, cache, filtros, busca, listas
services/geminiService.ts         # cliente da edge function do assistente
supabase.ts                       # client do Supabase
supabase/functions/gemini-chat/   # proxy do Gemini (Deno, roda no servidor)
components/                       # UI
types.ts                          # modelos de domínio (Movie, Person, Provider...)
```

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
- Sem testes automatizados.
- Sem ESLint — `npm run lint` só roda o compilador de tipos.
