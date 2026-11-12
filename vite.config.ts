import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Atenção: NÃO adicione a chave do Gemini (nem nenhum segredo de servidor) aqui.
// Tudo que entra em `define` ou que tem prefixo VITE_ vai parar no bundle
// que o navegador baixa, ou seja, fica público. Segredos vão para
// supabase/functions/*, via `supabase secrets set`.
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
