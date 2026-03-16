import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

export const getMovieVibeCheck = async (title: string, synopsis: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: `Analise a vibe do filme/série "${title}" com base nesta sinopse: "${synopsis}". Descreva a vibe em uma frase curta, impactante e moderna, usando emojis.`,
    });
    return response.text || 'Vibe misteriosa... ✨';
  } catch (error) {
    console.error('Error getting vibe check:', error);
    return 'Vibe indescritível no momento 🎬';
  }
};

export const chatWithAssistant = async (message: string, history: any[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
    
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts[0].text }]
    }));
    
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: "A mensagem principal do assistente em Markdown. SEMPRE que citar o título de um filme ou série no meio do texto, coloque-o como um link no formato Markdown usando 'movie:' seguido do título exato. Exemplo: [Interestelar](movie:Interestelar)."
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "O título do filme ou série recomendado." },
                  description: { type: Type.STRING, description: "Uma breve descrição ou motivo da recomendação." }
                },
                required: ["title", "description"]
              },
              description: "Uma lista de filmes ou séries recomendados, se houver. Se não houver recomendações, retorne um array vazio."
            }
          },
          required: ["message", "recommendations"]
        },
        systemInstruction: `Você é um assistente especialista em filmes e séries para o app "Groselhinhas".
Seja amigável, moderno e direto.
MUITO IMPORTANTE: Formate sua 'message' usando Markdown. Use parágrafos curtos, listas e negrito para destacar termos importantes.
SEMPRE que citar o título de um filme ou série na 'message', coloque-o como um link no formato Markdown usando 'movie:' seguido do título exato. Exemplo: [Interestelar](movie:Interestelar).
Se você for recomendar filmes, coloque-os no array 'recommendations'.`,
      },
    });

    return response.text || '{"message": "Desculpe, não consegui pensar em nada agora.", "recommendations": []}';
  } catch (error) {
    console.error('Error chatting with assistant:', error);
    return '{"message": "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.", "recommendations": []}';
  }
};
