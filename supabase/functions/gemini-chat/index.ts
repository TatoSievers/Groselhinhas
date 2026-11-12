// Edge Function: proxy para a API do Gemini.
//
// Motivo de existir: a chave do Gemini NUNCA pode ir para o navegador.
// Qualquer variável com prefixo VITE_ entra no bundle servido ao usuário.
// Aqui a chave fica no servidor, lida de Deno.env, e o front só fala com esta função.
//
// Deploy:
//   supabase secrets set GEMINI_API_KEY=sua_chave
//   supabase functions deploy gemini-chat

import { GoogleGenAI, Type } from 'npm:@google/genai@^1.45.0';

const MODEL = 'gemini-3.1-flash-lite-preview';

// Limites defensivos: a função é chamada com a anon key, que é pública.
// Sem isso, qualquer um pode queimar a cota mandando payloads gigantes.
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_TURNS = 20;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_INSTRUCTION = `Você é um assistente especialista em filmes e séries para o app "Groselhinhas".
Seja amigável, moderno e direto.
MUITO IMPORTANTE: Formate sua 'message' usando Markdown. Use parágrafos curtos, listas e negrito para destacar termos importantes.
SEMPRE que citar o título de um filme ou série na 'message', coloque-o como um link no formato Markdown usando 'movie:' seguido do título exato. Exemplo: [Interestelar](movie:Interestelar).
Se você for recomendar filmes, coloque-os no array 'recommendations'.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description:
        "A mensagem principal do assistente em Markdown. SEMPRE que citar o título de um filme ou série no meio do texto, coloque-o como um link no formato Markdown usando 'movie:' seguido do título exato. Exemplo: [Interestelar](movie:Interestelar).",
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'O título do filme ou série recomendado.' },
          description: { type: Type.STRING, description: 'Uma breve descrição ou motivo da recomendação.' },
        },
        required: ['title', 'description'],
      },
      description:
        'Uma lista de filmes ou séries recomendados, se houver. Se não houver recomendações, retorne um array vazio.',
    },
  },
  required: ['message', 'recommendations'],
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('GEMINI_API_KEY não configurada. Rode: supabase secrets set GEMINI_API_KEY=...');
    return json({ error: 'Serviço indisponível' }, 503);
  }

  let message: unknown;
  let history: unknown;
  try {
    ({ message, history } = await req.json());
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  if (typeof message !== 'string' || message.trim() === '') {
    return json({ error: 'Campo "message" é obrigatório' }, 400);
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return json({ error: 'Mensagem muito longa' }, 413);
  }

  const safeHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_TURNS) : [];

  const contents = safeHistory
    .filter((m: any) => m?.role && m?.parts?.[0]?.text)
    .map((m: any) => ({ role: m.role, parts: [{ text: String(m.parts[0].text) }] }));

  contents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    // O front espera uma string JSON no mesmo formato do schema acima.
    return json({
      text:
        response.text ||
        '{"message": "Desculpe, não consegui pensar em nada agora.", "recommendations": []}',
    });
  } catch (error) {
    // Nunca vaza detalhe do erro do provedor para o cliente.
    console.error('Erro ao chamar o Gemini:', error);
    return json({ error: 'Falha ao processar a mensagem' }, 502);
  }
});
