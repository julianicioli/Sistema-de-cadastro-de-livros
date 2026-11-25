
export function calcularPercentual(paginasLidas, totalPaginas) {
  const lidas = Number(paginasLidas) || 0;
  const total = Number(totalPaginas) || 0;
  if (total <= 0) return 0;
  return Math.min(100, Math.round((lidas * 1000) / total) / 10);
}

export function percentualCapitulos(capituloAtual, totalCapitulos) {
  return calcularPercentual(capituloAtual, totalCapitulos);
}

export function statusLeitura(percentual) {
  if (percentual >= 100) return 'Concluído';
  if (percentual > 0) return 'Lendo';
  return 'Não iniciado';
}

export function limitar(valor, max) {
  const n = parseInt(valor, 10);
  if (Number.isNaN(n) || n < 0) return 0;
  return max > 0 ? Math.min(n, max) : n;
}
