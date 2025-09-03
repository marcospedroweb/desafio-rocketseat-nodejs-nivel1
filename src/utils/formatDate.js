export function formatDate(date) {
  if (typeof date === 'number')
    return new Date(date).toLocaleDateString('pt-BR');
  return null;
}
