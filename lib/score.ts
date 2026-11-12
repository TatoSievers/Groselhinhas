import { Ratings } from '../types';

// ─────────────────────────────────────────────────────────────
//  A SUA RÉGUA
//
//  É aqui que você decide o que faz um título subir na lista.
//  Mexa nestes dois números e a ordenação do app inteiro muda.
//  Os dois precisam somar 1.
// ─────────────────────────────────────────────────────────────
export const PESOS = {
  publico: 0.5,  // nota do IMDb (o que as pessoas acharam)
  critica: 0.5,  // nota do Rotten Tomatoes (o que a crítica achou)
};

// Exemplos:
//   { publico: 0.5, critica: 0.5 }  → equilíbrio (padrão)
//   { publico: 0.3, critica: 0.7 }  → você confia mais na crítica
//   { publico: 0.8, critica: 0.2 }  → você confia mais no público

/**
 * Converte as notas de um título numa pontuação única de 0 a 100.
 *
 * IMDb vem de 0 a 10 e é multiplicado por 10 para ficar na mesma escala
 * do Rotten Tomatoes, que já é percentual.
 *
 * Se só uma das duas notas existir, ela vale sozinha — assim um filme
 * sem resenha de crítica não é punido por isso.
 * Se nenhuma existir, devolve null e o título vai para o fim da lista.
 */
export function calcularScore(ratings: Ratings | undefined): number | null {
  if (!ratings) return null;

  const publico = ratings.imdb > 0 ? ratings.imdb * 10 : null;
  const critica = typeof ratings.rottenTomatoes === 'number' ? ratings.rottenTomatoes : null;

  if (publico === null && critica === null) return null;
  if (publico === null) return critica;
  if (critica === null) return publico;

  return publico * PESOS.publico + critica * PESOS.critica;
}

/**
 * Ordena do melhor para o pior. Quem não tem nota nenhuma vai para o fim,
 * em vez de ser tratado como nota zero.
 */
export function ordenarPorScore<T extends { ratings: Ratings }>(itens: T[]): T[] {
  return [...itens].sort((a, b) => {
    const sa = calcularScore(a.ratings);
    const sb = calcularScore(b.ratings);
    if (sa === null && sb === null) return 0;
    if (sa === null) return 1;
    if (sb === null) return -1;
    return sb - sa;
  });
}
