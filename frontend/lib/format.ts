export const fmtBRL = (value = 0) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)

export const fmtNumber = (value = 0) => new Intl.NumberFormat('pt-BR').format(value || 0)
