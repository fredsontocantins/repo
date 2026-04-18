/**
 * Helpers para ler variáveis de ambiente críticas com fail-fast
 * caso estejam ausentes ou inválidas em produção.
 */

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. Configure-a antes de iniciar o servidor.`,
    )
  }
  return value
}

export function getJwtSecret(): string {
  const secret = requireEnv('JWT_SECRET')
  if (secret.length < 24) {
    throw new Error(
      'JWT_SECRET precisa ter ao menos 24 caracteres. Gere um segredo forte (ex.: openssl rand -base64 48).',
    )
  }
  return secret
}

export function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN ?? '7d'
}
