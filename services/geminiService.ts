import { GoogleGenAI } from '@google/genai';

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
        systemInstruction: `Você é um assistente especialista em filmes e séries para o app "Groselhinhas".
Seja amigável, moderno e direto.
MUITO IMPORTANTE: Formate suas respostas usando Markdown. Use parágrafos curtos, listas (bullet points) e negrito para destacar nomes de filmes ou termos importantes. NUNCA responda com um único parágrafo longo e enfadonho. Estruture bem a informação para facilitar a leitura.`,
      },
    });

    return response.text || 'Desculpe, não consegui pensar em nada agora.';
  } catch (error) {
    console.error('Error chatting with assistant:', error);
    return 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.';
  }
};
